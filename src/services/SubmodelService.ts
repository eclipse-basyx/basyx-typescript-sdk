import type { ConceptDescription, ISubmodelElement, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import type { ApiResult } from '../models/api';
import { ModelType } from '@aas-core-works/aas-core3.0-typescript/types';
import { ConceptDescriptionRepositoryClient } from '../clients/ConceptDescriptionRepositoryClient';
import { SubmodelRegistryClient } from '../clients/SubmodelRegistryClient';
import { SubmodelRepositoryClient } from '../clients/SubmodelRepositoryClient';
import { Configuration } from '../generated/runtime';
import { base64Decode, base64Encode } from '../lib/base64Url';
import { SubmodelDescriptor } from '../models/Descriptors';

export interface SubmodelServiceConfig {
    submodelRegistryConfig?: Configuration;
    submodelRepositoryConfig?: Configuration;
    conceptDescriptionRepositoryConfig?: Configuration;
}

/**
 * SubmodelService combines Submodel Registry, Submodel Repository, and Concept Description Repository clients
 * to provide higher-level functionality for working with Submodels.
 *
 * This service demonstrates the multi-client pattern by orchestrating
 * operations across different BaSyx components, including the Submodel Registry,
 * Submodel Repository, and Concept Description Repository.
 */
export class SubmodelService {
    private submodelRegistryClient: SubmodelRegistryClient;
    private submodelRepositoryClient: SubmodelRepositoryClient;
    private conceptDescriptionClient: ConceptDescriptionRepositoryClient;
    private submodelRegistryConfig?: Configuration;
    private submodelRepositoryConfig?: Configuration;
    private conceptDescriptionRepositoryConfig?: Configuration;

    constructor(config: SubmodelServiceConfig) {
        this.submodelRegistryClient = new SubmodelRegistryClient();
        this.submodelRepositoryClient = new SubmodelRepositoryClient();
        this.conceptDescriptionClient = new ConceptDescriptionRepositoryClient();
        this.submodelRegistryConfig = config.submodelRegistryConfig;
        this.submodelRepositoryConfig = config.submodelRepositoryConfig;
        this.conceptDescriptionRepositoryConfig = config.conceptDescriptionRepositoryConfig;
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
     *  - includeConceptDescriptions?: Whether to fetch concept descriptions (default: false)
     *
     * @returns Either `{ success: true; data: { submodels, source, conceptDescriptions? } }` or `{ success: false; error: ... }`.
     */
    async getSubmodelList(options?: {
        preferRegistry?: boolean;
        limit?: number;
        cursor?: string;
        includeConceptDescriptions?: boolean;
    }): Promise<
        ApiResult<
            {
                submodels: Submodel[];
                source: 'registry' | 'repository';
                conceptDescriptions?: ConceptDescription[];
            },
            any
        >
    > {
        const preferRegistry = options?.preferRegistry ?? true;
        const includeConceptDescriptions = options?.includeConceptDescriptions ?? false;

        // Try registry first if configured and preferred
        if (preferRegistry && this.submodelRegistryConfig) {
            const registryResult = await this.submodelRegistryClient.getAllSubmodelDescriptors({
                configuration: this.submodelRegistryConfig,
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

                // Fetch concept descriptions if requested
                let conceptDescriptions: ConceptDescription[] | undefined;
                if (includeConceptDescriptions) {
                    conceptDescriptions = await this.fetchConceptDescriptionsForSubmodels(submodels);
                }

                return {
                    success: true,
                    data: {
                        submodels,
                        source: 'registry',
                        ...(conceptDescriptions && { conceptDescriptions }),
                    },
                };
            }
        }

        // Fall back to repository if registry failed or not configured
        if (this.submodelRepositoryConfig) {
            const repositoryResult = await this.submodelRepositoryClient.getAllSubmodels({
                configuration: this.submodelRepositoryConfig,
                limit: options?.limit,
                cursor: options?.cursor,
            });

            if (repositoryResult.success) {
                const submodels = repositoryResult.data.result;

                // Fetch concept descriptions if requested
                let conceptDescriptions: ConceptDescription[] | undefined;
                if (includeConceptDescriptions) {
                    conceptDescriptions = await this.fetchConceptDescriptionsForSubmodels(submodels);
                }

                return {
                    success: true,
                    data: {
                        submodels,
                        source: 'repository',
                        ...(conceptDescriptions && { conceptDescriptions }),
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
     *  - includeConceptDescriptions?: Whether to fetch concept descriptions (default: false)
     *
     * @returns Either `{ success: true; data: { submodel, descriptor?, conceptDescriptions? } }` or `{ success: false; error: ... }`.
     */
    async getSubmodelById(options: {
        submodelIdentifier: string;
        useRegistryEndpoint?: boolean;
        includeConceptDescriptions?: boolean;
    }): Promise<
        ApiResult<
            {
                submodel: Submodel;
                descriptor?: SubmodelDescriptor;
                conceptDescriptions?: ConceptDescription[];
            },
            any
        >
    > {
        const { submodelIdentifier, useRegistryEndpoint = true, includeConceptDescriptions = false } = options;

        // Try registry-based flow first
        if (useRegistryEndpoint && this.submodelRegistryConfig) {
            const descriptorResult = await this.submodelRegistryClient.getSubmodelDescriptorById({
                configuration: this.submodelRegistryConfig,
                submodelIdentifier,
            });

            if (descriptorResult.success) {
                const descriptor = descriptorResult.data;
                const endpoint = descriptor.endpoints?.[0]?.protocolInformation?.href;

                if (endpoint) {
                    const submodelResult = await this.getSubmodelByEndpoint({
                        endpoint,
                        includeConceptDescriptions,
                    });
                    if (submodelResult.success) {
                        return {
                            success: true,
                            data: {
                                submodel: submodelResult.data.submodel,
                                descriptor,
                                ...(submodelResult.data.conceptDescriptions && {
                                    conceptDescriptions: submodelResult.data.conceptDescriptions,
                                }),
                            },
                        };
                    }
                }

                // If endpoint fetch failed, fall through to repository
            }
        }

        // Fall back to repository
        if (!this.submodelRepositoryConfig) {
            return {
                success: false,
                error: {
                    errorType: 'ConfigurationError',
                    message: 'No repository configuration available',
                },
            };
        }

        const submodelResult = await this.submodelRepositoryClient.getSubmodelById({
            configuration: this.submodelRepositoryConfig,
            submodelIdentifier,
        });

        if (submodelResult.success) {
            const submodel = submodelResult.data;

            // Fetch concept descriptions if requested
            let conceptDescriptions: ConceptDescription[] | undefined;
            if (includeConceptDescriptions) {
                conceptDescriptions = await this.fetchConceptDescriptionsForSubmodels([submodel]);
            }

            return {
                success: true,
                data: {
                    submodel,
                    descriptor: undefined,
                    ...(conceptDescriptions && { conceptDescriptions }),
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
        if (useRegistry && this.submodelRegistryConfig) {
            const descriptorResult = await this.submodelRegistryClient.getSubmodelDescriptorById({
                configuration: this.submodelRegistryConfig,
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
        if (!this.submodelRepositoryConfig) {
            return {
                success: false,
                error: {
                    errorType: 'ConfigurationError',
                    message: 'Repository configuration required',
                },
            };
        }

        const repositoryBasePath = this.submodelRepositoryConfig.basePath || 'http://localhost:8082';
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
     *  - includeConceptDescriptions?: Whether to fetch concept descriptions (default: false)
     *
     * @returns Either `{ success: true; data: { submodel, conceptDescriptions? } }` or `{ success: false; error: ... }`.
     */
    async getSubmodelByEndpoint(options: { endpoint: string; includeConceptDescriptions?: boolean }): Promise<
        ApiResult<
            {
                submodel: Submodel;
                conceptDescriptions?: ConceptDescription[];
            },
            any
        >
    > {
        const { endpoint, includeConceptDescriptions = false } = options;

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
        const submodelResult = await this.submodelRepositoryClient.getSubmodelById({
            configuration: config,
            submodelIdentifier,
        });

        if (!submodelResult.success) {
            return { success: false, error: submodelResult.error };
        }

        const submodel = submodelResult.data;

        // Fetch concept descriptions if requested
        let conceptDescriptions: ConceptDescription[] | undefined;
        if (includeConceptDescriptions) {
            conceptDescriptions = await this.fetchConceptDescriptionsForSubmodels([submodel]);
        }

        return {
            success: true,
            data: {
                submodel,
                ...(conceptDescriptions && { conceptDescriptions }),
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

        if (!this.submodelRepositoryConfig) {
            return {
                success: false,
                error: {
                    errorType: 'ConfigurationError',
                    message: 'Repository configuration required',
                },
            };
        }

        // Create Submodel in repository
        const submodelResult = await this.submodelRepositoryClient.postSubmodel({
            configuration: this.submodelRepositoryConfig,
            submodel: submodel,
        });

        if (!submodelResult.success) {
            return { success: false, error: submodelResult.error };
        }

        // Register descriptor in registry if configured and requested
        if (registerInRegistry && this.submodelRegistryConfig) {
            const descriptor = this.createDescriptorFromSubmodel(submodel);

            const descriptorResult = await this.submodelRegistryClient.postSubmodelDescriptor({
                configuration: this.submodelRegistryConfig,
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

        if (!this.submodelRepositoryConfig) {
            return {
                success: false,
                error: {
                    errorType: 'ConfigurationError',
                    message: 'Repository configuration required',
                },
            };
        }

        // Update Submodel in repository
        const submodelResult = await this.submodelRepositoryClient.putSubmodelById({
            configuration: this.submodelRepositoryConfig,
            submodelIdentifier: submodel.id,
            submodel: submodel,
        });

        if (!submodelResult.success) {
            return { success: false, error: submodelResult.error };
        }

        // Use the returned submodel if available, otherwise use the input submodel
        const updatedSubmodel = submodelResult.data || submodel;

        // Update descriptor in registry if configured and requested
        if (updateInRegistry && this.submodelRegistryConfig) {
            const descriptor = this.createDescriptorFromSubmodel(submodel);

            const descriptorResult = await this.submodelRegistryClient.putSubmodelDescriptorById({
                configuration: this.submodelRegistryConfig,
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
        if (deleteFromRegistry && this.submodelRegistryConfig) {
            const registryResult = await this.submodelRegistryClient.deleteSubmodelDescriptorById({
                configuration: this.submodelRegistryConfig,
                submodelIdentifier,
            });

            if (!registryResult.success) {
                return { success: false, error: registryResult.error };
            }
        }

        // Remove from repository
        if (this.submodelRepositoryConfig) {
            const repositoryResult = await this.submodelRepositoryClient.deleteSubmodelById({
                configuration: this.submodelRepositoryConfig,
                submodelIdentifier,
            });

            if (!repositoryResult.success) {
                return { success: false, error: repositoryResult.error };
            }
        }

        return { success: true, data: undefined };
    }

    /**
     * Helper method to create a Submodel descriptor from a Submodel.
     * Populates descriptor fields from the submodel including metadata and endpoint configuration.
     *
     * @param submodel The Submodel to create descriptor from
     * @returns SubmodelDescriptor with all populated fields
     */
    private createDescriptorFromSubmodel(submodel: Submodel): SubmodelDescriptor {
        // Set endpoint using repository base path
        const repositoryBasePath = this.submodelRepositoryConfig!.basePath || 'http://localhost:8082';
        const encodedId = base64Encode(submodel.id);
        const endpoints = [
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

        const descriptor = new SubmodelDescriptor(
            submodel.id,
            endpoints,
            submodel.administration ?? null,
            submodel.idShort ?? null,
            submodel.semanticId ?? null,
            submodel.supplementalSemanticIds ?? null,
            submodel.displayName ?? null,
            submodel.description ?? null,
            submodel.extensions ?? null
        );
        return descriptor;
    }

    /**
     * Extracts all unique semantic IDs from a submodel and its elements recursively.
     * Uses a stack-based approach to traverse the submodel element tree.
     *
     * @param submodel The submodel to extract semantic IDs from
     * @returns Array of unique semantic ID strings
     */
    private extractSemanticIds(submodel: Submodel): string[] {
        const semanticIds = new Set<string>();

        // Add submodel's own semantic ID if present
        if (submodel.semanticId?.keys && submodel.semanticId.keys.length > 0) {
            const semanticIdValue = submodel.semanticId.keys[0].value;
            if (semanticIdValue) {
                semanticIds.add(semanticIdValue);
            }
        }

        // Stack-based traversal of submodel elements
        const stack: ISubmodelElement[] = [...(submodel.submodelElements || [])];

        while (stack.length > 0) {
            const element = stack.pop()!;

            // Add element's semantic ID if present
            if (element.semanticId?.keys && element.semanticId.keys.length > 0) {
                const semanticIdValue = element.semanticId.keys[0].value;
                if (semanticIdValue) {
                    semanticIds.add(semanticIdValue);
                }
            }

            // Add children to stack based on element type
            const modelType = typeof element.modelType === 'function' ? element.modelType() : element.modelType;

            if (modelType === ModelType.SubmodelElementCollection) {
                const collection = element as any;
                if (collection.value && Array.isArray(collection.value)) {
                    stack.push(...collection.value);
                }
            } else if (modelType === ModelType.SubmodelElementList) {
                const list = element as any;
                if (list.value && Array.isArray(list.value)) {
                    stack.push(...list.value);
                }
            } else if (modelType === ModelType.Entity) {
                const entity = element as any;
                if (entity.statements && Array.isArray(entity.statements)) {
                    stack.push(...entity.statements);
                }
            } else if (modelType === ModelType.AnnotatedRelationshipElement) {
                const annotatedRel = element as any;
                if (annotatedRel.annotations && Array.isArray(annotatedRel.annotations)) {
                    stack.push(...annotatedRel.annotations);
                }
            }
        }

        return Array.from(semanticIds);
    }

    /**
     * Fetches concept descriptions for multiple submodels.
     * Deduplicates semantic IDs across all submodels and fetches each concept description once.
     * Skips concept descriptions that cannot be resolved.
     *
     * @param submodels Array of submodels to fetch concept descriptions for
     * @returns Array of unique concept descriptions
     */
    private async fetchConceptDescriptionsForSubmodels(submodels: Submodel[]): Promise<ConceptDescription[]> {
        if (!this.conceptDescriptionRepositoryConfig) {
            return [];
        }

        // Extract all semantic IDs from all submodels
        const allSemanticIds = new Set<string>();
        for (const submodel of submodels) {
            const semanticIds = this.extractSemanticIds(submodel);
            semanticIds.forEach((id) => allSemanticIds.add(id));
        }

        // Fetch concept descriptions for all unique semantic IDs
        const conceptDescriptions: ConceptDescription[] = [];
        const fetchPromises = Array.from(allSemanticIds).map(async (semanticId) => {
            try {
                const result = await this.conceptDescriptionClient.getConceptDescriptionById({
                    configuration: this.conceptDescriptionRepositoryConfig!,
                    cdIdentifier: semanticId,
                });

                if (result.success) {
                    return result.data;
                }
            } catch {
                // Skip concept descriptions that cannot be resolved
            }
            return null;
        });

        const results = await Promise.all(fetchPromises);
        conceptDescriptions.push(...results.filter((cd): cd is ConceptDescription => cd !== null));

        return conceptDescriptions;
    }
}
