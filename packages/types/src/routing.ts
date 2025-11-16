/**
 * ROUTING - Smart Multi-LLM Orchestration
 *
 * 90% cost savings by routing to the right model at the right time.
 * Learns from outcomes. Gets better every day.
 */

export interface RoutingDecision {
  decision_id: string;
  timestamp: string;

  // Input
  query: string;
  query_metadata: QueryMetadata;

  // Analysis
  complexity: number;                 // 0.0 to 1.0
  query_type: QueryType;
  estimated_tokens: {
    input: number;
    output: number;
  };

  // Decision
  selected_provider: LLMProvider;
  selected_model: string;
  confidence: number;                 // 0.0 to 1.0

  // Reasoning
  routing_logic: {
    complexity_score: number;
    cost_priority: number;
    quality_priority: number;
    speed_priority: number;
    specialty_match: number;
  };

  // Alternatives
  alternative_routes: RouteOption[];

  // Expected outcome
  expected_quality: number;           // 0.0 to 1.0
  expected_cost_usd: number;
  expected_latency_ms: number;
}

export interface QueryMetadata {
  user_id: string;
  session_id: string;
  context_length: number;

  // Classification
  domain?: string;
  intent?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';

  // Requirements
  requires_code?: boolean;
  requires_reasoning?: boolean;
  requires_creativity?: boolean;
  requires_speed?: boolean;

  // Constraints
  max_cost_usd?: number;
  max_latency_ms?: number;
  min_quality?: number;

  // History
  previous_queries: string[];
  user_satisfaction_history: number[];
}

export type QueryType =
  | 'simple_question'
  | 'complex_reasoning'
  | 'code_generation'
  | 'creative_writing'
  | 'data_analysis'
  | 'strategic_planning'
  | 'problem_decomposition'
  | 'optimization'
  | 'synthesis';

export type LLMProvider =
  | 'groq'                            // FREE, fast, Llama 90B
  | 'google'                          // FREE, Gemini Flash
  | 'deepseek'                        // CHEAP, code specialist
  | 'openai'                          // MODERATE, GPT-4o-mini
  | 'anthropic';                      // PREMIUM, Claude Sonnet

export interface RouteOption {
  provider: LLMProvider;
  model: string;

  // Scores
  quality_score: number;              // 0.0 to 1.0
  cost_score: number;                 // 0.0 to 1.0 (lower is better)
  speed_score: number;                // 0.0 to 1.0
  overall_score: number;

  // Estimates
  estimated_quality: number;
  estimated_cost_usd: number;
  estimated_latency_ms: number;

  // Why not chosen
  reason_not_selected?: string;
}

/**
 * Routing Table
 * The learned routing logic
 */
export interface RoutingTable {
  version: string;
  last_updated: string;

  // Rules
  rules: RoutingRule[];

  // Performance
  total_routings: number;
  success_rate: number;
  avg_cost_savings: number;           // vs always premium
  avg_quality: number;

  // Learning
  learning_rate: number;
  last_optimization: string;
}

export interface RoutingRule {
  rule_id: string;
  priority: number;                   // Higher = checked first

  // Conditions
  conditions: {
    complexity_range?: [number, number];
    query_types?: QueryType[];
    domains?: string[];
    user_preferences?: Record<string, any>;
  };

  // Action
  route_to: {
    provider: LLMProvider;
    model: string;
  };

  // Performance
  performance: {
    usage_count: number;
    success_rate: number;
    avg_quality: number;
    avg_cost: number;
    avg_latency: number;
  };

  // Learning
  status: 'active' | 'experimental' | 'deprecated';
  confidence: number;                 // 0.0 to 1.0
  last_evaluation: string;
}

/**
 * Routing Outcome
 * What actually happened after routing
 */
export interface RoutingOutcome {
  decision_id: string;
  timestamp: string;

  // Actual results
  actual_quality: number;             // From gratitude + validation
  actual_cost_usd: number;
  actual_latency_ms: number;
  actual_tokens: {
    input: number;
    output: number;
  };

  // Comparison to estimate
  quality_delta: number;              // Actual - expected
  cost_delta: number;
  latency_delta: number;

  // User feedback
  user_satisfied: boolean;
  gratitude_weight?: number;

  // Learning signal
  routing_was_optimal: boolean;
  better_route_exists?: RouteOption;

  // Update routing table
  should_update_rules: boolean;
  suggested_rule_change?: string;
}

/**
 * Cost Analytics
 * Understanding the savings
 */
export interface CostAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';

  // Actual costs
  total_cost_usd: number;
  cost_by_provider: Record<LLMProvider, number>;

  // Comparison
  cost_if_all_premium: number;        // If every query used Claude
  savings_usd: number;
  savings_percent: number;

  // Breakdown
  free_tier_usage: number;            // % routed to free
  cheap_tier_usage: number;           // % routed to cheap
  premium_tier_usage: number;         // % routed to premium

  // Quality maintained
  avg_quality_score: number;
  quality_vs_all_premium_delta: number; // How much quality we sacrificed

  // ROI
  value_created_usd: number;          // From gratitude signals
  roi: number;                        // value / cost
}
