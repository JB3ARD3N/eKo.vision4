/**
 * COMPLEXITY ANALYZER
 *
 * Analyzes query complexity to route appropriately.
 * Simple queries → free tier. Complex queries → premium.
 */

import type { QueryMetadata, QueryType } from '@mikedrop/types';

export class ComplexityAnalyzer {
  /**
   * Analyze query complexity (0.0 to 1.0)
   */
  async analyze(
    query: string,
    metadata: Partial<QueryMetadata>
  ): Promise<{ score: number; factors: any }> {
    const factors = {
      complexity_score: 0,
      cost_priority: 0,
      quality_priority: 0,
      speed_priority: 0,
      specialty_match: 0,
    };

    // Length factor
    const lengthScore = Math.min(query.length / 1000, 1.0);

    // Keyword complexity indicators
    const complexKeywords = [
      'analyze',
      'complex',
      'sophisticated',
      'nuanced',
      'comprehensive',
      'detailed',
      'intricate',
      'multifaceted',
    ];

    const simpleKeywords = ['simple', 'quick', 'basic', 'just', 'only', 'easy'];

    let keywordScore = 0.5; // Neutral start

    complexKeywords.forEach(keyword => {
      if (query.toLowerCase().includes(keyword)) {
        keywordScore += 0.1;
      }
    });

    simpleKeywords.forEach(keyword => {
      if (query.toLowerCase().includes(keyword)) {
        keywordScore -= 0.1;
      }
    });

    keywordScore = Math.max(0, Math.min(1, keywordScore));

    // Context length factor
    const contextScore = Math.min((metadata.context_length || 0) / 10000, 1.0);

    // Reasoning requirements
    let reasoningScore = 0.5;
    if (metadata.requires_reasoning) {
      reasoningScore = 0.8;
    }

    // Code requirements
    if (metadata.requires_code) {
      reasoningScore = Math.max(reasoningScore, 0.6);
    }

    // Creative requirements
    if (metadata.requires_creativity) {
      reasoningScore = Math.max(reasoningScore, 0.7);
    }

    // Urgency factor
    let urgencyBoost = 0;
    if (metadata.urgency === 'critical') {
      urgencyBoost = 0.3; // Critical queries → higher complexity → premium routing
    }

    // Combine factors
    const baseScore =
      lengthScore * 0.2 + keywordScore * 0.3 + contextScore * 0.2 + reasoningScore * 0.3;

    const finalScore = Math.min(baseScore + urgencyBoost, 1.0);

    factors.complexity_score = finalScore;

    return { score: finalScore, factors };
  }

  /**
   * Classify query type
   */
  classifyType(query: string, metadata: Partial<QueryMetadata>): QueryType {
    const queryLower = query.toLowerCase();

    // Code generation
    if (metadata.requires_code || this.hasCodeIndicators(queryLower)) {
      return 'code_generation';
    }

    // Complex reasoning
    if (
      metadata.requires_reasoning ||
      queryLower.includes('why') ||
      queryLower.includes('analyze') ||
      queryLower.includes('compare')
    ) {
      return 'complex_reasoning';
    }

    // Creative writing
    if (
      metadata.requires_creativity ||
      queryLower.includes('creative') ||
      queryLower.includes('story') ||
      queryLower.includes('write')
    ) {
      return 'creative_writing';
    }

    // Data analysis
    if (
      queryLower.includes('data') ||
      queryLower.includes('analyze') ||
      queryLower.includes('statistics')
    ) {
      return 'data_analysis';
    }

    // Strategic planning
    if (
      queryLower.includes('strategy') ||
      queryLower.includes('plan') ||
      queryLower.includes('roadmap')
    ) {
      return 'strategic_planning';
    }

    // Problem decomposition
    if (
      queryLower.includes('break down') ||
      queryLower.includes('decompose') ||
      queryLower.includes('steps')
    ) {
      return 'problem_decomposition';
    }

    // Optimization
    if (
      queryLower.includes('optimize') ||
      queryLower.includes('improve') ||
      queryLower.includes('faster')
    ) {
      return 'optimization';
    }

    // Synthesis
    if (
      queryLower.includes('combine') ||
      queryLower.includes('merge') ||
      queryLower.includes('synthesize')
    ) {
      return 'synthesis';
    }

    // Default to simple question
    return 'simple_question';
  }

  // Private helpers

  private hasCodeIndicators(query: string): boolean {
    const codeKeywords = [
      'function',
      'class',
      'code',
      'implement',
      'program',
      'algorithm',
      'script',
      'api',
      'debug',
      'refactor',
    ];

    return codeKeywords.some(keyword => query.includes(keyword));
  }
}
