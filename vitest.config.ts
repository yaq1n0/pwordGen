import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test-utils.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'text-summary', 'lcov'],
      include: ['src/**/*.{js,ts}'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.d.ts',
        '**/test-utils.ts',
        '**/*.config.{js,ts}',
        '**/coverage/**',
      ],
      thresholds: {
        global: {
          statements: 95,
          branches: 90,
          functions: 95,
          lines: 95,
        },
        // Per-file thresholds (crypto.ts has some hard-to-test fallback paths)
        'src/crypto.ts': {
          statements: 85,
          branches: 70,
          functions: 100,
          lines: 85,
        },
        'src/entropy.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        'src/generator.ts': {
          statements: 95,
          branches: 90,
          functions: 95,
          lines: 95,
        },
        'src/utils.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
      // Coverage watermarks for visual reporting
      watermarks: {
        statements: [75, 95],
        functions: [75, 95],
        branches: [65, 90],
        lines: [75, 95],
      },
      // Clean coverage directory before each run
      clean: true,
      // Skip files with no test coverage from reports
      skipFull: false,
      // Report uncovered files
      all: true,
    },
  },
});
