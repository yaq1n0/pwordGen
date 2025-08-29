module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended'],
  env: {
    node: true,
    browser: true,
    es2020: true,
  },
  rules: {
    // TypeScript specific
    '@typescript-eslint/no-unused-vars': 'error',

    // General code quality
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    eqeqeq: 'error',
    curly: 'error',
    'no-throw-literal': 'error',
    'no-unused-vars': 'off', // Turn off base rule in favor of @typescript-eslint version
  },
  overrides: [
    {
      files: ['**/*.test.ts'],
      env: {
        jest: true,
      },
    },
  ],
};
