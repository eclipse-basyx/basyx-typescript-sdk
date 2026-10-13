import { AssetAdministrationShellDescriptor, Endpoint, SubmodelDescriptor } from '../models/Descriptors';

const interfaceShortNames = [
    'AAS',
    'SUBMODEL',
    'SERIALIZE',
    'DESCRIPTION',
    'AASX-FILE',
    'AAS-REGISTRY',
    'SUBMODEL-REGISTRY',
    'AAS-REPOSITORY',
    'SUBMODEL-REPOSITORY',
    'CD-REPOSITORY',
    'AAS-DISCOVERY',
];

/**
 * Finds the endpoint of a descriptor that matches the given interface short name.
 *
 * An exact match on `endpoint._interface` is preferred. For `AAS-3.x` and `SUBMODEL-3.x` requests,
 * other 3.x versions are accepted as well, in this order:
 * 1. exact match (e.g. `AAS-3.0`)
 * 2. any direct interface of major version 3 (e.g. `AAS-3.1`, `AAS-3.2`)
 * 3. the repository interface of the same version (e.g. `AAS-REPOSITORY-3.0`)
 * 4. any repository interface of major version 3 (e.g. `AAS-REPOSITORY-3.2`)
 *
 * The href of a repository interface points to the repository base path instead of the resource itself.
 *
 * @param {Object} descriptor - The descriptor containing endpoint information.
 * @param {string} interfaceShortName - The short name of the interface to match against endpoint interfaces.
 * @returns {Endpoint | undefined} The matching endpoint, or `undefined` if there is none.
 */
export function findEndpoint(
    descriptor: AssetAdministrationShellDescriptor | SubmodelDescriptor,
    interfaceShortName: string
): Endpoint | undefined {
    if (!interfaceShortName || interfaceShortName.trim() === '') return undefined;

    interfaceShortName = interfaceShortName.trim().toUpperCase();

    if (!interfaceShortNames.some((iShortName: string) => interfaceShortName.startsWith(`${iShortName}-`))) {
        return undefined;
    }

    if (!Array.isArray(descriptor?.endpoints) || descriptor.endpoints.length === 0) {
        return undefined;
    }

    const endpoints = descriptor.endpoints.filter((endpoint) => endpoint?.protocolInformation?.href);
    const interfaceOf = (endpoint: Endpoint) => endpoint._interface?.trim().toUpperCase();

    const exactMatch = endpoints.find((endpoint) => interfaceOf(endpoint) === interfaceShortName);
    if (exactMatch) return exactMatch;

    const versionedInterface = /^(AAS|SUBMODEL)-(3\.\d+(?:\.\d+)*)$/.exec(interfaceShortName);
    if (!versionedInterface) return undefined;

    const [, interfaceName, version] = versionedInterface;
    const directInterfacePattern = new RegExp(String.raw`^${interfaceName}-3\.\d+(?:\.\d+)*$`);
    const repositoryInterfacePattern = new RegExp(String.raw`^${interfaceName}-REPOSITORY-3\.\d+(?:\.\d+)*$`);

    return (
        endpoints.find((endpoint) => directInterfacePattern.test(interfaceOf(endpoint) ?? '')) ??
        endpoints.find((endpoint) => interfaceOf(endpoint) === `${interfaceName}-REPOSITORY-${version}`) ??
        endpoints.find((endpoint) => repositoryInterfacePattern.test(interfaceOf(endpoint) ?? ''))
    );
}

/**
 * Checks whether an endpoint uses a repository interface (e.g. `AAS-REPOSITORY-3.0`).
 * The href of such an endpoint points to the repository base path instead of the resource itself.
 *
 * @param {Endpoint} endpoint - The endpoint to check.
 * @returns {boolean} `true` if the endpoint uses a repository interface.
 */
export function isRepositoryEndpoint(endpoint: Endpoint): boolean {
    return /^[A-Z-]+-REPOSITORY-/.test(endpoint?._interface?.trim().toUpperCase() ?? '');
}

/**
 * Extracts the endpoint from a descriptor based on the given interface short name.
 * See {@link findEndpoint} for the order in which endpoints are matched.
 *
 * @param {Object} descriptor - The descriptor containing endpoint information.
 * @param {string} interfaceShortName - The short name of the interface to match against endpoint interfaces.
 * @returns {string} The href of the matching endpoint's protocol information if found, otherwise an empty string.
 */
export function extractEndpointHref(
    descriptor: AssetAdministrationShellDescriptor | SubmodelDescriptor,
    interfaceShortName: string
): string {
    return findEndpoint(descriptor, interfaceShortName)?.protocolInformation?.href ?? '';
}
