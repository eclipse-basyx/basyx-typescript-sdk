import type {
    AssetAdministrationShell,
    AssetInformation,
    ISubmodelElement,
    Reference,
    Submodel,
} from '@aas-core-works/aas-core3.1-typescript/types';
import type { ApiResult } from '../models/api';
import type { AssetId } from '../models/AssetId';
import { AasRepositoryService } from '../generated';
import { Configuration } from '../generated/runtime';
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
import {
    convertApiSubmodelElementToCoreSubmodelElement,
    convertApiSubmodelToCoreSubmodel,
    convertCoreSubmodelElementToApiSubmodelElement,
    convertCoreSubmodelToApiSubmodel,
} from '../lib/convertSubmodelTypes';
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
        configuration: Configuration;
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
        configuration: Configuration;
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
        configuration: Configuration;
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
        configuration: Configuration;
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
        configuration: Configuration;
        aasIdentifier: string;
        assetAdministrationShell: AssetAdministrationShell;
    }): Promise<ApiResult<AssetAdministrationShell | void, AasRepositoryService.Result>> {
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

            return { success: true, data: result ? convertApiAasToCoreAas(result) : undefined };
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
        configuration: Configuration;
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
        configuration: Configuration;
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
        configuration: Configuration;
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
        configuration: Configuration;
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
        configuration: Configuration;
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
        configuration: Configuration;
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
        configuration: Configuration;
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
        configuration: Configuration;
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

            const result = await apiInstance.deleteSubmodelReferenceAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns the Submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The submodel's unique ID
     *  - level?: Determines the structural depth of the respective resource content
     *  - extent?: Determines to which extent the resource is being serialized
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelByIdAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        level?: AasRepositoryService.GetSubmodelByIdAasRepositoryLevelEnum;
        extent?: AasRepositoryService.GetSubmodelByIdAasRepositoryExtentEnum;
    }): Promise<ApiResult<Submodel, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, level, extent } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelByIdAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                level: level,
                extent: extent,
            });

            return { success: true, data: convertApiSubmodelToCoreSubmodel(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Creates or updates the Submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - submodel: Submodel object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putSubmodelByIdAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        submodel: Submodel;
    }): Promise<ApiResult<Reference | void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, submodel } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.putSubmodelByIdAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                submodel: convertCoreSubmodelToApiSubmodel(submodel),
            });

            return { success: true, data: result ? convertApiReferenceToCoreReference(result) : undefined };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Deletes the submodel from the Asset Administration Shell and the Repository.
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteSubmodelByIdAasRepository(options: {
        configuration: Configuration;
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

            const result = await apiInstance.deleteSubmodelByIdAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Updates the Submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - submodel: Submodel object
     *  - level?: Determines the structural depth of the respective resource content
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async patchSubmodelAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        submodel: Submodel;
        level?: AasRepositoryService.PatchSubmodelAasRepositoryLevelEnum;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, submodel, level } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.patchSubmodelAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                submodel: convertCoreSubmodelToApiSubmodel(submodel),
                level: level,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns the Submodel's metadata elements
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelByIdMetadataAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
    }): Promise<ApiResult<AasRepositoryService.SubmodelMetadata, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelByIdMetadataAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Updates the metadata attributes of the Submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - submodelMetadata: The Submodel Metadata object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async patchSubmodelByIdMetadataAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        submodelMetadata: AasRepositoryService.SubmodelMetadata;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, submodelMetadata } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.patchSubmodelByIdMetadataAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                submodelMetadata: submodelMetadata,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns the Submodel's ValueOnly representation
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - level?: Determines the structural depth of the respective resource content
     *  - extent?: Determines to which extent the resource is being serialized
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelByIdValueOnlyAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        level?: AasRepositoryService.GetSubmodelByIdValueOnlyAasRepositoryLevelEnum;
        extent?: AasRepositoryService.GetSubmodelByIdValueOnlyAasRepositoryExtentEnum;
    }): Promise<ApiResult<object, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, level, extent } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelByIdValueOnlyAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                level: level,
                extent: extent,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Updates the values of the Submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - level?: Determines the structural depth of the respective resource content
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async patchSubmodelByIdValueOnlyAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        body: object;
        level?: AasRepositoryService.PatchSubmodelByIdValueOnlyAasRepositoryLevelEnum;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, body, level } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.patchSubmodelByIdValueOnlyAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                body: body,
                level: level,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns the Submodel as a Reference
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The submodel's unique ID
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelByIdReferenceAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
    }): Promise<ApiResult<Reference, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelByIdReferenceAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
            });

            return { success: true, data: convertApiReferenceToCoreReference(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns the elements of this submodel in path notation.
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The submodel's unique ID
     *  - level?: Determines the structural depth of the respective resource content
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelByIdPathAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        level?: AasRepositoryService.GetSubmodelByIdPathAasRepositoryLevelEnum;
    }): Promise<ApiResult<Array<string>, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, level } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelByIdPathAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                level: level,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns all submodel elements including their hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *  - level?: Determines the structural depth of the respective resource content
     *  - extent?: Determines to which extent the resource is being serialized
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllSubmodelElementsAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        limit?: number;
        cursor?: string;
        level?: AasRepositoryService.GetAllSubmodelElementsAasRepositoryLevelEnum;
        extent?: AasRepositoryService.GetAllSubmodelElementsAasRepositoryExtentEnum;
    }): Promise<
        ApiResult<
            {
                pagedResult: AasRepositoryService.PagedResultPagingMetadata | undefined;
                result: ISubmodelElement[];
            },
            AasRepositoryService.Result
        >
    > {
        const { configuration, aasIdentifier, submodelIdentifier, limit, cursor, level, extent } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getAllSubmodelElementsAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
                level: level,
                extent: extent,
            });

            const submodelElements = (result.result ?? []).map(convertApiSubmodelElementToCoreSubmodelElement);
            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: submodelElements },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Creates a new submodel element
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - submodelElement: The Submodel Element object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postSubmodelElementAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        submodelElement: ISubmodelElement;
    }): Promise<ApiResult<ISubmodelElement, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, submodelElement } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.postSubmodelElementAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                submodelElement: convertCoreSubmodelElementToApiSubmodelElement(submodelElement),
            });

            return { success: true, data: convertApiSubmodelElementToCoreSubmodelElement(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns all submodel elements including their hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllSubmodelElementsMetadataAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        limit?: number;
        cursor?: string;
    }): Promise<
        ApiResult<
            {
                pagedResult: AasRepositoryService.PagedResultPagingMetadata | undefined;
                result: AasRepositoryService.SubmodelElementMetadata[];
            },
            AasRepositoryService.Result
        >
    > {
        const { configuration, aasIdentifier, submodelIdentifier, limit, cursor } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getAllSubmodelElementsMetadataAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
            });

            //const submodelElements = (result.result ?? []).map(convertApiSubmodelElementToCoreSubmodelElement);
            const submodelElementsMetadata = result.result ?? [];
            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: submodelElementsMetadata },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns all submodel elements including their hierarchy in the ValueOnly representation
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *  - level?: Determines the structural depth of the respective resource content
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllSubmodelElementsValueOnlyAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        limit?: number;
        cursor?: string;
        level?: AasRepositoryService.GetAllSubmodelElementsValueOnlyAasRepositoryLevelEnum;
    }): Promise<
        ApiResult<
            {
                pagedResult: AasRepositoryService.PagedResultPagingMetadata | undefined;
                result: object;
            },
            AasRepositoryService.Result
        >
    > {
        const { configuration, aasIdentifier, submodelIdentifier, limit, cursor, level } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getAllSubmodelElementsValueOnlyAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
                level: level,
            });

            //const submodelElementsValue = (result.result ?? []).map(convertApiSubmodelElementToCoreSubmodelElement);
            const submodelElementValues = result.result ?? [];
            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: submodelElementValues },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns all submodel elements as a list of References
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *  - level?: Determines the structural depth of the respective resource content
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllSubmodelElementsReferenceAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        limit?: number;
        cursor?: string;
        level?: AasRepositoryService.GetAllSubmodelElementsReferenceAasRepositoryLevelEnum;
    }): Promise<
        ApiResult<
            {
                pagedResult: AasRepositoryService.PagedResultPagingMetadata | undefined;
                result: Reference[];
            },
            AasRepositoryService.Result
        >
    > {
        const { configuration, aasIdentifier, submodelIdentifier, limit, cursor, level } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getAllSubmodelElementsReferenceAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
                level: level,
            });

            const submodelElementReferences = (result.result ?? []).map(convertApiReferenceToCoreReference);
            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: submodelElementReferences },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns all submodel elements including their hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *  - level?: Determines the structural depth of the respective resource content
     *  - extent?: Determines to which extent the resource is being serialized
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllSubmodelElementsPathAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        limit?: number;
        cursor?: string;
        level?: AasRepositoryService.GetAllSubmodelElementsPathAasRepositoryLevelEnum;
        extent?: AasRepositoryService.GetAllSubmodelElementsPathAasRepositoryExtentEnum;
    }): Promise<
        ApiResult<
            {
                pagedResult: AasRepositoryService.PagedResultPagingMetadata | undefined;
                result: string[];
            },
            AasRepositoryService.Result
        >
    > {
        const { configuration, aasIdentifier, submodelIdentifier, limit, cursor, level, extent } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getAllSubmodelElementsPathAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
                level: level,
                extent: extent,
            });

            //const submodelElements = (result.result ?? []).map(convertApiSubmodelElementToCoreSubmodelElement);
            const submodelElements = result.result ?? [];
            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: submodelElements },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns a specific submodel element from the Submodel at a specified path
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - level?: Determines the structural depth of the respective resource content
     *  - extent?: Determines to which extent the resource is being serialized
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelElementByPathAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        level?: AasRepositoryService.GetSubmodelElementByPathAasRepositoryLevelEnum;
        extent?: AasRepositoryService.GetSubmodelElementByPathAasRepositoryExtentEnum;
    }): Promise<ApiResult<ISubmodelElement, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, level, extent } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelElementByPathAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                level: level,
                extent: extent,
            });

            return { success: true, data: convertApiSubmodelElementToCoreSubmodelElement(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Creates a new submodel element at a specified path within submodel elements hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - submodelElement: SubmodelElement object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postSubmodelElementByPathAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        submodelElement: ISubmodelElement;
    }): Promise<ApiResult<ISubmodelElement, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, submodelElement } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.postSubmodelElementByPathAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                submodelElement: convertCoreSubmodelElementToApiSubmodelElement(submodelElement),
            });

            return { success: true, data: convertApiSubmodelElementToCoreSubmodelElement(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Deletes a submodel element at a specified path within the submodel elements hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteSubmodelElementByPathAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.deleteSubmodelElementByPathAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Updates an existing submodel element at a specified path within submodel elements hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - submodelElement: SubmodelElement object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putSubmodelElementByPathAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        submodelElement: ISubmodelElement;
    }): Promise<ApiResult<ISubmodelElement | void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, submodelElement } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.putSubmodelElementByPathAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                submodelElement: convertCoreSubmodelElementToApiSubmodelElement(submodelElement),
            });

            return { success: true, data: result ? convertApiSubmodelElementToCoreSubmodelElement(result) : undefined };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Updates an existing submodel element value at a specified path within submodel elements hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - submodelElement: SubmodelElement object
     *  - level?: Determines the structural depth of the respective resource content
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async patchSubmodelElementValueByPathAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        submodelElement: ISubmodelElement;
        level?: AasRepositoryService.PatchSubmodelElementValueByPathAasRepositoryLevelEnum;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, submodelElement, level } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.patchSubmodelElementValueByPathAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                submodelElement: convertCoreSubmodelElementToApiSubmodelElement(submodelElement),
                level: level,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns the metadata attributes of a specific submodel element from the Submodel at a specified path
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelElementByPathMetadataAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
    }): Promise<ApiResult<AasRepositoryService.SubmodelElementMetadata, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelElementByPathMetadataAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Updates the metadata attributes of an existing submodel element value at a specified path within submodel elements hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - submodelElementMetadata: The Submodel Element Metadata object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async patchSubmodelElementValueByPathMetadata(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        submodelElementMetadata: AasRepositoryService.SubmodelElementMetadata;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, submodelElementMetadata } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.patchSubmodelElementValueByPathMetadata({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                submodelElementMetadata: submodelElementMetadata,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns a specific submodel element from the Submodel at a specified path in the ValueOnly representation
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - level?: Determines the structural depth of the respective resource content
     *  - extent?: Determines to which extent the resource is being serialized
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelElementByPathValueOnlyAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        level?: AasRepositoryService.GetSubmodelElementByPathValueOnlyAasRepositoryLevelEnum;
        extent?: AasRepositoryService.GetSubmodelElementByPathValueOnlyAasRepositoryExtentEnum;
    }): Promise<ApiResult<AasRepositoryService.SubmodelElementValue, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, level, extent } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelElementByPathValueOnlyAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                level: level,
                extent: extent,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Updates the value of an existing submodel element value at a specified path within submodel elements hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - SubmodelElementValue: SubmodelElementValue object
     *  - level?: Determines the structural depth of the respective resource content
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async patchSubmodelElementValueByPathValueOnly(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        submodelElementValue: AasRepositoryService.SubmodelElementValue;
        level?: AasRepositoryService.PatchSubmodelElementValueByPathValueOnlyLevelEnum;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, submodelElementValue, level } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.patchSubmodelElementValueByPathValueOnly({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                submodelElementValue: submodelElementValue,
                level: level,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns the Reference of a specific submodel element from the Submodel at a specified path
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - level?: Determines the structural depth of the respective resource content
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelElementByPathReferenceAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        level?: AasRepositoryService.GetSubmodelElementByPathReferenceAasRepositoryLevelEnum;
    }): Promise<ApiResult<Reference, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, level } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelElementByPathReferenceAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                level: level,
            });

            return { success: true, data: convertApiReferenceToCoreReference(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns a specific submodel element from the Submodel at a specified path in the Path notation
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - level?: Determines the structural depth of the respective resource content
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelElementByPathPathAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        level?: AasRepositoryService.GetSubmodelElementByPathPathAasRepositoryLevelEnum;
    }): Promise<ApiResult<Array<string>, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, level } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelElementByPathPathAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                level: level,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Downloads file content from a specific submodel element from the Submodel at a specified path
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getFileByPathAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
    }): Promise<ApiResult<Blob, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getFileByPathAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Uploads file content to an existing submodel element at a specified path within submodel elements hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - fileName: The name of the file
     *  - file: The file to upload
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putFileByPathAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        fileName: string;
        file: Blob;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, fileName, file } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.putFileByPathAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
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
     * Deletes file content of an existing submodel element at a specified path within submodel elements hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteFileByPathAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.deleteFileByPathAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Synchronously invokes an Operation at a specified path
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - operationRequest: Operation request object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async invokeOperationAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        operationRequest: AasRepositoryService.OperationRequest;
    }): Promise<ApiResult<AasRepositoryService.OperationResult, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, operationRequest } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.invokeOperationAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                operationRequest: operationRequest,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Synchronously invokes an Operation at a specified path
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - operationRequestValueOnly: OperationRequestValueOnly object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async invokeOperationValueOnlyAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        operationRequestValueOnly: AasRepositoryService.OperationRequestValueOnly;
    }): Promise<ApiResult<AasRepositoryService.OperationResultValueOnly, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, operationRequestValueOnly } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.invokeOperationValueOnlyAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                operationRequestValueOnly: operationRequestValueOnly,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Asynchronously invokes an Operation at a specified path
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - operationRequest: OperationRequest object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async invokeOperationAsyncAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        operationRequest: AasRepositoryService.OperationRequest;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, operationRequest } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.invokeOperationAsyncAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                operationRequest: operationRequest,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Asynchronously invokes an Operation at a specified path
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - aasIdentifier: The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - operationRequestValueOnly: Operation request object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async invokeOperationAsyncValueOnlyAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        operationRequestValueOnly: AasRepositoryService.OperationRequestValueOnly;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, operationRequestValueOnly } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.invokeOperationAsyncValueOnlyAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                operationRequestValueOnly: operationRequestValueOnly,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns the Operation status of an asynchronous invoked Operation
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - handleId: The returned handle id of an operation’s asynchronous invocation used to request the current state of the operation’s execution (UTF8-BASE64-URL-encoded)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getOperationAsyncStatusAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        handleId: string;
    }): Promise<ApiResult<AasRepositoryService.BaseOperationResult, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, handleId } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);
            const encodedHandleId = base64Encode(handleId);

            const result = await apiInstance.getOperationAsyncStatusAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                handleId: encodedHandleId,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns the Operation result of an asynchronous invoked Operation
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - handleId: The returned handle id of an operation’s asynchronous invocation used to request the current state of the operation’s execution (UTF8-BASE64-URL-encoded)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getOperationAsyncResultAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        handleId: string;
    }): Promise<ApiResult<AasRepositoryService.OperationResult, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, handleId } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);
            const encodedHandleId = base64Encode(handleId);

            const result = await apiInstance.getOperationAsyncResultAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                handleId: encodedHandleId,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns the ValueOnly notation of the Operation result of an asynchronous invoked Operation
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - handleId: The returned handle id of an operation’s asynchronous invocation used to request the current state of the operation’s execution (UTF8-BASE64-URL-encoded)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getOperationAsyncResultValueOnlyAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        handleId: string;
    }): Promise<ApiResult<AasRepositoryService.OperationResultValueOnly, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, handleId } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);
            const encodedHandleId = base64Encode(handleId);

            const result = await apiInstance.getOperationAsyncResultValueOnlyAasRepository({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                handleId: encodedHandleId,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }
}
