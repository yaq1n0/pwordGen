import { getSecureRandomInt } from './crypto.js';
import {
  CHARACTER_CLASSES,
  SIMILAR_CHARACTERS,
  type PasswordOptions,
  type NormalizedPasswordOptions,
} from './types.js';

/**
 * Normalize password options with defaults
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
 * Build the character pool based on options
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
 * Get all selected character classes for validation
 */
function getSelectedClasses(options: NormalizedPasswordOptions): string[] {
  const classes: string[] = [];

  if (options.lowercase) {
    let chars: string = CHARACTER_CLASSES.lowercase;
    if (options.excludeSimilar) {
      chars = chars
        .split('')
        .filter(char => !SIMILAR_CHARACTERS.includes(char))
        .join('');
    }
    if (options.exclude) {
      chars = chars
        .split('')
        .filter(char => !options.exclude.includes(char))
        .join('');
    }
    if (chars.length > 0) {
      classes.push(chars);
    }
  }

  if (options.uppercase) {
    let chars: string = CHARACTER_CLASSES.uppercase;
    if (options.excludeSimilar) {
      chars = chars
        .split('')
        .filter(char => !SIMILAR_CHARACTERS.includes(char))
        .join('');
    }
    if (options.exclude) {
      chars = chars
        .split('')
        .filter(char => !options.exclude.includes(char))
        .join('');
    }
    if (chars.length > 0) {
      classes.push(chars);
    }
  }

  if (options.digits) {
    let chars: string = CHARACTER_CLASSES.digits;
    if (options.excludeSimilar) {
      chars = chars
        .split('')
        .filter(char => !SIMILAR_CHARACTERS.includes(char))
        .join('');
    }
    if (options.exclude) {
      chars = chars
        .split('')
        .filter(char => !options.exclude.includes(char))
        .join('');
    }
    if (chars.length > 0) {
      classes.push(chars);
    }
  }

  if (options.symbols) {
    let chars: string = CHARACTER_CLASSES.symbols;
    if (options.excludeSimilar) {
      chars = chars
        .split('')
        .filter(char => !SIMILAR_CHARACTERS.includes(char))
        .join('');
    }
    if (options.exclude) {
      chars = chars
        .split('')
        .filter(char => !options.exclude.includes(char))
        .join('');
    }
    if (chars.length > 0) {
      classes.push(chars);
    }
  }

  if (options.custom) {
    let chars: string = options.custom;
    if (options.excludeSimilar) {
      chars = chars
        .split('')
        .filter(char => !SIMILAR_CHARACTERS.includes(char))
        .join('');
    }
    if (options.exclude) {
      chars = chars
        .split('')
        .filter(char => !options.exclude.includes(char))
        .join('');
    }
    if (chars.length > 0) {
      classes.push(chars);
    }
  }

  return classes;
}

/**
 * Validate options and throw descriptive errors
 */
function validateOptions(options: NormalizedPasswordOptions): void {
  if (options.length < 1) {
    throw new Error('Password length must be at least 1');
  }

  if (!Number.isInteger(options.length)) {
    throw new Error('Password length must be an integer');
  }

  const pool = buildCharacterPool(options);
  if (pool.length === 0) {
    throw new Error('Character pool is empty - no characters available for password generation');
  }

  if (options.requireEachSelectedClass) {
    const selectedClasses = getSelectedClasses(options);
    if (selectedClasses.length > options.length) {
      throw new Error(
        `Cannot require each selected class: need at least ${selectedClasses.length} characters ` +
          `but password length is ${options.length}`
      );
    }
  }
}

/**
 * Generate a password that satisfies the "require each class" constraint
 */
function generateWithRequiredClasses(
  pool: string,
  selectedClasses: string[],
  options: NormalizedPasswordOptions
): string {
  const password: string[] = [];

  // First, add one character from each required class
  for (const classChars of selectedClasses) {
    const randomIndex = getSecureRandomInt(classChars.length);
    password.push(classChars[randomIndex]);
  }

  // Fill the remaining positions with random characters from the full pool
  for (let i = selectedClasses.length; i < options.length; i++) {
    const randomIndex = getSecureRandomInt(pool.length);
    password.push(pool[randomIndex]);
  }

  // Shuffle the password using Fisher-Yates algorithm
  for (let i = password.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

/**
 * Generate a password with basic random selection
 */
function generateBasic(pool: string, length: number): string {
  const password: string[] = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = getSecureRandomInt(pool.length);
    password.push(pool[randomIndex]);
  }

  return password.join('');
}

/**
 * Generate a cryptographically secure password
 */
export function generatePassword(options: PasswordOptions = {}): string {
  const normalizedOptions = normalizeOptions(options);
  validateOptions(normalizedOptions);

  const pool = buildCharacterPool(normalizedOptions);

  if (normalizedOptions.requireEachSelectedClass) {
    const selectedClasses = getSelectedClasses(normalizedOptions);
    return generateWithRequiredClasses(pool, selectedClasses, normalizedOptions);
  } else {
    return generateBasic(pool, normalizedOptions.length);
  }
}
