import { describe, it, expect } from 'vitest';
import { generatePassword, estimateEntropyBits, CHARACTER_CLASSES } from './index';

describe('Public API Integration', () => {
  describe('generatePassword export', () => {
    it.concurrent('should be exported and functional', () => {
      expect(typeof generatePassword).toBe('function');

      const password = generatePassword();
      expect(typeof password).toBe('string');
      expect(password.length).toBeGreaterThan(0);
    });
  });

  describe('estimateEntropyBits export', () => {
    it.concurrent('should be exported and functional', () => {
      expect(typeof estimateEntropyBits).toBe('function');

      const entropy = estimateEntropyBits();
      expect(entropy).toSatisfy(
        (value: number) => typeof value === 'number' && value > 0 && Number.isFinite(value)
      );
    });
  });

  describe('Constants export', () => {
    it.concurrent('should export CHARACTER_CLASSES with expected structure', () => {
      expect(CHARACTER_CLASSES).toBeDefined();
      expect(CHARACTER_CLASSES).toMatchObject({
        lowercase: expect.any(String),
        uppercase: expect.any(String),
        digits: expect.any(String),
        symbols: expect.any(String),
        similar: expect.any(String),
      });

      // Test that character classes contain expected types of characters
      expect(CHARACTER_CLASSES.lowercase).toMatch(/^[a-z]+$/);
      expect(CHARACTER_CLASSES.uppercase).toMatch(/^[A-Z]+$/);
      expect(CHARACTER_CLASSES.digits).toMatch(/^[0-9]+$/);
      expect(CHARACTER_CLASSES.symbols.length).toBeGreaterThan(0);
      expect(CHARACTER_CLASSES.similar.length).toBeGreaterThan(0);
    });
  });

  describe('API consistency', () => {
    it.concurrent('should generate passwords that match entropy estimates', () => {
      const options = {
        length: 12,
        lowercase: true,
        uppercase: true,
        digits: false,
        symbols: false,
      };

      const password = generatePassword(options);
      const entropy = estimateEntropyBits(options);

      expect(password).toHaveLength(12);
      expect(password).toMatch(/^[a-zA-Z]+$/);
      expect(entropy).toBeCloseTo(12 * Math.log2(52), 5);
    });

    it.concurrent('should handle complex configurations consistently', () => {
      const options = {
        length: 8,
        lowercase: true,
        uppercase: false,
        digits: true,
        symbols: false,
        custom: 'XYZ',
        excludeSimilar: true,
        exclude: 'aei',
        requireEachSelectedClass: true,
      };

      const password = generatePassword(options);
      const entropy = estimateEntropyBits(options);

      expect(password).toHaveLength(8);
      expect(entropy).toBeGreaterThan(0);

      // Should contain at least one digit and one from custom
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[XYZ]/);

      // Should not contain excluded characters
      expect(password).not.toMatch(/[aei]/);
      expect(password).not.toMatch(/[il1Lo0O]/);
    });
  });

  describe('TypeScript types and API compatibility', () => {
    it.concurrent('should accept all valid option combinations without errors', () => {
      const validConfigurations = [
        {},
        { length: 8 },
        { lowercase: false, custom: 'abc' }, // Ensure some characters when disabling classes
        { uppercase: false, custom: 'ABC' },
        { digits: false, custom: '123' },
        { symbols: false, custom: '!@#' },
        { custom: 'abc' },
        { excludeSimilar: true },
        { exclude: 'xyz' },
        { requireEachSelectedClass: true },
      ];

      validConfigurations.forEach((config, index) => {
        expect(
          () => generatePassword(config),
          `Configuration ${index}: ${JSON.stringify(config)}`
        ).not.toThrow();
        expect(
          () => estimateEntropyBits(config),
          `Configuration ${index}: ${JSON.stringify(config)}`
        ).not.toThrow();
      });
    });
  });
});
