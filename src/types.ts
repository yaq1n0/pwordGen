/**
 * Character classes for password generation
 */
export const CHARACTER_CLASSES = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

/**
 * Similar-looking characters that can be excluded for better readability
 */
export const SIMILAR_CHARACTERS = 'il1Lo0O';

/**
 * Options for password generation
 */
export interface PasswordOptions {
  /** Length of the generated password. Default: 16 */
  length?: number;

  /** Include lowercase letters. Default: true */
  lowercase?: boolean;

  /** Include uppercase letters. Default: true */
  uppercase?: boolean;

  /** Include digits. Default: true */
  digits?: boolean;

  /** Include symbols. Default: true */
  symbols?: boolean;

  /** Custom character set to include */
  custom?: string;

  /** Exclude similar-looking characters (il1Lo0O). Default: false */
  excludeSimilar?: boolean;

  /** Additional characters to exclude */
  exclude?: string;

  /** Require at least one character from each selected class. Default: false */
  requireEachSelectedClass?: boolean;
}

/**
 * Normalized options with defaults applied
 */
export interface NormalizedPasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
  custom: string;
  excludeSimilar: boolean;
  exclude: string;
  requireEachSelectedClass: boolean;
}
