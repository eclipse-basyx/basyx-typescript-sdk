/**
 * Encodes a given string into Base64 format.
 * Optionally transforms the output into a URL-safe Base64 string.
 *
 * The process includes:
 *   1. Trimming the input string.
 *   2. Percent-encoding the string.
 *   3. Converting percent-encoded characters back to their raw representation.
 *   4. Encoding the result into Base64.
 *   5. Optionally making the Base64 string URL safe by replacing '+' with '-', '/' with '_' and removing trailing '='.
 *
 * @function base64Encode
 * @param {string} string - The string to encode.
 * @param {boolean} [urlSafe=true] - Whether to return a URL-safe encoded string. Defaults to true.
 * @returns {string} The Base64 encoded string, converted to URL-safe format if requested.
 */
export function base64Encode(string: string, urlSafe: boolean = true): string {
    if (string === null || string === undefined) return '';

    string = string.trim();

    if (string === '') return '';

    const encodedUriComponent = encodeURIComponent(string);
    const unescapedEncodedUriComponent = unescape(encodedUriComponent); // reverse percent-encoding

    const base64String = btoa(unescapedEncodedUriComponent);

    if (!urlSafe) return base64String;

    const urlSafeBase64String = base64String
        .replace(/\+/g, '-') // Replace + with -
        .replace(/\//g, '_') // Replace / with _
        .replace(/=+$/, ''); // Remove padding (=)

    return urlSafeBase64String;
}

/**
 * Decodes a URL-safe Base64 encoded string into its original representation.
 *
 * The process includes:
 *   1. Trimming the input string.
 *   2. Replacing URL-safe characters '-' and '_' with their Base64 equivalents '+' and '/'.
 *   3. Restoring padding if missing.
 *   4. Decoding from Base64.
 *   5. Escaping the decoded string before decoding percent-encoded characters.
 *
 * @function base64Decode
 * @param {string} urlSafeBase64String - The URL-safe Base64 encoded string to decode.
 * @returns {string} The decoded string.
 */
export function base64Decode(urlSafeBase64String: string): string {
    if (urlSafeBase64String === null || urlSafeBase64String === undefined) return '';

    urlSafeBase64String = urlSafeBase64String.trim();

    if (urlSafeBase64String === '') return '';

    let base64String = urlSafeBase64String
        .replace(/-/g, '+') // Replace - with +
        .replace(/_/g, '/') // Replace _ with /
        .replace(/%3D/g, '=');

    // Restore missing padding if needed.
    const incompleteFourChars = base64String.length % 4;
    if (incompleteFourChars > 0) base64String += '=='.substring(0, 4 - incompleteFourChars);

    const encodedUriComponent = atob(base64String);
    const escapedEncodedUriComponent = escape(encodedUriComponent);
    const decodedString = decodeURIComponent(escapedEncodedUriComponent);

    return decodedString;
}
