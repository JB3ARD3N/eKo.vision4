/**
 * SMART ROUTER - Main Orchestrator
 *
 * Analyzes queries, routes to optimal provider, learns from outcomes.
 * Free tier first. Premium only when needed.
 */

import { nanoid } from 'nanoid';
import type {
  RoutingDecision,
  RoutingOutcome,
  QueryMetadata,
  LLMProvider,
  RouteOption,
  RoutingTable,
  CostAnalytics,
} from '@mikedrop/types';
import { ComplexityAnalyzer } from './complexity-analyzer.js';
import { CostOptimizer } from './cost-optimizer.js';
import { LearningEngine } from './learning-engine.js';

export interface SmartRouterConfig {
  cost_priority?: number; // 0-1, higher = more aggressive cost optimization
  quality_priority?: number; // 0-1, higher = prioritize quality over cost
  speed_priority?: number; // 0-1, higher = prioritize speed
  learning_enabled?: boolean;
}

export class SmartRouter {
  private complexityAnalyzer: ComplexityAnalyzer;
  private costOptimizer: CostOptimizer;
  private learningEngine: LearningEngine;
  private config: SmartRouterConfig;

  private decisions: Map<string, RoutingDecision> = new Map();
  private outcomes: Map<string, RoutingOutcome> = new Map();

  constructor(config: SmartRouterConfig = {}) {
    this.config = {
      cost_priority: config.cost_priority ?? 0.7,
      quality_priority: config.quality_priority ?? 0.8,
      speed_priority: config.speed_priority ?? 0.5,
      learning_enabled: config.learning_enabled ?? true,
    };

    this.complexityAnalyzer = new ComplexityAnalyzer();
    this.costOptimizer = new CostOptimizer();
    this.learningEngine = new LearningEngine();
  }

  /**
   * Route a query to the optimal provider
   */
  async route(query: string, metadata: Partial<QueryMetadata> = {}): Promise<RoutingDecision> {
    const decision_id = nanoid();
    const timestamp = new Date().toISOString();

    // Analyze complexity
    const complexity = await this.complexityAnalyzer.analyze(query, metadata);
    const query_type = this.complexityAnalyzer.classifyType(query, metadata);

    // Estimate token usage
    const estimated_tokens = this.estimateTokens(query);

    // Get routing options
    const options = await this.generateRouteOptions(
      complexity,
      query_type,
      estimated_tokens,
      metadata
    );

    // Select best option based on priorities
    const selected = await this.selectBestRoute(options, metadata);

    const decision: RoutingDecision = {
      decision_id,
      timestamp,
      query,
      query_metadata: this.completeMetadata(metadata),
      complexity: complexity.score,
      query_type,
      estimated_tokens,
      selected_provider: selected.provider,
      selected_model: selected.model,
      confidence: selected.confidence,
      routing_logic: complexity.factors,
      alternative_routes: options.filter(
        opt => opt.provider !== selected.provider || opt.model !== selected.model
      ),
      expected_quality: selected.expected_quality,
      expected_cost_usd: selected.expected_cost_usd,
      expected_latency_ms: selected.expected_latency_ms,
    };

    this.decisions.set(decision_id, decision);

    return decision;
  }

  /**
   * Record the outcome of a routing decision
   */
  async recordOutcome(params: {
    decision_id: string;
    actual_quality: number;
    actual_cost_usd: number;
    actual_latency_ms: number;
    actual_tokens: { input: number; output: number };
    user_satisfied: boolean;
    gratitude_weight?: number;
  }): Promise<void> {
    const decision = this.decisions.get(params.decision_id);
    if (!decision) {
      throw new Error(`Decision ${params.decision_id} not found`);
    }

    const outcome: RoutingOutcome = {
      decision_id: params.decision_id,
      timestamp: new Date().toISOString(),
      actual_quality: params.actual_quality,
      actual_cost_usd: params.actual_cost_usd,
      actual_latency_ms: params.actual_latency_ms,
      actual_tokens: params.actual_tokens,
      quality_delta: params.actual_quality - decision.expected_quality,
      cost_delta: params.actual_cost_usd - decision.expected_cost_usd,
      latency_delta: params.actual_latency_ms - decision.expected_latency_ms,
      user_satisfied: params.user_satisfied,
      gratitude_weight: params.gratitude_weight,
      routing_was_optimal: this.wasRoutingOptimal(decision, params),
      should_update_rules: Math.abs(params.actual_quality - decision.expected_quality) > 0.2,
    };

    // Check if there was a better route
    if (!outcome.routing_was_optimal) {
      outcome.better_route_exists = this.findBetterRoute(decision, params);
    }

    this.outcomes.set(params.decision_id, outcome);

    // Learn from outcome
    if (this.config.learning_enabled) {
      await this.learningEngine.learn(decision, outcome);
    }
  }

  /**
   * Get cost analytics
   */
  async getCostAnalytics(period: 'daily' | 'weekly' | 'monthly' | 'all_time'): Promise<CostAnalytics> {
    const relevantOutcomes = Array.from(this.outcomes.values()).filter(outcome =>
      this.isInPeriod(outcome.timestamp, period)
    );

    const total_cost_usd = relevantOutcomes.reduce((sum, o) => sum + o.actual_cost_usd, 0);

    // Calculate what it would cost if we always used premium (Claude)
    const cost_if_all_premium = relevantOutcomes.reduce((sum, o) => {
      const decision = this.decisions.get(o.decision_id)!;
      const premiumCost = this.estimatePremiumCost(
        o.actual_tokens.input,
        o.actual_tokens.output
      );
      return sum + premiumCost;
    }, 0);

    const savings_usd = cost_if_all_premium - total_cost_usd;
    const savings_percent = cost_if_all_premium > 0 ? (savings_usd / cost_if_all_premium) * 100 : 0;

    // Provider breakdown
    const cost_by_provider: Record<LLMProvider, number> = {
      groq: 0,
      google: 0,
      deepseek: 0,
      openai: 0,
      anthropic: 0,
    };

    relevantOutcomes.forEach(outcome => {
      const decision = this.decisions.get(outcome.decision_id)!;
      cost_by_provider[decision.selected_provider] += outcome.actual_cost_usd;
    });

    // Tier usage
    const totalDecisions = relevantOutcomes.length;
    const free_tier_usage =
      (relevantOutcomes.filter(o => {
        const d = this.decisions.get(o.decision_id)!;
        return d.selected_provider === 'groq' || d.selected_provider === 'google';
      }).length /
        totalDecisions) *
      100;

    const cheap_tier_usage =
      (relevantOutcomes.filter(o => {
        const d = this.decisions.get(o.decision_id)!;
        return d.selected_provider === 'deepseek' || d.selected_provider === 'openai';
      }).length /
        totalDecisions) *
      100;

    const premium_tier_usage = 100 - free_tier_usage - cheap_tier_usage;

    // Quality comparison
    const avg_quality_score =
      relevantOutcomes.reduce((sum, o) => sum + o.actual_quality, 0) / totalDecisions;

    // Assume premium would give ~0.95 quality average
    const quality_vs_all_premium_delta = avg_quality_score - 0.95;

    // Calculate value created (from gratitude signals)
    const value_created_usd = relevantOutcomes
      .filter(o => o.gratitude_weight)
      .reduce((sum, o) => sum + (o.gratitude_weight! * 1000), 0); // Rough estimate

    const roi = total_cost_usd > 0 ? value_created_usd / total_cost_usd : 0;

    return {
      period,
      total_cost_usd,
      cost_by_provider,
      cost_if_all_premium,
      savings_usd,
      savings_percent,
      free_tier_usage,
      cheap_tier_usage,
      premium_tier_usage,
      avg_quality_score,
      quality_vs_all_premium_delta,
      value_created_usd,
      roi,
    };
  }

  /**
   * Get routing table (learned rules)
   */
  async getRoutingTable(): Promise<RoutingTable> {
    return this.learningEngine.getRoutingTable();
  }

  // Private helpers

  private async generateRouteOptions(
    complexity: { score: number; factors: any },
    query_type: any,
    estimated_tokens: any,
    metadata: Partial<QueryMetadata>
  ): Promise<RouteOption[]> {
    const options: RouteOption[] = [];

    // Groq Llama 90B (FREE, fast)
    if (complexity.score < 0.3) {
      options.push({
        provider: 'groq',
        model: 'llama-3.1-90b',
        quality_score: 0.75,
        cost_score: 1.0, // FREE = best cost score
        speed_score: 1.0,
        overall_score: 0,
        estimated_quality: 0.75,
        estimated_cost_usd: 0,
        estimated_latency_ms: 500,
      });
    }

    // Google Gemini Flash (FREE, good reasoning)
    if (complexity.score < 0.6) {
      options.push({
        provider: 'google',
        model: 'gemini-1.5-flash',
        quality_score: 0.82,
        cost_score: 1.0, // FREE
        speed_score: 0.9,
        overall_score: 0,
        estimated_quality: 0.82,
        estimated_cost_usd: 0,
        estimated_latency_ms: 700,
      });
    }

    // DeepSeek (CHEAP, code specialist)
    if (query_type === 'code_generation' || metadata.requires_code) {
      options.push({
        provider: 'deepseek',
        model: 'deepseek-coder',
        quality_score: 0.88,
        cost_score: 0.95, // Very cheap
        speed_score: 0.85,
        overall_score: 0,
        estimated_quality: 0.88,
        estimated_cost_usd: this.estimateCost('deepseek', estimated_tokens),
        estimated_latency_ms: 900,
      });
    }

    // OpenAI GPT-4o-mini (MODERATE cost, balanced)
    if (complexity.score < 0.8) {
      options.push({
        provider: 'openai',
        model: 'gpt-4o-mini',
        quality_score: 0.85,
        cost_score: 0.7,
        speed_score: 0.8,
        overall_score: 0,
        estimated_quality: 0.85,
        estimated_cost_usd: this.estimateCost('openai', estimated_tokens),
        estimated_latency_ms: 1000,
      });
    }

    // Claude Sonnet (PREMIUM, highest quality)
    if (complexity.score >= 0.8 || metadata.urgency === 'critical') {
      options.push({
        provider: 'anthropic',
        model: 'claude-sonnet-4.5',
        quality_score: 1.0,
        cost_score: 0.3,
        speed_score: 0.7,
        overall_score: 0,
        estimated_quality: 0.96,
        estimated_cost_usd: this.estimateCost('anthropic', estimated_tokens),
        estimated_latency_ms: 1500,
      });
    }

    // Calculate overall scores
    options.forEach(option => {
      option.overall_score = this.calculateOverallScore(option);
    });

    return options.sort((a, b) => b.overall_score - a.overall_score);
  }

  private async selectBestRoute(
    options: RouteOption[],
    metadata: Partial<QueryMetadata>
  ): Promise<RouteOption & { confidence: number }> {
    if (options.length === 0) {
      // Fallback to Claude if no options
      return {
        provider: 'anthropic',
        model: 'claude-sonnet-4.5',
        quality_score: 1.0,
        cost_score: 0.3,
        speed_score: 0.7,
        overall_score: 0.8,
        estimated_quality: 0.96,
        estimated_cost_usd: 0.01,
        estimated_latency_ms: 1500,
        confidence: 1.0,
      };
    }

    const selected = options[0];

    return {
      ...selected,
      confidence: this.learningEngine.getConfidence(selected.provider, selected.model),
    };
  }

  private calculateOverallScore(option: RouteOption): number {
    return (
      option.quality_score * this.config.quality_priority! +
      option.cost_score * this.config.cost_priority! +
      option.speed_score * this.config.speed_priority!
    ) / (this.config.quality_priority! + this.config.cost_priority! + this.config.speed_priority!);
  }

  private estimateTokens(query: string): { input: number; output: number } {
    // Rough estimate: ~4 chars per token
    const input = Math.ceil(query.length / 4);
    const output = Math.ceil(input * 1.5); // Assume output is 1.5x input

    return { input, output };
  }

  private estimateCost(provider: LLMProvider, tokens: { input: number; output: number }): number {
    const pricing: Record<LLMProvider, { input: number; output: number }> = {
      groq: { input: 0, output: 0 }, // FREE
      google: { input: 0, output: 0 }, // FREE
      deepseek: { input: 0.14 / 1000000, output: 0.28 / 1000000 }, // Very cheap
      openai: { input: 0.15 / 1000, output: 0.60 / 1000 }, // GPT-4o-mini
      anthropic: { input: 3.0 / 1000000, output: 15.0 / 1000000 }, // Claude Sonnet
    };

    const rates = pricing[provider];
    return tokens.input * rates.input + tokens.output * rates.output;
  }

  private estimatePremiumCost(inputTokens: number, outputTokens: number): number {
    return this.estimateCost('anthropic', { input: inputTokens, output: outputTokens });
  }

  private completeMetadata(partial: Partial<QueryMetadata>): QueryMetadata {
    return {
      user_id: partial.user_id || 'anonymous',
      session_id: partial.session_id || nanoid(),
      context_length: partial.context_length || 0,
      previous_queries: partial.previous_queries || [],
      user_satisfaction_history: partial.user_satisfaction_history || [],
    };
  }

  private wasRoutingOptimal(decision: RoutingDecision, outcome: { actual_quality: number; actual_cost_usd: number }): boolean {
    // Routing was optimal if:
    // 1. Quality met expectations (within 10%)
    // 2. Cost didn't exceed expectations significantly

    const quality_ok = outcome.actual_quality >= decision.expected_quality * 0.9;
    const cost_ok = outcome.actual_cost_usd <= decision.expected_cost_usd * 1.2;

    return quality_ok && cost_ok;
  }

  private findBetterRoute(decision: RoutingDecision, outcome: any): RouteOption | undefined {
    // Find if there was a cheaper route that would have delivered same quality
    return decision.alternative_routes.find(
      alt => alt.estimated_quality >= outcome.actual_quality && alt.estimated_cost_usd < outcome.actual_cost_usd
    );
  }

  private isInPeriod(timestamp: string, period: 'daily' | 'weekly' | 'monthly' | 'all_time'): boolean {
    if (period === 'all_time') return true;

    const now = new Date();
    const eventDate = new Date(timestamp);
    const diffMs = now.getTime() - eventDate.getTime();

    switch (period) {
      case 'daily':
        return diffMs <= 24 * 60 * 60 * 1000;
      case 'weekly':
        return diffMs <= 7 * 24 * 60 * 60 * 1000;
      case 'monthly':
        return diffMs <= 30 * 24 * 60 * 60 * 1000;
      default:
        return false;
    }
  }
}
