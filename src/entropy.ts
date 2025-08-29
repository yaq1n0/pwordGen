import {
  CHARACTER_CLASSES,
  SIMILAR_CHARACTERS,
  type PasswordOptions,
  type NormalizedPasswordOptions,
} from './types.js';

/**
 * Normalize password options with defaults (duplicate from generator.ts for independence)
 */
function normalizeOptions(options: PasswordOptions = {}): NormalizedPasswordOptions {
  return {
    length: options.length ?? 16,
    lowercase: options.lowercase ?? true,
    uppercase: options.uppercase ?? true,
    digits: options.digits ?? true,
    symbols: options.symbols ?? true,
    custom: options.custom ?? '',
    excludeSimilar: options.excludeSimilar ?? false,
    exclude: options.exclude ?? '',
    requireEachSelectedClass: options.requireEachSelectedClass ?? false,
  };
}

/**
 * Build the character pool based on options (duplicate from generator.ts for independence)
 */
function buildCharacterPool(options: NormalizedPasswordOptions): string {
  let pool = '';

  // Add selected character classes
  if (options.lowercase) {
    pool += CHARACTER_CLASSES.lowercase;
  }
  if (options.uppercase) {
    pool += CHARACTER_CLASSES.uppercase;
  }
  if (options.digits) {
    pool += CHARACTER_CLASSES.digits;
  }
  if (options.symbols) {
    pool += CHARACTER_CLASSES.symbols;
  }
  if (options.custom) {
    pool += options.custom;
  }

  // Remove similar characters if requested
  if (options.excludeSimilar) {
    pool = pool
      .split('')
      .filter(char => !SIMILAR_CHARACTERS.includes(char))
      .join('');
  }

  // Remove explicitly excluded characters
  if (options.exclude) {
    pool = pool
      .split('')
      .filter(char => !options.exclude.includes(char))
      .join('');
  }

  // Remove duplicates while preserving order
  return [...new Set(pool.split(''))].join('');
}

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
export function estimateEntropyBits(options: PasswordOptions = {}): number {
  const normalizedOptions = normalizeOptions(options);

  if (normalizedOptions.length < 1) {
    return 0;
  }

  const pool = buildCharacterPool(normalizedOptions);

  if (pool.length === 0) {
    return 0;
  }

  // Basic entropy calculation: log2(poolSize^length) = length * log2(poolSize)
  return normalizedOptions.length * Math.log2(pool.length);
}
