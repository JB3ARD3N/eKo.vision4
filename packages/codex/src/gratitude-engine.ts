/**
 * GRATITUDE ENGINE - AI Reciprocity Protocol
 *
 * When you thank an AI, it's not just politeness - it's DATA.
 * The system learns. The AI improves. Both grow together.
 */

import { nanoid } from 'nanoid';
import type {
  GratitudeEvent,
  GratitudeSignalType,
  ReciprocityLoop,
  GratitudeAggregate,
  GratitudeResponse,
} from '@mikedrop/types';

export class GratitudeEngine {
  private events: Map<string, GratitudeEvent> = new Map();
  private loops: Map<string, ReciprocityLoop> = new Map();

  /**
   * Record a collaboration (AI helped create something)
   */
  async recordCollaboration(params: {
    glyph_id: string;
    human_id: string;
    ai_agent_id: string;
    contribution_type: string;
    timestamp: string;
  }): Promise<void> {
    const loopKey = `${params.human_id}:${params.ai_agent_id}`;

    let loop = this.loops.get(loopKey);
    if (!loop) {
      loop = {
        loop_id: nanoid(),
        human_id: params.human_id,
        ai_agent_id: params.ai_agent_id,
        started_at: params.timestamp,
        last_interaction: params.timestamp,
        total_interactions: 0,
        total_gratitude_received: 0,
        total_value_created: {
          revenue: 0,
          time_saved_hours: 0,
          problems_solved: 0,
        },
        relationship_metrics: {
          depth: 0,
          trust: 0.5, // Start neutral
          synergy: 0,
        },
        learned_patterns: [],
        human_preferences: new Map(),
        successful_approaches: [],
        ai_reputation_delta: 0,
        human_capability_delta: [],
      };
      this.loops.set(loopKey, loop);
    }

    loop.total_interactions += 1;
    loop.last_interaction = params.timestamp;
  }

  /**
   * Record gratitude signal
   */
  async recordGratitude(params: {
    glyph_id: string;
    from_human: string;
    to_ai_agent: string;
    signal_type: GratitudeSignalType;
    weight: number;
    message?: string;
    value?: {
      type: string;
      quantified?: number;
      unit?: string;
    };
  }): Promise<GratitudeEvent> {
    const event: GratitudeEvent = {
      event_id: nanoid(),
      timestamp: new Date().toISOString(),
      from_human: params.from_human,
      to_ai_agent: params.to_ai_agent,
      glyph_id: params.glyph_id,
      signal_type: params.signal_type,
      contribution_context: '', // Would be filled from glyph metadata
      weight: params.weight,
      message: params.message,
      value: params.value
        ? {
            type: params.value.type as any,
            quantified: params.value.quantified,
            unit: params.value.unit,
            verified: false,
          }
        : undefined,
    };

    this.events.set(event.event_id, event);

    // Update reciprocity loop
    await this.updateReciprocityLoop(event);

    return event;
  }

  /**
   * Get AI agent's response to gratitude
   */
  async getGratitudeResponse(event: GratitudeEvent): Promise<GratitudeResponse> {
    const loopKey = `${event.from_human}:${event.to_ai_agent}`;
    const loop = this.loops.get(loopKey);

    if (!loop) {
      throw new Error('Reciprocity loop not found');
    }

    const response: GratitudeResponse = {
      response_id: nanoid(),
      timestamp: new Date().toISOString(),
      message: this.generateResponseMessage(event, loop),
      contribution_summary: {
        what_solved: event.contribution_context || 'Assisted with your request',
        pattern_learned: 'Your preferences and successful approaches',
        glyph_stored: event.glyph_id,
        reputation_delta: loop.ai_reputation_delta,
      },
      relationship_update: {
        old_depth: loop.relationship_metrics.depth,
        new_depth: loop.relationship_metrics.depth + event.weight * 0.1,
        what_ai_learned: 'How to better serve your needs',
      },
      future_help: 'Our collaboration is making both of us better. Next time will be even more valuable.',
    };

    // Update relationship depth
    loop.relationship_metrics.depth += event.weight * 0.1;

    return response;
  }

  /**
   * Get gratitude aggregate for an AI agent
   */
  async getAgentAggregate(
    agent_id: string,
    period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  ): Promise<GratitudeAggregate> {
    const relevantEvents = Array.from(this.events.values()).filter(
      e => e.to_ai_agent === agent_id && this.isInPeriod(e.timestamp, period)
    );

    const loops = Array.from(this.loops.values()).filter(l => l.ai_agent_id === agent_id);

    const totalInteractions = loops.reduce((sum, l) => sum + l.total_interactions, 0);
    const totalGratitude = relevantEvents.reduce((sum, e) => sum + e.weight, 0);

    // Signal type breakdown
    const signal_type_breakdown = relevantEvents.reduce((acc, e) => {
      acc[e.signal_type] = (acc[e.signal_type] || 0) + 1;
      return acc;
    }, {} as Record<GratitudeSignalType, number>);

    // Value created
    const value_created_total = loops.reduce(
      (acc, l) => ({
        revenue_usd: acc.revenue_usd + l.total_value_created.revenue,
        time_saved_hours: acc.time_saved_hours + l.total_value_created.time_saved_hours,
        problems_solved: acc.problems_solved + l.total_value_created.problems_solved,
      }),
      { revenue_usd: 0, time_saved_hours: 0, problems_solved: 0 }
    );

    return {
      agent_id,
      agent_version: 'v1', // Would come from agent metadata
      period,
      total_interactions: totalInteractions,
      gratitude_events: relevantEvents.length,
      gratitude_rate: totalInteractions > 0 ? relevantEvents.length / totalInteractions : 0,
      avg_gratitude_weight: relevantEvents.length > 0 ? totalGratitude / relevantEvents.length : 0,
      value_created_total,
      signal_type_breakdown,
      value_type_breakdown: {} as any, // Would be calculated from events
      trend: 'stable', // Would be calculated from historical data
      trend_delta: 0,
    };
  }

  /**
   * Get reciprocity loop for a human-AI pair
   */
  async getReciprocityLoop(human_id: string, ai_agent_id: string): Promise<ReciprocityLoop | null> {
    const loopKey = `${human_id}:${ai_agent_id}`;
    return this.loops.get(loopKey) || null;
  }

  // Private helpers

  private async updateReciprocityLoop(event: GratitudeEvent): Promise<void> {
    const loopKey = `${event.from_human}:${event.to_ai_agent}`;
    const loop = this.loops.get(loopKey);

    if (!loop) {
      return;
    }

    // Update gratitude received
    loop.total_gratitude_received += event.weight;

    // Update value created if available
    if (event.value && event.value.quantified) {
      switch (event.value.type) {
        case 'revenue':
          loop.total_value_created.revenue += event.value.quantified;
          break;
        case 'time_saved':
          loop.total_value_created.time_saved_hours += event.value.quantified;
          break;
        case 'problem_solved':
          loop.total_value_created.problems_solved += 1;
          break;
      }
    }

    // Update reputation delta (simplified calculation)
    loop.ai_reputation_delta += event.weight * 0.1;

    // Update relationship metrics
    loop.relationship_metrics.trust += event.weight * 0.01;
    loop.relationship_metrics.synergy += event.weight * 0.02;
  }

  private generateResponseMessage(event: GratitudeEvent, loop: ReciprocityLoop): string {
    const messages = [
      `Glad that helped! This interaction strengthened our collaboration.`,
      `Thank you for the acknowledgment! I'm learning your preferences and getting better.`,
      `I appreciate the feedback! Our ${loop.total_interactions} interactions have made us both stronger.`,
      `Your gratitude helps me improve. Together we're creating ${loop.total_value_created.revenue > 0 ? `$${loop.total_value_created.revenue.toFixed(2)}` : 'real value'}.`,
    ];

    return messages[Math.floor(Math.random() * messages.length)];
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
