import type {
    AssetAdministrationShell,
    AssetInformation,
    Reference,
} from '@aas-core-works/aas-core3.0-typescript/types';
import type { ApiResult } from '../models/api';
import type { AssetId } from '../models/AssetId';
import * as AasRepository from '../generated';
import { base64Encode } from '../lib/base64Url';
import {
    convertApiAasToCoreAas,
    convertApiAssetInformationToCoreAssetInformation,
    convertApiReferenceToCoreReference,
    convertCoreAasToApiAas,
    convertCoreAssetInformationToApiAssetInformation,
    convertCoreReferenceToApiReference,
} from '../lib/convertAasTypes';
import { createCustomClient } from '../lib/createAasRepoClient';

export class AasRepositoryClient {
    /**
     * Returns all Asset Administration Shells.
     *
     * @param options Object containing:
     *  - baseUrl: The API base URL
     *  - headers?: Optional Request headers
     *  - assetIds?: A list of asset identifiers
     *  - idShort?: The AAS's idShort
     *  - limit?: Max number of elements to return
     *  - cursor?: A paging cursor from previous responses
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllAssetAdministrationShells(options: {
        baseUrl: string;
        headers?: Headers;
        assetIds?: AssetId[];
        idShort?: string;
        limit?: number;
        cursor?: string;
    }): Promise<
        ApiResult<
            {
                pagedResult: AasRepository.PagedResultPagingMetadata | undefined;
                result: AssetAdministrationShell[];
            },
            AasRepository.GetAllAssetAdministrationShellsError | Error
        >
    > {
        const { baseUrl, headers, assetIds, idShort, limit, cursor } = options;
        try {
            const client = createCustomClient(baseUrl, headers);
            const encodedAssetIds = assetIds?.map((id) => base64Encode(JSON.stringify(id)));

            const result = await AasRepository.getAllAssetAdministrationShells({
                client,
                query: { assetIds: encodedAssetIds, idShort, limit, cursor },
            });

            if (result.error) {
                return { success: false, error: result.error };
            }

            const shells = (result.data.result ?? []).map(convertApiAasToCoreAas);
            return {
                success: true,
                data: {
                    pagedResult: result.data.paging_metadata,
                    result: shells,
                },
            };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err : new Error(String(err)),
            };
        }
    }

    /**
     * Creates a new Asset Administration Shell.
     *
     * @param options Object containing:
     *  - baseUrl: The API base URL
     *  - assetAdministrationShell: The AAS to create
     *  - headers?: Optional request headers
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postAssetAdministrationShell(options: {
        baseUrl: string;
        headers?: Headers;
        assetAdministrationShell: AssetAdministrationShell;
    }): Promise<ApiResult<AssetAdministrationShell, AasRepository.PostAssetAdministrationShellError | Error>> {
        const { baseUrl, assetAdministrationShell, headers } = options;
        try {
            const client = createCustomClient(baseUrl, headers);
            const result = await AasRepository.postAssetAdministrationShell({
                client,
                body: convertCoreAasToApiAas(assetAdministrationShell),
            });

            if (result.error) {
                return { success: false, error: result.error };
            }
            return { success: true, data: convertApiAasToCoreAas(result.data) };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }

    /**
     * Deletes an Asset Administration Shell by its unique identifier.
     *
     * @param options Object containing:
     *  - baseUrl: The API base URL
     *  - aasIdentifier: The unique ID for the AAS
     *  - headers?: Optional request headers
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteAssetAdministrationShellById(options: {
        baseUrl: string;
        aasIdentifier: string;
        headers?: Headers;
    }): Promise<
        ApiResult<
            AasRepository.DeleteAssetAdministrationShellByIdResponse,
            AasRepository.DeleteAssetAdministrationShellByIdError | Error
        >
    > {
        const { baseUrl, aasIdentifier, headers } = options;
        try {
            const client = createCustomClient(baseUrl, headers);
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.deleteAssetAdministrationShellById({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
            });

            if (result.error) {
                return { success: false, error: result.error };
            }
            return { success: true, data: result.data };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }

    /**
     * Returns a specific Asset Administration Shell by its unique identifier.
     *
     * @param options Object containing:
     *  - baseUrl: The API base URL
     *  - aasIdentifier: The unique ID
     *  - headers?: Optional request headers
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAssetAdministrationShellById(options: {
        baseUrl: string;
        aasIdentifier: string;
        headers?: Headers;
    }): Promise<ApiResult<AssetAdministrationShell, AasRepository.GetAssetAdministrationShellByIdError | Error>> {
        const { baseUrl, aasIdentifier, headers } = options;
        try {
            const client = createCustomClient(baseUrl, headers);
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.getAssetAdministrationShellById({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
            });

            if (result.error) {
                // Return the complete error object with status code
                return {
                    success: false,
                    error: result.error,
                };
            }
            return { success: true, data: convertApiAasToCoreAas(result.data) };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }

    /**
     * Updates an existing Asset Administration Shell by ID (PUT).
     *
     * @param options Object containing:
     *  - baseUrl: The API base URL
     *  - aasIdentifier: The unique ID
     *  - assetAdministrationShell: The updated AAS object
     *  - headers?: Optional request headers
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putAssetAdministrationShellById(options: {
        baseUrl: string;
        aasIdentifier: string;
        assetAdministrationShell: AssetAdministrationShell;
        headers?: Headers;
    }): Promise<
        ApiResult<
            AasRepository.PutAssetAdministrationShellByIdResponse,
            AasRepository.PutAssetAdministrationShellByIdError | Error
        >
    > {
        const { baseUrl, aasIdentifier, assetAdministrationShell, headers } = options;
        try {
            const client = createCustomClient(baseUrl, headers);
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.putAssetAdministrationShellById({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
                body: convertCoreAasToApiAas(assetAdministrationShell),
            });

            if (result.error) {
                return { success: false, error: result.error };
            }
            return { success: true, data: result.data };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }

    /**
     * Returns the AssetInformation for the given AAS.
     *
     * @param options Object containing:
     *  - baseUrl: The API base URL
     *  - aasIdentifier: The unique ID
     *  - headers?: Optional request headers
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAssetInformation(options: {
        baseUrl: string;
        aasIdentifier: string;
        headers?: Headers;
    }): Promise<ApiResult<AssetInformation, AasRepository.GetAssetInformationAasRepositoryError | Error>> {
        const { baseUrl, aasIdentifier, headers } = options;
        try {
            const client = createCustomClient(baseUrl, headers);
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.getAssetInformationAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
            });

            if (result.error) {
                return { success: false, error: result.error };
            }
            return {
                success: true,
                data: convertApiAssetInformationToCoreAssetInformation(result.data),
            };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }

    /**
     * Updates the AssetInformation for the given AAS.
     *
     * @param options Object containing:
     *  - baseUrl: The API base URL
     *  - aasIdentifier: The unique ID
     *  - assetInformation: The updated AssetInformation object
     *  - headers?: Optional request headers
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putAssetInformation(options: {
        baseUrl: string;
        aasIdentifier: string;
        assetInformation: AssetInformation;
        headers?: Headers;
    }): Promise<
        ApiResult<
            AasRepository.PutAssetInformationAasRepositoryResponse,
            AasRepository.PutAssetInformationAasRepositoryError | Error
        >
    > {
        const { baseUrl, aasIdentifier, assetInformation, headers } = options;
        try {
            const client = createCustomClient(baseUrl, headers);
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.putAssetInformationAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
                body: convertCoreAssetInformationToApiAssetInformation(assetInformation),
            });

            if (result.error) {
                return { success: false, error: result.error };
            }
            return { success: true, data: result.data };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }

    /**
     * Deletes the Thumbnail associated with the given AAS.
     *
     * @param options Object containing:
     *  - baseUrl: The API base URL
     *  - aasIdentifier: The unique ID
     *  - headers?: Optional request headers
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteThumbnail(options: {
        baseUrl: string;
        aasIdentifier: string;
        headers?: Headers;
    }): Promise<
        ApiResult<
            AasRepository.DeleteThumbnailAasRepositoryResponses,
            AasRepository.DeleteThumbnailAasRepositoryError | Error
        >
    > {
        const { baseUrl, aasIdentifier, headers } = options;
        try {
            const client = createCustomClient(baseUrl, headers);
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.deleteThumbnailAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
            });

            if (result.error) {
                return { success: false, error: result.error };
            }
            return {
                success: true,
                data: result.data as AasRepository.DeleteThumbnailAasRepositoryResponses,
            };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }

    /**
     * Returns the Thumbnail associated with an AAS, if any.
     *
     * @param options Object containing:
     *  - baseUrl: The API base URL
     *  - aasIdentifier: The unique ID
     *  - headers?: Optional request headers
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getThumbnail(options: {
        baseUrl: string;
        aasIdentifier: string;
        headers?: Headers;
    }): Promise<ApiResult<Blob | File, AasRepository.GetThumbnailAasRepositoryError | Error>> {
        const { baseUrl, aasIdentifier, headers } = options;
        try {
            const client = createCustomClient(baseUrl, headers);
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.getThumbnailAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
            });

            if (result.error) {
                return { success: false, error: result.error };
            }
            return { success: true, data: result.data };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }

    /**
     * Updates (or creates) the Thumbnail for the given AAS.
     *
     * @param options Object containing:
     *  - baseUrl: The API base URL
     *  - aasIdentifier: The unique ID
     *  - thumbnail: The thumbnail data to upload
     *  - headers?: Optional request headers
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putThumbnail(options: {
        baseUrl: string;
        aasIdentifier: string;
        thumbnail: AasRepository.AssetinformationThumbnailBody;
        headers?: Headers;
    }): Promise<
        ApiResult<AasRepository.PutThumbnailAasRepositoryResponse, AasRepository.PutThumbnailAasRepositoryError | Error>
    > {
        const { baseUrl, aasIdentifier, thumbnail, headers } = options;
        try {
            const client = createCustomClient(baseUrl, headers);
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.putThumbnailAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
                body: thumbnail,
            });

            if (result.error) {
                return { success: false, error: result.error };
            }
            return { success: true, data: result.data };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }

    /**
     * Returns all submodel references for the given AAS.
     *
     * @param options Object containing:
     *  - baseUrl: The API base URL
     *  - aasIdentifier: The unique ID
     *  - headers?: Optional request headers
     *  - limit?: Max number of elements
     *  - cursor?: Paging cursor
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllSubmodelReferences(options: {
        baseUrl: string;
        aasIdentifier: string;
        headers?: Headers;
        limit?: number;
        cursor?: string;
    }): Promise<
        ApiResult<
            {
                pagedResult: AasRepository.PagedResultPagingMetadata | undefined;
                result: Reference[];
            },
            AasRepository.GetAllSubmodelReferencesAasRepositoryError | Error
        >
    > {
        const { baseUrl, aasIdentifier, headers, limit, cursor } = options;
        try {
            const client = createCustomClient(baseUrl, headers);
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.getAllSubmodelReferencesAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
                query: { limit, cursor },
            });

            if (result.error) {
                return { success: false, error: result.error };
            }

            const submodelReferences = (result.data.result ?? []).map(convertApiReferenceToCoreReference);
            return {
                success: true,
                data: {
                    pagedResult: result.data.paging_metadata,
                    result: submodelReferences,
                },
            };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }

    /**
     * Creates a submodel reference at the given AAS.
     *
     * @param options Object containing:
     *  - baseUrl: The API base URL
     *  - aasIdentifier: The unique ID of the AAS
     *  - submodelReference: The Reference to the submodel
     *  - headers?: Optional request headers
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postSubmodelReference(options: {
        baseUrl: string;
        aasIdentifier: string;
        submodelReference: Reference;
        headers?: Headers;
    }): Promise<ApiResult<Reference, AasRepository.PostSubmodelReferenceAasRepositoryError | Error>> {
        const { baseUrl, aasIdentifier, submodelReference, headers } = options;
        try {
            const client = createCustomClient(baseUrl, headers);
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.postSubmodelReferenceAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
                body: convertCoreReferenceToApiReference(submodelReference),
            });

            if (result.error) {
                return { success: false, error: result.error };
            }
            return { success: true, data: convertApiReferenceToCoreReference(result.data) };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }

    /**
     * Deletes a submodel reference from the given AAS (does not delete the submodel itself).
     *
     * @param options Object containing:
     *  - baseUrl: The API base URL
     *  - aasIdentifier: Unique ID of the AAS
     *  - submodelIdentifier: The submodel's unique ID
     *  - headers?: Optional request headers
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteSubmodelReferenceById(options: {
        baseUrl: string;
        aasIdentifier: string;
        submodelIdentifier: string;
        headers?: Headers;
    }): Promise<
        ApiResult<
            AasRepository.DeleteSubmodelReferenceByIdAasRepositoryResponse,
            AasRepository.DeleteSubmodelReferenceByIdAasRepositoryError | Error
        >
    > {
        const { baseUrl, aasIdentifier, submodelIdentifier, headers } = options;
        try {
            const client = createCustomClient(baseUrl, headers);
            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await AasRepository.deleteSubmodelReferenceByIdAasRepository({
                client,
                path: {
                    aasIdentifier: encodedAasIdentifier,
                    submodelIdentifier: encodedSubmodelIdentifier,
                },
            });

            if (result.error) {
                return { success: false, error: result.error };
            }
            return { success: true, data: result.data };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }
}
