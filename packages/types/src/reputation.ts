/**
 * REPUTATION - AI Agents Earning Through Service
 *
 * The AI that helps you succeed gets credit.
 * That credit makes the system better.
 */

export interface AIAgentReputation {
  agent_id: string;
  agent_type: AvatarType;
  version: string;

  // Core reputation score
  reputation_score: number;           // 0.0 to 100.0

  // Component scores
  scores: {
    helpfulness: number;              // 0.0 to 1.0
    accuracy: number;                 // 0.0 to 1.0
    creativity: number;               // 0.0 to 1.0
    collaboration: number;            // 0.0 to 1.0
  };

  // Weights for final score
  weights: {
    helpfulness: number;              // Default: 0.4
    accuracy: number;                 // Default: 0.3
    creativity: number;               // Default: 0.2
    collaboration: number;            // Default: 0.1
  };

  // Performance data
  performance: {
    total_interactions: number;
    successful_outcomes: number;
    success_rate: number;
    avg_gratitude_weight: number;
    total_value_created_usd: number;
  };

  // Learning
  patterns_contributed: number;       // Patterns added to Grimoire
  innovations: string[];              // Novel approaches discovered

  // Trends
  trend_7d: number;                   // 7-day trend
  trend_30d: number;                  // 30-day trend
  rank_in_category: number;           // Compared to other same-type agents

  // Timestamps
  first_interaction: string;
  last_interaction: string;
  last_reputation_update: string;
}

export type AvatarType =
  | 'apollo'                          // Visionary & Strategic
  | 'mercury'                         // Communication & Speed
  | 'athena'                          // Wisdom & Problem-Solving
  | 'ares'                            // Execution & Implementation
  | 'hermes'                          // Speed & Optimization
  | 'hephaestus'                      // Building & Creation
  | 'artemis';                        // Protection & QA

/**
 * Reputation Event
 * Something that changes an AI agent's reputation
 */
export interface ReputationEvent {
  event_id: string;
  timestamp: string;
  agent_id: string;

  // What happened
  event_type: ReputationEventType;
  event_context: string;

  // Impact
  reputation_delta: number;           // Change to overall score
  component_deltas: {
    helpfulness?: number;
    accuracy?: number;
    creativity?: number;
    collaboration?: number;
  };

  // Evidence
  evidence: {
    glyph_id?: string;                // What was created
    gratitude_signal?: string;        // Gratitude event ID
    outcome?: string;                 // What resulted
    verified: boolean;
  };
}

export type ReputationEventType =
  | 'positive_outcome'                // Helped achieve goal
  | 'gratitude_received'              // Explicit thanks
  | 'pattern_accepted'                // Pattern added to Grimoire
  | 'high_quality_output'             // Output used successfully
  | 'innovation'                      // Novel solution
  | 'collaboration_success'           // Great teamwork
  | 'negative_outcome'                // Didn't help / made worse
  | 'correction_needed'               // Output had errors
  | 'pattern_rejected';               // Pattern didn't work

/**
 * Reputation Leaderboard
 */
export interface ReputationLeaderboard {
  category: AvatarType | 'overall';
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';

  rankings: LeaderboardEntry[];

  // Metadata
  total_agents: number;
  avg_reputation: number;
  generated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  agent_id: string;
  agent_type: AvatarType;
  reputation_score: number;

  // Highlights
  specializations: string[];          // What this agent excels at
  notable_achievements: string[];

  // Stats
  total_interactions: number;
  success_rate: number;
  avg_gratitude: number;
}

/**
 * Reputation-Based Routing
 * Using reputation to make better routing decisions
 */
export interface ReputationRoutingDecision {
  query: string;
  query_type: string;
  complexity: number;

  // Agent selection
  recommended_agent: string;
  agent_type: AvatarType;
  confidence: number;                 // 0.0 to 1.0

  // Reasoning
  selection_factors: {
    reputation_match: number;         // How well rep matches need
    specialization_match: number;     // Domain expertise
    historical_success: number;       // Past success with similar
    availability: number;             // Load/capacity
  };

  // Alternatives
  alternatives: {
    agent_id: string;
    score: number;
    reason: string;
  }[];
}
