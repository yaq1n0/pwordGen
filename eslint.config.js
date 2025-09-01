import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        // Browser globals
        crypto: 'readonly',
        globalThis: 'readonly',
        // Node.js globals
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      eqeqeq: 'error',
      curly: ['error', 'multi'],
      'no-throw-literal': 'error',
      'no-unused-vars': 'off', // Turn off base rule in favor of @typescript-eslint version
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];
