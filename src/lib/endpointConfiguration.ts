import { Configuration } from '../generated/runtime';
import { AssetAdministrationShellDescriptor, SubmodelDescriptor } from '../models/Descriptors';
import { findEndpoint, isRepositoryEndpoint } from '../utils/DescriptorUtils';
import { base64Encode } from './base64Url';

/**
 * Returns the configuration for requests to a descriptor endpoint, or `null` to reject the endpoint.
 *
 * Called with the full endpoint href (e.g. `https://host/aas-env/shells/{id}`) before any request is sent.
 * The `basePath` of the returned configuration is ignored; it is derived from the href.
 * A rejected endpoint is not contacted and is reported with `errorType: 'EndpointRejected'`.
 */
export type EndpointConfigurationResolver = (
    href: string
) => Configuration | null | undefined | Promise<Configuration | null | undefined>;

export type EndpointConfigurationResult =
    | { success: true; configuration: Configuration }
    | { success: false; error: { errorType: 'EndpointRejected'; message: string } };

/**
 * A resolved descriptor endpoint.
 *
 * `href` is the URL of the resource itself; `basePath` is the URL of the repository serving it.
 */
export interface ResolvedDescriptorEndpoint {
    href: string;
    basePath: string;
}

/**
 * Splits a resource URL like `http://host/prefix/shells/{encodedId}` into the repository base path and the
 * encoded identifier.
 *
 * @param href The resource URL
 * @param collection The collection segment (`shells` or `submodels`)
 * @returns The base path and encoded identifier, or `undefined` if the URL does not match
 */
export function splitResourceHref(
    href: string,
    collection: 'shells' | 'submodels'
): { basePath: string; encodedId: string } | undefined {
    const match = href.match(new RegExp(String.raw`^(https?:\/\/[^/?#]+(?:\/[^?#]*?)?)\/${collection}\/([^/?#]+)\/?$`));
    if (!match) return undefined;
    return { basePath: match[1], encodedId: match[2] };
}

/**
 * Resolves the endpoint of a descriptor for the given interface family (`AAS` or `SUBMODEL`).
 * Repository interface endpoints are expanded to the resource URL of the descriptor's identifier.
 *
 * @param descriptor The descriptor
 * @param interfaceName `AAS` or `SUBMODEL`
 * @returns The resolved endpoint, or `undefined` if the descriptor has no usable endpoint
 */
export function resolveDescriptorEndpoint(
    descriptor: AssetAdministrationShellDescriptor | SubmodelDescriptor,
    interfaceName: 'AAS' | 'SUBMODEL'
): ResolvedDescriptorEndpoint | undefined {
    const endpoint = findEndpoint(descriptor, `${interfaceName}-3.0`);
    const endpointHref = endpoint?.protocolInformation?.href?.trim();
    if (!endpoint || !endpointHref) return undefined;

    const collection = interfaceName === 'AAS' ? 'shells' : 'submodels';

    if (isRepositoryEndpoint(endpoint)) {
        if (!descriptor.id) return undefined;
        const basePath = endpointHref.replace(/\/+$/, '');
        return { href: `${basePath}/${collection}/${base64Encode(descriptor.id)}`, basePath };
    }

    const parts = splitResourceHref(endpointHref, collection);
    return { href: endpointHref, basePath: parts?.basePath ?? endpointHref };
}

/**
 * Creates a configuration for the given base path that keeps the auth, fetch and middleware settings of `source`.
 *
 * @param basePath The base path to target
 * @param source The configuration to take the settings from
 * @returns The new configuration
 */
export function withBasePath(basePath: string, source?: Configuration): Configuration {
    if (!source) {
        return new Configuration({ basePath });
    }

    return new Configuration({
        basePath,
        fetchApi: source.fetchApi,
        middleware: source.middleware,
        queryParamsStringify: source.queryParamsStringify,
        username: source.username,
        password: source.password,
        apiKey: source.apiKey,
        accessToken: source.accessToken,
        headers: source.headers,
        credentials: source.credentials,
    });
}

/**
 * Determines the configuration for a request to a descriptor endpoint.
 *
 * If a resolver is given, it decides: it returns the configuration to use, or rejects the endpoint by returning
 * `null`/`undefined` or throwing. Otherwise, the settings of the fallback configuration (if any) are used.
 *
 * @param href The full endpoint URL
 * @param basePath The base path to send the request to
 * @param resolver The caller's endpoint configuration hook
 * @param fallback The configuration to take settings from if no resolver is given
 * @returns The configuration, or an `EndpointRejected` error
 */
export async function createEndpointConfiguration(
    href: string,
    basePath: string,
    resolver: EndpointConfigurationResolver | undefined,
    fallback: Configuration | undefined
): Promise<EndpointConfigurationResult> {
    if (!resolver) {
        return { success: true, configuration: withBasePath(basePath, fallback) };
    }

    let configuration: Configuration | null | undefined;
    try {
        configuration = await resolver(href);
    } catch (error) {
        return {
            success: false,
            error: {
                errorType: 'EndpointRejected',
                message: `Endpoint ${href} was rejected: ${error instanceof Error ? error.message : String(error)}`,
            },
        };
    }

    if (!configuration) {
        return {
            success: false,
            error: { errorType: 'EndpointRejected', message: `Endpoint ${href} was rejected` },
        };
    }

    return { success: true, configuration: withBasePath(basePath, configuration) };
}
