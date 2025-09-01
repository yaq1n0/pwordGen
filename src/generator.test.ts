import { describe, it, expect } from 'vitest';
import { generatePassword } from './generator';
import { CHARACTER_CLASSES } from './types';
import { createDistributionTest } from './test-utils';

describe('generatePassword', () => {
  describe('basic functionality', () => {
    it.concurrent('should generate passwords with default length', () => {
      const password = generatePassword();
      expect(password).toHaveLength(16);
    });

    it.concurrent('should generate passwords with custom length', () => {
      const password = generatePassword({ length: 8 });
      expect(password).toHaveLength(8);
    });

    it.concurrent('should generate different passwords on multiple calls', () => {
      const password1 = generatePassword();
      const password2 = generatePassword();
      expect(password1).not.toBe(password2);
    });

    it.concurrent('should only contain valid characters from selected classes', () => {
      const password = generatePassword({
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
      });

      for (const char of password) expect(CHARACTER_CLASSES.lowercase).toContain(char);
    });
  });

  describe('character class selection', () => {
    it('should respect lowercase only', () => {
      const password = generatePassword({
        length: 20,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
      });

      expect(password).toMatch(/^[a-z]+$/);
    });

    it('should respect uppercase only', () => {
      const password = generatePassword({
        length: 20,
        lowercase: false,
        uppercase: true,
        digits: false,
        symbols: false,
      });

      expect(password).toMatch(/^[A-Z]+$/);
    });

    it('should respect digits only', () => {
      const password = generatePassword({
        length: 20,
        lowercase: false,
        uppercase: false,
        digits: true,
        symbols: false,
      });

      expect(password).toMatch(/^[0-9]+$/);
    });

    it.concurrent('should handle custom characters', () => {
      const custom = 'xyz123';
      const password = generatePassword({
        length: 20,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
        custom,
      });

      for (const char of password) expect(custom).toContain(char);
    });
  });

  describe('excludeSimilar option', () => {
    it('should exclude similar characters when requested', () => {
      const password = generatePassword({
        length: 100,
        excludeSimilar: true,
      });

      for (const char of password) expect(CHARACTER_CLASSES.similar).not.toContain(char);
    });

    it('should include similar characters when not excluded', () => {
      // Generate many passwords to increase chance of hitting similar chars
      let foundSimilar = false;

      for (let i = 0; i < 50 && !foundSimilar; i++) {
        const password = generatePassword({
          length: 50,
          excludeSimilar: false,
        });

        for (const char of password)
          if (CHARACTER_CLASSES.similar.includes(char)) {
            foundSimilar = true;
            break;
          }
      }

      expect(foundSimilar).toBe(true);
    });
  });

  describe('exclude option', () => {
    it('should exclude specified characters', () => {
      const exclude = 'aeiou';
      const password = generatePassword({
        length: 100,
        exclude,
      });

      for (const char of password) expect(exclude).not.toContain(char);
    });
  });

  describe('requireEachSelectedClass option', () => {
    it('should include at least one character from each selected class', () => {
      const password = generatePassword({
        length: 10,
        lowercase: true,
        uppercase: true,
        digits: true,
        symbols: true,
        requireEachSelectedClass: true,
      });

      const patterns = [
        { name: 'lowercase', pattern: /[a-z]/ },
        { name: 'uppercase', pattern: /[A-Z]/ },
        { name: 'digits', pattern: /[0-9]/ },
        { name: 'symbols', pattern: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/ },
      ];

      patterns.forEach(({ pattern }) => {
        expect(password).toMatch(pattern);
      });
    });

    it('should work with partial character class selection', () => {
      const password = generatePassword({
        length: 5,
        lowercase: true,
        uppercase: true,
        digits: false,
        symbols: false,
        requireEachSelectedClass: true,
      });

      const expectations = [
        { pattern: /[a-z]/, shouldMatch: true, name: 'lowercase' },
        { pattern: /[A-Z]/, shouldMatch: true, name: 'uppercase' },
        { pattern: /[0-9]/, shouldMatch: false, name: 'digits' },
      ];

      expectations.forEach(({ pattern, shouldMatch }) => {
        if (shouldMatch) expect(password).toMatch(pattern);
        else expect(password).not.toMatch(pattern);
      });
    });

    it('should work with custom characters', () => {
      const password = generatePassword({
        length: 3,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
        custom: 'XYZ',
        requireEachSelectedClass: true,
      });

      const requiredPatterns = [
        { name: 'lowercase', pattern: /[a-z]/ },
        { name: 'custom', pattern: /[XYZ]/ },
      ];

      requiredPatterns.forEach(({ pattern }) => {
        expect(password).toMatch(pattern);
      });
    });
  });

  describe('error cases', () => {
    it('should throw for invalid length', () => {
      expect(() => generatePassword({ length: 0 })).toThrow('Password length must be at least 1');
      expect(() => generatePassword({ length: -1 })).toThrow('Password length must be at least 1');
      expect(() => generatePassword({ length: 1.5 })).toThrow('Password length must be an integer');
    });

    it('should throw when no character classes are selected', () => {
      expect(() =>
        generatePassword({
          lowercase: false,
          uppercase: false,
          digits: false,
          symbols: false,
        })
      ).toThrow('Character pool is empty');
    });

    it('should throw when requireEachSelectedClass needs more length than available', () => {
      expect(() =>
        generatePassword({
          length: 2,
          lowercase: true,
          uppercase: true,
          digits: true,
          symbols: true,
          requireEachSelectedClass: true,
        })
      ).toThrow('Cannot require each selected class');
    });

    it('should throw when all characters are excluded', () => {
      expect(() =>
        generatePassword({
          lowercase: true,
          uppercase: false,
          digits: false,
          symbols: false,
          exclude: CHARACTER_CLASSES.lowercase,
        })
      ).toThrow('Character pool is empty');
    });
  });

  describe('edge cases', () => {
    it('should work with length 1', () => {
      const password = generatePassword({ length: 1 });
      expect(password).toHaveLength(1);
    });

    it('should work with very long passwords', () => {
      const password = generatePassword({ length: 1000 });
      expect(password).toHaveLength(1000);
    });

    it('should handle empty custom string', () => {
      const password = generatePassword({
        custom: '',
        lowercase: true,
      });
      expect(password).toMatch(/[a-z]/);
    });
  });

  describe('uniformity checks', () => {
    it('should have reasonable character distribution', () => {
      const charset = 'ABC';
      const iterations = 3000;

      const { counts } = createDistributionTest(
        () =>
          generatePassword({
            length: 1,
            lowercase: false,
            uppercase: false,
            digits: false,
            symbols: false,
            custom: charset,
          }),
        iterations
      );

      const expectedCount = iterations / charset.length;
      const countsArray = Object.values(counts);

      expect(countsArray).toHaveReasonableDistribution(expectedCount, 0.2);
    });
  });
});
