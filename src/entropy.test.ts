import { describe, it, expect } from 'vitest';
import { estimateEntropyBits } from './entropy';

describe('estimateEntropyBits', () => {
  describe('basic calculations', () => {
    it.concurrent('should return 0 for zero length', () => {
      expect(estimateEntropyBits({ length: 0 })).toBe(0);
    });

    it.concurrent('should calculate entropy for single character class', () => {
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

    it.concurrent('should calculate entropy for multiple character classes', () => {
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

    it.concurrent('should scale entropy with length', () => {
      const entropy1 = estimateEntropyBits({ length: 1 });
      const entropy2 = estimateEntropyBits({ length: 2 });
      const entropy10 = estimateEntropyBits({ length: 10 });

      expect(entropy2).toBeCloseTo(entropy1 * 2, 10);
      expect(entropy10).toBeCloseTo(entropy1 * 10, 10);
    });
  });

  describe('character class effects', () => {
    it('should have higher entropy with more character classes', () => {
      const configs = [
        {
          name: 'lowercase only',
          lowercase: true,
          uppercase: false,
          digits: false,
          symbols: false,
        },
        {
          name: 'lowercase + uppercase',
          lowercase: true,
          uppercase: true,
          digits: false,
          symbols: false,
        },
        { name: 'all classes', lowercase: true, uppercase: true, digits: true, symbols: true },
      ];

      const entropies = configs.map(config => ({
        name: config.name,
        entropy: estimateEntropyBits({ length: 10, ...config }),
      }));

      // Each successive configuration should have higher entropy
      for (let i = 1; i < entropies.length; i++)
        expect(entropies[i].entropy).toBeGreaterThan(entropies[i - 1].entropy);
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
      const lengths = Array.from({ length: 20 }, (_, i) => i + 1);
      const entropies = lengths.map(length => estimateEntropyBits({ length }));

      // Each entropy should be greater than or equal to the previous
      entropies.forEach((entropy, i) => {
        if (i > 0) expect(entropy).toBeGreaterThanOrEqual(entropies[i - 1]);
      });
    });

    it('should be monotonic with character pool size', () => {
      const configs = [
        { name: '1 class', lowercase: true, uppercase: false, digits: false, symbols: false },
        { name: '2 classes', lowercase: true, uppercase: true, digits: false, symbols: false },
        { name: '3 classes', lowercase: true, uppercase: true, digits: true, symbols: false },
        { name: '4 classes', lowercase: true, uppercase: true, digits: true, symbols: true },
      ];

      const entropies = configs.map(config => estimateEntropyBits({ length: 10, ...config }));

      entropies.forEach((entropy, i) => {
        if (i > 0) expect(entropy).toBeGreaterThan(entropies[i - 1]);
      });
    });
  });

  describe('real-world examples', () => {
    it.each([
      [8, 50, 55, '8-character password'],
      [12, 75, 85, '12-character password'],
      [16, 100, 110, '16-character password'],
    ])('should give reasonable entropy for %s (%s)', (length, minEntropy, maxEntropy) => {
      const entropy = estimateEntropyBits({ length });
      expect(entropy).toBeGreaterThan(minEntropy);
      expect(entropy).toBeLessThan(maxEntropy);
    });
  });
});
