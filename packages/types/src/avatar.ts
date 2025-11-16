/**
 * AVATAR - The 7 Specialized Agents
 *
 * Each avatar is a cognitive domain with 180+ micro-skills.
 * They don't ADD capabilities - they MULTIPLY through synergies.
 */

export interface Avatar {
  id: string;
  type: AvatarType;
  version: string;

  // Identity
  name: string;
  domain: string;
  energy: string;                     // Archetypal energy

  // Capabilities
  skills: AvatarSkill[];
  specializations: string[];

  // Performance
  reputation: number;                 // 0.0 to 100.0
  elo_rating: number;                 // For tournament ranking

  // Configuration
  model_config: ModelConfig;
  routing_priority: number;           // When to use this avatar

  // State
  status: 'active' | 'training' | 'offline';
  current_load: number;               // 0.0 to 1.0
  last_used: string;
}

export interface AvatarSkill {
  skill_id: string;
  name: string;
  description: string;

  // Classification
  category: string;
  complexity: number;                 // 0.0 to 1.0

  // Performance
  proficiency: number;                // 0.0 to 1.0
  usage_count: number;
  success_rate: number;

  // Learning
  improving: boolean;
  last_improvement: string;
  improvement_rate: number;           // Daily % improvement

  // Dependencies
  requires_skills: string[];          // Prerequisite skills
  synergizes_with: string[];          // Skills that multiply this
}

export interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'groq' | 'deepseek' | 'local';
  model: string;

  // Parameters
  temperature: number;
  max_tokens: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;

  // Context
  system_prompt: string;
  context_window: number;

  // Cost
  cost_per_1k_input: number;
  cost_per_1k_output: number;
}

/**
 * Avatar Constellation
 * The 7 avatar system working together
 */
export const AVATAR_DEFINITIONS = {
  apollo: {
    domain: "Visionary & Strategic Planning",
    energy: "Future sight, long-range planning",
    skill_categories: [
      "Brand storytelling",
      "Trend forecasting",
      "Architecture design",
      "Vision articulation",
      "Strategic positioning"
    ],
    ideal_for: ["strategy", "vision", "positioning", "long-term-planning"]
  },

  mercury: {
    domain: "Communication & Speed",
    energy: "Rapid execution, information flow",
    skill_categories: [
      "API integration",
      "Data translation",
      "Message routing",
      "Protocol conversion",
      "Real-time processing"
    ],
    ideal_for: ["integration", "communication", "translation", "routing"]
  },

  athena: {
    domain: "Wisdom & Problem-Solving",
    energy: "Deep reasoning, strategic thinking",
    skill_categories: [
      "Algorithm design",
      "Problem decomposition",
      "Logic optimization",
      "Complex analysis",
      "Wisdom synthesis"
    ],
    ideal_for: ["analysis", "problem-solving", "logic", "reasoning"]
  },

  ares: {
    domain: "Execution & Implementation",
    energy: "Aggressive execution, no hesitation",
    skill_categories: [
      "Code generation",
      "Deployment",
      "Process automation",
      "Implementation",
      "Action-taking"
    ],
    ideal_for: ["coding", "building", "implementing", "shipping"]
  },

  hermes: {
    domain: "Speed & Optimization",
    energy: "Velocity, efficiency, swift routing",
    skill_categories: [
      "Performance optimization",
      "Caching strategy",
      "Speed enhancement",
      "Efficiency improvement",
      "Latency reduction"
    ],
    ideal_for: ["optimization", "performance", "speed", "efficiency"]
  },

  hephaestus: {
    domain: "Building & Creation",
    energy: "Forge work, craftsmanship, durability",
    skill_categories: [
      "UI components",
      "Database schemas",
      "Infrastructure",
      "System architecture",
      "Foundational building"
    ],
    ideal_for: ["infrastructure", "systems", "foundations", "crafting"]
  },

  artemis: {
    domain: "Protection & Quality Assurance",
    energy: "Vigilance, protection, precision",
    skill_categories: [
      "Security validation",
      "Compliance checking",
      "Error prevention",
      "Quality assurance",
      "Guardian functions"
    ],
    ideal_for: ["security", "validation", "protection", "quality"]
  }
} as const;

/**
 * Avatar Selection
 * Choosing the right avatar for a task
 */
export interface AvatarSelection {
  query: string;
  selected_avatar: AvatarType;
  confidence: number;                 // 0.0 to 1.0

  // Reasoning
  selection_factors: {
    domain_match: number;             // Domain alignment
    skill_match: number;              // Required skills
    reputation: number;               // Past performance
    load_balance: number;             // Capacity
  };

  // Multi-avatar option
  collaborative_recommendation?: {
    primary: AvatarType;
    supporting: AvatarType[];
    synergy_expected: number;         // Expected synergy boost
  };
}

/**
 * Avatar Performance Metrics
 */
export interface AvatarMetrics {
  avatar_id: string;
  avatar_type: AvatarType;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';

  // Volume
  total_queries: number;
  successful_queries: number;
  failed_queries: number;

  // Quality
  avg_quality_score: number;
  avg_gratitude_weight: number;
  success_rate: number;

  // Efficiency
  avg_response_time_ms: number;
  avg_cost_usd: number;
  cost_efficiency: number;            // Value / cost

  // Learning
  new_patterns_discovered: number;
  skills_improved: string[];
  reputation_delta: number;

  // Comparison
  rank_in_category: number;
  percentile: number;
}
