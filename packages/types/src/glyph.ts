/**
 * GLYPH - Compressed Semantic Units
 *
 * The fundamental unit of communication in the system.
 * Glyphs can be symbolic, semantic, or reference-based.
 */

export interface Glyph {
  id: string;                         // Content hash
  type: GlyphType;
  content: string;                    // The actual glyph content
  expanded?: string;                  // Full expansion (for reference glyphs)

  // Compression metadata
  compression: {
    layer: 1 | 2 | 3;                 // Which compression layer
    original_tokens: number;          // Before compression
    compressed_tokens: number;        // After compression
    savings_percent: number;          // Token reduction
  };

  // Usage tracking
  usage: {
    count: number;                    // How many times used
    success_rate: number;             // 0.0 to 1.0
    avg_gratitude: number;            // Average gratitude score
    last_used: string;                // ISO8601
  };

  // Provenance
  created_by: string;                 // Human or AI agent
  created_at: string;                 // ISO8601
  parent_glyph?: string;              // If derived from another

  // Searchability
  tags: string[];
  semantic_embedding?: number[];      // Vector for similarity search
}

export type GlyphType =
  | 'symbolic'                        // ⊕3⊗→μ style
  | 'semantic'                        // analyze(code).find(errors)
  | 'reference'                       // LP.SAAS.V3 → full prompt
  | 'composite';                      // Combination

/**
 * Glyph Library Entry
 * Stored in Grimoire with learned metadata
 */
export interface GlyphLibraryEntry extends Glyph {
  // Learning data
  performance: {
    quality_scores: number[];         // Historical quality
    cost_savings: number[];           // Actual savings
    user_satisfaction: number[];      // Gratitude signals
  };

  // Relationships
  similar_glyphs: string[];           // Content-similar
  commonly_combined_with: string[];   // Usage patterns
  replaces: string[];                 // Deprecated glyphs

  // Governance
  status: 'active' | 'deprecated' | 'experimental';
  version: string;
  changelog: ChangeEntry[];
}

export interface ChangeEntry {
  version: string;
  timestamp: string;
  changed_by: string;
  changes: string;
  reason: string;
}

/**
 * Compression Pipeline Result
 */
export interface CompressionResult {
  original: string;
  compressed: string;
  glyph_id: string;

  savings: {
    original_tokens: number;
    compressed_tokens: number;
    percent_reduction: number;
    cost_savings_usd: number;
  };

  layers_applied: GlyphType[];
  reversible: boolean;                // Can we expand back?
  quality_preserved: number;          // 0.0 to 1.0
}
