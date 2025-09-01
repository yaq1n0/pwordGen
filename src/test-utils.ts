import { expect } from 'vitest';

/**
 * Custom matcher to check if an array of counts has reasonable statistical distribution
 */
const toHaveReasonableDistribution = (
  received: number[],
  expectedCount: number,
  tolerancePercentage: number = 0.3
) => {
  const tolerance = expectedCount * tolerancePercentage;

  const failures: string[] = [];

  received.forEach((count, index) => {
    if (count <= expectedCount - tolerance || count >= expectedCount + tolerance)
      failures.push(
        `Index ${index}: expected ${count} to be between ${Math.round(expectedCount - tolerance)} and ${Math.round(expectedCount + tolerance)}`
      );
  });

  return {
    pass: failures.length === 0,
    message: () =>
      failures.length === 0
        ? `Expected distribution to be outside reasonable bounds`
        : `Distribution failures:\n${failures.join('\n')}`,
  };
};

/**
 * Custom matcher to check if a value satisfies multiple conditions
 */
const toSatisfyAll = (received: any, ...conditions: Array<(value: any) => boolean>) => {
  const failures: string[] = [];

  conditions.forEach((condition, index) => {
    if (!condition(received)) failures.push(`Condition ${index + 1} failed for value: ${received}`);
  });

  return {
    pass: failures.length === 0,
    message: () =>
      failures.length === 0
        ? `Expected value to fail at least one condition`
        : `Condition failures:\n${failures.join('\n')}`,
  };
};

// Extend vitest's expect with custom matchers
expect.extend({
  toHaveReasonableDistribution,
  toSatisfyAll,
});

// Type declarations for TypeScript
declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveReasonableDistribution(expectedCount: number, tolerancePercentage?: number): T;
    toSatisfyAll(...conditions: Array<(value: any) => boolean>): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveReasonableDistribution(expectedCount: number, tolerancePercentage?: number): any;
    toSatisfyAll(...conditions: Array<(value: any) => boolean>): any;
  }
}

/**
 * Helper function to test multiple password configurations in parallel
 */
export const testPasswordConfigurations = async (
  configurations: Array<{
    name: string;
    options: any;
    expectations: Array<(password: string) => void>;
  }>,
  generateFn: (options: any) => string
): Promise<void> => {
  const promises = configurations.map(async ({ options, expectations }) => {
    const password = generateFn(options);
    expectations.forEach(expectation => expectation(password));
  });

  await Promise.all(promises);
};

/**
 * Helper to create statistical test data
 */
export const createDistributionTest = (
  generator: () => any,
  iterations: number = 1000
): { counts: Record<string, number>; total: number } => {
  const counts: Record<string, number> = {};

  for (let i = 0; i < iterations; i++) {
    const result = String(generator());
    counts[result] = (counts[result] || 0) + 1;
  }

  return { counts, total: iterations };
};
