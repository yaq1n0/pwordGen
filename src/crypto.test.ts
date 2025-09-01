import { describe, it, expect, vi } from 'vitest';
import { getRandomBytes, getSecureRandomInt } from './crypto';
import { createDistributionTest } from './test-utils';

describe('crypto', () => {
  describe('getRandomBytes', () => {
    it.concurrent('should generate bytes of the requested length', () => {
      const bytes = getRandomBytes(16);
      expect(bytes).toMatchObject({
        length: 16,
      });
      expect(bytes).toBeInstanceOf(Uint8Array);
    });

    it.concurrent('should generate different bytes on multiple calls', () => {
      const bytes1 = getRandomBytes(32);
      const bytes2 = getRandomBytes(32);

      // While theoretically possible, the probability of getting identical 32-byte arrays is negligible
      expect(bytes1).not.toEqual(bytes2);
    });

    it.concurrent('should work with zero length', () => {
      const bytes = getRandomBytes(0);
      expect(bytes).toHaveLength(0);
    });
  });

  describe('getSecureRandomInt', () => {
    it('should generate integers in the correct range', () => {
      const max = 10;
      for (let i = 0; i < 100; i++) {
        const result = getSecureRandomInt(max);
        expect(result).toSatisfy(
          (value: number) => value >= 0 && value < max && Number.isInteger(value)
        );
      }
    });

    it('should return 0 for max = 1', () => {
      expect(getSecureRandomInt(1)).toBe(0);
    });

    it.each([
      [0, 'max must be a positive integer'],
      [-1, 'max must be a positive integer'],
      [1.5, 'max must be a positive integer'],
    ])('should throw for invalid max value %s', (invalidMax, expectedError) => {
      expect(() => getSecureRandomInt(invalidMax)).toThrow(expectedError);
    });

    it('should have reasonable distribution for small ranges', () => {
      const max = 4;
      const iterations = 1000;

      const { counts } = createDistributionTest(() => getSecureRandomInt(max), iterations);

      // Convert counts object to array for testing
      const countsArray = Array.from({ length: max }, (_, i) => counts[i] || 0);
      const expectedCount = iterations / max;

      expect(countsArray).toHaveReasonableDistribution(expectedCount, 0.3);
    });

    it.concurrent('should work with large max values', () => {
      const max = 256;
      const result = getSecureRandomInt(max);
      expect(result).toSatisfy((value: number) => value >= 0 && value < max);
    });

    it('should handle maximum attempts edge case', () => {
      // Test the edge case by temporarily mocking getRandomBytes
      // to return values that are always rejected by rejection sampling
      const originalGetRandomBytes = globalThis.crypto?.getRandomValues;
      let callCount = 0;

      const mockGetRandomValues = vi.fn((arr: Uint8Array) => {
        callCount++;
        // Always return maximum values to force rejection
        arr.fill(255);
        return arr;
      });

      // Mock crypto.getRandomValues to force rejection sampling failures
      Object.defineProperty(globalThis.crypto, 'getRandomValues', {
        value: mockGetRandomValues,
        configurable: true,
      });

      try {
        expect(() => getSecureRandomInt(3)).toThrow(
          'Failed to generate unbiased random number after maximum attempts'
        );
        expect(callCount).toBeGreaterThan(5); // Should have tried multiple times
      } finally {
        // Restore original function
        Object.defineProperty(globalThis.crypto, 'getRandomValues', {
          value: originalGetRandomBytes,
          configurable: true,
        });
      }
    });
  });
});
