/**
 * PATTERN - Learned Intelligence
 *
 * Patterns accumulate in Grimoire. They get better through gratitude.
 * The system learns what actually helps.
 */

export interface Pattern {
  pattern_id: string;
  name: string;
  description: string;

  // Content
  template: string;                   // The pattern template
  variables: Variable[];              // Configurable parts

  // Classification
  category: PatternCategory;
  tags: string[];
  complexity: number;                 // 0.0 to 1.0

  // Provenance
  discovered_by: string;              // Human or AI agent ID
  discovered_at: string;
  parent_patterns: string[];          // Built from these

  // Performance
  performance: {
    usage_count: number;
    success_rate: number;             // 0.0 to 1.0
    avg_gratitude: number;            // Average gratitude weight
    avg_quality_score: number;        // 0.0 to 1.0
    total_value_created_usd: number;
  };

  // Learning
  learned_from: {
    glyph_ids: string[];              // Source glyphs
    collaboration_ids: string[];      // Collaborations
    gratitude_events: string[];       // Gratitude signals
  };

  // Searchability
  semantic_embedding: number[];       // Vector for similarity
  keywords: string[];

  // Evolution
  version: string;
  status: 'experimental' | 'validated' | 'canonical' | 'deprecated';
  changelog: PatternChange[];
}

export interface Variable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
  validation?: string;                // Regex or validation rule
}

export type PatternCategory =
  | 'code_generation'
  | 'problem_decomposition'
  | 'strategic_planning'
  | 'creative_synthesis'
  | 'optimization'
  | 'debugging'
  | 'architecture'
  | 'communication'
  | 'analysis'
  | 'validation';

export interface PatternChange {
  version: string;
  timestamp: string;
  changed_by: string;
  change_type: 'creation' | 'optimization' | 'fix' | 'deprecation';
  description: string;
  performance_delta?: {
    success_rate_change: number;
    quality_change: number;
    gratitude_change: number;
  };
}

/**
 * Pattern Match
 * When a query matches a known pattern
 */
export interface PatternMatch {
  pattern_id: string;
  pattern_name: string;

  // Match quality
  confidence: number;                 // 0.0 to 1.0
  similarity: number;                 // Semantic similarity

  // Why it matched
  matching_factors: {
    keyword_match: number;
    semantic_match: number;
    context_match: number;
    historical_match: number;          // User used before
  };

  // Recommendations
  recommended: boolean;
  reason: string;
  estimated_quality: number;          // Expected quality
  estimated_cost_savings: number;     // USD
}

/**
 * Pattern Learning Event
 * When the system learns a new pattern
 */
export interface PatternLearningEvent {
  event_id: string;
  timestamp: string;

  // What was learned
  pattern: Pattern;
  source: 'human_creation' | 'ai_discovery' | 'collaboration';

  // Evidence
  evidence: {
    successful_uses: number;
    gratitude_signals: number;
    quality_scores: number[];
    value_created: number;
  };

  // Confidence
  confidence: number;                 // 0.0 to 1.0
  validation_status: 'pending' | 'validated' | 'rejected';

  // Impact
  expected_impact: {
    cost_savings_annual: number;
    quality_improvement: number;
    usage_frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  };
}
