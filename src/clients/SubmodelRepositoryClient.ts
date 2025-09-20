import type { ISubmodelElement, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
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
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
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
                data: { pagedResult: result.pagingMetadata, result: submodels },
            };
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
     * Returns all submodel elements including their hierarchy
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
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
}
