import { getSecureRandomInt } from './crypto';
import { CHARACTER_CLASSES, PasswordOptionsKeys, type PasswordOptions } from './types';
import { normalizeOptions, buildCharacterPool, filterCharacters } from './utils';

/** Character class configuration for processing */
const CHARACTER_CLASS_CONFIG = [
  { key: 'lowercase' as PasswordOptionsKeys, chars: CHARACTER_CLASSES.lowercase },
  { key: 'uppercase' as PasswordOptionsKeys, chars: CHARACTER_CLASSES.uppercase },
  { key: 'digits' as PasswordOptionsKeys, chars: CHARACTER_CLASSES.digits },
  { key: 'symbols' as PasswordOptionsKeys, chars: CHARACTER_CLASSES.symbols },
  { key: 'custom' as PasswordOptionsKeys, chars: '' }, // Will use options.custom value
] as const;

/** Get all selected character classes for validation */
const getSelectedClasses = (options: PasswordOptions): string[] =>
  CHARACTER_CLASS_CONFIG.filter(({ key }) => options[key]) // Only include enabled character classes
    .map(({ key, chars }) => filterCharacters(key === 'custom' ? options.custom : chars, options)) // use options.custom if key is 'custom'
    .filter(chars => chars.length > 0); // Only include non-empty character sets

/** Validate options and throw descriptive errors */
const validateOptions = (options: PasswordOptions): void => {
  if (options.length < 1) throw new Error('Password length must be at least 1');

  if (!Number.isInteger(options.length)) throw new Error('Password length must be an integer');

  const pool = buildCharacterPool(options);
  if (pool.length === 0)
    throw new Error('Character pool is empty - no characters available for password generation');

  if (options.requireEachSelectedClass) {
    const selectedClasses = getSelectedClasses(options);
    if (selectedClasses.length > options.length)
      throw new Error(
        `Cannot require each selected class: need at least ${selectedClasses.length} characters but password length is ${options.length}`
      );
  }
};

/** Generate a password that satisfies the "require each class" constraint */
const generateWithRequiredClasses = (
  pool: string,
  selectedClasses: string[],
  options: PasswordOptions
): string => {
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
};

/** Generate a password with basic random selection */
const generateBasic = (pool: string, length: number): string => {
  const password: string[] = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = getSecureRandomInt(pool.length);
    password.push(pool[randomIndex]);
  }

  return password.join('');
};

/** Generate a cryptographically secure password */
export const generatePassword = (options: Partial<PasswordOptions> = {}): string => {
  const normalizedOptions = normalizeOptions(options);
  validateOptions(normalizedOptions);

  const pool = buildCharacterPool(normalizedOptions);

  return normalizedOptions.requireEachSelectedClass
    ? generateWithRequiredClasses(pool, getSelectedClasses(normalizedOptions), normalizedOptions)
    : generateBasic(pool, normalizedOptions.length);
};
