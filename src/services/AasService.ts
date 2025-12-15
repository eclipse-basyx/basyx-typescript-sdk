import type { ApiResult } from '../models/api';
import {
    AssetAdministrationShell,
    KeyTypes,
    Reference,
    ReferenceTypes,
    Submodel,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { AasDiscoveryClient } from '../clients/AasDiscoveryClient';
import { AasRegistryClient } from '../clients/AasRegistryClient';
import { AasRepositoryClient } from '../clients/AasRepositoryClient';
import { Configuration } from '../generated';
import { base64Decode, base64Encode } from '../lib/base64Url';
import { AssetId } from '../models/AssetId';
import { AssetAdministrationShellDescriptor } from '../models/Descriptors';
import { extractEndpointHref } from '../utils/DescriptorUtils';
import { SubmodelService } from './SubmodelService';

export interface AasServiceConfig {
    registryConfig?: Configuration;
    repositoryConfig?: Configuration;
    submodelRegistryConfig?: Configuration;
    submodelRepositoryConfig?: Configuration;
    conceptDescriptionRepositoryConfig?: Configuration;
    discoveryConfig?: Configuration;
}

/**
 * AasService combines and orchestrates multiple clients and services, including:
 * - AasRegistryClient
 * - AasRepositoryClient
 * - AasDiscoveryClient
 * - SubmodelService
 *
 * It provides higher-level functionality for working with Asset Administration Shells
 * by coordinating operations across these BaSyx components, demonstrating the multi-client pattern.
 */
export class AasService {
    private registryClient: AasRegistryClient;
    private repositoryClient: AasRepositoryClient;
    private discoveryClient: AasDiscoveryClient;
    private registryConfig?: Configuration;
    private repositoryConfig?: Configuration;
    private discoveryConfig?: Configuration;
    private submodelService: SubmodelService;

    constructor(config: AasServiceConfig) {
        this.registryClient = new AasRegistryClient();
        this.repositoryClient = new AasRepositoryClient();
        this.discoveryClient = new AasDiscoveryClient();
        this.registryConfig = config.registryConfig;
        this.repositoryConfig = config.repositoryConfig;
        this.discoveryConfig = config.discoveryConfig;

        // Use separate submodel configs if provided, otherwise fall back to AAS configs
        this.submodelService = new SubmodelService({
            registryConfig: config.submodelRegistryConfig ?? config.registryConfig,
            repositoryConfig: config.submodelRepositoryConfig ?? config.repositoryConfig,
            conceptDescriptionRepositoryConfig: config.conceptDescriptionRepositoryConfig,
        });
    }

    /**
     * Retrieves a list of all Asset Administration Shells.
     *
     * This method first attempts to fetch AAS Descriptors from the Registry,
     * then uses the descriptor endpoints to fetch the actual shells.
     * If a registry is not configured or fails, it falls back to fetching
     * AAS directly from the Repository.
     *
     * @param options Object containing:
     *  - preferRegistry?: Whether to prefer registry over repository (default: true)
     *  - limit?: Maximum number of elements to retrieve
     *  - cursor?: Pagination cursor
     *  - includeSubmodels?: Whether to fetch submodels for each shell (default: false)
     *  - includeConceptDescriptions?: Whether to fetch concept descriptions (default: false)
     *
     * @returns Either `{ success: true; data: { shells, source, submodels? } }` or `{ success: false; error: ... }`.
     */
    async getAasList(options?: {
        preferRegistry?: boolean;
        limit?: number;
        cursor?: string;
        includeSubmodels?: boolean;
        includeConceptDescriptions?: boolean;
    }): Promise<
        ApiResult<
            {
                shells: AssetAdministrationShell[];
                source: 'registry' | 'repository';
                submodels?: Record<string, Submodel[]>;
            },
            any
        >
    > {
        const preferRegistry = options?.preferRegistry ?? true;
        const includeSubmodels = options?.includeSubmodels ?? false;

        // Try registry first if configured and preferred
        if (preferRegistry && this.registryConfig) {
            const registryResult = await this.registryClient.getAllAssetAdministrationShellDescriptors({
                configuration: this.registryConfig,
                limit: options?.limit,
                cursor: options?.cursor,
            });

            if (registryResult.success) {
                // Fetch actual shells from descriptor endpoints
                const shells: AssetAdministrationShell[] = [];
                for (const descriptor of registryResult.data.result) {
                    const endpoint = extractEndpointHref(descriptor, 'AAS-3.0');
                    if (endpoint && descriptor.id) {
                        // Extract base URL from endpoint (remove /shells/{id} part)
                        const baseUrl = endpoint.match(/^(https?:\/\/[^/]+(?::\d+)?)/)?.[1] || endpoint;
                        const config = new Configuration({ basePath: baseUrl });
                        const shellResult = await this.repositoryClient.getAssetAdministrationShellById({
                            configuration: config,
                            aasIdentifier: descriptor.id,
                        });
                        if (shellResult.success) {
                            shells.push(shellResult.data);
                        }
                    }
                }

                // Fetch submodels if requested
                let submodelsMap: Record<string, Submodel[]> | undefined;
                if (includeSubmodels) {
                    submodelsMap = await this.fetchSubmodelsForShells(shells, options?.includeConceptDescriptions);
                }

                return {
                    success: true,
                    data: {
                        shells,
                        source: 'registry',
                        ...(submodelsMap && { submodels: submodelsMap }),
                    },
                };
            }
        }

        // Fall back to repository if registry failed or not configured
        if (this.repositoryConfig) {
            const repositoryResult = await this.repositoryClient.getAllAssetAdministrationShells({
                configuration: this.repositoryConfig,
                limit: options?.limit,
                cursor: options?.cursor,
            });

            if (repositoryResult.success) {
                const shells = repositoryResult.data.result;

                // Fetch submodels if requested
                let submodelsMap: Record<string, Submodel[]> | undefined;
                if (includeSubmodels) {
                    submodelsMap = await this.fetchSubmodelsForShells(shells, options?.includeConceptDescriptions);
                }

                return {
                    success: true,
                    data: {
                        shells,
                        source: 'repository',
                        ...(submodelsMap && { submodels: submodelsMap }),
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
     * Retrieves an Asset Administration Shell by ID.
     *
     * This method first attempts to fetch the descriptor from the registry
     * and use its endpoint to fetch the shell. If that fails, it falls back
     * to fetching directly from the repository.
     *
     * @param options Object containing:
     *  - aasIdentifier: The AAS identifier
     *  - useRegistryEndpoint?: Whether to try registry endpoint first (default: true)
     *  - includeSubmodels?: Whether to fetch submodels for the shell (default: false)
     *  - includeConceptDescriptions?: Whether to fetch concept descriptions (default: false)
     *
     * @returns Either `{ success: true; data: { shell, descriptor?, submodels? } }` or `{ success: false; error: ... }`.
     */
    async getAasById(options: {
        aasIdentifier: string;
        useRegistryEndpoint?: boolean;
        includeSubmodels?: boolean;
        includeConceptDescriptions?: boolean;
    }): Promise<
        ApiResult<
            {
                shell: AssetAdministrationShell;
                descriptor?: AssetAdministrationShellDescriptor;
                submodels?: Submodel[];
            },
            any
        >
    > {
        const { aasIdentifier, useRegistryEndpoint = true, includeSubmodels = false } = options;

        // Try registry-based flow first
        if (useRegistryEndpoint && this.registryConfig) {
            const descriptorResult = await this.registryClient.getAssetAdministrationShellDescriptorById({
                configuration: this.registryConfig,
                aasIdentifier,
            });

            if (descriptorResult.success) {
                const descriptor = descriptorResult.data;
                const endpoint = extractEndpointHref(descriptor, 'AAS-3.0');

                if (endpoint) {
                    // Extract base URL from endpoint (remove /shells/{id} part)
                    const baseUrl = endpoint.match(/^(https?:\/\/[^/]+(?::\d+)?)/)?.[1] || endpoint;
                    // Try to fetch from descriptor endpoint
                    const config = new Configuration({ basePath: baseUrl });
                    const shellResult = await this.repositoryClient.getAssetAdministrationShellById({
                        configuration: config,
                        aasIdentifier,
                    });

                    if (shellResult.success) {
                        const shell = shellResult.data;

                        // Fetch submodels if requested
                        let submodels: Submodel[] | undefined;
                        if (includeSubmodels) {
                            const submodelsMap = await this.fetchSubmodelsForShells(
                                [shell],
                                options.includeConceptDescriptions
                            );
                            submodels = submodelsMap[shell.id] || [];
                        }

                        return {
                            success: true,
                            data: {
                                shell,
                                descriptor,
                                ...(submodels && { submodels }),
                            },
                        };
                    }
                }
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

        const shellResult = await this.repositoryClient.getAssetAdministrationShellById({
            configuration: this.repositoryConfig,
            aasIdentifier,
        });

        if (shellResult.success) {
            const shell = shellResult.data;

            // Fetch submodels if requested
            let submodels: Submodel[] | undefined;
            if (includeSubmodels) {
                const submodelsMap = await this.fetchSubmodelsForShells([shell], options.includeConceptDescriptions);
                submodels = submodelsMap[shell.id] || [];
            }

            return {
                success: true,
                data: {
                    shell,
                    descriptor: undefined,
                    ...(submodels && { submodels }),
                },
            };
        }

        return { success: false, error: shellResult.error };
    }

    /**
     * Gets the endpoint URL for an Asset Administration Shell by its identifier.
     *
     * If registry is configured and useRegistry is true, retrieves the endpoint
     * from the descriptor's endpoint object. Otherwise, constructs the endpoint
     * from the repository base path and the encoded AAS identifier.
     *
     * @param options Object containing:
     *  - aasIdentifier: The AAS identifier
     *  - useRegistry?: Whether to try getting endpoint from registry (default: true)
     *
     * @returns Either `{ success: true; data: endpointUrl }` or `{ success: false; error: ... }`.
     */
    async getAasEndpointById(options: {
        aasIdentifier: string;
        useRegistry?: boolean;
    }): Promise<ApiResult<string, any>> {
        const { aasIdentifier, useRegistry = true } = options;

        // Try registry first if configured and requested
        if (useRegistry && this.registryConfig) {
            const descriptorResult = await this.registryClient.getAssetAdministrationShellDescriptorById({
                configuration: this.registryConfig,
                aasIdentifier,
            });

            if (descriptorResult.success) {
                const endpoint = extractEndpointHref(descriptorResult.data, 'AAS-3.0');
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

        const repositoryBasePath = this.repositoryConfig.basePath || 'http://localhost:8081';
        const encodedId = base64Encode(aasIdentifier);
        const endpoint = `${repositoryBasePath}/shells/${encodedId}`;

        return { success: true, data: endpoint };
    }

    /**
     * Retrieves an Asset Administration Shell by its endpoint URL.
     *
     * Extracts the base URL and base64url-encoded AAS identifier from the endpoint,
     * decodes the identifier, and fetches the shell from the repository.
     *
     * @param options Object containing:
     *  - endpoint: The endpoint URL (format: http://host/shells/{base64EncodedId})
     *  - includeSubmodels?: Whether to fetch submodels for the shell (default: false)
     *  - includeConceptDescriptions?: Whether to fetch concept descriptions (default: false)
     *
     * @returns Either `{ success: true; data: { shell, submodels? } }` or `{ success: false; error: ... }`.
     */
    async getAasByEndpoint(options: {
        endpoint: string;
        includeSubmodels?: boolean;
        includeConceptDescriptions?: boolean;
    }): Promise<
        ApiResult<
            {
                shell: AssetAdministrationShell;
                submodels?: Submodel[];
            },
            any
        >
    > {
        const { endpoint, includeSubmodels = false } = options;

        // Extract base URL and encoded ID from endpoint
        // Expected format: http://localhost:8081/shells/base64EncodedId
        const match = endpoint.match(/^(https?:\/\/[^/]+(?::\d+)?)\/shells\/([^/]+)$/);

        if (!match) {
            return {
                success: false,
                error: {
                    errorType: 'InvalidEndpoint',
                    message: 'Invalid endpoint format. Expected format: http://host/shells/{base64EncodedId}',
                },
            };
        }

        const [, baseUrl, encodedId] = match;

        // Decode the ID
        const aasIdentifier = base64Decode(encodedId);

        // Create configuration for the endpoint
        const config = new Configuration({ basePath: baseUrl });

        // Fetch the shell
        const shellResult = await this.repositoryClient.getAssetAdministrationShellById({
            configuration: config,
            aasIdentifier,
        });

        if (!shellResult.success) {
            return { success: false, error: shellResult.error };
        }

        const shell = shellResult.data;

        // Fetch submodels if requested
        let submodels: Submodel[] | undefined;
        if (includeSubmodels) {
            const submodelsMap = await this.fetchSubmodelsForShells([shell], options.includeConceptDescriptions);
            submodels = submodelsMap[shell.id] || [];
        }

        return {
            success: true,
            data: {
                shell,
                ...(submodels && { submodels }),
            },
        };
    }

    /**
     * Creates an Asset Administration Shell and optionally registers it in the registry.
     *
     * This method creates the AAS in the repository first. If registry is configured
     * and registerInRegistry is true, it automatically creates a descriptor from the shell
     * and registers it in the registry with the repository endpoint.
     *
     * @param options Object containing:
     *  - shell: The AAS to create
     *  - registerInRegistry?: Whether to register the descriptor in the registry (default: true)
     *
     * @returns Either `{ success: true; data: { shell, descriptor? } }` or `{ success: false; error: ... }`.
     */
    async createAas(options: { shell: AssetAdministrationShell; registerInRegistry?: boolean }): Promise<
        ApiResult<
            {
                shell: AssetAdministrationShell;
                descriptor?: AssetAdministrationShellDescriptor;
            },
            any
        >
    > {
        const { shell, registerInRegistry = true } = options;

        if (!this.repositoryConfig) {
            return {
                success: false,
                error: {
                    errorType: 'ConfigurationError',
                    message: 'Repository configuration required',
                },
            };
        }

        // Create AAS in repository
        const shellResult = await this.repositoryClient.postAssetAdministrationShell({
            configuration: this.repositoryConfig,
            assetAdministrationShell: shell,
        });

        if (!shellResult.success) {
            return { success: false, error: shellResult.error };
        }

        // Register descriptor in registry if configured and requested
        if (registerInRegistry && this.registryConfig) {
            const descriptor = this.createDescriptorFromAas(shell);

            const descriptorResult = await this.registryClient.postAssetAdministrationShellDescriptor({
                configuration: this.registryConfig,
                assetAdministrationShellDescriptor: descriptor,
            });

            if (!descriptorResult.success) {
                // Note: Shell was created but descriptor registration failed
                return { success: false, error: descriptorResult.error };
            }

            return {
                success: true,
                data: {
                    shell: shellResult.data,
                    descriptor: descriptorResult.data,
                },
            };
        }

        // Registry not configured or registration not requested
        return {
            success: true,
            data: {
                shell: shellResult.data,
                descriptor: undefined,
            },
        };
    }

    /**
     * Updates an Asset Administration Shell and optionally updates its descriptor in the registry.
     *
     * This method updates the AAS in the repository. If registry is configured
     * and updateInRegistry is true, it automatically creates/updates the descriptor
     * in the registry with the updated shell data.
     *
     * @param options Object containing:
     *  - shell: The updated AAS
     *  - updateInRegistry?: Whether to update the descriptor in the registry (default: true)
     *
     * @returns Either `{ success: true; data: { shell, descriptor? } }` or `{ success: false; error: ... }`.
     */
    async updateAas(options: { shell: AssetAdministrationShell; updateInRegistry?: boolean }): Promise<
        ApiResult<
            {
                shell: AssetAdministrationShell;
                descriptor?: AssetAdministrationShellDescriptor;
            },
            any
        >
    > {
        const { shell, updateInRegistry = true } = options;

        if (!this.repositoryConfig) {
            return {
                success: false,
                error: {
                    errorType: 'ConfigurationError',
                    message: 'Repository configuration required',
                },
            };
        }

        // Update AAS in repository
        const shellResult = await this.repositoryClient.putAssetAdministrationShellById({
            configuration: this.repositoryConfig,
            aasIdentifier: shell.id,
            assetAdministrationShell: shell,
        });

        if (!shellResult.success) {
            return { success: false, error: shellResult.error };
        }

        // Use the returned shell if available, otherwise use the input shell
        const updatedShell = shellResult.data || shell;

        // Update descriptor in registry if configured and requested
        if (updateInRegistry && this.registryConfig) {
            const descriptor = this.createDescriptorFromAas(shell);

            const descriptorResult = await this.registryClient.putAssetAdministrationShellDescriptorById({
                configuration: this.registryConfig,
                aasIdentifier: shell.id,
                assetAdministrationShellDescriptor: descriptor,
            });

            if (!descriptorResult.success) {
                // Note: Shell was updated but descriptor update failed
                return { success: false, error: descriptorResult.error };
            }

            // Use the returned descriptor if available, otherwise use the created descriptor
            const updatedDescriptor = descriptorResult.data || descriptor;

            return {
                success: true,
                data: {
                    shell: updatedShell,
                    descriptor: updatedDescriptor,
                },
            };
        }

        // Registry not configured or update not requested
        return {
            success: true,
            data: {
                shell: updatedShell,
                descriptor: undefined,
            },
        };
    }

    /**
     * Deletes an Asset Administration Shell and optionally removes it from the registry.
     *
     * This method removes the descriptor from the registry first (if requested),
     * then deletes the AAS from the repository.
     *
     * @param options Object containing:
     *  - aasIdentifier: The AAS identifier to remove
     *  - deleteFromRegistry?: Whether to delete from registry (default: true)
     *
     * @returns Either `{ success: true; data: void }` or `{ success: false; error: ... }`.
     */
    async deleteAas(options: { aasIdentifier: string; deleteFromRegistry?: boolean }): Promise<ApiResult<void, any>> {
        const { aasIdentifier, deleteFromRegistry = true } = options;

        // Remove from registry first if configured and requested
        if (deleteFromRegistry && this.registryConfig) {
            const registryResult = await this.registryClient.deleteAssetAdministrationShellDescriptorById({
                configuration: this.registryConfig,
                aasIdentifier,
            });

            if (!registryResult.success) {
                return { success: false, error: registryResult.error };
            }
        }

        // Remove from repository
        if (this.repositoryConfig) {
            const repoResult = await this.repositoryClient.deleteAssetAdministrationShellById({
                configuration: this.repositoryConfig,
                aasIdentifier,
            });

            if (!repoResult.success) {
                return { success: false, error: repoResult.error };
            }
        }

        return { success: true, data: undefined };
    }

    /**
     * Retrieves Asset Administration Shells by their asset identifiers.
     *
     * This method uses the discovery service to resolve asset IDs to AAS identifiers,
     * then fetches the corresponding shells. If multiple AAS IDs are found for the given
     * asset IDs, all matching shells are returned.
     *
     * @param options Object containing:
     *  - assetIds: Array of asset identifiers to search for
     *  - includeSubmodels?: Whether to fetch submodels for each shell (default: false)
     *  - includeConceptDescriptions?: Whether to fetch concept descriptions (default: false)
     *
     * @returns Either `{ success: true; data: { shells, aasIds } }` or `{ success: false; error: ... }`.
     */
    async getAasByAssetId(options: {
        assetIds: AssetId[];
        includeSubmodels?: boolean;
        includeConceptDescriptions?: boolean;
    }): Promise<
        ApiResult<
            {
                shells: AssetAdministrationShell[];
                aasIds: string[];
            },
            any
        >
    > {
        const { assetIds, includeSubmodels = false, includeConceptDescriptions = false } = options;

        if (!this.discoveryConfig) {
            return {
                success: false,
                error: {
                    errorType: 'ConfigurationError',
                    message: 'Discovery service configuration not provided',
                },
            };
        }

        // Use discovery service to resolve asset IDs to AAS identifiers
        const discoveryResult = await this.discoveryClient.getAllAssetAdministrationShellIdsByAssetLink({
            configuration: this.discoveryConfig,
            assetIds,
        });

        if (!discoveryResult.success) {
            return { success: false, error: discoveryResult.error };
        }

        const aasIds = discoveryResult.data.result;

        if (aasIds.length === 0) {
            return {
                success: true,
                data: {
                    shells: [],
                    aasIds: [],
                },
            };
        }

        // Fetch all AAS by their identifiers
        const shellResults = await Promise.all(
            aasIds.map((aasId) =>
                this.getAasById({
                    aasIdentifier: aasId,
                    includeSubmodels,
                    includeConceptDescriptions,
                })
            )
        );

        // Collect successful results
        const shells: AssetAdministrationShell[] = [];
        const errors: any[] = [];

        shellResults.forEach((result, index) => {
            if (result.success) {
                shells.push(result.data.shell);
            } else {
                errors.push({ aasId: aasIds[index], error: result.error });
            }
        });

        // If some shells failed to fetch but others succeeded, still return success with available shells
        if (shells.length > 0) {
            return {
                success: true,
                data: {
                    shells,
                    aasIds,
                },
            };
        }

        // If all failed, return error
        return {
            success: false,
            error: {
                errorType: 'FetchError',
                message: 'Failed to fetch any AAS',
                details: errors,
            },
        };
    }

    /**
     * Resolves a reference to retrieve the endpoints for the referenced AAS, Submodel, and SubmodelElement path.
     *
     * This method parses a Reference object and extracts the AAS ID, Submodel ID, and builds the path
     * to the SubmodelElement if applicable. It supports ModelReferences with keys pointing to:
     * - AssetAdministrationShell
     * - Submodel
     * - SubmodelElements (including nested elements in collections and lists)
     *
     * @param options Object containing:
     *  - reference: The Reference object to resolve
     *
     * @returns Either `{ success: true; data: { aasEndpoint?, submodelEndpoint?, submodelElementPath? } }` or `{ success: false; error: ... }`.
     */
    async resolveReference(options: { reference: Reference }): Promise<
        ApiResult<
            {
                aasEndpoint?: string;
                submodelEndpoint?: string;
                submodelElementPath?: string;
            },
            any
        >
    > {
        const { reference } = options;

        // Only support ModelReference type
        if (reference.type !== ReferenceTypes.ModelReference) {
            return {
                success: false,
                error: {
                    errorType: 'UnsupportedReferenceType',
                    message: `Reference type '${reference.type}' is not supported. Only 'ModelReference' is supported.`,
                },
            };
        }

        if (!reference.keys || reference.keys.length === 0) {
            return {
                success: false,
                error: {
                    errorType: 'InvalidReference',
                    message: 'Reference must contain at least one key',
                },
            };
        }

        let aasEndpoint: string | undefined;
        let submodelEndpoint: string | undefined;
        let submodelElementPath: string | undefined;
        let remainingKeys = [...reference.keys];

        // Check if first key is AssetAdministrationShell
        if (remainingKeys[0].type === KeyTypes.AssetAdministrationShell) {
            const aasId = remainingKeys[0].value;
            const aasEndpointResult = await this.getAasEndpointById({ aasIdentifier: aasId });

            if (aasEndpointResult.success) {
                aasEndpoint = aasEndpointResult.data;
            }

            remainingKeys = remainingKeys.slice(1);

            // Check if next key is Submodel
            if (remainingKeys.length > 0 && remainingKeys[0].type === KeyTypes.Submodel) {
                const submodelId = remainingKeys[0].value;
                const smEndpointResult = await this.submodelService.getSubmodelEndpointById({
                    submodelIdentifier: submodelId,
                });

                if (smEndpointResult.success) {
                    submodelEndpoint = smEndpointResult.data;
                }

                remainingKeys = remainingKeys.slice(1);
            }
        }
        // Check if first key is Submodel (without AAS context)
        else if (remainingKeys[0].type === KeyTypes.Submodel) {
            const submodelId = remainingKeys[0].value;
            const smEndpointResult = await this.submodelService.getSubmodelEndpointById({
                submodelIdentifier: submodelId,
            });

            if (smEndpointResult.success) {
                submodelEndpoint = smEndpointResult.data;
            }

            remainingKeys = remainingKeys.slice(1);
        }

        // Build submodel element path if we have a submodel endpoint and remaining keys
        if (submodelEndpoint && remainingKeys.length > 0) {
            submodelElementPath = `${submodelEndpoint}/submodel-elements/`;

            for (let i = 0; i < remainingKeys.length; i++) {
                const key = remainingKeys[i];

                // For SubmodelElementList, we need to fetch the list and find the index
                if (i > 0 && remainingKeys[i - 1].type === KeyTypes.SubmodelElementList) {
                    // Note: This would require fetching the list to determine the index
                    // For now, we'll just append the value as-is
                    // In a full implementation, you'd fetch the SME and find the index
                    submodelElementPath += `${encodeURIComponent('[' + key.value + ']')}`;
                }
                // For SubmodelElementCollection or other nested elements
                else {
                    if (!submodelElementPath.endsWith('/submodel-elements/')) {
                        submodelElementPath += '.';
                    }
                    submodelElementPath += key.value;
                }
            }
        }

        return {
            success: true,
            data: {
                aasEndpoint,
                submodelEndpoint,
                submodelElementPath,
            },
        };
    }

    /**
     * Helper method to create an AAS descriptor from an AssetAdministrationShell.
     * Populates descriptor fields from the shell including metadata and endpoint configuration.
     *
     * @param shell The AssetAdministrationShell to create descriptor from
     * @returns AssetAdministrationShellDescriptor with all populated fields
     */
    private createDescriptorFromAas(shell: AssetAdministrationShell): AssetAdministrationShellDescriptor {
        const descriptor = new AssetAdministrationShellDescriptor(
            shell.id,
            shell.displayName || null,
            shell.description || null,
            shell.extensions || null,
            shell.administration || null,
            shell.idShort || null,
            shell.assetInformation?.assetKind || null,
            shell.assetInformation?.assetType || null,
            shell.assetInformation?.globalAssetId || null,
            shell.assetInformation?.specificAssetIds || null,
            null, // submodelDescriptors not included here
            null // endpoints set below
        );

        // Set endpoint using repository base path
        const repositoryBasePath = this.repositoryConfig!.basePath || 'http://localhost:8081';
        const encodedId = base64Encode(shell.id);
        descriptor.endpoints = [
            {
                _interface: 'AAS-3.0',
                protocolInformation: {
                    href: `${repositoryBasePath}/shells/${encodedId}`,
                    endpointProtocol: null,
                    endpointProtocolVersion: null,
                    subprotocol: null,
                    subprotocolBody: null,
                    subprotocolBodyEncoding: null,
                    securityAttributes: null,
                },
            },
        ];

        return descriptor;
    }

    /**
     * Helper method to fetch submodels for a list of shells.
     * Returns a map of shell IDs to their corresponding submodels.
     *
     * @param shells Array of Asset Administration Shells
     * @param includeConceptDescriptions Whether to fetch concept descriptions for submodels
     * @returns Record mapping shell IDs to arrays of Submodels
     */
    private async fetchSubmodelsForShells(
        shells: AssetAdministrationShell[],
        includeConceptDescriptions?: boolean
    ): Promise<Record<string, Submodel[]>> {
        const submodelsMap: Record<string, Submodel[]> = {};

        await Promise.all(
            shells.map(async (shell) => {
                const submodelRefs = shell.submodels || [];
                const submodels: Submodel[] = [];

                for (const submodelRef of submodelRefs) {
                    // Extract submodel ID from reference
                    const submodelId = submodelRef.keys?.[0]?.value;
                    if (!submodelId) continue;

                    // Fetch the submodel
                    const submodelResult = await this.submodelService.getSubmodelById({
                        submodelIdentifier: submodelId,
                        useRegistryEndpoint: false, // Use repository directly for consistency
                        includeConceptDescriptions,
                    });

                    if (submodelResult.success) {
                        submodels.push(submodelResult.data.submodel);
                    }
                }

                submodelsMap[shell.id] = submodels;
            })
        );

        return submodelsMap;
    }
}
