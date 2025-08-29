import { describe, it, expect } from 'vitest';
import {
  generatePassword,
  estimateEntropyBits,
  CHARACTER_CLASSES,
  SIMILAR_CHARACTERS,
} from './index.js';

describe('Public API Integration', () => {
  describe('generatePassword export', () => {
    it('should be exported and functional', () => {
      expect(typeof generatePassword).toBe('function');

      const password = generatePassword();
      expect(typeof password).toBe('string');
      expect(password.length).toBeGreaterThan(0);
    });
  });

  describe('estimateEntropyBits export', () => {
    it('should be exported and functional', () => {
      expect(typeof estimateEntropyBits).toBe('function');

      const entropy = estimateEntropyBits();
      expect(typeof entropy).toBe('number');
      expect(entropy).toBeGreaterThan(0);
    });
  });

  describe('Constants export', () => {
    it('should export CHARACTER_CLASSES', () => {
      expect(CHARACTER_CLASSES).toBeDefined();
      expect(CHARACTER_CLASSES.lowercase).toBe('abcdefghijklmnopqrstuvwxyz');
      expect(CHARACTER_CLASSES.uppercase).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      expect(CHARACTER_CLASSES.digits).toBe('0123456789');
      expect(CHARACTER_CLASSES.symbols).toBe('!@#$%^&*()_+-=[]{}|;:,.<>?');
    });

    it('should export SIMILAR_CHARACTERS', () => {
      expect(SIMILAR_CHARACTERS).toBeDefined();
      expect(SIMILAR_CHARACTERS).toBe('il1Lo0O');
    });
  });

  describe('API consistency', () => {
    it('should generate passwords that match entropy estimates', () => {
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

    it('should handle complex configurations consistently', () => {
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

  describe('TypeScript types', () => {
    it('should accept all valid option combinations', () => {
      // These should compile without TypeScript errors
      generatePassword();
      generatePassword({});
      generatePassword({ length: 8 });
      generatePassword({ lowercase: false });
      generatePassword({ uppercase: false });
      generatePassword({ digits: false });
      generatePassword({ symbols: false });
      generatePassword({ custom: 'abc' });
      generatePassword({ excludeSimilar: true });
      generatePassword({ exclude: 'xyz' });
      generatePassword({ requireEachSelectedClass: true });

      estimateEntropyBits();
      estimateEntropyBits({});
      estimateEntropyBits({ length: 8 });
    });
  });
});
