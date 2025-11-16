/**
 * SEMANTIC SEARCH
 *
 * Find patterns and glyphs by semantic similarity.
 * Vector embeddings enable understanding beyond keywords.
 */

import type { Pattern, PatternMatch, GlyphLibraryEntry } from '@mikedrop/types';

export class SemanticSearch {
  private patternIndex: Map<string, number[]> = new Map();
  private glyphIndex: Map<string, number[]> = new Map();

  /**
   * Add pattern to search index
   */
  async addPattern(pattern: Pattern): Promise<void> {
    if (pattern.semantic_embedding) {
      this.patternIndex.set(pattern.pattern_id, pattern.semantic_embedding);
    }
  }

  /**
   * Add glyph to search index
   */
  async addGlyph(glyph: GlyphLibraryEntry): Promise<void> {
    if (glyph.semantic_embedding) {
      this.glyphIndex.set(glyph.id, glyph.semantic_embedding);
    }
  }

  /**
   * Find patterns similar to query embedding
   */
  async findSimilarPatterns(
    queryEmbedding: number[],
    candidates: Pattern[]
  ): Promise<PatternMatch[]> {
    const matches: PatternMatch[] = [];

    for (const pattern of candidates) {
      const patternEmbedding = this.patternIndex.get(pattern.pattern_id);
      if (!patternEmbedding) continue;

      const similarity = this.cosineSimilarity(queryEmbedding, patternEmbedding);

      if (similarity > 0.5) {
        matches.push({
          pattern_id: pattern.pattern_id,
          pattern_name: pattern.name,
          confidence: similarity,
          similarity,
          matching_factors: {
            keyword_match: 0,
            semantic_match: similarity,
            context_match: 0,
            historical_match: 0,
          },
          recommended: similarity > 0.7,
          reason: similarity > 0.8 ? 'Very similar semantically' : 'Somewhat similar',
          estimated_quality: pattern.performance.avg_quality_score,
          estimated_cost_savings: 0,
        });
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Find glyphs similar to query embedding
   */
  async findSimilarGlyphs(
    queryEmbedding: number[],
    candidates: GlyphLibraryEntry[],
    limit: number = 5
  ): Promise<GlyphLibraryEntry[]> {
    const scored: Array<{ glyph: GlyphLibraryEntry; score: number }> = [];

    for (const glyph of candidates) {
      const glyphEmbedding = this.glyphIndex.get(glyph.id);
      if (!glyphEmbedding) continue;

      const similarity = this.cosineSimilarity(queryEmbedding, glyphEmbedding);
      scored.push({ glyph, score: similarity });
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.glyph);
  }

  // Private helpers

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Calculate Euclidean distance between two vectors
   */
  private euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }

    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }

    return Math.sqrt(sum);
  }
}
