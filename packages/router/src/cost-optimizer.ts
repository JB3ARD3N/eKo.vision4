/**
 * COST OPTIMIZER
 *
 * Optimizes routing decisions for maximum cost savings
 * while maintaining quality.
 */

import type { RouteOption, LLMProvider } from '@mikedrop/types';

export class CostOptimizer {
  /**
   * Find the most cost-effective route that meets quality requirements
   */
  findOptimalRoute(
    options: RouteOption[],
    min_quality: number = 0.7,
    max_cost: number = Infinity
  ): RouteOption | null {
    // Filter options that meet quality requirement and cost constraint
    const viable = options.filter(
      opt => opt.estimated_quality >= min_quality && opt.estimated_cost_usd <= max_cost
    );

    if (viable.length === 0) {
      return null;
    }

    // Sort by cost (ascending) then by quality (descending)
    viable.sort((a, b) => {
      if (a.estimated_cost_usd !== b.estimated_cost_usd) {
        return a.estimated_cost_usd - b.estimated_cost_usd;
      }
      return b.estimated_quality - a.estimated_quality;
    });

    return viable[0];
  }

  /**
   * Calculate potential savings from choosing one route over another
   */
  calculateSavings(selectedRoute: RouteOption, baselineRoute: RouteOption): {
    cost_savings_usd: number;
    cost_savings_percent: number;
    quality_tradeoff: number;
  } {
    const cost_savings_usd = baselineRoute.estimated_cost_usd - selectedRoute.estimated_cost_usd;
    const cost_savings_percent =
      baselineRoute.estimated_cost_usd > 0
        ? (cost_savings_usd / baselineRoute.estimated_cost_usd) * 100
        : 0;

    const quality_tradeoff = selectedRoute.estimated_quality - baselineRoute.estimated_quality;

    return {
      cost_savings_usd,
      cost_savings_percent,
      quality_tradeoff,
    };
  }

  /**
   * Recommend tier based on usage patterns
   */
  recommendTier(params: {
    avg_complexity: number;
    quality_requirement: number;
    budget_usd_per_month: number;
    queries_per_month: number;
  }): {
    recommended_split: Record<'free' | 'cheap' | 'premium', number>;
    estimated_cost: number;
    estimated_quality: number;
  } {
    const { avg_complexity, quality_requirement, budget_usd_per_month, queries_per_month } = params;

    let free_percent = 0;
    let cheap_percent = 0;
    let premium_percent = 0;

    // If complexity is low and quality requirement is moderate
    if (avg_complexity < 0.4 && quality_requirement < 0.85) {
      free_percent = 80;
      cheap_percent = 15;
      premium_percent = 5;
    }
    // If complexity is moderate
    else if (avg_complexity < 0.7 && quality_requirement < 0.90) {
      free_percent = 50;
      cheap_percent = 35;
      premium_percent = 15;
    }
    // If high complexity or high quality requirement
    else {
      free_percent = 20;
      cheap_percent = 30;
      premium_percent = 50;
    }

    // Adjust based on budget
    const cost_per_query_baseline = 0.01; // Assume $0.01 per premium query
    const estimated_baseline_cost = queries_per_month * cost_per_query_baseline;

    if (budget_usd_per_month < estimated_baseline_cost * 0.5) {
      // Very tight budget - shift to free tier
      free_percent = Math.min(free_percent + 20, 90);
      premium_percent = Math.max(premium_percent - 20, 5);
    }

    // Calculate estimated cost
    const free_cost = 0;
    const cheap_cost_per_query = 0.001; // $0.001
    const premium_cost_per_query = 0.01; // $0.01

    const estimated_cost =
      (queries_per_month * free_percent / 100) * free_cost +
      (queries_per_month * cheap_percent / 100) * cheap_cost_per_query +
      (queries_per_month * premium_percent / 100) * premium_cost_per_query;

    // Estimate quality
    const free_quality = 0.75;
    const cheap_quality = 0.85;
    const premium_quality = 0.96;

    const estimated_quality =
      (free_percent / 100) * free_quality +
      (cheap_percent / 100) * cheap_quality +
      (premium_percent / 100) * premium_quality;

    return {
      recommended_split: {
        free: free_percent,
        cheap: cheap_percent,
        premium: premium_percent,
      },
      estimated_cost,
      estimated_quality,
    };
  }
}
