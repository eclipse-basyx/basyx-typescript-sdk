import type {
    AssetAdministrationShell,
    AssetInformation,
    Reference,
} from '@aas-core-works/aas-core3.0-typescript/types';
import type { ApiResult } from '../models/api';
import type { AssetId } from '../models/AssetId';
import { AasRepositoryService } from '../generated'; // Updated import
//import {
// AssetAdministrationShellRepositoryAPIApi as AasRepository,
//Configuration,
//PagedResultPagingMetadata,
//Result,
//} from '../generated';
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import {
    convertApiAasToCoreAas,
    convertApiAssetInformationToCoreAssetInformation,
    convertApiReferenceToCoreReference,
    convertCoreAasToApiAas,
    convertCoreAssetInformationToApiAssetInformation,
    convertCoreReferenceToApiReference,
} from '../lib/convertAasTypes';
import { handleApiError } from '../lib/errorHandler';

export class AasRepositoryClient {
    /**
     * Returns all Asset Administration Shells
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - assetIds?: A list of specific Asset identifiers
     *  - idShort?: The Asset Administration Shell’s IdShort
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllAssetAdministrationShells(options: {
        configuration: AasRepositoryService.Configuration;
        assetIds?: AssetId[];
        idShort?: string;
        limit?: number;
        cursor?: string;
    }): Promise<
        ApiResult<
            {
                pagedResult: AasRepositoryService.PagedResultPagingMetadata | undefined;
                result: AssetAdministrationShell[];
            },
            AasRepositoryService.Result
        >
    > {
        const { configuration, assetIds, idShort, limit, cursor } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );
            const encodedAssetIds = assetIds?.map((id) => base64Encode(JSON.stringify(id)));

            const result = await apiInstance.getAllAssetAdministrationShells({
                assetIds: encodedAssetIds,
                idShort: idShort,
                limit: limit,
                cursor: cursor,
            });

            const shells = (result.result ?? []).map(convertApiAasToCoreAas);
            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: shells },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Creates a new Asset Administration Shell
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - assetAdministrationShell: Asset Administration Shell object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postAssetAdministrationShell(options: {
        configuration: AasRepositoryService.Configuration;
        assetAdministrationShell: AssetAdministrationShell;
    }): Promise<ApiResult<AssetAdministrationShell, AasRepositoryService.Result>> {
        const { configuration, assetAdministrationShell } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const result = await apiInstance.postAssetAdministrationShell({
                assetAdministrationShell: convertCoreAasToApiAas(assetAdministrationShell),
            });

            return { success: true, data: convertApiAasToCoreAas(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Deletes an Asset Administration Shell
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteAssetAdministrationShellById(options: {
        configuration: AasRepositoryService.Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.deleteAssetAdministrationShellById({
                aasIdentifier: encodedAasIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns a specific Asset Administration Shell
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAssetAdministrationShellById(options: {
        configuration: AasRepositoryService.Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<AssetAdministrationShell, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.getAssetAdministrationShellById({
                aasIdentifier: encodedAasIdentifier,
            });

            return { success: true, data: convertApiAasToCoreAas(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Updates an existing Asset Administration Shell
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - assetAdministrationShell: Asset Administration Shell object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putAssetAdministrationShellById(options: {
        configuration: AasRepositoryService.Configuration;
        aasIdentifier: string;
        assetAdministrationShell: AssetAdministrationShell;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, assetAdministrationShell } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.putAssetAdministrationShellById({
                aasIdentifier: encodedAasIdentifier,
                assetAdministrationShell: convertCoreAasToApiAas(assetAdministrationShell),
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns the Asset Information
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAssetInformation(options: {
        configuration: AasRepositoryService.Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<AssetInformation, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.getAssetInformationAasRepository({
                aasIdentifier: encodedAasIdentifier,
            });

            return {
                success: true,
                data: convertApiAssetInformationToCoreAssetInformation(result),
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Updates the Asset Information
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - assetInformation: Asset Information object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putAssetInformation(options: {
        configuration: AasRepositoryService.Configuration;
        aasIdentifier: string;
        assetInformation: AssetInformation;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, assetInformation } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.putAssetInformationAasRepository({
                aasIdentifier: encodedAasIdentifier,
                assetInformation: convertCoreAssetInformationToApiAssetInformation(assetInformation),
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Deletes the Thumbnail associated with the given AAS
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteThumbnail(options: {
        configuration: AasRepositoryService.Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier } = options;
        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.deleteThumbnailAasRepository({
                aasIdentifier: encodedAasIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns the Thumbnail associated with an AAS, if any
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getThumbnail(options: {
        configuration: AasRepositoryService.Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<Blob, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.getThumbnailAasRepository({
                aasIdentifier: encodedAasIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Updates (or creates) the Thumbnail for the given AAS
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - fileName: The name of the file
     *  - file: The file to upload
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putThumbnail(options: {
        configuration: AasRepositoryService.Configuration;
        aasIdentifier: string;
        fileName: string;
        file: Blob;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, fileName, file } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.putThumbnailAasRepository({
                aasIdentifier: encodedAasIdentifier,
                fileName: fileName,
                file: file,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns all submodel references
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllSubmodelReferences(options: {
        configuration: AasRepositoryService.Configuration;
        aasIdentifier: string;
        limit?: number;
        cursor?: string;
    }): Promise<
        ApiResult<
            { pagedResult: AasRepositoryService.PagedResultPagingMetadata | undefined; result: Reference[] },
            AasRepositoryService.Result
        >
    > {
        const { configuration, aasIdentifier, limit, cursor } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.getAllSubmodelReferencesAasRepository({
                aasIdentifier: encodedAasIdentifier,
                limit: limit,
                cursor: cursor,
            });

            const submodelReferences = (result.result ?? []).map(convertApiReferenceToCoreReference);
            return {
                success: true,
                data: {
                    pagedResult: result.pagingMetadata,
                    result: submodelReferences,
                },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Creates a submodel reference at the Asset Administration Shell
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelReference: Reference to the Submodel
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postSubmodelReference(options: {
        configuration: AasRepositoryService.Configuration;
        aasIdentifier: string;
        submodelReference: Reference;
    }): Promise<ApiResult<Reference, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelReference } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.postSubmodelReferenceAasRepository({
                aasIdentifier: encodedAasIdentifier,
                reference: convertCoreReferenceToApiReference(submodelReference),
            });

            return { success: true, data: convertApiReferenceToCoreReference(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Deletes a submodel reference from the given AAS (does not delete the submodel itself).
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: Unique ID of the AAS
     *  - submodelIdentifier: The submodel's unique ID
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteSubmodelReferenceById(options: {
        configuration: AasRepositoryService.Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.deleteSubmodelReferenceByIdAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }
}
