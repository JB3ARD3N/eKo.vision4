/**
 * REFERENCE COMPRESSOR - Layer 3
 *
 * Stores full patterns in Grimoire, references by ID.
 * Target: 97% total savings for repeated patterns.
 *
 * Example: "LP.SAAS.V3" expands to 500-token expert prompt
 */

import { nanoid } from 'nanoid';

export interface StoredPattern {
  id: string;
  pattern: string;
  usage_count: number;
  created_at: string;
  last_used: string;
}

export class ReferenceCompressor {
  private patterns: Map<string, StoredPattern> = new Map();
  private patternIndex: Map<string, string> = new Map(); // content hash → id

  /**
   * Compress by storing pattern and returning reference ID
   */
  async compress(text: string): Promise<{
    glyph_id?: string;
    is_new: boolean;
  }> {
    // Check if pattern already exists
    const contentHash = this.hashContent(text);
    const existingId = this.patternIndex.get(contentHash);

    if (existingId) {
      // Pattern exists - return ID and update usage
      const pattern = this.patterns.get(existingId)!;
      pattern.usage_count++;
      pattern.last_used = new Date().toISOString();

      return { glyph_id: existingId, is_new: false };
    }

    // New pattern - store it
    if (text.length > 100) {
      // Only store patterns > 100 chars
      const id = this.generateReadableId(text);

      const storedPattern: StoredPattern = {
        id,
        pattern: text,
        usage_count: 1,
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString(),
      };

      this.patterns.set(id, storedPattern);
      this.patternIndex.set(contentHash, id);

      return { glyph_id: id, is_new: true };
    }

    return { is_new: false };
  }

  /**
   * Decompress by expanding reference ID to full pattern
   */
  async decompress(glyphId: string): Promise<string | null> {
    const pattern = this.patterns.get(glyphId);

    if (pattern) {
      pattern.usage_count++;
      pattern.last_used = new Date().toISOString();
      return pattern.pattern;
    }

    return null;
  }

  /**
   * Get pattern statistics
   */
  getPatternStats(glyphId: string): StoredPattern | null {
    return this.patterns.get(glyphId) || null;
  }

  /**
   * Get most used patterns
   */
  getMostUsedPatterns(limit: number = 10): StoredPattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, limit);
  }

  /**
   * Get total savings from reference compression
   */
  getTotalSavings(): {
    patterns_stored: number;
    total_usage: number;
    original_tokens: number;
    compressed_tokens: number;
    savings_percent: number;
  } {
    let total_usage = 0;
    let original_tokens = 0;
    let compressed_tokens = 0;

    for (const pattern of this.patterns.values()) {
      total_usage += pattern.usage_count;
      const pattern_tokens = Math.ceil(pattern.pattern.length / 4);
      const id_tokens = Math.ceil(pattern.id.length / 4);

      original_tokens += pattern_tokens * pattern.usage_count;
      compressed_tokens += id_tokens * pattern.usage_count;
    }

    const savings_percent =
      original_tokens > 0 ? ((original_tokens - compressed_tokens) / original_tokens) * 100 : 0;

    return {
      patterns_stored: this.patterns.size,
      total_usage,
      original_tokens,
      compressed_tokens,
      savings_percent,
    };
  }

  // Private helpers

  private hashContent(text: string): string {
    // Simple hash for demo - in production would use crypto hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  private generateReadableId(text: string): string {
    // Generate human-readable ID based on content
    // Example: "LP.SAAS.V3" for "SaaS Landing Page prompt v3"

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);

    const prefix = words
      .slice(0, 3)
      .map(w => w[0].toUpperCase())
      .join('');

    const version = '1';
    const random = nanoid(4).toUpperCase();

    return `${prefix}.${random}.V${version}`;
  }
}
