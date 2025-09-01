const lowercase = 'abcdefghijklmnopqrstuvwxyz';
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const digits = '0123456789';
const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const similar = 'il1Lo0O';

/** Character classes for password generation */
export const CHARACTER_CLASSES = {
  lowercase,
  uppercase,
  digits,
  symbols,
  similar,
};

/** Normalized password options with all defaults applied */
export type PasswordOptions = {
  /** Length of the generated password. Default: 16 */
  length: number;
  /** Include lowercase letters. Default: true */
  lowercase: boolean;
  /** Include uppercase letters. Default: true */
  uppercase: boolean;
  /** Include digits. Default: true */
  digits: boolean;
  /** Include symbols. Default: true */
  symbols: boolean;
  /** Custom character set to include */
  custom: string;
  /** Exclude similar-looking characters (il1Lo0O). Default: false */
  excludeSimilar: boolean;
  /** Additional characters to exclude */
  exclude: string;
  /** Require at least one character from each selected class. Default: false */
  requireEachSelectedClass: boolean;
};

export type PasswordOptionsKeys = keyof PasswordOptions;

/** Default password options */
export const defaultOptions: PasswordOptions = {
  length: 16,
  lowercase: true,
  uppercase: true,
  digits: true,
  symbols: true,
  custom: '',
  excludeSimilar: false,
  exclude: '',
  requireEachSelectedClass: false,
};
