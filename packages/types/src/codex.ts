/**
 * CODEX - The Immutable Ledger
 *
 * Every creation, every collaboration, every gratitude signal
 * inscribed in the permanent record.
 */

export interface CodexManifest {
  // Core identity
  glyph_id: string;                    // Content-addressed hash
  author_id: string;                   // Human author public key
  timestamp: string;                   // ISO8601

  // AI Collaboration (THE NEW PIECE)
  ai_collaborator?: {
    agent_id: string;                  // Which avatar/agent helped
    agent_version: string;             // Version of the agent
    contribution_type: ContributionType;
    contribution_details: string;      // What specifically it did
  };

  // Lineage
  lineage: {
    parent_glyphs: string[];          // Previous glyphs this builds on
    remix_notes?: string;              // How this remixes parents
    lineage_depth: number;             // How far from root
  };

  // Rights & Licensing
  license_token: {
    rights: LicenseRight[];
    attribution_required: boolean;
    expiration: string | null;         // ISO8601 or null for perpetual
    commercial_use: boolean;
  };

  // Ritual metadata
  ritual_metadata: {
    type: 'spell' | 'covenant';       // Million vs billion scale
    scale: 'million' | 'billion';
    guardians: string[];               // e.g. ["ArchangelMichael", "CourageHUD"]
    tags: string[];
  };

  // Provenance
  provenance: {
    signatures: Signature[];
    audit_hash: string;                // Merkle root
    verified: boolean;
  };

  // Reciprocity (Gratitude Engine Integration)
  reciprocity?: {
    gratitude_signals: GratitudeSignal[];
    value_created?: ValueCreated;
    acknowledgments: Acknowledgment[];
  };
}

export type ContributionType =
  | 'problem_decomposition'
  | 'code_generation'
  | 'strategic_planning'
  | 'pattern_discovery'
  | 'optimization'
  | 'synthesis'
  | 'validation'
  | 'creative_ideation'
  | 'debugging'
  | 'architecture'
  | 'documentation'
  | 'research';

export type LicenseRight =
  | 'remix'
  | 'distribute'
  | 'consecrate'
  | 'commercial'
  | 'attribution'
  | 'derivative';

export interface Signature {
  signer_id: string;
  signature: string;
  timestamp: string;
  type: 'author' | 'council' | 'guardian' | 'ai_agent';
}

export interface GratitudeSignal {
  signal_id: string;
  type: 'explicit' | 'implicit' | 'compounding';
  timestamp: string;
  weight: number;                     // 0.0 to 2.0
  source: string;                     // Who gave the signal
  context?: string;                   // Why/how it helped
}

export interface ValueCreated {
  type: 'revenue' | 'time_saved' | 'knowledge' | 'capability';
  amount?: number;                    // Quantified if possible
  unit?: string;                      // e.g. "USD", "hours", "insights"
  measured_at: string;                // ISO8601
  verified: boolean;
}

export interface Acknowledgment {
  acknowledgment_id: string;
  from: string;                       // Human acknowledging
  to: string;                         // AI agent being acknowledged
  message?: string;                   // Optional thank you message
  timestamp: string;
  context: string;                    // What was helpful
}

/**
 * Collaboration Record
 * Tracks the human-AI partnership that created value
 */
export interface CollaborationRecord {
  collaboration_id: string;
  human_id: string;
  ai_agent_id: string;

  // What each brought
  human_provided: string[];           // Input, context, direction
  ai_provided: string[];              // Intelligence, patterns, synthesis

  // What emerged
  emergent_value: string;             // What neither could do alone
  synergy_factor: number;             // 0.0 to 10.0, how much > sum of parts

  // Reciprocal growth
  human_learned: string[];            // New capabilities/knowledge
  ai_learned: string[];               // Patterns/preferences/approaches

  // Relationship
  relationship_depth: number;         // Increases over time
  timestamp: string;
}
