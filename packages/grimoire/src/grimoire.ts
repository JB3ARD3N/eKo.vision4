/**
 * GRIMOIRE - The Living Pattern Library
 *
 * Self-improving knowledge base.
 * Patterns weighted by gratitude signals.
 * Learns what actually helps.
 */

import { nanoid } from 'nanoid';
import type {
  Pattern,
  PatternCategory,
  PatternMatch,
  PatternLearningEvent,
  GlyphLibraryEntry,
  Glyph,
  GlyphType,
} from '@mikedrop/types';
import { PatternMatcher } from './pattern-matcher.js';
import { SemanticSearch } from './semantic-search.js';
import { generateEmbedding } from './utils/embedding.js';

export interface GrimoireConfig {
  auto_learn?: boolean;
  learning_threshold?: number; // Minimum gratitude to consider pattern validated
}

export class Grimoire {
  private patterns: Map<string, Pattern> = new Map();
  private glyphs: Map<string, GlyphLibraryEntry> = new Map();
  private patternMatcher: PatternMatcher;
  private semanticSearch: SemanticSearch;
  private config: GrimoireConfig;

  constructor(config: GrimoireConfig = {}) {
    this.config = {
      auto_learn: config.auto_learn ?? true,
      learning_threshold: config.learning_threshold ?? 0.7,
    };

    this.patternMatcher = new PatternMatcher();
    this.semanticSearch = new SemanticSearch();
  }

  /**
   * Store a pattern in the Grimoire
   */
  async storePattern(pattern: Omit<Pattern, 'pattern_id'>): Promise<Pattern> {
    const pattern_id = nanoid();

    // Generate semantic embedding for search
    const semantic_embedding = await generateEmbedding(
      pattern.name + ' ' + pattern.description + ' ' + pattern.template
    );

    const completePattern: Pattern = {
      ...pattern,
      pattern_id,
      semantic_embedding,
      performance: pattern.performance || {
        usage_count: 0,
        success_rate: 0,
        avg_gratitude: 0,
        avg_quality_score: 0,
        total_value_created_usd: 0,
      },
      learned_from: pattern.learned_from || {
        glyph_ids: [],
        collaboration_ids: [],
        gratitude_events: [],
      },
      changelog: pattern.changelog || [],
    };

    this.patterns.set(pattern_id, completePattern);

    // Index for semantic search
    await this.semanticSearch.addPattern(completePattern);

    return completePattern;
  }

  /**
   * Store a glyph in the library
   */
  async storeGlyph(glyph: Omit<GlyphLibraryEntry, 'id'>): Promise<GlyphLibraryEntry> {
    const id = nanoid();

    // Generate semantic embedding
    const semantic_embedding = await generateEmbedding(glyph.content);

    const completeGlyph: GlyphLibraryEntry = {
      ...glyph,
      id,
      semantic_embedding,
      usage: glyph.usage || {
        count: 0,
        success_rate: 0,
        avg_gratitude: 0,
        last_used: new Date().toISOString(),
      },
      performance: glyph.performance || {
        quality_scores: [],
        cost_savings: [],
        user_satisfaction: [],
      },
      similar_glyphs: [],
      commonly_combined_with: [],
      replaces: [],
      status: glyph.status || 'active',
      version: glyph.version || '1.0.0',
      changelog: glyph.changelog || [],
    };

    this.glyphs.set(id, completeGlyph);

    // Index for semantic search
    await this.semanticSearch.addGlyph(completeGlyph);

    return completeGlyph;
  }

  /**
   * Find patterns matching a query
   */
  async findPatterns(query: {
    text?: string;
    category?: PatternCategory;
    min_success_rate?: number;
    min_gratitude?: number;
    limit?: number;
  }): Promise<PatternMatch[]> {
    let candidates = Array.from(this.patterns.values());

    // Filter by category
    if (query.category) {
      candidates = candidates.filter(p => p.category === query.category);
    }

    // Filter by performance
    if (query.min_success_rate !== undefined) {
      candidates = candidates.filter(p => p.performance.success_rate >= query.min_success_rate!);
    }

    if (query.min_gratitude !== undefined) {
      candidates = candidates.filter(p => p.performance.avg_gratitude >= query.min_gratitude!);
    }

    // Semantic search if text query
    let matches: PatternMatch[] = [];

    if (query.text) {
      const queryEmbedding = await generateEmbedding(query.text);
      matches = await this.semanticSearch.findSimilarPatterns(queryEmbedding, candidates);
    } else {
      // No text query - use all candidates
      matches = candidates.map(p => ({
        pattern_id: p.pattern_id,
        pattern_name: p.name,
        confidence: 1.0,
        similarity: 1.0,
        matching_factors: {
          keyword_match: 0,
          semantic_match: 0,
          context_match: 0,
          historical_match: 0,
        },
        recommended: true,
        reason: 'Matches filters',
        estimated_quality: p.performance.avg_quality_score,
        estimated_cost_savings: 0,
      }));
    }

    // Sort by performance and relevance
    matches.sort((a, b) => {
      const patternA = this.patterns.get(a.pattern_id)!;
      const patternB = this.patterns.get(b.pattern_id)!;

      // Combine similarity with performance
      const scoreA = a.similarity * 0.5 + patternA.performance.avg_gratitude * 0.5;
      const scoreB = b.similarity * 0.5 + patternB.performance.avg_gratitude * 0.5;

      return scoreB - scoreA;
    });

    // Limit results
    if (query.limit) {
      matches = matches.slice(0, query.limit);
    }

    return matches;
  }

  /**
   * Find similar glyphs
   */
  async findSimilarGlyphs(glyphId: string, limit: number = 5): Promise<GlyphLibraryEntry[]> {
    const glyph = this.glyphs.get(glyphId);
    if (!glyph || !glyph.semantic_embedding) {
      return [];
    }

    const allGlyphs = Array.from(this.glyphs.values()).filter(g => g.id !== glyphId);
    return this.semanticSearch.findSimilarGlyphs(glyph.semantic_embedding, allGlyphs, limit);
  }

  /**
   * Update pattern performance based on usage
   */
  async recordPatternUsage(params: {
    pattern_id: string;
    quality_score: number;
    gratitude_weight: number;
    value_created_usd?: number;
    success: boolean;
  }): Promise<void> {
    const pattern = this.patterns.get(params.pattern_id);
    if (!pattern) {
      throw new Error(`Pattern ${params.pattern_id} not found`);
    }

    // Update usage count
    pattern.performance.usage_count += 1;

    // Update success rate
    if (params.success) {
      const newSuccessCount =
        pattern.performance.success_rate * (pattern.performance.usage_count - 1) + 1;
      pattern.performance.success_rate = newSuccessCount / pattern.performance.usage_count;
    }

    // Update average gratitude
    const totalGratitude =
      pattern.performance.avg_gratitude * (pattern.performance.usage_count - 1) +
      params.gratitude_weight;
    pattern.performance.avg_gratitude = totalGratitude / pattern.performance.usage_count;

    // Update average quality
    const totalQuality =
      pattern.performance.avg_quality_score * (pattern.performance.usage_count - 1) +
      params.quality_score;
    pattern.performance.avg_quality_score = totalQuality / pattern.performance.usage_count;

    // Update value created
    if (params.value_created_usd) {
      pattern.performance.total_value_created_usd += params.value_created_usd;
    }

    // Auto-promote to validated if meets threshold
    if (
      this.config.auto_learn &&
      pattern.status === 'experimental' &&
      pattern.performance.avg_gratitude >= this.config.learning_threshold! &&
      pattern.performance.usage_count >= 5
    ) {
      pattern.status = 'validated';

      pattern.changelog.push({
        version: this.incrementVersion(pattern.version),
        timestamp: new Date().toISOString(),
        changed_by: 'grimoire_auto_learn',
        change_type: 'optimization',
        description: 'Auto-promoted to validated based on performance',
        performance_delta: {
          success_rate_change: pattern.performance.success_rate,
          quality_change: pattern.performance.avg_quality_score,
          gratitude_change: pattern.performance.avg_gratitude,
        },
      });
    }
  }

  /**
   * Learn a new pattern from successful usage
   */
  async learnPattern(event: PatternLearningEvent): Promise<Pattern | null> {
    if (!this.config.auto_learn) {
      return null;
    }

    if (event.confidence < this.config.learning_threshold!) {
      return null;
    }

    // Check if pattern already exists
    const existingMatches = await this.findPatterns({
      text: event.pattern.name,
      limit: 1,
    });

    if (existingMatches.length > 0 && existingMatches[0].similarity > 0.9) {
      // Pattern already exists - just update performance
      return null;
    }

    // Store new pattern
    return this.storePattern(event.pattern);
  }

  /**
   * Get grimoire statistics
   */
  async getStats(): Promise<{
    total_patterns: number;
    total_glyphs: number;
    validated_patterns: number;
    experimental_patterns: number;
    avg_pattern_quality: number;
    avg_glyph_quality: number;
    total_value_created: number;
  }> {
    const patterns = Array.from(this.patterns.values());
    const glyphs = Array.from(this.glyphs.values());

    return {
      total_patterns: patterns.length,
      total_glyphs: glyphs.length,
      validated_patterns: patterns.filter(p => p.status === 'validated').length,
      experimental_patterns: patterns.filter(p => p.status === 'experimental').length,
      avg_pattern_quality:
        patterns.reduce((sum, p) => sum + p.performance.avg_quality_score, 0) /
        Math.max(patterns.length, 1),
      avg_glyph_quality:
        glyphs.reduce((sum, g) => sum + (g.usage.success_rate || 0), 0) / Math.max(glyphs.length, 1),
      total_value_created: patterns.reduce(
        (sum, p) => sum + p.performance.total_value_created_usd,
        0
      ),
    };
  }

  /**
   * Get pattern by ID
   */
  async getPattern(pattern_id: string): Promise<Pattern | null> {
    return this.patterns.get(pattern_id) || null;
  }

  /**
   * Get glyph by ID
   */
  async getGlyph(glyph_id: string): Promise<GlyphLibraryEntry | null> {
    return this.glyphs.get(glyph_id) || null;
  }

  // Private helpers

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }
}
