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
import { Configuration, RequiredError } from '../generated/runtime';
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
    private static requireIdentifier(value: string | null | undefined, field: string): string {
        if (value === null || value === undefined || value.trim() === '') {
            throw new RequiredError(field, `Required parameter "${field}" was null, undefined, or empty.`);
        }

        return value;
    }

    private static extractStatusCode(err: unknown, parsedError?: AasRepositoryService.Result): number | undefined {
        const responseStatus = (err as { response?: { status?: unknown } })?.response?.status;
        if (typeof responseStatus === 'number') {
            return responseStatus;
        }

        if (err instanceof RequiredError || (err as { name?: unknown })?.name === 'RequiredError') {
            return 400;
        }

        const code = parsedError?.messages?.[0]?.code;
        if (!code) {
            return undefined;
        }

        const parsedCode = Number.parseInt(code, 10);
        return Number.isNaN(parsedCode) ? undefined : parsedCode;
    }
    /**
     * Returns all Asset Administration Shells
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - assetIds?: A list of specific Asset identifiers
     *  - idShort?: The Asset Administration Shell’s IdShort
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
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

            const response = await apiInstance.getAllAssetAdministrationShellsRaw({
                assetIds: encodedAssetIds,
                idShort: idShort,
                limit: limit,
                cursor: cursor,
            });
            const result = await response.value();

            const shells = (result.result ?? []).map(convertApiAasToCoreAas);
            return {
                success: true,
                data: { pagedResult: result.paging_metadata, result: shells },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns References to all Asset Administration Shells
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - assetIds?: A list of specific Asset identifiers
     *  - idShort?: The Asset Administration Shell’s IdShort
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllAssetAdministrationShellsReference(options: {
        configuration: Configuration;
        assetIds?: AssetId[];
        idShort?: string;
        limit?: number;
        cursor?: string;
    }): Promise<
        ApiResult<
            {
                pagedResult: AasRepositoryService.PagedResultPagingMetadata | undefined;
                result: Reference[];
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

            const response = await apiInstance.getAllAssetAdministrationShellsReferenceRaw({
                assetIds: encodedAssetIds,
                idShort: idShort,
                limit: limit,
                cursor: cursor,
            });
            const result = await response.value();

            const shellReferences = (result.result ?? []).map(convertApiReferenceToCoreReference);

            return {
                success: true,
                data: { pagedResult: result.paging_metadata, result: shellReferences },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const response = await apiInstance.postAssetAdministrationShellRaw({
                assetAdministrationShell: convertCoreAasToApiAas(assetAdministrationShell),
            });
            const result = await response.value();

            return { success: true, data: convertApiAasToCoreAas(result), statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));

            const response = await apiInstance.deleteAssetAdministrationShellByIdRaw({
                aasIdentifier: encodedAasIdentifier,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));

            const response = await apiInstance.getAssetAdministrationShellByIdRaw({
                aasIdentifier: encodedAasIdentifier,
            });
            const result = await response.value();

            return { success: true, data: convertApiAasToCoreAas(result), statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));

            const response = await apiInstance.putAssetAdministrationShellByIdRaw({
                aasIdentifier: encodedAasIdentifier,
                assetAdministrationShell: convertCoreAasToApiAas(assetAdministrationShell),
            });

            if (response.raw.status === 204) {
                return { success: true, data: undefined, statusCode: response.raw.status };
            }

            const result = await response.value();

            return { success: true, data: result ? convertApiAasToCoreAas(result) : undefined, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns a specific Asset Administration Shell in reference representation
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAssetAdministrationShellByIdReferenceAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<Reference, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(
                AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier')
            );

            const response = await apiInstance.getAssetAdministrationShellByIdReferenceAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
            });
            const result = await response.value();

            return {
                success: true,
                data: convertApiReferenceToCoreReference(result),
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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
    async getAssetInformationAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<AssetInformation, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));

            const response = await apiInstance.getAssetInformationAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
            });
            const result = await response.value();

            return {
                success: true,
                data: convertApiAssetInformationToCoreAssetInformation(result),
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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
    async putAssetInformationAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        assetInformation: AssetInformation;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, assetInformation } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));

            const response = await apiInstance.putAssetInformationAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                assetInformation: convertCoreAssetInformationToApiAssetInformation(assetInformation),
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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
    async deleteThumbnailAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier } = options;
        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));

            const response = await apiInstance.deleteThumbnailAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
            });

            if (response.raw.status === 204) {
                return { success: true, data: undefined, statusCode: response.raw.status };
            }

            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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
    async getThumbnailAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<Blob, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));

            const response = await apiInstance.getThumbnailAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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
    async putThumbnailAasRepository(options: {
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));

            const response = await apiInstance.putThumbnailAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                fileName: fileName,
                file: file,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns all submodel references
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllSubmodelReferencesAasRepository(options: {
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));

            const response = await apiInstance.getAllSubmodelReferencesAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                limit: limit,
                cursor: cursor,
            });
            const result = await response.value();

            const submodelReferences = (result.result ?? []).map(convertApiReferenceToCoreReference);
            return {
                success: true,
                data: {
                    pagedResult: result.paging_metadata,
                    result: submodelReferences,
                },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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
    async postSubmodelReferenceAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelReference: Reference;
    }): Promise<ApiResult<Reference, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelReference } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));

            const response = await apiInstance.postSubmodelReferenceAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                reference: convertCoreReferenceToApiReference(submodelReference),
            });
            const result = await response.value();

            return { success: true, data: convertApiReferenceToCoreReference(result), statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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
    async deleteSubmodelReferenceAasRepository(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.deleteSubmodelReferenceAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    async getAssetInformation(options: {
        configuration: Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<AssetInformation, AasRepositoryService.Result>> {
        return this.getAssetInformationAasRepository(options);
    }

    async putAssetInformation(options: {
        configuration: Configuration;
        aasIdentifier: string;
        assetInformation: AssetInformation;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        return this.putAssetInformationAasRepository(options);
    }

    async deleteThumbnail(options: {
        configuration: Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        return this.deleteThumbnailAasRepository(options);
    }

    async getThumbnail(options: {
        configuration: Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<Blob, AasRepositoryService.Result>> {
        return this.getThumbnailAasRepository(options);
    }

    async putThumbnail(options: {
        configuration: Configuration;
        aasIdentifier: string;
        fileName: string;
        file: Blob;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        return this.putThumbnailAasRepository(options);
    }

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
        return this.getAllSubmodelReferencesAasRepository(options);
    }

    async postSubmodelReference(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelReference: Reference;
    }): Promise<ApiResult<Reference, AasRepositoryService.Result>> {
        return this.postSubmodelReferenceAasRepository(options);
    }

    async deleteSubmodelReferenceById(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
    }): Promise<ApiResult<void, AasRepositoryService.Result>> {
        return this.deleteSubmodelReferenceAasRepository(options);
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getSubmodelByIdAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                level: level,
                extent: extent,
            });
            const result = await response.value();

            return { success: true, data: convertApiSubmodelToCoreSubmodel(result), statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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
    }): Promise<ApiResult<Submodel | void, AasRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, submodel } = options;

        try {
            const apiInstance = new AasRepositoryService.AssetAdministrationShellRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.putSubmodelByIdAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                submodel: convertCoreSubmodelToApiSubmodel(submodel),
            });

            if (response.raw.status === 204) {
                return { success: true, data: undefined, statusCode: response.raw.status };
            }

            if (response.raw.status === 201) {
                try {
                    const createdSubmodel = await response.value();
                    return {
                        success: true,
                        data: createdSubmodel ? convertApiSubmodelToCoreSubmodel(createdSubmodel) : undefined,
                        statusCode: response.raw.status,
                    };
                } catch {
                    // Some servers acknowledge creation with an empty or non-JSON body.
                    return { success: true, data: undefined, statusCode: response.raw.status };
                }
            }

            const result = await response.value();
            return {
                success: true,
                data: result ? convertApiSubmodelToCoreSubmodel(result) : undefined,
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.deleteSubmodelByIdAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.patchSubmodelAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                submodel: convertCoreSubmodelToApiSubmodel(submodel),
                level: level,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getSubmodelByIdMetadataAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.patchSubmodelByIdMetadataAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                submodelMetadata: submodelMetadata,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getSubmodelByIdValueOnlyAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                level: level,
                extent: extent,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.patchSubmodelByIdValueOnlyAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                body: body,
                level: level,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getSubmodelByIdReferenceAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
            });
            const result = await response.value();

            return { success: true, data: convertApiReferenceToCoreReference(result), statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getSubmodelByIdPathAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                level: level,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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
     *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getAllSubmodelElementsAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
                level: level,
                extent: extent,
            });
            const result = await response.value();

            const submodelElements = (result.result ?? []).map(convertApiSubmodelElementToCoreSubmodelElement);
            return {
                success: true,
                data: { pagedResult: result.paging_metadata, result: submodelElements },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.postSubmodelElementAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                submodelElement: convertCoreSubmodelElementToApiSubmodelElement(submodelElement),
            });
            const result = await response.value();

            return { success: true, data: convertApiSubmodelElementToCoreSubmodelElement(result), statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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
     *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getAllSubmodelElementsMetadataAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
            });
            const result = await response.value();

            //const submodelElements = (result.result ?? []).map(convertApiSubmodelElementToCoreSubmodelElement);
            const submodelElementsMetadata = result.result ?? [];
            return {
                success: true,
                data: { pagedResult: result.paging_metadata, result: submodelElementsMetadata },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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
     *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getAllSubmodelElementsValueOnlyAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
                level: level,
            });
            const result = await response.value();

            //const submodelElementsValue = (result.result ?? []).map(convertApiSubmodelElementToCoreSubmodelElement);
            const submodelElementValues = result.result ?? [];
            return {
                success: true,
                data: { pagedResult: result.paging_metadata, result: submodelElementValues },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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
     *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getAllSubmodelElementsReferenceAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
                level: level,
            });
            const result = await response.value();

            const submodelElementReferences = (result.result ?? []).map(convertApiReferenceToCoreReference);
            return {
                success: true,
                data: { pagedResult: result.paging_metadata, result: submodelElementReferences },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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
     *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getAllSubmodelElementsPathAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
                level: level,
                extent: extent,
            });
            const result = await response.value();

            //const submodelElements = (result.result ?? []).map(convertApiSubmodelElementToCoreSubmodelElement);
            const submodelElements = result.result ?? [];
            return {
                success: true,
                data: { pagedResult: result.paging_metadata, result: submodelElements },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getSubmodelElementByPathAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                level: level,
                extent: extent,
            });
            const result = await response.value();

            return { success: true, data: convertApiSubmodelElementToCoreSubmodelElement(result), statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.postSubmodelElementByPathAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                submodelElement: convertCoreSubmodelElementToApiSubmodelElement(submodelElement),
            });
            const result = await response.value();

            return { success: true, data: convertApiSubmodelElementToCoreSubmodelElement(result), statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.deleteSubmodelElementByPathAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.putSubmodelElementByPathAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                submodelElement: convertCoreSubmodelElementToApiSubmodelElement(submodelElement),
            });

            if (response.raw.status === 204) {
                return { success: true, data: undefined, statusCode: response.raw.status };
            }

            if (response.raw.status === 201) {
                try {
                    const createdSubmodelElement = await response.value();
                    return {
                        success: true,
                        data: createdSubmodelElement
                            ? convertApiSubmodelElementToCoreSubmodelElement(createdSubmodelElement)
                            : undefined,
                        statusCode: response.raw.status,
                    };
                } catch {
                    // Some servers acknowledge creation with an empty or non-JSON body.
                    return { success: true, data: undefined, statusCode: response.raw.status };
                }
            }

            const result = await response.value();

            return {
                success: true,
                data: result ? convertApiSubmodelElementToCoreSubmodelElement(result) : undefined,
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.patchSubmodelElementValueByPathAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                submodelElement: convertCoreSubmodelElementToApiSubmodelElement(submodelElement),
                level: level,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getSubmodelElementByPathMetadataAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.patchSubmodelElementValueByPathMetadataRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                submodelElementMetadata: submodelElementMetadata,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getSubmodelElementByPathValueOnlyAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                level: level,
                extent: extent,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.patchSubmodelElementValueByPathValueOnlyRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                submodelElementValue: submodelElementValue,
                level: level,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getSubmodelElementByPathReferenceAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                level: level,
            });
            const result = await response.value();

            return { success: true, data: convertApiReferenceToCoreReference(result), statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getSubmodelElementByPathPathAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                level: level,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.getFileByPathAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.putFileByPathAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                fileName: fileName,
                file: file,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.deleteFileByPathAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.invokeOperationAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                operationRequest: operationRequest,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.invokeOperationValueOnlyAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                operationRequestValueOnly: operationRequestValueOnly,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.invokeOperationAsyncAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                operationRequest: operationRequest,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));

            const response = await apiInstance.invokeOperationAsyncValueOnlyAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                operationRequestValueOnly: operationRequestValueOnly,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));
            const encodedHandleId = base64Encode(AasRepositoryClient.requireIdentifier(handleId, 'handleId'));

            const response = await apiInstance.getOperationAsyncStatusAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                handleId: encodedHandleId,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));
            const encodedHandleId = base64Encode(AasRepositoryClient.requireIdentifier(handleId, 'handleId'));

            const response = await apiInstance.getOperationAsyncResultAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                handleId: encodedHandleId,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
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

            const encodedAasIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier'));
            const encodedSubmodelIdentifier = base64Encode(AasRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier'));
            const encodedHandleId = base64Encode(AasRepositoryClient.requireIdentifier(handleId, 'handleId'));

            const response = await apiInstance.getOperationAsyncResultValueOnlyAasRepositoryRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                handleId: encodedHandleId,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns an appropriate serialization based on the specified format
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIds?: The Asset Administration Shell IDs
     *  - submodelIds?: The Submodel IDs
     *  - includeConceptDescriptions?: Include concept descriptions in the environment
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async generateSerializationByIds(options: {
        configuration: Configuration;
        aasIds?: string[];
        submodelIds?: string[];
        includeConceptDescriptions?: boolean;
    }): Promise<ApiResult<Blob, AasRepositoryService.Result>> {
        const { configuration, aasIds, submodelIds, includeConceptDescriptions } = options;

        try {
            const apiInstance = new AasRepositoryService.SerializationAPIApi(applyDefaults(configuration));

            const response = await apiInstance.generateSerializationByIdsRaw({
                aasIds: aasIds,
                submodelIds: submodelIds,
                includeConceptDescriptions: includeConceptDescriptions,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns the self-describing information of a network resource (ServiceDescription)
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSelfDescription(options: {
        configuration: Configuration;
    }): Promise<ApiResult<AasRepositoryService.ServiceDescription, AasRepositoryService.Result>> {
        const { configuration } = options;

        try {
            const apiInstance = new AasRepositoryService.DescriptionAPIApi(applyDefaults(configuration));
            const response = await apiInstance.getSelfDescriptionRaw();
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }
}
