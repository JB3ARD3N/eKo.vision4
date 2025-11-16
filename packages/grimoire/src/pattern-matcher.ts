/**
 * PATTERN MATCHER
 *
 * Matches queries to known patterns.
 * Learns from successful matches.
 */

import type { Pattern, PatternMatch } from '@mikedrop/types';

export class PatternMatcher {
  /**
   * Match a query against patterns using keyword matching
   */
  matchByKeywords(query: string, patterns: Pattern[]): PatternMatch[] {
    const queryLower = query.toLowerCase();
    const queryTokens = this.tokenize(queryLower);

    const matches: PatternMatch[] = [];

    for (const pattern of patterns) {
      const patternText = (
        pattern.name +
        ' ' +
        pattern.description +
        ' ' +
        pattern.tags.join(' ') +
        ' ' +
        pattern.keywords.join(' ')
      ).toLowerCase();

      const patternTokens = this.tokenize(patternText);

      // Calculate keyword overlap
      const overlap = this.calculateOverlap(queryTokens, patternTokens);

      if (overlap > 0) {
        matches.push({
          pattern_id: pattern.pattern_id,
          pattern_name: pattern.name,
          confidence: overlap,
          similarity: overlap,
          matching_factors: {
            keyword_match: overlap,
            semantic_match: 0,
            context_match: 0,
            historical_match: 0,
          },
          recommended: overlap > 0.3,
          reason: overlap > 0.5 ? 'Strong keyword match' : 'Partial keyword match',
          estimated_quality: pattern.performance.avg_quality_score,
          estimated_cost_savings: 0,
        });
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Match based on pattern category
   */
  matchByCategory(
    query: string,
    patterns: Pattern[]
  ): { category: string; confidence: number }[] {
    const categoryKeywords: Record<string, string[]> = {
      code_generation: ['code', 'generate', 'create', 'build', 'implement', 'write'],
      problem_decomposition: ['problem', 'break', 'decompose', 'analyze', 'split', 'divide'],
      strategic_planning: ['strategy', 'plan', 'roadmap', 'vision', 'direction'],
      creative_synthesis: ['creative', 'combine', 'synthesize', 'merge', 'blend'],
      optimization: ['optimize', 'improve', 'faster', 'better', 'efficient'],
      debugging: ['debug', 'fix', 'error', 'bug', 'issue', 'problem'],
      architecture: ['architecture', 'design', 'structure', 'system', 'framework'],
      communication: ['communicate', 'explain', 'clarify', 'describe', 'tell'],
      analysis: ['analyze', 'examine', 'study', 'investigate', 'explore'],
      validation: ['validate', 'verify', 'check', 'test', 'confirm'],
    };

    const queryLower = query.toLowerCase();
    const results: { category: string; confidence: number }[] = [];

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      let matches = 0;
      for (const keyword of keywords) {
        if (queryLower.includes(keyword)) {
          matches++;
        }
      }

      if (matches > 0) {
        results.push({
          category,
          confidence: matches / keywords.length,
        });
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  // Private helpers

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  private calculateOverlap(tokens1: string[], tokens2: string[]): number {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);

    let intersection = 0;
    for (const token of set1) {
      if (set2.has(token)) {
        intersection++;
      }
    }

    const union = set1.size + set2.size - intersection;
    return union > 0 ? intersection / union : 0;
  }
}
