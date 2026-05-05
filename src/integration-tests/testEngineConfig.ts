export type InfrastructureComponent =
    | 'aasRepository'
    | 'submodelRepository'
    | 'conceptDescriptionRepository'
    | 'aasRegistry'
    | 'submodelRegistry'
    | 'aasDiscovery'
    | 'aasxFileServer';

const DEFAULT_BASE_PATHS: Record<InfrastructureComponent, string> = {
    aasRepository: 'http://localhost:8081',
    submodelRepository: 'http://localhost:8082',
    conceptDescriptionRepository: 'http://localhost:8083',
    aasRegistry: 'http://localhost:8084',
    submodelRegistry: 'http://localhost:8085',
    aasDiscovery: 'http://localhost:8086',
    aasxFileServer: 'http://localhost:8087',
};

const COMPONENT_ENV_VARS: Record<InfrastructureComponent, string> = {
    aasRepository: 'BASYX_AAS_REPOSITORY_URL',
    submodelRepository: 'BASYX_SUBMODEL_REPOSITORY_URL',
    conceptDescriptionRepository: 'BASYX_CONCEPT_DESCRIPTION_REPOSITORY_URL',
    aasRegistry: 'BASYX_AAS_REGISTRY_URL',
    submodelRegistry: 'BASYX_SUBMODEL_REGISTRY_URL',
    aasDiscovery: 'BASYX_AAS_DISCOVERY_URL',
    aasxFileServer: 'BASYX_AASX_FILE_SERVER_URL',
};

function normalizeBasePath(value: string): string {
    return value.replace(/\/+$/, '');
}

export function getIntegrationBasePath(component: InfrastructureComponent): string {
    const envVarName = COMPONENT_ENV_VARS[component];
    const value = process.env[envVarName];
    if (value && value.trim().length > 0) {
        return normalizeBasePath(value.trim());
    }

    return DEFAULT_BASE_PATHS[component];
}
