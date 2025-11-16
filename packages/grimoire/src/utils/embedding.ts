/**
 * EMBEDDING UTILITIES
 *
 * Generate semantic embeddings for text.
 * In production, would use actual embedding models.
 * For now, simplified hash-based embeddings.
 */

import { createHash } from 'crypto';

const EMBEDDING_DIMENSION = 384; // Common embedding size

/**
 * Generate a semantic embedding for text
 * SIMPLIFIED VERSION - In production would use actual embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Simplified: Use hash to generate deterministic pseudo-embedding
  // In production: Call OpenAI embeddings, Cohere, or local model

  const hash = createHash('sha256').update(text).digest();
  const embedding: number[] = [];

  // Convert hash bytes to normalized floats
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    const byteIndex = i % hash.length;
    const value = hash[byteIndex] / 255; // Normalize to 0-1
    embedding.push(value * 2 - 1); // Scale to -1 to 1
  }

  // Normalize to unit vector
  return normalizeVector(embedding);
}

/**
 * Generate embedding from tokens (for glyph compression)
 */
export async function generateTokenEmbedding(tokens: string[]): Promise<number[]> {
  const text = tokens.join(' ');
  return generateEmbedding(text);
}

/**
 * Normalize a vector to unit length
 */
function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));

  if (magnitude === 0) {
    return vector;
  }

  return vector.map(val => val / magnitude);
}

/**
 * Batch generate embeddings
 */
export async function batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map(text => generateEmbedding(text)));
}
