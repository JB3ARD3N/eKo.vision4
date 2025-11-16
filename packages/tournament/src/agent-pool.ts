/**
 * AGENT POOL
 *
 * Manages the pool of 100+ agents with rotating leadership.
 * Highest-rated agents lead clusters.
 */

import { nanoid } from 'nanoid';
import type { AvatarType } from '@mikedrop/types';

export interface Agent {
  id: string;
  type: AvatarType;
  elo_rating: number;
}

export class AgentPool {
  private agents: Agent[] = [];

  constructor() {
    this.initializeAgents();
  }

  /**
   * Initialize agent pool with balanced distribution
   */
  private initializeAgents(): void {
    const avatarTypes: AvatarType[] = [
      'apollo',
      'athena',
      'ares',
      'hermes',
      'hephaestus',
      'artemis',
      'mercury',
    ];

    // Create ~100 agents with balanced distribution
    const agentsPerType = Math.floor(100 / avatarTypes.length);

    for (const type of avatarTypes) {
      for (let i = 0; i < agentsPerType; i++) {
        this.agents.push({
          id: nanoid(),
          type,
          elo_rating: 1200 + Math.random() * 200, // 1200-1400 starting rating
        });
      }
    }

    console.log(`🤖 Agent pool initialized: ${this.agents.length} agents across ${avatarTypes.length} types`);
  }

  /**
   * Get agents for a debate (highest rated first)
   */
  getAgents(count: number): Agent[] {
    // Sort by Elo rating (highest first)
    const sorted = [...this.agents].sort((a, b) => b.elo_rating - a.elo_rating);

    // Return top N agents
    return sorted.slice(0, count);
  }

  /**
   * Get agents by type
   */
  getAgentsByType(type: AvatarType, count: number): Agent[] {
    const ofType = this.agents.filter(a => a.type === type);
    return ofType
      .sort((a, b) => b.elo_rating - a.elo_rating)
      .slice(0, count);
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(limit: number = 10): Agent[] {
    return [...this.agents]
      .sort((a, b) => b.elo_rating - a.elo_rating)
      .slice(0, limit);
  }

  /**
   * Get statistics
   */
  getStats(): {
    total_agents: number;
    by_type: Record<AvatarType, number>;
    avg_rating: number;
    top_rated: Agent;
  } {
    const by_type = this.agents.reduce((acc, agent) => {
      acc[agent.type] = (acc[agent.type] || 0) + 1;
      return acc;
    }, {} as Record<AvatarType, number>);

    const avg_rating =
      this.agents.reduce((sum, a) => sum + a.elo_rating, 0) / this.agents.length;

    const top_rated = [...this.agents].sort((a, b) => b.elo_rating - a.elo_rating)[0];

    return {
      total_agents: this.agents.length,
      by_type,
      avg_rating,
      top_rated,
    };
  }
}
