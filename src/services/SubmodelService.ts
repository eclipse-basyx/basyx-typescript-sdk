import type { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import type { ApiResult } from '../models/api';
import { SubmodelRegistryClient } from '../clients/SubmodelRegistryClient';
import { SubmodelRepositoryClient } from '../clients/SubmodelRepositoryClient';
import { Configuration } from '../generated/runtime';
import { base64Decode, base64Encode } from '../lib/base64Url';
import { SubmodelDescriptor } from '../models/Descriptors';

export interface SubmodelServiceConfig {
    registryConfig?: Configuration;
    repositoryConfig?: Configuration;
}

/**
 * SubmodelService combines Submodel Registry and Repository clients to provide
 * higher-level functionality for working with Submodels.
 *
 * This service demonstrates the multi-client pattern by orchestrating
 * operations across different BaSyx components.
 */
export class SubmodelService {
    private registryClient: SubmodelRegistryClient;
    private repositoryClient: SubmodelRepositoryClient;
    private registryConfig?: Configuration;
    private repositoryConfig?: Configuration;

    constructor(config: SubmodelServiceConfig) {
        this.registryClient = new SubmodelRegistryClient();
        this.repositoryClient = new SubmodelRepositoryClient();
        this.registryConfig = config.registryConfig;
        this.repositoryConfig = config.repositoryConfig;
    }

    /**
     * Retrieves a list of all Submodels.
     *
     * This method first attempts to fetch Submodel Descriptors from the Registry,
     * then uses the descriptor endpoints to fetch the actual submodels.
     * If a registry is not configured or fails, it falls back to fetching
     * Submodels directly from the Repository.
     *
     * @param options Object containing:
     *  - preferRegistry?: Whether to prefer registry over repository (default: true)
     *  - limit?: Maximum number of elements to retrieve
     *  - cursor?: Pagination cursor
     *
     * @returns Either `{ success: true; data: { submodels, source } }` or `{ success: false; error: ... }`.
     */
    async getSubmodelList(options?: { preferRegistry?: boolean; limit?: number; cursor?: string }): Promise<
        ApiResult<
            {
                submodels: Submodel[];
                source: 'registry' | 'repository';
            },
            any
        >
    > {
        const preferRegistry = options?.preferRegistry ?? true;

        // Try registry first if configured and preferred
        if (preferRegistry && this.registryConfig) {
            const registryResult = await this.registryClient.getAllSubmodelDescriptors({
                configuration: this.registryConfig,
                limit: options?.limit,
                cursor: options?.cursor,
            });

            if (registryResult.success) {
                const descriptors = registryResult.data.result;

                // Fetch submodels from their endpoints
                const submodelPromises = descriptors.map(async (descriptor) => {
                    const endpoint = descriptor.endpoints?.[0]?.protocolInformation?.href;
                    if (!endpoint) {
                        return null;
                    }

                    const submodelResult = await this.getSubmodelByEndpoint({ endpoint });
                    return submodelResult.success ? submodelResult.data.submodel : null;
                });

                const submodels = (await Promise.all(submodelPromises)).filter((sm): sm is Submodel => sm !== null);

                return {
                    success: true,
                    data: {
                        submodels,
                        source: 'registry',
                    },
                };
            }
        }

        // Fall back to repository if registry failed or not configured
        if (this.repositoryConfig) {
            const repositoryResult = await this.repositoryClient.getAllSubmodels({
                configuration: this.repositoryConfig,
                limit: options?.limit,
                cursor: options?.cursor,
            });

            if (repositoryResult.success) {
                return {
                    success: true,
                    data: {
                        submodels: repositoryResult.data.result,
                        source: 'repository',
                    },
                };
            }

            return { success: false, error: repositoryResult.error };
        }

        return {
            success: false,
            error: {
                errorType: 'ConfigurationError',
                message: 'Neither registry nor repository configuration provided',
            },
        };
    }

    /**
     * Retrieves a Submodel by ID.
     *
     * This method first attempts to fetch the descriptor from the registry
     * and use its endpoint to fetch the submodel. If that fails, it falls back
     * to fetching directly from the repository.
     *
     * @param options Object containing:
     *  - submodelIdentifier: The Submodel identifier
     *  - useRegistryEndpoint?: Whether to try registry endpoint first (default: true)
     *
     * @returns Either `{ success: true; data: { submodel, descriptor? } }` or `{ success: false; error: ... }`.
     */
    async getSubmodelById(options: { submodelIdentifier: string; useRegistryEndpoint?: boolean }): Promise<
        ApiResult<
            {
                submodel: Submodel;
                descriptor?: SubmodelDescriptor;
            },
            any
        >
    > {
        const { submodelIdentifier, useRegistryEndpoint = true } = options;

        // Try registry-based flow first
        if (useRegistryEndpoint && this.registryConfig) {
            const descriptorResult = await this.registryClient.getSubmodelDescriptorById({
                configuration: this.registryConfig,
                submodelIdentifier,
            });

            if (descriptorResult.success) {
                const descriptor = descriptorResult.data;
                const endpoint = descriptor.endpoints?.[0]?.protocolInformation?.href;

                if (endpoint) {
                    const submodelResult = await this.getSubmodelByEndpoint({ endpoint });
                    if (submodelResult.success) {
                        return {
                            success: true,
                            data: {
                                submodel: submodelResult.data.submodel,
                                descriptor,
                            },
                        };
                    }
                }

                // If endpoint fetch failed, fall through to repository
            }
        }

        // Fall back to repository
        if (!this.repositoryConfig) {
            return {
                success: false,
                error: {
                    errorType: 'ConfigurationError',
                    message: 'No repository configuration available',
                },
            };
        }

        const submodelResult = await this.repositoryClient.getSubmodelById({
            configuration: this.repositoryConfig,
            submodelIdentifier,
        });

        if (submodelResult.success) {
            return {
                success: true,
                data: {
                    submodel: submodelResult.data,
                    descriptor: undefined,
                },
            };
        }

        return { success: false, error: submodelResult.error };
    }

    /**
     * Gets the endpoint URL for a Submodel by its identifier.
     *
     * If registry is configured and useRegistry is true, retrieves the endpoint
     * from the descriptor's endpoint object. Otherwise, constructs the endpoint
     * from the repository base path and the encoded Submodel identifier.
     *
     * @param options Object containing:
     *  - submodelIdentifier: The Submodel identifier
     *  - useRegistry?: Whether to try getting endpoint from registry (default: true)
     *
     * @returns Either `{ success: true; data: endpointUrl }` or `{ success: false; error: ... }`.
     */
    async getSubmodelEndpointById(options: {
        submodelIdentifier: string;
        useRegistry?: boolean;
    }): Promise<ApiResult<string, any>> {
        const { submodelIdentifier, useRegistry = true } = options;

        // Try registry first if configured and requested
        if (useRegistry && this.registryConfig) {
            const descriptorResult = await this.registryClient.getSubmodelDescriptorById({
                configuration: this.registryConfig,
                submodelIdentifier,
            });

            if (descriptorResult.success) {
                const endpoint = descriptorResult.data.endpoints?.[0]?.protocolInformation?.href;
                if (endpoint) {
                    return { success: true, data: endpoint };
                }
            }
        }

        // Fall back to constructing from repository base
        if (!this.repositoryConfig) {
            return {
                success: false,
                error: {
                    errorType: 'ConfigurationError',
                    message: 'Repository configuration required',
                },
            };
        }

        const repositoryBasePath = this.repositoryConfig.basePath || 'http://localhost:8082';
        const encodedId = base64Encode(submodelIdentifier);
        const endpoint = `${repositoryBasePath}/submodels/${encodedId}`;

        return { success: true, data: endpoint };
    }

    /**
     * Retrieves a Submodel by its endpoint URL.
     *
     * Extracts the base URL and base64url-encoded Submodel identifier from the endpoint,
     * decodes the identifier, and fetches the submodel from the repository.
     *
     * @param options Object containing:
     *  - endpoint: The endpoint URL (format: http://host/submodels/{base64EncodedId})
     *
     * @returns Either `{ success: true; data: { submodel } }` or `{ success: false; error: ... }`.
     */
    async getSubmodelByEndpoint(options: { endpoint: string }): Promise<
        ApiResult<
            {
                submodel: Submodel;
            },
            any
        >
    > {
        const { endpoint } = options;

        // Extract base URL and encoded ID from endpoint
        // Expected format: http://localhost:8082/submodels/base64EncodedId
        const match = endpoint.match(/^(https?:\/\/[^/]+(?::\d+)?)\/submodels\/([^/]+)$/);

        if (!match) {
            return {
                success: false,
                error: {
                    errorType: 'InvalidEndpoint',
                    message: 'Invalid endpoint format. Expected format: http://host/submodels/{base64EncodedId}',
                },
            };
        }

        const [, baseUrl, encodedId] = match;

        // Decode the ID
        const submodelIdentifier = base64Decode(encodedId);

        // Create configuration for the endpoint
        const config = new Configuration({ basePath: baseUrl });

        // Fetch the submodel
        const submodelResult = await this.repositoryClient.getSubmodelById({
            configuration: config,
            submodelIdentifier,
        });

        if (!submodelResult.success) {
            return { success: false, error: submodelResult.error };
        }

        return {
            success: true,
            data: {
                submodel: submodelResult.data,
            },
        };
    }

    /**
     * Creates a Submodel and optionally registers it in the registry.
     *
     * This method creates the Submodel in the repository first. If registry is configured
     * and registerInRegistry is true, it automatically creates a descriptor from the submodel
     * and registers it in the registry with the repository endpoint.
     *
     * @param options Object containing:
     *  - submodel: The Submodel to create
     *  - registerInRegistry?: Whether to register the descriptor in the registry (default: true)
     *
     * @returns Either `{ success: true; data: { submodel, descriptor? } }` or `{ success: false; error: ... }`.
     */
    async createSubmodel(options: { submodel: Submodel; registerInRegistry?: boolean }): Promise<
        ApiResult<
            {
                submodel: Submodel;
                descriptor?: SubmodelDescriptor;
            },
            any
        >
    > {
        const { submodel, registerInRegistry = true } = options;

        if (!this.repositoryConfig) {
            return {
                success: false,
                error: {
                    errorType: 'ConfigurationError',
                    message: 'Repository configuration required',
                },
            };
        }

        // Create Submodel in repository
        const submodelResult = await this.repositoryClient.postSubmodel({
            configuration: this.repositoryConfig,
            submodel: submodel,
        });

        if (!submodelResult.success) {
            return { success: false, error: submodelResult.error };
        }

        // Register descriptor in registry if configured and requested
        if (registerInRegistry && this.registryConfig) {
            // Create descriptor from submodel
            const descriptor = new SubmodelDescriptor(submodel.id, []);

            // Set endpoint using repository base path
            const repositoryBasePath = this.repositoryConfig.basePath || 'http://localhost:8082';
            const encodedId = base64Encode(submodel.id);
            descriptor.endpoints = [
                {
                    _interface: 'SUBMODEL-3.0',
                    protocolInformation: {
                        href: `${repositoryBasePath}/submodels/${encodedId}`,
                        endpointProtocol: null,
                        endpointProtocolVersion: null,
                        subprotocol: null,
                        subprotocolBody: null,
                        subprotocolBodyEncoding: null,
                        securityAttributes: null,
                    },
                },
            ];

            const descriptorResult = await this.registryClient.postSubmodelDescriptor({
                configuration: this.registryConfig,
                submodelDescriptor: descriptor,
            });

            if (!descriptorResult.success) {
                // Submodel was created but registration failed - return error
                return { success: false, error: descriptorResult.error };
            }

            return {
                success: true,
                data: {
                    submodel: submodelResult.data,
                    descriptor: descriptorResult.data,
                },
            };
        }

        // Registry not configured or registration not requested
        return {
            success: true,
            data: {
                submodel: submodelResult.data,
                descriptor: undefined,
            },
        };
    }

    /**
     * Updates a Submodel and optionally updates its descriptor in the registry.
     *
     * This method updates the Submodel in the repository. If registry is configured
     * and updateInRegistry is true, it automatically creates/updates the descriptor
     * in the registry with the updated submodel data.
     *
     * @param options Object containing:
     *  - submodel: The updated Submodel
     *  - updateInRegistry?: Whether to update the descriptor in the registry (default: true)
     *
     * @returns Either `{ success: true; data: { submodel, descriptor? } }` or `{ success: false; error: ... }`.
     */
    async updateSubmodel(options: { submodel: Submodel; updateInRegistry?: boolean }): Promise<
        ApiResult<
            {
                submodel: Submodel;
                descriptor?: SubmodelDescriptor;
            },
            any
        >
    > {
        const { submodel, updateInRegistry = true } = options;

        if (!this.repositoryConfig) {
            return {
                success: false,
                error: {
                    errorType: 'ConfigurationError',
                    message: 'Repository configuration required',
                },
            };
        }

        // Update Submodel in repository
        const submodelResult = await this.repositoryClient.putSubmodelById({
            configuration: this.repositoryConfig,
            submodelIdentifier: submodel.id,
            submodel: submodel,
        });

        if (!submodelResult.success) {
            return { success: false, error: submodelResult.error };
        }

        // Use the returned submodel if available, otherwise use the input submodel
        const updatedSubmodel = submodelResult.data || submodel;

        // Update descriptor in registry if configured and requested
        if (updateInRegistry && this.registryConfig) {
            // Create/update descriptor from submodel
            const descriptor = new SubmodelDescriptor(submodel.id, []);

            // Set endpoint using repository base path
            const repositoryBasePath = this.repositoryConfig.basePath || 'http://localhost:8082';
            const encodedId = base64Encode(submodel.id);
            descriptor.endpoints = [
                {
                    _interface: 'SUBMODEL-3.0',
                    protocolInformation: {
                        href: `${repositoryBasePath}/submodels/${encodedId}`,
                        endpointProtocol: null,
                        endpointProtocolVersion: null,
                        subprotocol: null,
                        subprotocolBody: null,
                        subprotocolBodyEncoding: null,
                        securityAttributes: null,
                    },
                },
            ];

            const descriptorResult = await this.registryClient.putSubmodelDescriptorById({
                configuration: this.registryConfig,
                submodelIdentifier: submodel.id,
                submodelDescriptor: descriptor,
            });

            if (!descriptorResult.success) {
                // Submodel was updated but registry update failed - return error
                return { success: false, error: descriptorResult.error };
            }

            return {
                success: true,
                data: {
                    submodel: updatedSubmodel,
                    descriptor: descriptorResult.data || undefined,
                },
            };
        }

        // Registry not configured or update not requested
        return {
            success: true,
            data: {
                submodel: updatedSubmodel,
                descriptor: undefined,
            },
        };
    }

    /**
     * Deletes a Submodel and optionally removes it from the registry.
     *
     * This method removes the descriptor from the registry first (if requested),
     * then deletes the Submodel from the repository.
     *
     * @param options Object containing:
     *  - submodelIdentifier: The Submodel identifier to remove
     *  - deleteFromRegistry?: Whether to delete from registry (default: true)
     *
     * @returns Either `{ success: true; data: void }` or `{ success: false; error: ... }`.
     */
    async deleteSubmodel(options: {
        submodelIdentifier: string;
        deleteFromRegistry?: boolean;
    }): Promise<ApiResult<void, any>> {
        const { submodelIdentifier, deleteFromRegistry = true } = options;

        // Remove from registry first if configured and requested
        if (deleteFromRegistry && this.registryConfig) {
            const registryResult = await this.registryClient.deleteSubmodelDescriptorById({
                configuration: this.registryConfig,
                submodelIdentifier,
            });

            if (!registryResult.success) {
                return { success: false, error: registryResult.error };
            }
        }

        // Remove from repository
        if (this.repositoryConfig) {
            const repositoryResult = await this.repositoryClient.deleteSubmodelById({
                configuration: this.repositoryConfig,
                submodelIdentifier,
            });

            if (!repositoryResult.success) {
                return { success: false, error: repositoryResult.error };
            }
        }

        return { success: true, data: undefined };
    }
}
