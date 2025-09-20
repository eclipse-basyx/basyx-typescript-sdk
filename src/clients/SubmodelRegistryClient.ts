import type { ApiResult } from '../models/api';
import { SubmodelRegistryService } from '../generated';
import { Configuration } from '../generated/runtime';
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import {
    convertApiSubmodelDescriptorToCoreSubmodelDescriptor,
    convertCoreSubmodelDescriptorToApiSubmodelDescriptor,
} from '../lib/convertAasDescriptorTypes';
import { handleApiError } from '../lib/errorHandler';
import { SubmodelDescriptor } from '../models/Descriptors';

export class SubmodelRegistryClient {
    /**
     * Returns all Submodel Descriptors
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllSubmodelDescriptors(options: {
        configuration: Configuration;
        limit?: number;
        cursor?: string;
    }): Promise<
        ApiResult<
            {
                pagedResult: SubmodelRegistryService.PagedResultPagingMetadata | undefined;
                result: SubmodelDescriptor[];
            },
            SubmodelRegistryService.Result
        >
    > {
        const { configuration, limit, cursor } = options;

        try {
            const apiInstance = new SubmodelRegistryService.SubmodelRegistryAPIApi(applyDefaults(configuration));

            const result = await apiInstance.getAllSubmodelDescriptors({
                limit: limit,
                cursor: cursor,
            });
            const submodelDescriptors = (result.result ?? []).map(convertApiSubmodelDescriptorToCoreSubmodelDescriptor);

            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: submodelDescriptors },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Creates a new Submodel Descriptor, i.e. registers a Submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - submodelDescriptor: Submodel Descriptor object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postSubmodelDescriptor(options: {
        configuration: Configuration;
        submodelDescriptor: SubmodelDescriptor;
    }): Promise<ApiResult<SubmodelDescriptor, SubmodelRegistryService.Result>> {
        const { configuration, submodelDescriptor } = options;

        try {
            const apiInstance = new SubmodelRegistryService.SubmodelRegistryAPIApi(applyDefaults(configuration));

            const result = await apiInstance.postSubmodelDescriptor({
                submodelDescriptor: convertCoreSubmodelDescriptorToApiSubmodelDescriptor(submodelDescriptor),
            });

            return { success: true, data: convertApiSubmodelDescriptorToCoreSubmodelDescriptor(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Deletes a Submodel Descriptor, i.e. de-registers a Submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteSubmodelDescriptorById(options: {
        configuration: Configuration;
        submodelIdentifier: string;
    }): Promise<ApiResult<void, SubmodelRegistryService.Result>> {
        const { configuration, submodelIdentifier } = options;

        try {
            const apiInstance = new SubmodelRegistryService.SubmodelRegistryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.deleteSubmodelDescriptorById({
                submodelIdentifier: encodedSubmodelIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns a specific Submodel Descriptor
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelDescriptorById(options: {
        configuration: Configuration;
        submodelIdentifier: string;
    }): Promise<ApiResult<SubmodelDescriptor, SubmodelRegistryService.Result>> {
        const { configuration, submodelIdentifier } = options;

        try {
            const apiInstance = new SubmodelRegistryService.SubmodelRegistryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelDescriptorById({
                submodelIdentifier: encodedSubmodelIdentifier,
            });

            return { success: true, data: convertApiSubmodelDescriptorToCoreSubmodelDescriptor(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Creates or updates an existing Submodel Descriptor
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     *  - submodelDescriptor: Submodel Descriptor object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putSubmodelDescriptorById(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        submodelDescriptor: SubmodelDescriptor;
    }): Promise<ApiResult<SubmodelDescriptor | void, SubmodelRegistryService.Result>> {
        const { configuration, submodelIdentifier, submodelDescriptor } = options;

        try {
            const apiInstance = new SubmodelRegistryService.SubmodelRegistryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.putSubmodelDescriptorById({
                submodelIdentifier: encodedSubmodelIdentifier,
                submodelDescriptor: convertCoreSubmodelDescriptorToApiSubmodelDescriptor(submodelDescriptor),
            });

            return {
                success: true,
                data: result ? convertApiSubmodelDescriptorToCoreSubmodelDescriptor(result) : undefined,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }
}
