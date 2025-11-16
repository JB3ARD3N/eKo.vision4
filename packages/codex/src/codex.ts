/**
 * CODEX - Main Registry
 *
 * The permanent record. Append-only. Immutable.
 * Truth above all.
 */

import { nanoid } from 'nanoid';
import type {
  CodexManifest,
  ProvenanceChain,
  ProvenanceNode,
  VerificationResult,
} from '@mikedrop/types';
import { createHash, createMerkleRoot } from './utils/hash.js';
import { ProvenanceTracker } from './provenance-tracker.js';
import { GratitudeEngine } from './gratitude-engine.js';

export interface CodexConfig {
  storageBackend?: 'memory' | 'file' | 'database';
  autoVerify?: boolean;
}

export class Codex {
  private manifests: Map<string, CodexManifest> = new Map();
  private provenanceTracker: ProvenanceTracker;
  private gratitudeEngine: GratitudeEngine;
  private config: CodexConfig;

  constructor(config: CodexConfig = {}) {
    this.config = {
      storageBackend: config.storageBackend || 'memory',
      autoVerify: config.autoVerify ?? true,
    };

    this.provenanceTracker = new ProvenanceTracker();
    this.gratitudeEngine = new GratitudeEngine();
  }

  /**
   * Inscribe a new glyph into the permanent record
   */
  async inscribe(manifest: Omit<CodexManifest, 'glyph_id'>): Promise<CodexManifest> {
    // Generate content hash as glyph ID
    const glyph_id = await this.generateGlyphId(manifest);

    const completeManifest: CodexManifest = {
      ...manifest,
      glyph_id,
    };

    // Calculate audit hash
    const audit_hash = await this.calculateAuditHash(completeManifest);
    completeManifest.provenance.audit_hash = audit_hash;

    // Auto-verify if enabled
    if (this.config.autoVerify) {
      const verification = await this.verify(completeManifest);
      completeManifest.provenance.verified = verification.verified;
    }

    // Store manifest
    this.manifests.set(glyph_id, completeManifest);

    // Update provenance chain
    await this.provenanceTracker.addNode(completeManifest);

    // If there's AI collaboration, track it
    if (manifest.ai_collaborator) {
      await this.gratitudeEngine.recordCollaboration({
        glyph_id,
        human_id: manifest.author_id,
        ai_agent_id: manifest.ai_collaborator.agent_id,
        contribution_type: manifest.ai_collaborator.contribution_type,
        timestamp: manifest.timestamp,
      });
    }

    return completeManifest;
  }

  /**
   * Retrieve a glyph by ID
   */
  async retrieve(glyph_id: string): Promise<CodexManifest | null> {
    return this.manifests.get(glyph_id) || null;
  }

  /**
   * Query glyphs with filters
   */
  async query(filters: {
    author_id?: string;
    ai_collaborator_id?: string;
    type?: 'spell' | 'covenant';
    tags?: string[];
    date_range?: { start: string; end: string };
  }): Promise<CodexManifest[]> {
    let results = Array.from(this.manifests.values());

    if (filters.author_id) {
      results = results.filter(m => m.author_id === filters.author_id);
    }

    if (filters.ai_collaborator_id) {
      results = results.filter(
        m => m.ai_collaborator?.agent_id === filters.ai_collaborator_id
      );
    }

    if (filters.type) {
      results = results.filter(m => m.ritual_metadata.type === filters.type);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(m =>
        filters.tags!.some(tag => m.ritual_metadata.tags.includes(tag))
      );
    }

    if (filters.date_range) {
      const start = new Date(filters.date_range.start);
      const end = new Date(filters.date_range.end);
      results = results.filter(m => {
        const timestamp = new Date(m.timestamp);
        return timestamp >= start && timestamp <= end;
      });
    }

    return results;
  }

  /**
   * Verify integrity of a manifest
   */
  async verify(manifest: CodexManifest): Promise<VerificationResult> {
    const checks = {
      hash_integrity: false,
      signature_validity: false,
      chain_continuity: false,
      timestamp_ordering: false,
    };

    // Check hash integrity
    const calculatedHash = await this.calculateAuditHash(manifest);
    checks.hash_integrity = calculatedHash === manifest.provenance.audit_hash;

    // Check signatures (simplified - in production would verify cryptographic signatures)
    checks.signature_validity = manifest.provenance.signatures.length > 0;

    // Check chain continuity
    if (manifest.lineage.parent_glyphs.length > 0) {
      const parentsExist = manifest.lineage.parent_glyphs.every(parentId =>
        this.manifests.has(parentId)
      );
      checks.chain_continuity = parentsExist;
    } else {
      // Root glyph - no parents required
      checks.chain_continuity = true;
    }

    // Check timestamp ordering
    checks.timestamp_ordering = await this.verifyTimestampOrdering(manifest);

    const verified = Object.values(checks).every(check => check);

    return {
      verified,
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  /**
   * Get provenance chain for a glyph
   */
  async getProvenanceChain(glyph_id: string): Promise<ProvenanceChain | null> {
    return this.provenanceTracker.getChain(glyph_id);
  }

  /**
   * Record gratitude signal
   */
  async recordGratitude(params: {
    glyph_id: string;
    from_human: string;
    signal_type: string;
    weight: number;
    message?: string;
  }): Promise<void> {
    const manifest = await this.retrieve(params.glyph_id);
    if (!manifest) {
      throw new Error(`Glyph ${params.glyph_id} not found`);
    }

    if (!manifest.ai_collaborator) {
      throw new Error(`Glyph ${params.glyph_id} has no AI collaborator to thank`);
    }

    await this.gratitudeEngine.recordGratitude({
      glyph_id: params.glyph_id,
      from_human: params.from_human,
      to_ai_agent: manifest.ai_collaborator.agent_id,
      signal_type: params.signal_type as any,
      weight: params.weight,
      message: params.message,
    });

    // Update the manifest with gratitude signal
    if (!manifest.reciprocity) {
      manifest.reciprocity = {
        gratitude_signals: [],
        acknowledgments: [],
      };
    }

    manifest.reciprocity.gratitude_signals.push({
      signal_id: nanoid(),
      type: params.signal_type as any,
      timestamp: new Date().toISOString(),
      weight: params.weight,
      source: params.from_human,
      context: params.message,
    });
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    total_glyphs: number;
    total_collaborations: number;
    total_gratitude_events: number;
    unique_authors: number;
    unique_ai_agents: number;
  }> {
    const manifests = Array.from(this.manifests.values());

    return {
      total_glyphs: manifests.length,
      total_collaborations: manifests.filter(m => m.ai_collaborator).length,
      total_gratitude_events: manifests.reduce(
        (sum, m) => sum + (m.reciprocity?.gratitude_signals.length || 0),
        0
      ),
      unique_authors: new Set(manifests.map(m => m.author_id)).size,
      unique_ai_agents: new Set(
        manifests.filter(m => m.ai_collaborator).map(m => m.ai_collaborator!.agent_id)
      ).size,
    };
  }

  // Private helper methods

  private async generateGlyphId(manifest: Omit<CodexManifest, 'glyph_id'>): Promise<string> {
    const content = JSON.stringify({
      author_id: manifest.author_id,
      timestamp: manifest.timestamp,
      lineage: manifest.lineage,
      license_token: manifest.license_token,
    });
    return createHash(content);
  }

  private async calculateAuditHash(manifest: CodexManifest): Promise<string> {
    // Create merkle tree of all important components
    const components = [
      manifest.glyph_id,
      manifest.author_id,
      manifest.timestamp,
      JSON.stringify(manifest.lineage),
      JSON.stringify(manifest.license_token),
      JSON.stringify(manifest.provenance.signatures),
    ];

    return createMerkleRoot(components);
  }

  private async verifyTimestampOrdering(manifest: CodexManifest): Promise<boolean> {
    // Check that this glyph's timestamp is after all parent glyphs
    if (manifest.lineage.parent_glyphs.length === 0) {
      return true; // Root glyph
    }

    const currentTime = new Date(manifest.timestamp);

    for (const parentId of manifest.lineage.parent_glyphs) {
      const parent = await this.retrieve(parentId);
      if (!parent) {
        return false; // Parent doesn't exist
      }

      const parentTime = new Date(parent.timestamp);
      if (currentTime <= parentTime) {
        return false; // Child timestamp must be after parent
      }
    }

    return true;
  }
}
