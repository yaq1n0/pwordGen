# 📊 Test Coverage Guide

This project uses **vitest** with **V8 coverage provider** for comprehensive test coverage analysis.

## 🎯 Coverage Targets

We maintain high coverage standards to ensure code quality and reliability:

| Metric         | Global Target | Critical Files Target |
| -------------- | ------------- | --------------------- |
| **Statements** | 95%           | 100%                  |
| **Branches**   | 90%           | 100%                  |
| **Functions**  | 95%           | 100%                  |
| **Lines**      | 95%           | 100%                  |

### Critical Files (100% Coverage Required)

- `src/crypto.ts` - Cryptographic functions
- `src/entropy.ts` - Entropy calculations
- `src/utils.ts` - Utility functions

## 🚀 Coverage Commands

### Basic Coverage

```bash
# Run tests with coverage
npm run test:coverage

# Generate coverage report and open in browser
npm run coverage:open

# Watch mode with coverage
npm run test:coverage:watch
```

### Advanced Coverage

```bash
# Interactive coverage UI
npm run test:coverage:ui

# Verbose coverage checking
npm run coverage:check

# Auto-update coverage thresholds
npm run test:coverage:threshold
```

## 📈 Coverage Reports

After running coverage, reports are generated in multiple formats:

- **HTML Report**: `coverage/index.html` - Interactive visual report
- **Text Report**: Console output with summary
- **LCOV Report**: `coverage/lcov.info` - For CI/CD integration
- **JSON Report**: `coverage/coverage-final.json` - Machine-readable

## 🎨 Coverage Watermarks

Visual indicators in HTML reports:

- **🔴 Red**: < 75% (Needs attention)
- **🟡 Yellow**: 75-95% (Good)
- **🟢 Green**: > 95% (Excellent)

## 🔧 Configuration

Coverage is configured in `vitest.config.ts`:

- **Provider**: V8 (fastest, most accurate)
- **Included**: All `src/**/*.{js,ts}` files
- **Excluded**: Tests, type definitions, configuration files

## 🏆 Best Practices

1. **Write tests first** - Use TDD approach
2. **Focus on edge cases** - Cover error conditions
3. **Test behavioral outcomes** - Not just implementation details
4. **Use concurrent tests** - For better performance
5. **Maintain thresholds** - Don't let coverage drop

## 🚨 Coverage Failures

If coverage falls below thresholds:

1. Identify uncovered code in HTML report
2. Write focused tests for missing coverage
3. Consider if code is truly necessary
4. Update thresholds only if justified

## 🔄 CI Integration

Coverage is integrated into our CI pipeline:

- Runs on every PR
- Fails builds below thresholds
- Generates coverage badges
- Uploads reports for analysis

Use `npm run ci` for complete CI checks locally.
