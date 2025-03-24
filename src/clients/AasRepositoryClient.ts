import type {
    AssetAdministrationShell,
    AssetInformation,
    Reference,
} from '@aas-core-works/aas-core3.0-typescript/types';
import type { ApiResult } from '../models/api';
import type { AssetId } from '../models/AssetId';
import { ConfigurationParameters } from '../generated/configuration';
import {
    AssetAdministrationShellRepositoryAPIApi as AasRepository,
    PagedResultPagingMetadata,
    RequiredError,
} from '../generated/index';
import { base64Encode } from '../lib/base64Url';
import {
    convertApiAasToCoreAas,
    convertApiAssetInformationToCoreAssetInformation,
    convertApiReferenceToCoreReference,
    convertCoreAasToApiAas,
    convertCoreAssetInformationToApiAssetInformation,
    convertCoreReferenceToApiReference,
} from '../lib/convertAasTypes';

export class AasRepositoryClient {
    /**
     * Returns all Asset Administration Shells.
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - assetIds?: A list of specific Asset identifiers.
     *  - idShort?: The Asset Administration Shell’s IdShort
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllAssetAdministrationShells(options: {
        configuration: ConfigurationParameters;
        assetIds?: AssetId[];
        idShort?: string;
        limit?: number;
        cursor?: string;
    }): Promise<
        ApiResult<
            {
                pagedResult: PagedResultPagingMetadata | undefined;
                result: AssetAdministrationShell[];
            },
            RequiredError
        >
    > {
        const { configuration, assetIds, idShort, limit, cursor } = options;
        try {
            const apiInstance = new AasRepository(configuration);
            const encodedAssetIds = assetIds?.map((id) => base64Encode(JSON.stringify(id)));

            const result = await apiInstance.getAllAssetAdministrationShells(encodedAssetIds, idShort, limit, cursor);

            const shells = (result.result ?? []).map(convertApiAasToCoreAas);
            return {
                success: true,
                data: {
                    pagedResult: result.pagingMetadata,
                    result: shells,
                },
            };
        } catch (err) {
            return {
                success: false,
                error: err as RequiredError,
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
            OpenAPI.setConfig({
                baseUrl,
                headers,
            });
            const result = await AasRepository.postAssetAdministrationShell({
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
            OpenAPI.setConfig({
                baseUrl,
                headers,
            });
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.deleteAssetAdministrationShellById({
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
     *  - configuration: The API configuration
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAssetAdministrationShellById(options: {
        configuration: ConfigurationParameters;
        aasIdentifier: string;
    }): Promise<ApiResult<AssetAdministrationShell, RequiredError>> {
        const { configuration, aasIdentifier } = options;
        try {
            const apiInstance = new AasRepository(configuration);
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.getAssetAdministrationShellById(encodedAasIdentifier);

            return { success: true, data: convertApiAasToCoreAas(result) };
        } catch (err) {
            return { success: false, error: err as RequiredError };
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
            OpenAPI.setConfig({
                baseUrl,
                headers,
            });
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.putAssetAdministrationShellById({
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
            OpenAPI.setConfig({
                baseUrl,
                headers,
            });
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.getAssetInformationAasRepository({
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
            OpenAPI.setConfig({
                baseUrl,
                headers,
            });
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.putAssetInformationAasRepository({
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
            OpenAPI.setConfig({
                baseUrl,
                headers,
            });
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.deleteThumbnailAasRepository({
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
            OpenAPI.setConfig({
                baseUrl,
                headers,
            });
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.getThumbnailAasRepository({
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
            OpenAPI.setConfig({
                baseUrl,
                headers,
            });
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.putThumbnailAasRepository({
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
            OpenAPI.setConfig({
                baseUrl,
                headers,
            });
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.getAllSubmodelReferencesAasRepository({
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
            OpenAPI.setConfig({
                baseUrl,
                headers,
            });
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await AasRepository.postSubmodelReferenceAasRepository({
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
            OpenAPI.setConfig({
                baseUrl,
                headers,
            });
            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await AasRepository.deleteSubmodelReferenceByIdAasRepository({
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
