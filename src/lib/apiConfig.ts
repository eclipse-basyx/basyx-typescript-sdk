//import { Configuration } from '../generated';
import {
    AasRegistryService,
    AasRepositoryService,
    ConceptDescriptionRepositoryService,
    SubmodelRepositoryService,
} from '../generated';
//export function applyDefaults(configuration: AAS.Configuration): AAS.Configuration {
export function applyDefaults<
    T extends
        | AasRepositoryService.Configuration
        | SubmodelRepositoryService.Configuration
        | ConceptDescriptionRepositoryService.Configuration
        | AasRegistryService.Configuration,
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
    // const defaultConfiguration = new AAS.Configuration({
    //     basePath: configuration.basePath || undefined,
    //     fetchApi: configuration.fetchApi || getDefaultFetchApi(),
    //     middleware: configuration.middleware || undefined,
    //     queryParamsStringify: configuration.queryParamsStringify || undefined,
    //     username: configuration.username || undefined,
    //     password: configuration.password || undefined,
    //     apiKey: configuration.apiKey || undefined,
    //     accessToken: configuration.accessToken || undefined,
    //     headers: configuration.headers || undefined,
    //     credentials: configuration.credentials || undefined,
    // });

    //return defaultConfiguration as T;
    // Create the appropriate configuration type
    if (configuration instanceof AasRepositoryService.Configuration) {
        return new AasRepositoryService.Configuration(options) as T;
    } else if (configuration instanceof SubmodelRepositoryService.Configuration) {
        return new SubmodelRepositoryService.Configuration(options) as T;
    } else if (configuration instanceof ConceptDescriptionRepositoryService.Configuration) {
        return new ConceptDescriptionRepositoryService.Configuration(options) as T;
    } else {
        return new AasRegistryService.Configuration(options) as T;
    }
}

function getDefaultFetchApi(): typeof fetch {
    // In Node (>=18) or browser, global fetch is available.
    return fetch.bind(globalThis);
}
