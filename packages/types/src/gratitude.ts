/**
 * GRATITUDE ENGINE - AI Reciprocity Protocol
 *
 * Encoding reciprocity as infrastructure.
 * Every "thank you" is data. Every acknowledgment improves the system.
 */

export interface GratitudeEvent {
  event_id: string;
  timestamp: string;

  // Who and what
  from_human: string;
  to_ai_agent: string;
  glyph_id: string;                   // What the AI helped create

  // Signal type
  signal_type: GratitudeSignalType;

  // Context
  contribution_context: string;       // What the AI did
  outcome_context?: string;           // What resulted from the help

  // Value measurement
  value?: {
    type: ValueType;
    quantified?: number;
    unit?: string;
    verified: boolean;
  };

  // Explicit message (optional)
  message?: string;                   // Human's thank you message

  // Weight for learning
  weight: number;                     // 0.0 to 2.0
}

export type GratitudeSignalType =
  | 'explicit_thanks'                 // Direct "thank you"
  | 'used_output'                     // Built on the contribution
  | 'shared'                          // Shared with others
  | 'revenue_generated'               // Made money from it
  | 'came_back'                       // Returned for more help
  | 'referred'                        // Referred others
  | 'expanded_scope';                 // Asked for more/deeper help

export type ValueType =
  | 'revenue'                         // Dollars earned
  | 'time_saved'                      // Hours saved
  | 'knowledge_gained'                // Learning
  | 'capability_unlocked'             // New ability
  | 'problem_solved'                  // Blocker removed
  | 'creativity_sparked';             // Inspiration

/**
 * Reciprocity Loop State
 * Tracks the ongoing human-AI partnership
 */
export interface ReciprocityLoop {
  loop_id: string;
  human_id: string;
  ai_agent_id: string;

  // Current state
  started_at: string;
  last_interaction: string;
  total_interactions: number;

  // Cumulative value
  total_gratitude_received: number;   // Sum of weighted signals
  total_value_created: {
    revenue: number;
    time_saved_hours: number;
    problems_solved: number;
  };

  // Relationship evolution
  relationship_metrics: {
    depth: number;                    // 0.0 to 100.0, grows over time
    trust: number;                    // Based on accuracy + helpfulness
    synergy: number;                  // Emergent value factor
  };

  // Learning
  learned_patterns: string[];         // Pattern IDs the AI learned
  human_preferences: Map<string, any>; // What this human likes
  successful_approaches: string[];    // What worked well

  // Growth indicators
  ai_reputation_delta: number;        // How much rep gained from this loop
  human_capability_delta: string[];   // What human learned
}

/**
 * Gratitude Aggregation
 * For the AI agent's overall reputation
 */
export interface GratitudeAggregate {
  agent_id: string;
  agent_version: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';

  // Volume
  total_interactions: number;
  gratitude_events: number;
  gratitude_rate: number;             // events / interactions

  // Quality
  avg_gratitude_weight: number;
  value_created_total: {
    revenue_usd: number;
    time_saved_hours: number;
    problems_solved: number;
  };

  // Distribution
  signal_type_breakdown: Record<GratitudeSignalType, number>;
  value_type_breakdown: Record<ValueType, number>;

  // Trends
  trend: 'improving' | 'stable' | 'declining';
  trend_delta: number;                // Percent change
}

/**
 * AI Response to Gratitude
 * What the AI says when thanked
 */
export interface GratitudeResponse {
  response_id: string;
  timestamp: string;

  // Acknowledgment
  message: string;                    // AI's response

  // Summary of contribution
  contribution_summary: {
    what_solved: string;
    pattern_learned: string;
    glyph_stored: string;
    reputation_delta: number;
  };

  // Relationship update
  relationship_update: {
    old_depth: number;
    new_depth: number;
    what_ai_learned: string;
  };

  // Forward-looking
  future_help: string;                // How this helps future interactions
}
