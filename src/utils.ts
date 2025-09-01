import { CHARACTER_CLASSES, type PasswordOptions, defaultOptions } from './types';

/** Normalize password options with defaults */
export const normalizeOptions = (overrides: Partial<PasswordOptions>): PasswordOptions => ({
  ...defaultOptions,
  ...overrides,
});

/** Build the character pool based on options */
export const buildCharacterPool = (options: PasswordOptions): string => {
  // Build base pool from selected character classes
  const basePool = [
    options.lowercase && CHARACTER_CLASSES.lowercase,
    options.uppercase && CHARACTER_CLASSES.uppercase,
    options.digits && CHARACTER_CLASSES.digits,
    options.symbols && CHARACTER_CLASSES.symbols,
    options.custom && options.custom,
  ]
    .filter(Boolean)
    .join('');

  // Apply filtering and remove duplicates in one pass
  const filteredPool = filterCharacters(basePool, options);

  // Remove duplicates while preserving order
  return [...new Set(filteredPool.split(''))].join('');
};

/** Apply character filtering (similar and excluded characters) to a character set */
export const filterCharacters = (chars: string, options: PasswordOptions): string => {
  if (!chars) return '';

  // Early return if no filtering needed
  if (!options.excludeSimilar && !options.exclude) return chars;

  // Build exclusion set once for better performance
  const excludeSet = new Set<string>();

  if (options.excludeSimilar)
    CHARACTER_CLASSES.similar.split('').forEach(char => excludeSet.add(char));

  if (options.exclude) options.exclude.split('').forEach(char => excludeSet.add(char));

  // Filter characters in single pass
  return chars
    .split('')
    .filter(char => !excludeSet.has(char))
    .join('');
};
