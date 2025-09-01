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

export { generatePassword } from './generator';
export { estimateEntropyBits } from './entropy';
export { CHARACTER_CLASSES, type PasswordOptions, defaultOptions } from './types';
