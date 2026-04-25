import type { ApiResult } from '../models/api';
import { SubmodelRegistryService } from '../generated';
import { Configuration, RequiredError } from '../generated/runtime';
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import {
    convertApiSubmodelDescriptorToCoreSubmodelDescriptor,
    convertCoreSubmodelDescriptorToApiSubmodelDescriptor,
} from '../lib/convertAasDescriptorTypes';
import { handleApiError } from '../lib/errorHandler';
import { SubmodelDescriptor } from '../models/Descriptors';

export class SubmodelRegistryClient {
    private static requireIdentifier(value: string | null | undefined, field: string): string {
        if (value === null || value === undefined || value.trim() === '') {
            throw new RequiredError(field, `Required parameter "${field}" was null, undefined, or empty.`);
        }

        return value;
    }

    private static extractStatusCode(err: unknown, parsedError?: SubmodelRegistryService.Result): number | undefined {
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

            const response = await apiInstance.getAllSubmodelDescriptorsRaw({
                limit: limit,
                cursor: cursor,
            });
            const result = await response.value();
            const submodelDescriptors = (result.result ?? []).map(convertApiSubmodelDescriptorToCoreSubmodelDescriptor);

            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: submodelDescriptors },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRegistryClient.extractStatusCode(err, customError),
            };
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

            const response = await apiInstance.postSubmodelDescriptorRaw({
                submodelDescriptor: convertCoreSubmodelDescriptorToApiSubmodelDescriptor(submodelDescriptor),
            });
            const result = await response.value();

            return {
                success: true,
                data: convertApiSubmodelDescriptorToCoreSubmodelDescriptor(result),
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRegistryClient.extractStatusCode(err, customError),
            };
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

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRegistryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.deleteSubmodelDescriptorByIdRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRegistryClient.extractStatusCode(err, customError),
            };
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

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRegistryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getSubmodelDescriptorByIdRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
            });
            const result = await response.value();

            return {
                success: true,
                data: convertApiSubmodelDescriptorToCoreSubmodelDescriptor(result),
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRegistryClient.extractStatusCode(err, customError),
            };
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

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRegistryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.putSubmodelDescriptorByIdRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
                submodelDescriptor: convertCoreSubmodelDescriptorToApiSubmodelDescriptor(submodelDescriptor),
            });

            if (response.raw.status === 204) {
                return {
                    success: true,
                    data: undefined,
                    statusCode: response.raw.status,
                };
            }

            const result = await response.value();

            return {
                success: true,
                data: result ? convertApiSubmodelDescriptorToCoreSubmodelDescriptor(result) : undefined,
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRegistryClient.extractStatusCode(err, customError),
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
    }): Promise<ApiResult<SubmodelRegistryService.ServiceDescription, SubmodelRegistryService.Result>> {
        const { configuration } = options;

        try {
            const apiInstance = new SubmodelRegistryService.DescriptionAPIApi(applyDefaults(configuration));
            const response = await apiInstance.getSelfDescriptionRaw();
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRegistryClient.extractStatusCode(err, customError),
            };
        }
    }
}
