/**
 * Generate cryptographically secure random bytes (using Web Crypto API in browsers and Node.js crypto module in Node.js)
 */
export const getRandomBytes = (length: number): Uint8Array => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues)
    return crypto.getRandomValues(new Uint8Array(length)); // Browser environment with Web Crypto API
  else if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues)
    return globalThis.crypto.getRandomValues(new Uint8Array(length)); // Node.js 16+ with global crypto
  else throw new Error('No cryptographically secure random number generator available');
};

/**
 * Attempt to generate a valid random value from bytes
 * Returns the result if valid, or null if the value should be rejected
 */
function tryGenerateRandomValue(
  bytesNeeded: number,
  maxValidValue: number,
  max: number
): number | null {
  const randomBytes = getRandomBytes(bytesNeeded);
  let randomValue = 0;

  // Convert bytes to integer
  for (let j = 0; j < bytesNeeded; j++) randomValue = (randomValue << 8) | randomBytes[j];

  // Reject values that would cause bias
  if (randomValue <= maxValidValue) return randomValue % max;

  return null;
}

/**
 * Generate a cryptographically secure random integer in the range [0, max)
 * Uses rejection sampling to ensure uniform distribution
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 0 || !Number.isInteger(max)) throw new Error('max must be a positive integer');
  if (max === 1) return 0;

  const bitsNeeded = Math.ceil(Math.log2(max));
  const bytesNeeded = Math.ceil(bitsNeeded / 8);

  // Calculate the rejection threshold to ensure uniform distribution
  const maxValidValue = Math.floor(256 ** bytesNeeded / max) * max - 1;

  const maxAttempts = 10;
  for (let i = 0; i < maxAttempts; i++) {
    const result = tryGenerateRandomValue(bytesNeeded, maxValidValue, max);
    if (result !== null) return result;
  }

  throw new Error('Failed to generate unbiased random number after maximum attempts');
}
