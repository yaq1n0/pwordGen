import { type PasswordOptions } from './types';
import { normalizeOptions, buildCharacterPool } from './utils';

/**
 * Estimate the entropy bits for a password generated with the given options
 *
 * Entropy is calculated as: log2(poolSize^length)
 * This assumes each character position is chosen independently from the full pool.
 *
 * Note: The actual entropy may be slightly lower when using requireEachSelectedClass
 * due to the constraint that certain character classes must be represented, but this
 * provides a reasonable approximation for security purposes.
 */
export const estimateEntropyBits = (options: Partial<PasswordOptions> = {}): number => {
  const normalizedOptions = normalizeOptions(options);

  if (normalizedOptions.length < 1) return 0;

  const pool = buildCharacterPool(normalizedOptions);

  if (pool.length === 0) return 0;

  // Basic entropy calculation: log2(poolSize^length) = length * log2(poolSize)
  return normalizedOptions.length * Math.log2(pool.length);
};
