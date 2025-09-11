//import { Configuration } from '../generated';
import { Configuration } from '../generated/runtime';

export function applyDefaults(configuration: Configuration): Configuration {
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
        headers: configuration.headers || undefined,
        credentials: configuration.credentials || undefined,
    };

    // Create a new configuration instance with defaults applied
    return new Configuration(options);
}

function getDefaultFetchApi(): typeof fetch {
    // In Node (>=18) or browser, global fetch is available.
    return fetch.bind(globalThis);
}
