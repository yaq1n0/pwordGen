import { describe, it, expect } from 'vitest';
import { generatePassword } from './generator.js';
import { CHARACTER_CLASSES, SIMILAR_CHARACTERS } from './types.js';

describe('generatePassword', () => {
  describe('basic functionality', () => {
    it('should generate passwords with default length', () => {
      const password = generatePassword();
      expect(password).toHaveLength(16);
    });

    it('should generate passwords with custom length', () => {
      const password = generatePassword({ length: 8 });
      expect(password).toHaveLength(8);
    });

    it('should generate different passwords on multiple calls', () => {
      const password1 = generatePassword();
      const password2 = generatePassword();
      expect(password1).not.toBe(password2);
    });

    it('should only contain valid characters from selected classes', () => {
      const password = generatePassword({
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
      });

      for (const char of password) {
        expect(CHARACTER_CLASSES.lowercase).toContain(char);
      }
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

    it('should handle custom characters', () => {
      const custom = 'xyz123';
      const password = generatePassword({
        length: 20,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
        custom,
      });

      for (const char of password) {
        expect(custom).toContain(char);
      }
    });
  });

  describe('excludeSimilar option', () => {
    it('should exclude similar characters when requested', () => {
      const password = generatePassword({
        length: 100,
        excludeSimilar: true,
      });

      for (const char of password) {
        expect(SIMILAR_CHARACTERS).not.toContain(char);
      }
    });

    it('should include similar characters when not excluded', () => {
      // Generate many passwords to increase chance of hitting similar chars
      let foundSimilar = false;

      for (let i = 0; i < 50 && !foundSimilar; i++) {
        const password = generatePassword({
          length: 50,
          excludeSimilar: false,
        });

        for (const char of password) {
          if (SIMILAR_CHARACTERS.includes(char)) {
            foundSimilar = true;
            break;
          }
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

      for (const char of password) {
        expect(exclude).not.toContain(char);
      }
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

      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/);
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

      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).not.toMatch(/[0-9]/);
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

      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[XYZ]/);
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
      const counts = { A: 0, B: 0, C: 0 };
      const iterations = 3000;

      for (let i = 0; i < iterations; i++) {
        const password = generatePassword({
          length: 1,
          lowercase: false,
          uppercase: false,
          digits: false,
          symbols: false,
          custom: charset,
        });
        counts[password as keyof typeof counts]++;
      }

      // Each character should appear roughly 33% of the time
      const expectedCount = iterations / 3;
      const tolerance = expectedCount * 0.2; // 20% tolerance

      expect(counts.A).toBeGreaterThan(expectedCount - tolerance);
      expect(counts.A).toBeLessThan(expectedCount + tolerance);
      expect(counts.B).toBeGreaterThan(expectedCount - tolerance);
      expect(counts.B).toBeLessThan(expectedCount + tolerance);
      expect(counts.C).toBeGreaterThan(expectedCount - tolerance);
      expect(counts.C).toBeLessThan(expectedCount + tolerance);
    });
  });
});
