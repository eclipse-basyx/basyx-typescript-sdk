import { Configuration } from '../generated';

export function applyDefaults(configuration: Configuration): Configuration {
    const defaultConfiguration = new Configuration({
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
    });

    return defaultConfiguration;
}

function getDefaultFetchApi(): typeof fetch {
    // In Node (>=18) or browser, global fetch is available.
    return fetch.bind(globalThis);
}
