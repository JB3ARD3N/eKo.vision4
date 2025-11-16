/**
 * LEARNING ENGINE
 *
 * Learns from routing outcomes. Updates routing logic.
 * Gets better every day.
 */

import { nanoid } from 'nanoid';
import type {
  RoutingDecision,
  RoutingOutcome,
  RoutingTable,
  RoutingRule,
  LLMProvider,
} from '@mikedrop/types';

export class LearningEngine {
  private routingTable: RoutingTable;
  private learningHistory: Array<{ decision: RoutingDecision; outcome: RoutingOutcome }> = [];

  constructor() {
    this.routingTable = this.initializeDefaultTable();
  }

  /**
   * Learn from a routing outcome
   */
  async learn(decision: RoutingDecision, outcome: RoutingOutcome): Promise<void> {
    // Store in history
    this.learningHistory.push({ decision, outcome });

    // Update relevant rule
    await this.updateRule(decision, outcome);

    // Potentially create new rule
    if (outcome.should_update_rules) {
      await this.considerNewRule(decision, outcome);
    }

    // Update statistics
    this.updateStatistics();
  }

  /**
   * Get routing table
   */
  getRoutingTable(): RoutingTable {
    return this.routingTable;
  }

  /**
   * Get confidence for a provider/model combination
   */
  getConfidence(provider: LLMProvider, model: string): number {
    const rule = this.routingTable.rules.find(
      r => r.route_to.provider === provider && r.route_to.model === model
    );

    return rule?.confidence || 0.5;
  }

  // Private methods

  private initializeDefaultTable(): RoutingTable {
    const rules: RoutingRule[] = [
      {
        rule_id: nanoid(),
        priority: 1,
        conditions: {
          complexity_range: [0, 0.3],
        },
        route_to: {
          provider: 'groq',
          model: 'llama-3.1-90b',
        },
        performance: {
          usage_count: 0,
          success_rate: 0.75,
          avg_quality: 0.75,
          avg_cost: 0,
          avg_latency: 500,
        },
        status: 'active',
        confidence: 0.8,
        last_evaluation: new Date().toISOString(),
      },
      {
        rule_id: nanoid(),
        priority: 2,
        conditions: {
          complexity_range: [0.3, 0.6],
        },
        route_to: {
          provider: 'google',
          model: 'gemini-1.5-flash',
        },
        performance: {
          usage_count: 0,
          success_rate: 0.82,
          avg_quality: 0.82,
          avg_cost: 0,
          avg_latency: 700,
        },
        status: 'active',
        confidence: 0.85,
        last_evaluation: new Date().toISOString(),
      },
      {
        rule_id: nanoid(),
        priority: 3,
        conditions: {
          complexity_range: [0.6, 0.8],
          query_types: ['code_generation'],
        },
        route_to: {
          provider: 'deepseek',
          model: 'deepseek-coder',
        },
        performance: {
          usage_count: 0,
          success_rate: 0.88,
          avg_quality: 0.88,
          avg_cost: 0.0005,
          avg_latency: 900,
        },
        status: 'active',
        confidence: 0.9,
        last_evaluation: new Date().toISOString(),
      },
      {
        rule_id: nanoid(),
        priority: 4,
        conditions: {
          complexity_range: [0.8, 1.0],
        },
        route_to: {
          provider: 'anthropic',
          model: 'claude-sonnet-4.5',
        },
        performance: {
          usage_count: 0,
          success_rate: 0.96,
          avg_quality: 0.96,
          avg_cost: 0.01,
          avg_latency: 1500,
        },
        status: 'active',
        confidence: 0.95,
        last_evaluation: new Date().toISOString(),
      },
    ];

    return {
      version: '1.0.0',
      last_updated: new Date().toISOString(),
      rules,
      total_routings: 0,
      success_rate: 0,
      avg_cost_savings: 0,
      avg_quality: 0,
      learning_rate: 0.01,
      last_optimization: new Date().toISOString(),
    };
  }

  private async updateRule(decision: RoutingDecision, outcome: RoutingOutcome): Promise<void> {
    const matchingRule = this.routingTable.rules.find(
      r =>
        r.route_to.provider === decision.selected_provider &&
        r.route_to.model === decision.selected_model
    );

    if (!matchingRule) return;

    // Update usage count
    matchingRule.performance.usage_count += 1;

    // Update success rate
    const wasSuccessful = outcome.user_satisfied && outcome.actual_quality >= 0.7;
    const newSuccessCount =
      matchingRule.performance.success_rate * (matchingRule.performance.usage_count - 1) +
      (wasSuccessful ? 1 : 0);
    matchingRule.performance.success_rate =
      newSuccessCount / matchingRule.performance.usage_count;

    // Update average quality
    const totalQuality =
      matchingRule.performance.avg_quality * (matchingRule.performance.usage_count - 1) +
      outcome.actual_quality;
    matchingRule.performance.avg_quality = totalQuality / matchingRule.performance.usage_count;

    // Update average cost
    const totalCost =
      matchingRule.performance.avg_cost * (matchingRule.performance.usage_count - 1) +
      outcome.actual_cost_usd;
    matchingRule.performance.avg_cost = totalCost / matchingRule.performance.usage_count;

    // Update average latency
    const totalLatency =
      matchingRule.performance.avg_latency * (matchingRule.performance.usage_count - 1) +
      outcome.actual_latency_ms;
    matchingRule.performance.avg_latency = totalLatency / matchingRule.performance.usage_count;

    // Adjust confidence based on performance
    if (outcome.routing_was_optimal) {
      matchingRule.confidence = Math.min(matchingRule.confidence * 1.01, 1.0);
    } else {
      matchingRule.confidence = Math.max(matchingRule.confidence * 0.99, 0.3);
    }

    matchingRule.last_evaluation = new Date().toISOString();
  }

  private async considerNewRule(
    decision: RoutingDecision,
    outcome: RoutingOutcome
  ): Promise<void> {
    // If there's a consistently better route, create a new rule
    if (outcome.better_route_exists && this.shouldCreateNewRule(outcome)) {
      const newRule: RoutingRule = {
        rule_id: nanoid(),
        priority: this.routingTable.rules.length + 1,
        conditions: {
          complexity_range: [
            Math.max(0, decision.complexity - 0.1),
            Math.min(1, decision.complexity + 0.1),
          ],
          query_types: [decision.query_type],
        },
        route_to: {
          provider: outcome.better_route_exists.provider,
          model: outcome.better_route_exists.model,
        },
        performance: {
          usage_count: 0,
          success_rate: 0,
          avg_quality: outcome.better_route_exists.estimated_quality,
          avg_cost: outcome.better_route_exists.estimated_cost_usd,
          avg_latency: outcome.better_route_exists.estimated_latency_ms,
        },
        status: 'experimental',
        confidence: 0.5,
        last_evaluation: new Date().toISOString(),
      };

      this.routingTable.rules.push(newRule);
    }
  }

  private shouldCreateNewRule(outcome: RoutingOutcome): boolean {
    // Only create new rule if there's significant evidence
    // For now, simplified - in production would require multiple occurrences
    return outcome.quality_delta < -0.2 && outcome.cost_delta > 0.001;
  }

  private updateStatistics(): void {
    this.routingTable.total_routings = this.learningHistory.length;

    if (this.learningHistory.length > 0) {
      const totalSuccess = this.learningHistory.filter(
        h => h.outcome.user_satisfied
      ).length;
      this.routingTable.success_rate = totalSuccess / this.learningHistory.length;

      const totalQuality = this.learningHistory.reduce(
        (sum, h) => sum + h.outcome.actual_quality,
        0
      );
      this.routingTable.avg_quality = totalQuality / this.learningHistory.length;

      // Calculate average cost savings vs always-premium baseline
      const totalActualCost = this.learningHistory.reduce(
        (sum, h) => sum + h.outcome.actual_cost_usd,
        0
      );
      const totalPremiumCost = this.learningHistory.length * 0.01; // Assume $0.01 per query
      this.routingTable.avg_cost_savings =
        totalPremiumCost > 0 ? ((totalPremiumCost - totalActualCost) / totalPremiumCost) * 100 : 0;
    }

    this.routingTable.last_updated = new Date().toISOString();
  }
}
