/**
 * SIGNATURE UTILITIES
 *
 * Simple signature verification for provenance.
 * In production, would use proper cryptographic signatures.
 */

import { createHash } from './hash.js';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Generate a simple key pair (simplified for demo)
 */
export function generateKeyPair(identity: string): KeyPair {
  const privateKey = createHash(identity + Date.now().toString());
  const publicKey = createHash(privateKey);

  return {
    publicKey,
    privateKey,
  };
}

/**
 * Sign content (simplified for demo)
 */
export function sign(content: string, privateKey: string): string {
  return createHash(content + privateKey);
}

/**
 * Verify signature (simplified for demo)
 */
export function verify(content: string, signature: string, publicKey: string): boolean {
  // In a real system, would use proper crypto
  // This is just a placeholder
  return signature.length === 64; // SHA-256 hash length
}
