# pwordgen

A tiny, auditable, TypeScript-native password generator for browser and Node.js environments.

## Features

- 🔒 **Cryptographically secure** - Uses Web Crypto API (browser) and Node.js crypto module
- 🌐 **Cross-platform** - Works in both browser and Node.js environments
- 🎯 **Unbiased sampling** - Uses rejection sampling for uniform distribution
- ⚡ **Zero dependencies** - Lightweight with no runtime dependencies
- 📝 **TypeScript native** - Built with TypeScript, includes type definitions
- 🔧 **Highly configurable** - Extensive options for character classes and constraints
- 📊 **Entropy estimation** - Built-in entropy calculation

## Installation

```bash
npm install pwordgen
```

## Quick Start

```typescript
import { generatePassword, estimateEntropyBits } from 'pwordgen';

// Generate a password with default settings (16 characters, all character classes)
const password = generatePassword();
console.log(password); // e.g., "Kx8#mP2$qR9!nV5w"

// Estimate entropy bits for the same configuration
const entropy = estimateEntropyBits();
console.log(`Password entropy: ${entropy.toFixed(1)} bits`); // e.g., "Password entropy: 105.6 bits"
```

## API Reference

### `generatePassword(options?): string`

Generates a cryptographically secure password.

#### Options

```typescript
interface PasswordOptions {
  /** Length of the generated password. Default: 16 */
  length?: number;
  
  /** Include lowercase letters (a-z). Default: true */
  lowercase?: boolean;
  
  /** Include uppercase letters (A-Z). Default: true */
  uppercase?: boolean;
  
  /** Include digits (0-9). Default: true */
  digits?: boolean;
  
  /** Include symbols (!@#$%^&*()_+-=[]{}|;:,.<>?). Default: true */
  symbols?: boolean;
  
  /** Custom character set to include */
  custom?: string;
  
  /** Exclude similar-looking characters (il1Lo0O). Default: false */
  excludeSimilar?: boolean;
  
  /** Additional characters to exclude */
  exclude?: string;
  
  /** Require at least one character from each selected class. Default: false */
  requireEachSelectedClass?: boolean;
}
```

#### Examples

```typescript
// Basic usage with custom length
const shortPassword = generatePassword({ length: 8 });

// Only lowercase and uppercase letters
const alphaPassword = generatePassword({
  length: 12,
  digits: false,
  symbols: false
});

// High-security password excluding similar characters
const securePassword = generatePassword({
  length: 20,
  excludeSimilar: true,
  requireEachSelectedClass: true
});

// Custom character set
const customPassword = generatePassword({
  length: 10,
  lowercase: false,
  uppercase: false,
  digits: false,
  symbols: false,
  custom: 'ABCDEF0123456789' // Hexadecimal
});

// Exclude specific characters
const cleanPassword = generatePassword({
  length: 12,
  exclude: 'il1Lo0O@#$'
});
```

### `estimateEntropyBits(options?): number`

Calculates the estimated entropy in bits for a password generated with the given options.

```typescript
const entropy = estimateEntropyBits({
  length: 12,
  lowercase: true,
  uppercase: true,
  digits: false,
  symbols: false
});
console.log(`Entropy: ${entropy.toFixed(1)} bits`); // Entropy: 79.2 bits
```

### Character Classes

Pre-defined character classes are available for reference:

```typescript
import { CHARACTER_CLASSES, SIMILAR_CHARACTERS } from 'pwordgen';

console.log(CHARACTER_CLASSES.lowercase);  // "abcdefghijklmnopqrstuvwxyz"
console.log(CHARACTER_CLASSES.uppercase);  // "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
console.log(CHARACTER_CLASSES.digits);     // "0123456789"
console.log(CHARACTER_CLASSES.symbols);    // "!@#$%^&*()_+-=[]{}|;:,.<>?"
console.log(SIMILAR_CHARACTERS);           // "il1Lo0O"
```

## Security

### Cryptographic Security

- **Browser**: Uses `crypto.getRandomValues()` from the Web Crypto API
- **Node.js**: Uses `crypto.randomBytes()` from the Node.js crypto module
- **Fallback**: Graceful fallback with clear error messages if crypto is unavailable

### Unbiased Sampling

The library uses rejection sampling to ensure uniform distribution of characters, preventing bias that could reduce password entropy.

### No Network Calls

All password generation happens locally. No data is transmitted over the network.

### No Telemetry

The library collects no usage data or telemetry information.

## Entropy Guidelines

Password strength recommendations based on entropy:

- **< 40 bits**: Weak - suitable only for low-security applications
- **40-60 bits**: Fair - acceptable for some applications
- **60-80 bits**: Good - suitable for most applications
- **80-100 bits**: Strong - suitable for high-security applications
- **> 100 bits**: Very Strong - suitable for critical security applications

Example entropy values:
```typescript
// 8 characters, all classes: ~52 bits
estimateEntropyBits({ length: 8 });

// 12 characters, all classes: ~79 bits
estimateEntropyBits({ length: 12 });

// 16 characters, all classes: ~105 bits
estimateEntropyBits({ length: 16 });

// 12 characters, letters only: ~67 bits
estimateEntropyBits({ 
  length: 12, 
  digits: false, 
  symbols: false 
});
```

## Error Handling

The library throws descriptive errors for invalid configurations:

```typescript
// Throws: "Password length must be at least 1"
generatePassword({ length: 0 });

// Throws: "Character pool is empty"
generatePassword({ 
  lowercase: false, 
  uppercase: false, 
  digits: false, 
  symbols: false 
});

// Throws: "Cannot require each selected class: need at least 4 characters but password length is 2"
generatePassword({ 
  length: 2, 
  requireEachSelectedClass: true 
});
```

## Browser Support

- Chrome 37+
- Firefox 34+
- Safari 7.1+
- Edge 12+

## Node.js Support

- Node.js 16+ (recommended)
- Node.js 14+ (with crypto polyfill)

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Lint code
npm run lint

# Format code
npm run prettier:fix
```

## License

MIT

## Contributing

Contributions are welcome! Please read the contributing guidelines and ensure all tests pass before submitting a pull request.

## Changelog

### 0.1.0
- Initial release
- Core password generation functionality
- Entropy estimation
- Cross-platform support (browser and Node.js)
- TypeScript support with full type definitions
