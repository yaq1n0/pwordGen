import { describe, it, expect } from 'vitest';
import { normalizeOptions, buildCharacterPool } from './utils';
import { CHARACTER_CLASSES, defaultOptions, type PasswordOptions } from './types';

describe('normalizeOptions', () => {
  describe('default behavior', () => {
    it.concurrent('should return default options when no overrides provided', () => {
      const result = normalizeOptions({});
      expect(result).toEqual(defaultOptions);
    });

    it.concurrent('should return default options when undefined passed', () => {
      const result = normalizeOptions(undefined as any);
      expect(result).toEqual(defaultOptions);
    });

    it.concurrent('should apply all default values', () => {
      const result = normalizeOptions({});
      expect(result).toMatchObject({
        length: 16,
        lowercase: true,
        uppercase: true,
        digits: true,
        symbols: true,
        custom: '',
        excludeSimilar: false,
        exclude: '',
        requireEachSelectedClass: false,
      });
    });
  });

  describe('override behavior', () => {
    it.concurrent('should override length while preserving other defaults', () => {
      const result = normalizeOptions({ length: 8 });
      expect(result).toMatchObject({
        length: 8,
        lowercase: true,
        uppercase: true,
        digits: true,
        symbols: true,
      });
    });

    it.concurrent('should override boolean flags while preserving other defaults', () => {
      const result = normalizeOptions({
        lowercase: false,
        uppercase: false,
        symbols: false,
      });
      expect(result).toMatchObject({
        lowercase: false,
        uppercase: false,
        symbols: false,
        digits: true, // default preserved
        length: 16,
      });
    });

    it.concurrent('should override string options while preserving other defaults', () => {
      const result = normalizeOptions({
        custom: 'xyz',
        exclude: 'aeiou',
      });
      expect(result).toMatchObject({
        custom: 'xyz',
        exclude: 'aeiou',
        length: 16, // default preserved
        lowercase: true,
        uppercase: true,
      });
    });

    it.concurrent('should override all options simultaneously', () => {
      const overrides: Partial<PasswordOptions> = {
        length: 20,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
        custom: 'ABC123',
        excludeSimilar: true,
        exclude: 'xyz',
        requireEachSelectedClass: true,
      };

      const result = normalizeOptions(overrides);
      expect(result).toEqual({ ...defaultOptions, ...overrides });
    });
  });

  describe('partial overrides', () => {
    it.concurrent('should merge partial overrides correctly', () => {
      const result = normalizeOptions({
        length: 12,
        excludeSimilar: true,
      });

      expect(result).toMatchObject({
        length: 12,
        excludeSimilar: true,
        // All other defaults should be preserved
        lowercase: true,
        uppercase: true,
        digits: true,
        symbols: true,
        custom: '',
        exclude: '',
        requireEachSelectedClass: false,
      });
    });
  });
});

describe('buildCharacterPool', () => {
  describe('basic character class inclusion', () => {
    it.each([
      [
        'lowercase',
        { lowercase: true, uppercase: false, digits: false, symbols: false },
        CHARACTER_CLASSES.lowercase,
      ],
      [
        'uppercase',
        { lowercase: false, uppercase: true, digits: false, symbols: false },
        CHARACTER_CLASSES.uppercase,
      ],
      [
        'digits',
        { lowercase: false, uppercase: false, digits: true, symbols: false },
        CHARACTER_CLASSES.digits,
      ],
      [
        'symbols',
        { lowercase: false, uppercase: false, digits: false, symbols: true },
        CHARACTER_CLASSES.symbols,
      ],
    ])('should include %s when enabled', (className, options, expectedPool) => {
      const pool = buildCharacterPool({ ...defaultOptions, ...options });
      expect(pool).toBe(expectedPool);
    });

    it('should combine multiple character classes', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: true,
        uppercase: true,
        digits: false,
        symbols: false,
      });
      expect(pool).toBe(CHARACTER_CLASSES.lowercase + CHARACTER_CLASSES.uppercase);
    });

    it('should include all default character classes', () => {
      const pool = buildCharacterPool(defaultOptions);
      const expected =
        CHARACTER_CLASSES.lowercase +
        CHARACTER_CLASSES.uppercase +
        CHARACTER_CLASSES.digits +
        CHARACTER_CLASSES.symbols;
      expect(pool).toBe(expected);
    });
  });

  describe('custom character handling', () => {
    it('should include custom characters', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
        custom: 'xyz123',
      });
      expect(pool).toBe('xyz123');
    });

    it('should combine custom characters with other classes', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
        custom: 'XYZ',
      });
      expect(pool).toBe(CHARACTER_CLASSES.lowercase + 'XYZ');
    });

    it('should handle empty custom string', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
        custom: '',
      });
      expect(pool).toBe(CHARACTER_CLASSES.lowercase);
    });
  });

  describe('similar character exclusion', () => {
    it('should exclude similar characters when enabled', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
        excludeSimilar: true,
      });

      // Should not contain any similar characters
      for (const char of CHARACTER_CLASSES.similar) expect(pool).not.toContain(char);

      // Should still contain non-similar lowercase characters
      expect(pool).toContain('a');
      expect(pool).toContain('b');
      expect(pool).toContain('c');
    });

    it('should exclude similar characters from all classes', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        excludeSimilar: true,
      });

      for (const char of CHARACTER_CLASSES.similar) expect(pool).not.toContain(char);
    });

    it('should exclude similar characters from custom strings', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
        custom: 'il1Lo0O',
        excludeSimilar: true,
      });

      expect(pool).toBe('');
    });
  });

  describe('custom character exclusion', () => {
    it('should exclude specified characters', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
        exclude: 'aeiou',
      });

      // Should exclude all specified characters
      for (const char of 'aeiou') expect(pool).not.toContain(char);

      // Should still contain non-excluded characters
      expect(pool).toContain('b');
      expect(pool).toContain('c');
    });

    it('should exclude from all character classes', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        exclude: 'aA1!',
      });

      for (const char of 'aA1!') expect(pool).not.toContain(char);
    });

    it('should exclude from custom characters', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
        custom: 'abcdef',
        exclude: 'ace',
      });

      expect(pool).toBe('bdf');
    });
  });

  describe('duplicate removal', () => {
    it('should remove duplicate characters', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
        custom: 'aabbcc',
      });

      expect(pool).toBe('abc');
    });

    it('should remove duplicates between classes and custom', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
        custom: 'abc', // duplicates with lowercase
      });

      // Should only contain each character once
      const lowercase = CHARACTER_CLASSES.lowercase;
      expect(pool).toBe(lowercase);
    });

    it('should preserve order while removing duplicates', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
        custom: 'abcabc',
      });

      expect(pool).toBe('abc');
    });
  });

  describe('combined exclusions', () => {
    it('should apply both excludeSimilar and exclude', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
        excludeSimilar: true,
        exclude: 'xyz',
      });

      // Should exclude similar characters
      for (const char of CHARACTER_CLASSES.similar) expect(pool).not.toContain(char);

      // Should exclude custom characters
      expect(pool).not.toContain('x');
      expect(pool).not.toContain('y');
      expect(pool).not.toContain('z');

      // Should still contain other characters
      expect(pool).toContain('a');
      expect(pool).toContain('b');
    });
  });

  describe('edge cases', () => {
    it('should return empty string when no classes selected', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
      });

      expect(pool).toBe('');
    });

    it('should return empty string when all characters excluded', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
        exclude: CHARACTER_CLASSES.lowercase,
      });

      expect(pool).toBe('');
    });

    it('should handle overlapping exclusions gracefully', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
        excludeSimilar: true,
        exclude: 'il1Lo0O', // same as similar characters
      });

      // Should not crash and should exclude characters only once
      for (const char of CHARACTER_CLASSES.similar) expect(pool).not.toContain(char);
    });

    it('should work with very long custom strings', () => {
      const longCustom = 'a'.repeat(1000) + 'b'.repeat(1000);
      const pool = buildCharacterPool({
        ...defaultOptions,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
        custom: longCustom,
      });

      expect(pool).toBe('ab');
    });
  });

  describe('real-world scenarios', () => {
    it('should build reasonable pool for default options', () => {
      const pool = buildCharacterPool(defaultOptions);
      const expectedLength =
        CHARACTER_CLASSES.lowercase.length +
        CHARACTER_CLASSES.uppercase.length +
        CHARACTER_CLASSES.digits.length +
        CHARACTER_CLASSES.symbols.length;

      expect(pool.length).toBe(expectedLength);

      // Should contain samples from each character class
      expect(pool).toContain('a'); // lowercase
      expect(pool).toContain('A'); // uppercase
      expect(pool).toContain('1'); // digits
      expect(pool).toContain('!'); // symbols
    });

    it('should handle common exclusion patterns', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        excludeSimilar: true,
        exclude: '"\'`',
      });

      // Should exclude quotes and similar characters
      const excludedChars = '"\'`' + CHARACTER_CLASSES.similar;
      for (const char of excludedChars) expect(pool).not.toContain(char);
    });

    it('should handle alphanumeric-only pools', () => {
      const pool = buildCharacterPool({
        ...defaultOptions,
        symbols: false,
      });

      expect(pool).toMatch(/^[a-zA-Z0-9]+$/);
      expect(pool).not.toContain('!');
      expect(pool).not.toContain('@');
    });
  });
});
