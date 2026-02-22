// Mock DB and logger so databaseService can be imported without a real database
jest.mock('../config/database', () => ({ query: jest.fn() }));
jest.mock('../services/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    redact: jest.fn(),
}));

const { sanitize } = require('../services/databaseService');

// ─── trimString ──────────────────────────────────────────────────────────────

describe('sanitize.trimString', () => {
    test('trims leading and trailing whitespace', () => {
        expect(sanitize.trimString('  hello  ')).toBe('hello');
    });
    test('returns null for empty string', () => {
        expect(sanitize.trimString('')).toBeNull();
    });
    test('returns null for whitespace-only string', () => {
        expect(sanitize.trimString('   ')).toBeNull();
    });
    test('returns null for null', () => {
        expect(sanitize.trimString(null)).toBeNull();
    });
    test('returns null for undefined', () => {
        expect(sanitize.trimString(undefined)).toBeNull();
    });
    test('truncates to maxLength', () => {
        expect(sanitize.trimString('abcdef', 3)).toBe('abc');
    });
    test('default maxLength is 255', () => {
        const long = 'a'.repeat(300);
        expect(sanitize.trimString(long)).toHaveLength(255);
    });
    test('converts number to string', () => {
        expect(sanitize.trimString(42)).toBe('42');
    });
    test('preserves special characters', () => {
        expect(sanitize.trimString("O'Brien & Co.")).toBe("O'Brien & Co.");
    });
    test('preserves unicode characters', () => {
        expect(sanitize.trimString('José García')).toBe('José García');
    });
});

// ─── email ───────────────────────────────────────────────────────────────────

describe('sanitize.email', () => {
    test('valid email is returned trimmed and lowercased', () => {
        expect(sanitize.email('User@Example.COM')).toBe('user@example.com');
    });
    test('trims surrounding whitespace', () => {
        expect(sanitize.email('  user@example.com  ')).toBe('user@example.com');
    });
    test('returns null for invalid email (no @)', () => {
        expect(sanitize.email('notanemail')).toBeNull();
    });
    test('returns null for invalid email (no domain)', () => {
        expect(sanitize.email('user@')).toBeNull();
    });
    test('returns null for null', () => {
        expect(sanitize.email(null)).toBeNull();
    });
    test('returns null for empty string', () => {
        expect(sanitize.email('')).toBeNull();
    });
    test('returns null for email exceeding 255 characters', () => {
        const long = 'a'.repeat(250) + '@b.com'; // 256 chars, over the 255 limit
        expect(sanitize.email(long)).toBeNull();
    });
    test('accepts email with subdomain', () => {
        expect(sanitize.email('user@mail.example.com')).toBe('user@mail.example.com');
    });
    test('accepts email with + alias', () => {
        expect(sanitize.email('user+tag@example.com')).toBe('user+tag@example.com');
    });
});

// ─── phone ───────────────────────────────────────────────────────────────────

describe('sanitize.phone', () => {
    test('valid US phone number is returned', () => {
        expect(sanitize.phone('(555) 123-4567')).toBe('(555) 123-4567');
    });
    test('valid international phone with + is returned', () => {
        expect(sanitize.phone('+1 555 123 4567')).toBe('+1 555 123 4567');
    });
    test('trims surrounding whitespace', () => {
        expect(sanitize.phone('  5551234567  ')).toBe('5551234567');
    });
    test('returns null for null', () => {
        expect(sanitize.phone(null)).toBeNull();
    });
    test('returns null for empty string', () => {
        expect(sanitize.phone('')).toBeNull();
    });
    test('returns null for too-short number (under 7 digits)', () => {
        expect(sanitize.phone('123')).toBeNull();
    });
    test('returns null for phone exceeding 50 characters', () => {
        expect(sanitize.phone('1'.repeat(51))).toBeNull();
    });
    test('returns null for letters-only string', () => {
        expect(sanitize.phone('call-me-now')).toBeNull();
    });
});

// ─── enumValue ───────────────────────────────────────────────────────────────

describe('sanitize.enumValue', () => {
    const allowed = ['new', 'approved', 'rejected'];

    test('valid value in allowed list is returned', () => {
        expect(sanitize.enumValue('approved', allowed)).toBe('approved');
    });
    test('value is normalized to lowercase', () => {
        expect(sanitize.enumValue('APPROVED', allowed)).toBe('approved');
    });
    test('trims whitespace before checking', () => {
        expect(sanitize.enumValue('  new  ', allowed)).toBe('new');
    });
    test('invalid value returns defaultVal (null by default)', () => {
        expect(sanitize.enumValue('pending', allowed)).toBeNull();
    });
    test('invalid value returns custom defaultVal', () => {
        expect(sanitize.enumValue('pending', allowed, 'new')).toBe('new');
    });
    test('null returns defaultVal', () => {
        expect(sanitize.enumValue(null, allowed, 'new')).toBe('new');
    });
    test('empty string returns defaultVal', () => {
        expect(sanitize.enumValue('', allowed, 'new')).toBe('new');
    });
});

// ─── positiveInt ─────────────────────────────────────────────────────────────

describe('sanitize.positiveInt', () => {
    test('positive integer is returned', () => {
        expect(sanitize.positiveInt(5)).toBe(5);
    });
    test('string integer is parsed', () => {
        expect(sanitize.positiveInt('42')).toBe(42);
    });
    test('zero returns null', () => {
        expect(sanitize.positiveInt(0)).toBeNull();
    });
    test('negative number returns null', () => {
        expect(sanitize.positiveInt(-1)).toBeNull();
    });
    test('null returns null', () => {
        expect(sanitize.positiveInt(null)).toBeNull();
    });
    test('undefined returns null', () => {
        expect(sanitize.positiveInt(undefined)).toBeNull();
    });
    test('non-numeric string returns null', () => {
        expect(sanitize.positiveInt('abc')).toBeNull();
    });
    test('float is truncated to integer', () => {
        expect(sanitize.positiveInt(3.9)).toBe(3);
    });
    test('float string is parsed and truncated', () => {
        expect(sanitize.positiveInt('7.8')).toBe(7);
    });
});

// ─── nonNegativeNumber ───────────────────────────────────────────────────────

describe('sanitize.nonNegativeNumber', () => {
    test('positive number is returned', () => {
        expect(sanitize.nonNegativeNumber(5.5)).toBe(5.5);
    });
    test('zero is returned', () => {
        expect(sanitize.nonNegativeNumber(0)).toBe(0);
    });
    test('negative number returns null', () => {
        expect(sanitize.nonNegativeNumber(-1)).toBeNull();
    });
    test('null returns null', () => {
        expect(sanitize.nonNegativeNumber(null)).toBeNull();
    });
    test('undefined returns null', () => {
        expect(sanitize.nonNegativeNumber(undefined)).toBeNull();
    });
    test('string number is parsed', () => {
        expect(sanitize.nonNegativeNumber('12.5')).toBe(12.5);
    });
    test('non-numeric string returns null', () => {
        expect(sanitize.nonNegativeNumber('abc')).toBeNull();
    });
});
