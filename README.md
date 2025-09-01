# pwordgen

A tiny, TypeScript-native password generator for browser and Node.js environments.

## Installation

```bash
npm install pwordgen
```

## Quick Start

```typescript
import { generatePassword, estimateEntropyBits } from 'pwordgen';

// Generate a password with defaults (16 chars, all character classes)
const password = generatePassword();

// Estimate entropy
const entropy = estimateEntropyBits({ length: 16 });
console.log(`Entropy: ${entropy.toFixed(1)} bits`);
```

## API

### `generatePassword(options?): string`

Generates a cryptographically secure password.

```typescript
interface PasswordOptions {
  length: number; // Default: 16
  lowercase: boolean; // Default: true
  uppercase: boolean; // Default: true
  digits: boolean; // Default: true
  symbols: boolean; // Default: true
  custom: string; // Default: ''
  excludeSimilar: boolean; // Default: false (excludes il1Lo0O)
  exclude: string; // Default: ''
  requireEachSelectedClass: boolean; // Default: false
}
```

#### Examples

```typescript
// Custom length
generatePassword({ length: 12 });

// Letters only
generatePassword({ digits: false, symbols: false });

// Exclude similar characters
generatePassword({ excludeSimilar: true });

// Custom character set
generatePassword({
  lowercase: false,
  uppercase: false,
  digits: false,
  symbols: false,
  custom: 'ABCDEF0123456789',
});

// Ensure at least one from each selected class
generatePassword({
  length: 12,
  requireEachSelectedClass: true,
});
```

### `estimateEntropyBits(options?): number`

Calculates estimated entropy in bits for the given configuration.

```typescript
const entropy = estimateEntropyBits({
  length: 12,
  digits: false,
  symbols: false,
});
```

### Character Classes

```typescript
import { CHARACTER_CLASSES } from 'pwordgen';

CHARACTER_CLASSES.lowercase; // "abcdefghijklmnopqrstuvwxyz"
CHARACTER_CLASSES.uppercase; // "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
CHARACTER_CLASSES.digits; // "0123456789"
CHARACTER_CLASSES.symbols; // "!@#$%^&*()_+-=[]{}|;:,.<>?"
CHARACTER_CLASSES.similar; // "il1Lo0O"
```

## Security

- Uses Web Crypto API (browser) and Node.js crypto module
- Rejection sampling ensures uniform distribution
- No network calls or telemetry
- Cryptographically secure random number generation

## Browser Support

Chrome 37+, Firefox 34+, Safari 7.1+, Edge 12+

## Node.js Support

Node.js 16+

## Development

```bash
npm install          # Install dependencies
npm test             # Run tests
npm run build        # Build package
npm run lint         # Lint code
npm run prettier:fix # Format code
```

## License

MIT
