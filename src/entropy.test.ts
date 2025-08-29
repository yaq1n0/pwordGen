import { describe, it, expect } from 'vitest';
import { estimateEntropyBits } from './entropy.js';

describe('estimateEntropyBits', () => {
  describe('basic calculations', () => {
    it('should return 0 for zero length', () => {
      expect(estimateEntropyBits({ length: 0 })).toBe(0);
    });

    it('should calculate entropy for single character class', () => {
      // Lowercase only: 26 characters
      const entropy = estimateEntropyBits({
        length: 1,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
      });

      expect(entropy).toBeCloseTo(Math.log2(26), 10);
    });

    it('should calculate entropy for multiple character classes', () => {
      // All default classes combined and deduplicated
      const entropy = estimateEntropyBits({
        length: 1,
        lowercase: true,
        uppercase: true,
        digits: true,
        symbols: true,
      });

      // Calculate expected pool size: 26 + 26 + 10 + symbols count
      const expectedPoolSize = 26 + 26 + 10 + '!@#$%^&*()_+-=[]{}|;:,.<>?'.length;
      expect(entropy).toBeCloseTo(Math.log2(expectedPoolSize), 5);
    });

    it('should scale entropy with length', () => {
      const entropy1 = estimateEntropyBits({ length: 1 });
      const entropy2 = estimateEntropyBits({ length: 2 });
      const entropy10 = estimateEntropyBits({ length: 10 });

      expect(entropy2).toBeCloseTo(entropy1 * 2, 10);
      expect(entropy10).toBeCloseTo(entropy1 * 10, 10);
    });
  });

  describe('character class effects', () => {
    it('should have higher entropy with more character classes', () => {
      const lowercaseOnly = estimateEntropyBits({
        length: 10,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
      });

      const lowercaseAndUppercase = estimateEntropyBits({
        length: 10,
        lowercase: true,
        uppercase: true,
        digits: false,
        symbols: false,
      });

      const allClasses = estimateEntropyBits({
        length: 10,
        lowercase: true,
        uppercase: true,
        digits: true,
        symbols: true,
      });

      expect(lowercaseAndUppercase).toBeGreaterThan(lowercaseOnly);
      expect(allClasses).toBeGreaterThan(lowercaseAndUppercase);
    });

    it('should handle custom characters', () => {
      const withoutCustom = estimateEntropyBits({
        length: 10,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
      });

      const withCustom = estimateEntropyBits({
        length: 10,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
        custom: 'XYZ',
      });

      expect(withCustom).toBeGreaterThan(withoutCustom);
    });
  });

  describe('exclusion effects', () => {
    it('should have lower entropy when excluding similar characters', () => {
      const withSimilar = estimateEntropyBits({
        length: 10,
        excludeSimilar: false,
      });

      const withoutSimilar = estimateEntropyBits({
        length: 10,
        excludeSimilar: true,
      });

      expect(withSimilar).toBeGreaterThan(withoutSimilar);
    });

    it('should have lower entropy when excluding custom characters', () => {
      const withoutExclusion = estimateEntropyBits({
        length: 10,
        exclude: '',
      });

      const withExclusion = estimateEntropyBits({
        length: 10,
        exclude: 'aeiou',
      });

      expect(withoutExclusion).toBeGreaterThan(withExclusion);
    });
  });

  describe('edge cases', () => {
    it('should return 0 when no character classes are selected', () => {
      expect(
        estimateEntropyBits({
          lowercase: false,
          uppercase: false,
          digits: false,
          symbols: false,
        })
      ).toBe(0);
    });

    it('should handle duplicate characters correctly', () => {
      const entropy1 = estimateEntropyBits({
        length: 10,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
        custom: 'abc',
      });

      const entropy2 = estimateEntropyBits({
        length: 10,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
        custom: 'abcabc', // duplicates should be removed
      });

      expect(entropy1).toBeCloseTo(entropy2, 10);
    });

    it('should work with very long passwords', () => {
      const entropy = estimateEntropyBits({ length: 1000 });
      expect(entropy).toBeGreaterThan(6000); // Should be quite high
      expect(Number.isFinite(entropy)).toBe(true);
    });
  });

  describe('monotonicity', () => {
    it('should be monotonic with length', () => {
      const entropies: number[] = [];

      for (let length = 1; length <= 20; length++) {
        entropies.push(estimateEntropyBits({ length }));
      }

      // Each entropy should be greater than or equal to the previous
      for (let i = 1; i < entropies.length; i++) {
        expect(entropies[i]).toBeGreaterThanOrEqual(entropies[i - 1]);
      }
    });

    it('should be monotonic with character pool size', () => {
      const configs = [
        { lowercase: true, uppercase: false, digits: false, symbols: false },
        { lowercase: true, uppercase: true, digits: false, symbols: false },
        { lowercase: true, uppercase: true, digits: true, symbols: false },
        { lowercase: true, uppercase: true, digits: true, symbols: true },
      ];

      const entropies = configs.map(config => estimateEntropyBits({ length: 10, ...config }));

      for (let i = 1; i < entropies.length; i++) {
        expect(entropies[i]).toBeGreaterThan(entropies[i - 1]);
      }
    });
  });

  describe('real-world examples', () => {
    it('should give reasonable entropy for common password lengths', () => {
      // 8-character password with all classes should be around 52 bits
      const entropy8 = estimateEntropyBits({ length: 8 });
      expect(entropy8).toBeGreaterThan(50);
      expect(entropy8).toBeLessThan(55);

      // 12-character password should be around 79 bits
      const entropy12 = estimateEntropyBits({ length: 12 });
      expect(entropy12).toBeGreaterThan(75);
      expect(entropy12).toBeLessThan(85);

      // 16-character password should be around 105 bits
      const entropy16 = estimateEntropyBits({ length: 16 });
      expect(entropy16).toBeGreaterThan(100);
      expect(entropy16).toBeLessThan(110);
    });
  });
});
