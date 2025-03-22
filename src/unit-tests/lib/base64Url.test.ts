import { base64Decode, base64Encode } from '../../lib/base64Url';

describe('base64Url', () => {
    test('should return an empty string when encoding an empty string', () => {
        expect(base64Encode('')).toBe('');
    });

    test('should return an empty string when decoding an empty string', () => {
        expect(base64Decode('')).toBe('');
    });

    test('should encode and decode a simple string correctly (URL-safe)', () => {
        const original = 'hello world!';
        const encoded = base64Encode(original, true);
        // URL safe base64 should not include '+' or '/'
        expect(encoded).not.toMatch(/[+/]/);
        const decoded = base64Decode(encoded);
        expect(decoded).toEqual(original);
    });

    test('should encode using regular base64 when urlSafe is false', () => {
        const original = 'f'; // Using a short string to ensure padding ("Zg==" is expected)
        const encoded = base64Encode(original, false);
        // Regular base64 for 'f' is "Zg==" which contains padding '='
        expect(encoded).toMatch(/=+/);
        // Convert to URL-safe version manually so base64Decode can decode it:
        const urlConverted = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const decoded = base64Decode(urlConverted);
        expect(decoded).toEqual(original);
    });
    test('should handle strings with special characters', () => {
        const original = 'A longer test string with special characters: !@#$%^&*()';
        const encoded = base64Encode(original, true);
        const decoded = base64Decode(encoded);
        expect(decoded).toEqual(original);
    });

    test('should throw an error when decoding an invalid base64 string', () => {
        const malformed = 'malformed--base64';
        expect(() => base64Decode(malformed)).toThrow();
    });
});
