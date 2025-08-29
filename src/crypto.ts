/**
 * Cross-platform cryptographically secure random number generation
 * Uses Web Crypto API in browsers and Node.js crypto module in Node.js
 */

/**
 * Generate cryptographically secure random bytes
 */
export function getRandomBytes(length: number): Uint8Array {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Browser environment with Web Crypto API
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
  } else if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    // Node.js 16+ with global crypto
    const array = new Uint8Array(length);
    globalThis.crypto.getRandomValues(array);
    return array;
  } else {
    // Node.js with require() fallback
    try {
      const nodeCrypto = require('crypto');
      return new Uint8Array(nodeCrypto.randomBytes(length));
    } catch {
      throw new Error('No cryptographically secure random number generator available');
    }
  }
}

/**
 * Generate a cryptographically secure random integer in the range [0, max)
 * Uses rejection sampling to ensure uniform distribution
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 0 || !Number.isInteger(max)) {
    throw new Error('max must be a positive integer');
  }

  if (max === 1) {
    return 0;
  }

  // Calculate how many bits we need
  const bitsNeeded = Math.ceil(Math.log2(max));
  const bytesNeeded = Math.ceil(bitsNeeded / 8);

  // Calculate the rejection threshold to ensure uniform distribution
  const maxValidValue = Math.floor(256 ** bytesNeeded / max) * max - 1;

  let attempts = 0;
  const maxAttempts = 1000; // Prevent infinite loops

  while (attempts < maxAttempts) {
    const randomBytes = getRandomBytes(bytesNeeded);
    let randomValue = 0;

    // Convert bytes to integer
    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = (randomValue << 8) | randomBytes[i];
    }

    // Reject values that would cause bias
    if (randomValue <= maxValidValue) {
      return randomValue % max;
    }

    attempts++;
  }

  throw new Error('Failed to generate unbiased random number after maximum attempts');
}
