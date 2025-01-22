import { createClient } from '@hey-api/client-fetch';

/**
 * Creates a custom client configuration
 *
 * @function createCustomClient
 * @param baseURL The base URL of the API
 * @param headers The headers to be included in the request
 * @returns {Client} The custom client
 */
export function createCustomClient(baseURL: string, headers: Headers = new Headers()) {
    return createClient({
        baseUrl: baseURL,
        headers,
    });
}
