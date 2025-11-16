/**
 * QUALITY JUDGE
 *
 * Scores solutions for quality.
 * Higher score = better solution.
 */

export class QualityJudge {
  /**
   * Score a solution (0.0 to 1.0)
   */
  async score(solution: string, query: string): Promise<number> {
    // Simplified scoring - in production would use actual LLM evaluation
    // or ensemble of judges

    let score = 0.5; // Start at middle

    // Length heuristic (too short or too long is bad)
    if (solution.length < 50) {
      score -= 0.2; // Too brief
    } else if (solution.length > 1000) {
      score -= 0.1; // Too verbose
    } else if (solution.length > 100 && solution.length < 500) {
      score += 0.1; // Good length
    }

    // Completeness heuristic
    if (solution.includes('step') || solution.includes('approach')) {
      score += 0.05; // Has structure
    }

    // Reasoning heuristic
    if (solution.includes('because') || solution.includes('therefore')) {
      score += 0.05; // Has reasoning
    }

    // Specificity heuristic
    if (solution.includes('specifically') || solution.includes('example')) {
      score += 0.05; // Has specifics
    }

    // Query relevance (simple keyword matching)
    const queryTokens = query.toLowerCase().split(/\s+/);
    const solutionLower = solution.toLowerCase();
    let relevanceScore = 0;

    for (const token of queryTokens) {
      if (token.length > 3 && solutionLower.includes(token)) {
        relevanceScore += 0.02;
      }
    }

    score += Math.min(relevanceScore, 0.2);

    // Agent type bonus (some agent types excel at certain tasks)
    if (solution.includes('[Apollo')) {
      score += 0.03; // Strategic thinking bonus
    }
    if (solution.includes('[Athena')) {
      score += 0.05; // Logic/reasoning bonus
    }

    // Normalize to 0.0-1.0
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Score multiple solutions and rank them
   */
  async rankSolutions(
    solutions: Array<{ id: string; content: string }>,
    query: string
  ): Promise<Array<{ id: string; score: number }>> {
    const scored = await Promise.all(
      solutions.map(async s => ({
        id: s.id,
        score: await this.score(s.content, query),
      }))
    );

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Compare two solutions and pick winner
   */
  async compare(
    solution1: string,
    solution2: string,
    query: string
  ): Promise<{ winner: 1 | 2; score1: number; score2: number }> {
    const score1 = await this.score(solution1, query);
    const score2 = await this.score(solution2, query);

    return {
      winner: score1 >= score2 ? 1 : 2,
      score1,
      score2,
    };
  }
}
