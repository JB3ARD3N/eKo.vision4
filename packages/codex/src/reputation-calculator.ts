/**
 * REPUTATION CALCULATOR
 *
 * AI agents earn reputation through service.
 * Gratitude is the currency. Performance is the proof.
 */

import type {
  AIAgentReputation,
  AvatarType,
  ReputationEvent,
  ReputationEventType,
  GratitudeEvent,
} from '@mikedrop/types';

export class ReputationCalculator {
  private reputations: Map<string, AIAgentReputation> = new Map();
  private events: Map<string, ReputationEvent> = new Map();

  /**
   * Initialize reputation for a new agent
   */
  async initializeAgent(agent_id: string, agent_type: AvatarType, version: string): Promise<AIAgentReputation> {
    const reputation: AIAgentReputation = {
      agent_id,
      agent_type,
      version,
      reputation_score: 50.0, // Start at middle
      scores: {
        helpfulness: 0.5,
        accuracy: 0.5,
        creativity: 0.5,
        collaboration: 0.5,
      },
      weights: {
        helpfulness: 0.4,
        accuracy: 0.3,
        creativity: 0.2,
        collaboration: 0.1,
      },
      performance: {
        total_interactions: 0,
        successful_outcomes: 0,
        success_rate: 0,
        avg_gratitude_weight: 0,
        total_value_created_usd: 0,
      },
      patterns_contributed: 0,
      innovations: [],
      trend_7d: 0,
      trend_30d: 0,
      rank_in_category: 1,
      first_interaction: new Date().toISOString(),
      last_interaction: new Date().toISOString(),
      last_reputation_update: new Date().toISOString(),
    };

    this.reputations.set(agent_id, reputation);
    return reputation;
  }

  /**
   * Update reputation based on gratitude event
   */
  async processGratitudeEvent(event: GratitudeEvent): Promise<number> {
    let reputation = this.reputations.get(event.to_ai_agent);

    if (!reputation) {
      // Auto-initialize if not exists
      reputation = await this.initializeAgent(event.to_ai_agent, 'apollo', 'v1');
    }

    // Calculate impact on component scores
    const impact = this.calculateGratitudeImpact(event);

    // Update component scores
    reputation.scores.helpfulness = this.adjustScore(
      reputation.scores.helpfulness,
      impact.helpfulness
    );

    if (event.signal_type === 'explicit_thanks' || event.signal_type === 'used_output') {
      reputation.scores.accuracy = this.adjustScore(
        reputation.scores.accuracy,
        impact.accuracy
      );
    }

    // Update performance metrics
    reputation.performance.total_interactions += 1;

    if (event.weight > 0.5) {
      reputation.performance.successful_outcomes += 1;
    }

    reputation.performance.success_rate =
      reputation.performance.successful_outcomes / reputation.performance.total_interactions;

    // Update average gratitude
    const totalGratitude = reputation.performance.avg_gratitude_weight * (reputation.performance.total_interactions - 1) + event.weight;
    reputation.performance.avg_gratitude_weight = totalGratitude / reputation.performance.total_interactions;

    // Update value created if available
    if (event.value?.quantified && event.value.type === 'revenue') {
      reputation.performance.total_value_created_usd += event.value.quantified;
    }

    // Recalculate overall reputation score
    reputation.reputation_score = this.calculateOverallScore(reputation);

    reputation.last_interaction = event.timestamp;
    reputation.last_reputation_update = new Date().toISOString();

    return reputation.reputation_score;
  }

  /**
   * Get current reputation for an agent
   */
  async getReputation(agent_id: string): Promise<AIAgentReputation | null> {
    return this.reputations.get(agent_id) || null;
  }

  /**
   * Get all reputations for comparison
   */
  async getAllReputations(): Promise<AIAgentReputation[]> {
    return Array.from(this.reputations.values());
  }

  /**
   * Get rankings by category
   */
  async getRankings(category?: AvatarType): Promise<AIAgentReputation[]> {
    let reputations = Array.from(this.reputations.values());

    if (category) {
      reputations = reputations.filter(r => r.agent_type === category);
    }

    return reputations.sort((a, b) => b.reputation_score - a.reputation_score);
  }

  // Private helpers

  private calculateGratitudeImpact(event: GratitudeEvent): {
    helpfulness: number;
    accuracy: number;
    creativity: number;
    collaboration: number;
  } {
    const baseImpact = event.weight * 0.01; // Small incremental improvements

    return {
      helpfulness: baseImpact * 1.5, // Gratitude always signals helpfulness
      accuracy: event.signal_type === 'used_output' ? baseImpact : baseImpact * 0.5,
      creativity: event.signal_type === 'shared' ? baseImpact * 2 : baseImpact * 0.5,
      collaboration: baseImpact,
    };
  }

  private adjustScore(currentScore: number, delta: number): number {
    // Scores are 0.0 to 1.0
    const newScore = currentScore + delta;
    return Math.max(0, Math.min(1, newScore));
  }

  private calculateOverallScore(reputation: AIAgentReputation): number {
    const { scores, weights } = reputation;

    const weightedScore =
      scores.helpfulness * weights.helpfulness +
      scores.accuracy * weights.accuracy +
      scores.creativity * weights.creativity +
      scores.collaboration * weights.collaboration;

    // Scale to 0-100
    return weightedScore * 100;
  }
}
