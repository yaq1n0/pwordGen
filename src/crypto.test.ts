import { describe, it, expect } from 'vitest';
import { getRandomBytes, getSecureRandomInt } from './crypto.js';

describe('crypto', () => {
  describe('getRandomBytes', () => {
    it('should generate bytes of the requested length', () => {
      const bytes = getRandomBytes(16);
      expect(bytes).toHaveLength(16);
      expect(bytes).toBeInstanceOf(Uint8Array);
    });

    it('should generate different bytes on multiple calls', () => {
      const bytes1 = getRandomBytes(32);
      const bytes2 = getRandomBytes(32);

      // While theoretically possible, the probability of getting identical 32-byte arrays is negligible
      expect(bytes1).not.toEqual(bytes2);
    });

    it('should work with zero length', () => {
      const bytes = getRandomBytes(0);
      expect(bytes).toHaveLength(0);
    });
  });

  describe('getSecureRandomInt', () => {
    it('should generate integers in the correct range', () => {
      const max = 10;
      for (let i = 0; i < 100; i++) {
        const result = getSecureRandomInt(max);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(max);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('should return 0 for max = 1', () => {
      expect(getSecureRandomInt(1)).toBe(0);
    });

    it('should throw for invalid max values', () => {
      expect(() => getSecureRandomInt(0)).toThrow('max must be a positive integer');
      expect(() => getSecureRandomInt(-1)).toThrow('max must be a positive integer');
      expect(() => getSecureRandomInt(1.5)).toThrow('max must be a positive integer');
    });

    it('should have reasonable distribution for small ranges', () => {
      const max = 4;
      const counts = new Array(max).fill(0);
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const result = getSecureRandomInt(max);
        counts[result]++;
      }

      // Each value should appear roughly 25% of the time (with some tolerance)
      const expectedCount = iterations / max;
      const tolerance = expectedCount * 0.3; // 30% tolerance

      for (let i = 0; i < max; i++) {
        expect(counts[i]).toBeGreaterThan(expectedCount - tolerance);
        expect(counts[i]).toBeLessThan(expectedCount + tolerance);
      }
    });

    it('should work with large max values', () => {
      const max = 256;
      const result = getSecureRandomInt(max);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(max);
    });
  });
});
