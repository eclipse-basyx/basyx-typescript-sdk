import type {
    AssetAdministrationShell,
    AssetInformation,
    Reference,
} from '@aas-core-works/aas-core3.0-typescript/types';
import type { ApiResult } from '../models/api';
import type { AssetId } from '../models/AssetId';
import { ConfigurationParameters } from '../generated/AasRepositoryService';
import {
    AssetAdministrationShellRepositoryAPIApi as AasRepository,
    PagedResultPagingMetadata,
    RequiredError,
} from '../generated/AasRepositoryService';
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
            const apiInstance = new AasRepository(configuration, undefined, global.fetch);
            const encodedAssetIds = assetIds?.map((id) => base64Encode(JSON.stringify(id)));

            const result = await apiInstance.getAllAssetAdministrationShells(encodedAssetIds, idShort, limit, cursor);

            const shells = (result.result ?? []).map(convertApiAasToCoreAas);
            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: shells },
            };
        } catch (err) {
            return { success: false, error: err as RequiredError };
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
        configuration: ConfigurationParameters;
        assetAdministrationShell: AssetAdministrationShell;
    }): Promise<ApiResult<AssetAdministrationShell, RequiredError>> {
        const { configuration, assetAdministrationShell } = options;

        try {
            const apiInstance = new AasRepository(configuration, undefined, global.fetch);

            const result = await apiInstance.postAssetAdministrationShell(
                convertCoreAasToApiAas(assetAdministrationShell)
            );

            return { success: true, data: convertApiAasToCoreAas(result) };
        } catch (err) {
            return { success: false, error: err as RequiredError };
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
        configuration: ConfigurationParameters;
        aasIdentifier: string;
    }): Promise<ApiResult<Response, RequiredError>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasRepository(configuration, undefined, global.fetch);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.deleteAssetAdministrationShellById(encodedAasIdentifier);

            return { success: true, data: result };
        } catch (err) {
            return { success: false, error: err as RequiredError };
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
        configuration: ConfigurationParameters;
        aasIdentifier: string;
    }): Promise<ApiResult<AssetAdministrationShell, RequiredError>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasRepository(configuration, undefined, global.fetch);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.getAssetAdministrationShellById(encodedAasIdentifier);

            return { success: true, data: convertApiAasToCoreAas(result) };
        } catch (err) {
            return { success: false, error: err as RequiredError };
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
        configuration: ConfigurationParameters;
        aasIdentifier: string;
        assetAdministrationShell: AssetAdministrationShell;
    }): Promise<ApiResult<Response, RequiredError>> {
        const { configuration, aasIdentifier, assetAdministrationShell } = options;

        try {
            const apiInstance = new AasRepository(configuration, undefined, global.fetch);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.putAssetAdministrationShellById(
                convertCoreAasToApiAas(assetAdministrationShell),
                encodedAasIdentifier
            );

            return { success: true, data: result };
        } catch (err) {
            return { success: false, error: err as RequiredError };
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
        configuration: ConfigurationParameters;
        aasIdentifier: string;
    }): Promise<ApiResult<AssetInformation, RequiredError>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasRepository(configuration, undefined, global.fetch);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.getAssetInformationAasRepository(encodedAasIdentifier);

            return {
                success: true,
                data: convertApiAssetInformationToCoreAssetInformation(result),
            };
        } catch (err) {
            return { success: false, error: err as RequiredError };
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
        configuration: ConfigurationParameters;
        aasIdentifier: string;
        assetInformation: AssetInformation;
    }): Promise<ApiResult<Response, RequiredError>> {
        const { configuration, aasIdentifier, assetInformation } = options;

        try {
            const apiInstance = new AasRepository(configuration, undefined, global.fetch);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.putAssetInformationAasRepository(
                convertCoreAssetInformationToApiAssetInformation(assetInformation),
                encodedAasIdentifier
            );

            return { success: true, data: result };
        } catch (err) {
            return { success: false, error: err as RequiredError };
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
        configuration: ConfigurationParameters;
        aasIdentifier: string;
    }): Promise<ApiResult<Response, RequiredError>> {
        const { configuration, aasIdentifier } = options;
        try {
            const apiInstance = new AasRepository(configuration, undefined, global.fetch);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.deleteThumbnailAasRepository(encodedAasIdentifier);

            return { success: true, data: result };
        } catch (err) {
            return { success: false, error: err as RequiredError };
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
        configuration: ConfigurationParameters;
        aasIdentifier: string;
    }): Promise<ApiResult<Blob, RequiredError>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasRepository(configuration, undefined, global.fetch);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.getThumbnailAasRepository(encodedAasIdentifier);

            return { success: true, data: result };
        } catch (err) {
            return { success: false, error: err as RequiredError };
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
        configuration: ConfigurationParameters;
        aasIdentifier: string;
        fileName: string;
        file: Blob;
    }): Promise<ApiResult<Response, RequiredError>> {
        const { configuration, aasIdentifier, fileName, file } = options;

        try {
            const apiInstance = new AasRepository(configuration, undefined, global.fetch);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.putThumbnailAasRepository(fileName, file, encodedAasIdentifier);

            return { success: true, data: result };
        } catch (err) {
            return { success: false, error: err as RequiredError };
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
        configuration: ConfigurationParameters;
        aasIdentifier: string;
        limit?: number;
        cursor?: string;
    }): Promise<ApiResult<{ pagedResult: PagedResultPagingMetadata | undefined; result: Reference[] }, RequiredError>> {
        const { configuration, aasIdentifier, limit, cursor } = options;

        try {
            const apiInstance = new AasRepository(configuration, undefined, global.fetch);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.getAllSubmodelReferencesAasRepository(encodedAasIdentifier, limit, cursor);

            const submodelReferences = (result.result ?? []).map(convertApiReferenceToCoreReference);
            return {
                success: true,
                data: {
                    pagedResult: result.pagingMetadata,
                    result: submodelReferences,
                },
            };
        } catch (err) {
            return { success: false, error: err as RequiredError };
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
        configuration: ConfigurationParameters;
        aasIdentifier: string;
        submodelReference: Reference;
    }): Promise<ApiResult<Reference, RequiredError>> {
        const { configuration, aasIdentifier, submodelReference } = options;

        try {
            const apiInstance = new AasRepository(configuration, undefined, global.fetch);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.postSubmodelReferenceAasRepository(
                convertCoreReferenceToApiReference(submodelReference),
                encodedAasIdentifier
            );

            return { success: true, data: convertApiReferenceToCoreReference(result) };
        } catch (err) {
            return { success: false, error: err as RequiredError };
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
        configuration: ConfigurationParameters;
        aasIdentifier: string;
        submodelIdentifier: string;
    }): Promise<ApiResult<Response, RequiredError>> {
        const { configuration, aasIdentifier, submodelIdentifier } = options;

        try {
            const apiInstance = new AasRepository(configuration, undefined, global.fetch);

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.deleteSubmodelReferenceByIdAasRepository(
                encodedAasIdentifier,
                encodedSubmodelIdentifier
            );

            return { success: true, data: result };
        } catch (err) {
            return { success: false, error: err as RequiredError };
        }
    }
}
