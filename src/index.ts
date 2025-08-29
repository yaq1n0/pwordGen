/**
 * pwordgen - A tiny, auditable, TypeScript-native password generator
 *
 * Features:
 * - Cryptographically secure random generation (CSPRNG)
 * - Cross-platform (browser and Node.js)
 * - Unbiased sampling using rejection sampling
 * - Configurable character classes and constraints
 * - Entropy estimation
 * - Zero runtime dependencies
 */

export { generatePassword } from './generator.js';
export { estimateEntropyBits } from './entropy.js';
export type { PasswordOptions } from './types.js';

// Re-export constants for advanced usage
export { CHARACTER_CLASSES, SIMILAR_CHARACTERS } from './types.js';
