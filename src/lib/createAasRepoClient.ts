import { createClient } from '@hey-api/client-fetch';

export function createCustomClient(baseURL: string, headers: Headers = new Headers()) {
    return createClient({
        baseUrl: baseURL,
        headers,
    });
}
