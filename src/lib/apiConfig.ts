//import { Configuration } from '../generated';
import {
    AasDiscoveryService,
    AasRegistryService,
    AasRepositoryService,
    AasxFileService,
    ConceptDescriptionRepositoryService,
    SubmodelRegistryService,
    SubmodelRepositoryService,
} from '../generated';
//export function applyDefaults(configuration: AAS.Configuration): AAS.Configuration {
export function applyDefaults<
    T extends
        | AasRepositoryService.Configuration
        | SubmodelRepositoryService.Configuration
        | ConceptDescriptionRepositoryService.Configuration
        | AasRegistryService.Configuration
        | SubmodelRegistryService.Configuration
        | AasDiscoveryService.Configuration
        | AasxFileService.Configuration,
>(configuration: T): T {
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

    // Create the appropriate configuration type
    switch (configuration.constructor) {
        case AasRepositoryService.Configuration:
            return new AasRepositoryService.Configuration(options) as T;

        case SubmodelRepositoryService.Configuration:
            return new SubmodelRepositoryService.Configuration(options) as T;

        case ConceptDescriptionRepositoryService.Configuration:
            return new ConceptDescriptionRepositoryService.Configuration(options) as T;

        case AasRegistryService.Configuration:
            return new AasRegistryService.Configuration(options) as T;

        case SubmodelRegistryService.Configuration:
            return new SubmodelRegistryService.Configuration(options) as T;

        case AasDiscoveryService.Configuration:
            return new AasDiscoveryService.Configuration(options) as T;

        case AasxFileService.Configuration:
            return new AasxFileService.Configuration(options) as T;

        default:
            throw new Error('None of the configuration types match');
    }
}

function getDefaultFetchApi(): typeof fetch {
    // In Node (>=18) or browser, global fetch is available.
    return fetch.bind(globalThis);
}
