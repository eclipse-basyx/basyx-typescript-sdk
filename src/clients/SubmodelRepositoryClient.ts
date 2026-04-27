import type { ISubmodelElement, Submodel } from '@aas-core-works/aas-core3.1-typescript/types';
import type { ApiResult } from '../models/api';
import { SubmodelRepositoryService } from '../generated'; // Updated import
import { Configuration } from '../generated/runtime';
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
            const encodedSemanticId = semanticId ? base64Encode(JSON.stringify(semanticId)) : undefined;

            const result = await apiInstance.getAllSubmodels({
                semanticId: encodedSemanticId,
                idShort: idShort,
                limit: limit,
                cursor: cursor,
                level: level,
                extent: extent,
            });

            const submodels = (result.result ?? []).map(convertApiSubmodelToCoreSubmodel);

            return {
                success: true,
                data: { pagedResult: result.paging_metadata, result: submodels },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns all Submodels in metadata representation
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
            const encodedSemanticId = semanticId ? base64Encode(JSON.stringify(semanticId)) : undefined;

            const result = await apiInstance.getAllSubmodelsMetadata({
                semanticId: encodedSemanticId,
                idShort: idShort,
                limit: limit,
                cursor: cursor,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns all Submodels in value-only representation
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
            const encodedSemanticId = semanticId ? base64Encode(JSON.stringify(semanticId)) : undefined;

            const result = await apiInstance.getAllSubmodelsValueOnly({
                semanticId: encodedSemanticId,
                idShort: idShort,
                limit: limit,
                cursor: cursor,
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
     * Returns references to all Submodels
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
            const encodedSemanticId = semanticId ? base64Encode(JSON.stringify(semanticId)) : undefined;

            const result = await apiInstance.getAllSubmodelsReference({
                semanticId: encodedSemanticId,
                idShort: idShort,
                limit: limit,
                cursor: cursor,
                level: level,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns paths of all Submodels
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
            const encodedSemanticId = semanticId ? base64Encode(JSON.stringify(semanticId)) : undefined;

            const result = await apiInstance.getAllSubmodelsPath({
                semanticId: encodedSemanticId,
                idShort: idShort,
                limit: limit,
                cursor: cursor,
                level: level,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            const result = await apiInstance.postSubmodel({
                submodel: convertCoreSubmodelToApiSubmodel(submodel),
            });

            return { success: true, data: convertApiSubmodelToCoreSubmodel(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.deleteSubmodelById({
                submodelIdentifier: encodedSubmodelIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelById({
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
     * Returns a specific Submodel in reference representation
     */
    async getSubmodelByIdReference(options: {
        configuration: Configuration;
        submodelIdentifier: string;
    }): Promise<ApiResult<SubmodelRepositoryService.Reference, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelByIdReference({
                submodelIdentifier: encodedSubmodelIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns a specific Submodel in path representation
     */
    async getSubmodelByIdPath(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        level?: SubmodelRepositoryService.GetSubmodelByIdPathLevelEnum;
    }): Promise<ApiResult<string[], SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, level } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelByIdPath({
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.putSubmodelById({
                submodelIdentifier: encodedSubmodelIdentifier,
                submodel: convertCoreSubmodelToApiSubmodel(submodel),
            });

            return { success: true, data: result ? convertApiSubmodelToCoreSubmodel(result) : undefined };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Updates an existing Submodel partially
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.patchSubmodelById({
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getAllSubmodelElements({
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
                level: level,
                extent: extent,
            });

            const submodelElements = (result.result ?? []).map(convertApiSubmodelElementToCoreSubmodelElement);

            return {
                success: true,
                data: { pagedResult: result.paging_metadata, result: submodelElements },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns all submodel elements in metadata representation
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getAllSubmodelElementsMetadataSubmodelRepo({
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns all submodel elements in value-only representation
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getAllSubmodelElementsValueOnlySubmodelRepo({
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
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
     * Returns references to all submodel elements
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getAllSubmodelElementsReferenceSubmodelRepo({
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
                level: level,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns paths of all submodel elements
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getAllSubmodelElementsPathSubmodelRepo({
                submodelIdentifier: encodedSubmodelIdentifier,
                limit: limit,
                cursor: cursor,
                level: level,
            });

            return { success: true, data: result };
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.postSubmodelElementSubmodelRepo({
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelElementByPathSubmodelRepo({
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
     * Returns metadata attributes of a specific submodel element
     */
    async getSubmodelElementByPathMetadata(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
    }): Promise<ApiResult<SubmodelRepositoryService.SubmodelElementMetadata, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelElementByPathMetadataSubmodelRepo({
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
     * Returns a specific submodel element in reference representation
     */
    async getSubmodelElementByPathReference(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
    }): Promise<ApiResult<SubmodelRepositoryService.Reference, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelElementByPathReferenceSubmodelRepo({
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
     * Returns a specific submodel element in path representation
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelElementByPathPathSubmodelRepo({
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.postSubmodelElementByPathSubmodelRepo({
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.deleteSubmodelElementByPathSubmodelRepo({
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.putSubmodelElementByPathSubmodelRepo({
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                submodelElement: convertCoreSubmodelElementToApiSubmodelElement(submodelElement),
                level: level,
            });

            return { success: true, data: result ? convertApiSubmodelElementToCoreSubmodelElement(result) : undefined };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Updates values of an existing submodel element at a specified path
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.patchSubmodelElementByPathSubmodelRepo({
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelByIdMetadata({
                submodelIdentifier: encodedSubmodelIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Updates metadata attributes of an existing Submodel
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.patchSubmodelByIdMetadata({
                submodelIdentifier: encodedSubmodelIdentifier,
                submodelMetadata: submodelMetadata,
                level: level,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelByIdValueOnly({
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
    //  * Updates the values of an existing Submodel
    //  *
    //  * @param options Object containing:
    //  *  - configuration: The http request options
    //  *  - submodelIdentifier: The Submodel’s unique id
    //  *  - level?: Determines the structural depth of the respective resource content
    //  *
    //  * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
    //  */
    async patchSubmodelByIdValueOnly(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        body: object;
        level?: SubmodelRepositoryService.PatchSubmodelByIdValueOnlyLevelEnum;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, body, level } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.patchSubmodelByIdValueOnly({
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelElementByPathValueOnlySubmodelRepo({
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
    //  * Updates the value of an existing SubmodelElement
    //  *
    //  * @param options Object containing:
    //  *  - configuration: The http request options
    //  *  - submodelIdentifier: The Submodel’s unique id
    //  *  - idShortPath: IdShort path to the submodel element (dot-separated) 
    //  *  - submodelElementValue: SubmodelElementValue object
    //  *  - level?: Determines the structural depth of the respective resource content
    //  *
    //  * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
    //  */
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.patchSubmodelElementByPathValueOnlySubmodelRepo({
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
     * Updates metadata attributes of an existing SubmodelElement
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.patchSubmodelElementByPathMetadataSubmodelRepo({
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
     * Returns file content for a submodel element at a specified path
     */
    async getFileByPath(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
    }): Promise<ApiResult<Blob, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getFileByPathSubmodelRepo({
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
     * Updates file content for a submodel element at a specified path
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.putFileByPathSubmodelRepo({
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
     * Deletes file content of an existing submodel element at a specified path
     */
    async deleteFileByPath(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        idShortPath: string;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, idShortPath } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.deleteFileByPathSubmodelRepo({
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.invokeOperationSubmodelRepo({
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                operationRequest: operationRequest,
                //async: async,
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

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.invokeOperationValueOnly({
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.invokeOperationAsync({
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

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.invokeOperationAsyncValueOnly({
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
     * Returns status of an asynchronously invoked operation
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getOperationAsyncStatus({
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                handleId: handleId,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns result of an asynchronously invoked operation
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getOperationAsyncResult({
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                handleId: handleId,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns result of an asynchronously invoked operation in value-only representation
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

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getOperationAsyncResultValueOnly({
                submodelIdentifier: encodedSubmodelIdentifier,
                idShortPath: idShortPath,
                handleId: handleId,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns an appropriate serialization based on the specified format
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

            const result = await apiInstance.generateSerializationByIds({
                aasIds: aasIds,
                submodelIds: submodelIds,
                includeConceptDescriptions: includeConceptDescriptions,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns the self-describing information of a network resource (ServiceDescription)
     */
    async getSelfDescription(options: {
        configuration: Configuration;
    }): Promise<ApiResult<SubmodelRepositoryService.ServiceDescription, SubmodelRepositoryService.Result>> {
        const { configuration } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.DescriptionAPIApi(applyDefaults(configuration));

            const result = await apiInstance.getSelfDescription();

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }
}
