import type { ISubmodelElement, Submodel } from '@aas-core-works/aas-core3.1-typescript/types';
import type { ApiResult } from '../models/api';
import { SubmodelRepositoryService } from '../generated'; // Updated import
import { Configuration, RequiredError } from '../generated/runtime';
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import {
    convertApiSubmodelElementToCoreSubmodelElement,
    convertApiSubmodelToCoreSubmodel,
    convertCoreSubmodelElementToApiSubmodelElement,
    convertCoreSubmodelToApiSubmodel,
} from '../lib/convertSubmodelTypes';
import { handleApiError } from '../lib/errorHandler';
//import { SubmodelElement } from 'src/generated/SubmodelRepositoryService';

export class SubmodelRepositoryClient {
    private static requireIdentifier(value: string | null | undefined, field: string): string {
        if (value === null || value === undefined || value.trim() === '') {
            throw new RequiredError(field, `Required parameter "${field}" was null, undefined, or empty.`);
        }

        return value;
    }

    private static extractStatusCode(err: unknown, parsedError?: SubmodelRepositoryService.Result): number | undefined {
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
     * Returns all Submodels
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - semanticId?: The value of the semantic id reference
     *  - idShort?: The Asset Administration Shell's IdShort
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
     *  - level?: Determines the structural depth of the respective resource content
     *  - extent?: Determines to which extent the resource is being serialized
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllSubmodels(options: {
        configuration: Configuration;
        semanticId?: string;
        idShort?: string;
        limit?: number;
        cursor?: string;
        level?: SubmodelRepositoryService.GetAllSubmodelsLevelEnum;
        extent?: SubmodelRepositoryService.GetAllSubmodelsExtentEnum;
    }): Promise<
        ApiResult<
            {
                pagedResult: SubmodelRepositoryService.PagedResultPagingMetadata | undefined;
                result: Submodel[];
            },
            SubmodelRepositoryService.Result
        >
    > {
        const { configuration, semanticId, idShort, limit, cursor, level, extent } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));
            const encodedSemanticId = semanticId ? base64Encode(semanticId) : undefined;

            const response = await apiInstance.getAllSubmodelsRaw({
                semanticId: encodedSemanticId,
                idShort: idShort,
                limit: limit,
                cursor: cursor,
                level: level,
                extent: extent,
            });
            const result = await response.value();

            const submodels = (result.result ?? []).map(convertApiSubmodelToCoreSubmodel);

            return {
                success: true,
                data: { pagedResult: result.paging_metadata, result: submodels },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns all Submodels in metadata representation
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - semanticId?: The value of the semantic id reference
      *  - idShort?: The Asset Administration Shell's IdShort
      *  - limit?: The maximum number of elements in the response array
      *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getAllSubmodelsMetadata(options: {
        configuration: Configuration;
        semanticId?: string;
        idShort?: string;
        limit?: number;
        cursor?: string;
    }): Promise<ApiResult<SubmodelRepositoryService.GetSubmodelsMetadataResult, SubmodelRepositoryService.Result>> {
        const { configuration, semanticId, idShort, limit, cursor } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));
            const encodedSemanticId = semanticId ? base64Encode(semanticId) : undefined;

            const response = await apiInstance.getAllSubmodelsMetadataRaw({
                semanticId: encodedSemanticId,
                idShort: idShort,
                limit: limit,
                cursor: cursor,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns all Submodels in value-only representation
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - semanticId?: The value of the semantic id reference
      *  - idShort?: The Asset Administration Shell's IdShort
      *  - limit?: The maximum number of elements in the response array
      *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
      *  - level?: Determines the structural depth of the respective resource content
      *  - extent?: Determines to which extent the resource is being serialized
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getAllSubmodelsValueOnly(options: {
        configuration: Configuration;
        semanticId?: string;
        idShort?: string;
        limit?: number;
        cursor?: string;
        level?: SubmodelRepositoryService.GetAllSubmodelsValueOnlyLevelEnum;
        extent?: SubmodelRepositoryService.GetAllSubmodelsValueOnlyExtentEnum;
    }): Promise<ApiResult<SubmodelRepositoryService.GetSubmodelsValueResult, SubmodelRepositoryService.Result>> {
        const { configuration, semanticId, idShort, limit, cursor, level, extent } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));
            const encodedSemanticId = semanticId ? base64Encode(semanticId) : undefined;

            const response = await apiInstance.getAllSubmodelsValueOnlyRaw({
                semanticId: encodedSemanticId,
                idShort: idShort,
                limit: limit,
                cursor: cursor,
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns references to all Submodels
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - semanticId?: The value of the semantic id reference
      *  - idShort?: The Asset Administration Shell's IdShort
      *  - limit?: The maximum number of elements in the response array
      *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
      *  - level?: Determines the structural depth of the respective resource content
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getAllSubmodelsReference(options: {
        configuration: Configuration;
        semanticId?: string;
        idShort?: string;
        limit?: number;
        cursor?: string;
        level?: SubmodelRepositoryService.GetAllSubmodelsReferenceLevelEnum;
    }): Promise<ApiResult<SubmodelRepositoryService.GetReferencesResult, SubmodelRepositoryService.Result>> {
        const { configuration, semanticId, idShort, limit, cursor, level } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));
            const encodedSemanticId = semanticId ? base64Encode(semanticId) : undefined;

            const response = await apiInstance.getAllSubmodelsReferenceRaw({
                semanticId: encodedSemanticId,
                idShort: idShort,
                limit: limit,
                cursor: cursor,
                level: level,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns paths of all Submodels
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - semanticId?: The value of the semantic id reference
      *  - idShort?: The Asset Administration Shell's IdShort
      *  - limit?: The maximum number of elements in the response array
      *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
      *  - level?: Determines the structural depth of the respective resource content
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getAllSubmodelsPath(options: {
        configuration: Configuration;
        semanticId?: string;
        idShort?: string;
        limit?: number;
        cursor?: string;
        level?: SubmodelRepositoryService.GetAllSubmodelsPathLevelEnum;
    }): Promise<ApiResult<SubmodelRepositoryService.GetPathItemsResult, SubmodelRepositoryService.Result>> {
        const { configuration, semanticId, idShort, limit, cursor, level } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));
            const encodedSemanticId = semanticId ? base64Encode(semanticId) : undefined;

            const response = await apiInstance.getAllSubmodelsPathRaw({
                semanticId: encodedSemanticId,
                idShort: idShort,
                limit: limit,
                cursor: cursor,
                level: level,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Creates a new Submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - submodel: Submodel object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postSubmodel(options: {
        configuration: Configuration;
        submodel: Submodel;
    }): Promise<ApiResult<Submodel, SubmodelRepositoryService.Result>> {
        const { configuration, submodel } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const response = await apiInstance.postSubmodelRaw({
                submodel: convertCoreSubmodelToApiSubmodel(submodel),
            });
            const result = await response.value();

            return {
                success: true,
                data: convertApiSubmodelToCoreSubmodel(result),
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Deletes a Submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteSubmodelById(options: {
        configuration: Configuration;
        submodelIdentifier: string;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.deleteSubmodelByIdRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns a specific Submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id
     *  - level?: Determines the structural depth of the respective resource content
     *  - extent?: Determines to which extent the resource is being serialized
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelById(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        level?: SubmodelRepositoryService.GetSubmodelByIdLevelEnum;
        extent?: SubmodelRepositoryService.GetSubmodelByIdExtentEnum;
    }): Promise<ApiResult<Submodel, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, level, extent } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getSubmodelByIdRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                level: level,
                extent: extent,
            });
            const result = await response.value();

            return {
                success: true,
                data: convertApiSubmodelToCoreSubmodel(result),
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns a specific Submodel in reference representation
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getSubmodelByIdReference(options: {
        configuration: Configuration;
        submodelIdentifier: string;
    }): Promise<ApiResult<SubmodelRepositoryService.Reference, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getSubmodelByIdReferenceRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns a specific Submodel in path representation
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - level?: Determines the structural depth of the respective resource content
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getSubmodelByIdPath(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        level?: SubmodelRepositoryService.GetSubmodelByIdPathLevelEnum;
    }): Promise<ApiResult<string[], SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, level } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getSubmodelByIdPathRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Updates an existing Submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id
     *  - submodel: Submodel object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putSubmodelById(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        submodel: Submodel;
    }): Promise<ApiResult<Submodel | void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, submodel } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.putSubmodelByIdRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                submodel: convertCoreSubmodelToApiSubmodel(submodel),
            });

            if (response.raw.status === 204) {
                return { success: true, data: undefined, statusCode: response.raw.status };
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Updates an existing Submodel partially
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - submodel: Submodel object
      *  - level?: Determines the structural depth of the respective resource content
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async patchSubmodelById(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        submodel: Submodel;
        level?: SubmodelRepositoryService.PatchSubmodelByIdLevelEnum;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, submodel, level } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.patchSubmodelByIdRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns all submodel elements including their hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
     *  - level?: Determines the structural depth of the respective resource content
     *  - extent?: Determines to which extent the resource is being serialized
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllSubmodelElements(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        limit?: number;
        cursor?: string;
        level?: SubmodelRepositoryService.GetAllSubmodelElementsLevelEnum;
        extent?: SubmodelRepositoryService.GetAllSubmodelElementsExtentEnum;
    }): Promise<
        ApiResult<
            {
                pagedResult: SubmodelRepositoryService.PagedResultPagingMetadata | undefined;
                result: ISubmodelElement[];
            },
            SubmodelRepositoryService.Result
        >
    > {
        const { configuration, submodelIdentifier, limit, cursor, level, extent } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getAllSubmodelElementsRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns all submodel elements in metadata representation
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - limit?: The maximum number of elements in the response array
      *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getAllSubmodelElementsMetadata(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        limit?: number;
        cursor?: string;
    }): Promise<
        ApiResult<SubmodelRepositoryService.GetSubmodelElementsMetadataResult, SubmodelRepositoryService.Result>
    > {
        const { configuration, submodelIdentifier, limit, cursor } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getAllSubmodelElementsMetadataSubmodelRepoRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns all submodel elements in value-only representation
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - limit?: The maximum number of elements in the response array
      *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
      *  - level?: Determines the structural depth of the respective resource content
      *  - extent?: Determines to which extent the resource is being serialized
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getAllSubmodelElementsValueOnly(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        limit?: number;
        cursor?: string;
        level?: SubmodelRepositoryService.GetAllSubmodelElementsValueOnlySubmodelRepoLevelEnum;
        extent?: SubmodelRepositoryService.GetAllSubmodelElementsValueOnlySubmodelRepoExtentEnum;
    }): Promise<ApiResult<SubmodelRepositoryService.GetSubmodelElementsValueResult, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, limit, cursor, level, extent } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getAllSubmodelElementsValueOnlySubmodelRepoRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns references to all submodel elements
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - limit?: The maximum number of elements in the response array
      *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
      *  - level?: Determines the structural depth of the respective resource content
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getAllSubmodelElementsReference(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        limit?: number;
        cursor?: string;
        level?: SubmodelRepositoryService.GetAllSubmodelElementsReferenceSubmodelRepoLevelEnum;
    }): Promise<ApiResult<SubmodelRepositoryService.GetReferencesResult, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, limit, cursor, level } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getAllSubmodelElementsReferenceSubmodelRepoRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
                level: level,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns paths of all submodel elements
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - limit?: The maximum number of elements in the response array
      *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
      *  - level?: Determines the structural depth of the respective resource content
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getAllSubmodelElementsPath(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        limit?: number;
        cursor?: string;
        level?: SubmodelRepositoryService.GetAllSubmodelElementsPathSubmodelRepoLevelEnum;
    }): Promise<ApiResult<SubmodelRepositoryService.GetPathItemsResult, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, limit, cursor, level } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getAllSubmodelElementsPathSubmodelRepoRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
                level: level,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Creates a new submodel element
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postSubmodelElement(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        submodelElement: ISubmodelElement;
    }): Promise<ApiResult<ISubmodelElement, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, submodelElement } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.postSubmodelElementSubmodelRepoRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                submodelElement: convertCoreSubmodelElementToApiSubmodelElement(submodelElement),
            });
            const result = await response.value();

            return {
                success: true,
                data: convertApiSubmodelElementToCoreSubmodelElement(result),
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns a specific submodel element from the Submodel at a specified path
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - level?: Determines the structural depth of the respective resource content
     *  - extent?: Determines to which extent the resource is being serialized
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelElementByPath(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
        level?: SubmodelRepositoryService.GetSubmodelElementByPathSubmodelRepoLevelEnum;
        extent?: SubmodelRepositoryService.GetSubmodelElementByPathSubmodelRepoExtentEnum;
    }): Promise<ApiResult<ISubmodelElement, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath, level, extent } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getSubmodelElementByPathSubmodelRepoRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                level: level,
                extent: extent,
            });
            const result = await response.value();

            return {
                success: true,
                data: convertApiSubmodelElementToCoreSubmodelElement(result),
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns metadata attributes of a specific submodel element
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - idShortPath: IdShort path to the submodel element (dot-separated)
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getSubmodelElementByPathMetadata(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
    }): Promise<ApiResult<SubmodelRepositoryService.SubmodelElementMetadata, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getSubmodelElementByPathMetadataSubmodelRepoRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns a specific submodel element in reference representation
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - idShortPath: IdShort path to the submodel element (dot-separated)
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getSubmodelElementByPathReference(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
    }): Promise<ApiResult<SubmodelRepositoryService.Reference, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getSubmodelElementByPathReferenceSubmodelRepoRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns a specific submodel element in path representation
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - idShortPath: IdShort path to the submodel element (dot-separated)
      *  - level?: Determines the structural depth of the respective resource content
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getSubmodelElementByPathPath(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
        level?: SubmodelRepositoryService.GetSubmodelElementByPathPathSubmodelRepoLevelEnum;
    }): Promise<ApiResult<string[], SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath, level } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getSubmodelElementByPathPathSubmodelRepoRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Creates a new submodel element at a specified path within submodel elements hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - submodelElement: SubmodelElement object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postSubmodelElementByPath(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
        submodelElement: ISubmodelElement;
    }): Promise<ApiResult<ISubmodelElement, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath, submodelElement } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.postSubmodelElementByPathSubmodelRepoRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                submodelElement: convertCoreSubmodelElementToApiSubmodelElement(submodelElement),
            });
            const result = await response.value();

            return {
                success: true,
                data: convertApiSubmodelElementToCoreSubmodelElement(result),
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Deletes a submodel element at a specified path within the submodel elements hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteSubmodelElementByPath(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.deleteSubmodelElementByPathSubmodelRepoRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Updates an existing submodel element at a specified path within submodel elements hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - submodelElement: SubmodelElement object
     *  - level?: Determines the structural depth of the respective resource content
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putSubmodelElementByPath(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
        submodelElement: ISubmodelElement;
        level?: SubmodelRepositoryService.PutSubmodelElementByPathSubmodelRepoLevelEnum;
    }): Promise<ApiResult<ISubmodelElement | void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath, submodelElement, level } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.putSubmodelElementByPathSubmodelRepoRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                submodelElement: convertCoreSubmodelElementToApiSubmodelElement(submodelElement),
                level: level,
            });

            if (response.raw.status === 204) {
                return { success: true, data: undefined, statusCode: response.raw.status };
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Updates values of an existing submodel element at a specified path
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - idShortPath: IdShort path to the submodel element (dot-separated)
      *  - submodelElement: SubmodelElement object
      *  - level?: Determines the structural depth of the respective resource content
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async patchSubmodelElementByPath(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
        submodelElement: ISubmodelElement;
        level?: SubmodelRepositoryService.PatchSubmodelElementByPathSubmodelRepoLevelEnum;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath, submodelElement, level } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.patchSubmodelElementByPathSubmodelRepoRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns the metadata attributes of a specific Submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelByIdMetadata(options: {
        configuration: Configuration;
        submodelIdentifier: string;
    }): Promise<ApiResult<SubmodelRepositoryService.SubmodelMetadata, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getSubmodelByIdMetadataRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Updates metadata attributes of an existing Submodel
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - submodelMetadata: SubmodelMetadata object
      *  - level?: Determines the structural depth of the respective resource content
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async patchSubmodelByIdMetadata(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        submodelMetadata: SubmodelRepositoryService.SubmodelMetadata;
        level?: SubmodelRepositoryService.PatchSubmodelByIdMetadataLevelEnum;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, submodelMetadata, level } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.patchSubmodelByIdMetadataRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                submodelMetadata: submodelMetadata,
                level: level,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns a specific Submodel in the ValueOnly representation
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id
     *  - level?: Determines the structural depth of the respective resource content
     *  - extent?: Determines to which extent the resource is being serialized
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelByIdValueOnly(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        level?: SubmodelRepositoryService.GetSubmodelByIdValueOnlyLevelEnum;
        extent?: SubmodelRepositoryService.GetSubmodelByIdValueOnlyExtentEnum;
    }): Promise<ApiResult<object, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, level, extent } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getSubmodelByIdValueOnlyRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Updates the values of an existing Submodel
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - body: Value-only payload object
      *  - level?: Determines the structural depth of the respective resource content
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async patchSubmodelByIdValueOnly(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        body: object;
        level?: SubmodelRepositoryService.PatchSubmodelByIdValueOnlyLevelEnum;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, body, level } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.patchSubmodelByIdValueOnlyRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns a specific submodel element from the Submodel at a specified path in the ValueOnly representation
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - level?: Determines the structural depth of the respective resource content
     *  - extent?: Determines to which extent the resource is being serialized
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelElementByPathValueOnly(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
        level?: SubmodelRepositoryService.GetSubmodelElementByPathValueOnlySubmodelRepoLevelEnum;
        extent?: SubmodelRepositoryService.GetSubmodelElementByPathValueOnlySubmodelRepoExtentEnum;
    }): Promise<ApiResult<SubmodelRepositoryService.SubmodelElementValue, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath, level, extent } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getSubmodelElementByPathValueOnlySubmodelRepoRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Updates the value of an existing SubmodelElement
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - idShortPath: IdShort path to the submodel element (dot-separated)
      *  - submodelElementValue: SubmodelElementValue object
      *  - level?: Determines the structural depth of the respective resource content
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async patchSubmodelElementByPathValueOnly(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
        submodelElementValue: SubmodelRepositoryService.SubmodelElementValue;
        level?: SubmodelRepositoryService.PatchSubmodelElementByPathValueOnlySubmodelRepoLevelEnum;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath, submodelElementValue, level } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.patchSubmodelElementByPathValueOnlySubmodelRepoRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Updates metadata attributes of an existing SubmodelElement
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - idShortPath: IdShort path to the submodel element (dot-separated)
      *  - submodelElementMetadata: SubmodelElementMetadata object
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async patchSubmodelElementByPathMetadata(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
        submodelElementMetadata: SubmodelRepositoryService.SubmodelElementMetadata;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath, submodelElementMetadata } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.patchSubmodelElementByPathMetadataSubmodelRepoRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns file content for a submodel element at a specified path
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - idShortPath: IdShort path to the submodel element (dot-separated)
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getFileByPath(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
    }): Promise<ApiResult<Blob, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getFileByPathSubmodelRepoRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Updates file content for a submodel element at a specified path
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - idShortPath: IdShort path to the submodel element (dot-separated)
      *  - fileName?: Name of the uploaded file
      *  - file?: File content
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async putFileByPath(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
        fileName?: string;
        file?: Blob;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath, fileName, file } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.putFileByPathSubmodelRepoRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Deletes file content of an existing submodel element at a specified path
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - idShortPath: IdShort path to the submodel element (dot-separated)
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async deleteFileByPath(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.deleteFileByPathSubmodelRepoRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Synchronously invokes an Operation at a specified path
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - operationRequest: Operation request object
     *  - async?: Determines whether an operation invocation is performed asynchronously or synchronously
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postInvokeOperationSubmodelRepo(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
        operationRequest: SubmodelRepositoryService.OperationRequest;
        //async?: boolean;
    }): Promise<ApiResult<SubmodelRepositoryService.OperationResult, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath, operationRequest } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.invokeOperationSubmodelRepoRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                operationRequest: operationRequest,
                //async: async,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Synchronously invokes an Operation at a specified path
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
    async postInvokeOperationValueOnly(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        operationRequestValueOnly: SubmodelRepositoryService.OperationRequestValueOnly;
    }): Promise<ApiResult<SubmodelRepositoryService.OperationResultValueOnly, SubmodelRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, operationRequestValueOnly } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedAasIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier')
            );
            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.invokeOperationValueOnlyRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Asynchronously invokes an Operation at a specified path
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - submodelIdentifier: The Submodel’s unique id
     *  - idShortPath: IdShort path to the submodel element (dot-separated)
     *  - operationRequest: Operation request object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postInvokeOperationAsync(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
        operationRequest: SubmodelRepositoryService.OperationRequest;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath, operationRequest } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.invokeOperationAsyncRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
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
    async postInvokeOperationAsyncValueOnly(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        idShortPath: string;
        operationRequestValueOnly: SubmodelRepositoryService.OperationRequestValueOnly;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, idShortPath, operationRequestValueOnly } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedAasIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(aasIdentifier, 'aasIdentifier')
            );
            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.invokeOperationAsyncValueOnlyRaw({
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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns status of an asynchronously invoked operation
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - idShortPath: IdShort path to the submodel element (dot-separated)
      *  - handleId: Identifier of the asynchronous invocation handle
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getOperationAsyncStatus(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
        handleId: string;
    }): Promise<ApiResult<SubmodelRepositoryService.BaseOperationResult, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath, handleId } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getOperationAsyncStatusRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                handleId: handleId,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns result of an asynchronously invoked operation
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - idShortPath: IdShort path to the submodel element (dot-separated)
      *  - handleId: Identifier of the asynchronous invocation handle
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getOperationAsyncResult(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
        handleId: string;
    }): Promise<ApiResult<SubmodelRepositoryService.OperationResult, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath, handleId } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getOperationAsyncResultRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                handleId: handleId,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns result of an asynchronously invoked operation in value-only representation
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - submodelIdentifier: The Submodel's unique id
      *  - idShortPath: IdShort path to the submodel element (dot-separated)
      *  - handleId: Identifier of the asynchronous invocation handle
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async getOperationAsyncResultValueOnly(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
        handleId: string;
    }): Promise<ApiResult<SubmodelRepositoryService.OperationResultValueOnly, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath, handleId } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRepositoryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getOperationAsyncResultValueOnlyRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                handleId: handleId,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
      * Returns an appropriate serialization based on the specified format
      *
      * @param options Object containing:
      *  - configuration: The http request options
      *  - aasIds?: Asset Administration Shell IDs
      *  - submodelIds?: Submodel IDs
      *  - includeConceptDescriptions?: Whether to include referenced ConceptDescriptions in the serialization result
      *
      * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
      */
    async generateSerializationByIds(options: {
        configuration: Configuration;
        aasIds?: string[];
        submodelIds?: string[];
        includeConceptDescriptions?: boolean;
    }): Promise<ApiResult<Blob, SubmodelRepositoryService.Result>> {
        const { configuration, aasIds, submodelIds, includeConceptDescriptions } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SerializationAPIApi(applyDefaults(configuration));

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
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
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
    }): Promise<ApiResult<SubmodelRepositoryService.ServiceDescription, SubmodelRepositoryService.Result>> {
        const { configuration } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.DescriptionAPIApi(applyDefaults(configuration));

            const response = await apiInstance.getSelfDescriptionRaw();
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }
}
