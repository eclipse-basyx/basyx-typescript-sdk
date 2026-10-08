import type { ConditionalRequestHeaders } from '../models/api';

export function applyDefaults(configuration: any, conditionalHeaders?: ConditionalRequestHeaders): any {
    // Extract configuration properties
    const options = {
        basePath: configuration.basePath || undefined,
        fetchApi: configuration.fetchApi || getDefaultFetchApi(),
        middleware: configuration.middleware || undefined,
        queryParamsStringify: configuration.queryParamsStringify || undefined,
        username: configuration.username || undefined,
        password: configuration.password || undefined,
        apiKey: configuration.apiKey || undefined,
        accessToken: configuration.accessToken || undefined,
        headers: withConditionalHeaders(configuration.headers || undefined, conditionalHeaders),
        credentials: configuration.credentials || undefined,
    };

    // Create a new configuration instance with defaults applied
    const ConfigurationCtor = configuration.constructor as new (configuration: Record<string, unknown>) => unknown;
    return new ConfigurationCtor(options);
}

function getDefaultFetchApi(): typeof fetch {
    // In Node (>=18) or browser, global fetch is available.
    return fetch.bind(globalThis);
}

/**
 * Adds `If-Match` and `If-None-Match` to the configured headers. A passed condition replaces a configured header of
 * the same name regardless of its case; without conditions the configured headers are returned unchanged.
 */
function withConditionalHeaders(
    headers: Record<string, string> | undefined,
    conditionalHeaders: ConditionalRequestHeaders | undefined
): Record<string, string> | undefined {
    const conditions: Record<string, string | undefined> = {
        'If-Match': conditionalHeaders?.ifMatch,
        'If-None-Match': conditionalHeaders?.ifNoneMatch,
    };
    const names = Object.keys(conditions).filter((name) => conditions[name]);
    if (names.length === 0) {
        return headers;
    }

    const lowerCaseNames = names.map((name) => name.toLowerCase());
    const merged: Record<string, string> = {};
    for (const [name, value] of Object.entries(headers ?? {})) {
        if (!lowerCaseNames.includes(name.toLowerCase())) {
            merged[name] = value;
        }
    }
    for (const name of names) {
        merged[name] = conditions[name] as string;
    }
    return merged;
}
