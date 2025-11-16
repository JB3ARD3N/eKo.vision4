/**
 * HASH UTILITIES
 *
 * Content-addressed hashing for glyphs and provenance.
 */

import { createHash as nodeCreateHash } from 'crypto';

/**
 * Create SHA-256 hash of content
 */
export function createHash(content: string): string {
  return nodeCreateHash('sha256').update(content).digest('hex');
}

/**
 * Create merkle root from array of hashes
 */
export function createMerkleRoot(items: string[]): string {
  if (items.length === 0) {
    return createHash('');
  }

  if (items.length === 1) {
    return createHash(items[0]);
  }

  // Hash all items
  let hashes = items.map(item => createHash(item));

  // Build merkle tree
  while (hashes.length > 1) {
    const newLevel: string[] = [];

    for (let i = 0; i < hashes.length; i += 2) {
      if (i + 1 < hashes.length) {
        newLevel.push(createHash(hashes[i] + hashes[i + 1]));
      } else {
        newLevel.push(hashes[i]);
      }
    }

    hashes = newLevel;
  }

  return hashes[0];
}

/**
 * Verify merkle proof
 */
export function verifyMerkleProof(
  leaf: string,
  proof: string[],
  root: string
): boolean {
  let hash = createHash(leaf);

  for (const proofElement of proof) {
    hash = createHash(hash + proofElement);
  }

  return hash === root;
}
