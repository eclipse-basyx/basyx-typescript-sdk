import type { ApiResult, ConditionalApiResult } from '../models/api';
import { SubmodelRegistryService } from '../generated';
import { Configuration, RequiredError } from '../generated/runtime';
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import { getConditionalErrorFields, getEtag, getNotModifiedResult } from '../lib/conditionalRequests';
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
     *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
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
            const pagedResult = result.paging_metadata;

            return {
                success: true,
                data: { pagedResult, result: submodelDescriptors },
                statusCode: response.raw.status,
                etag: getEtag(response.raw),
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRegistryClient.extractStatusCode(err, customError),
                ...getConditionalErrorFields(err),
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
                etag: getEtag(response.raw),
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRegistryClient.extractStatusCode(err, customError),
                ...getConditionalErrorFields(err),
            };
        }
    }

    /**
     * Deletes a Submodel Descriptor, i.e. de-registers a Submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     *  - ifMatch?: Sent as `If-Match` header; the request fails with `preconditionFailed` if the resource has changed since the `etag` was issued
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteSubmodelDescriptorById(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        ifMatch?: string;
    }): Promise<ApiResult<void, SubmodelRegistryService.Result>> {
        const { configuration, submodelIdentifier, ifMatch } = options;

        try {
            const apiInstance = new SubmodelRegistryService.SubmodelRegistryAPIApi(
                applyDefaults(configuration, { ifMatch })
            );

            const encodedSubmodelIdentifier = base64Encode(
                SubmodelRegistryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.deleteSubmodelDescriptorByIdRaw({
                submodelIdentifier: encodedSubmodelIdentifier,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status, etag: getEtag(response.raw) };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRegistryClient.extractStatusCode(err, customError),
                ...getConditionalErrorFields(err),
            };
        }
    }

    /**
     * Returns a specific Submodel Descriptor
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - submodelIdentifier: The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     *  - ifNoneMatch?: Sent as `If-None-Match` header; returns `{ success: true; notModified: true }` without data if the representation still has this `etag`
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelDescriptorById<IfNoneMatch extends string | undefined = undefined>(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        ifNoneMatch?: IfNoneMatch;
    }): Promise<ConditionalApiResult<SubmodelDescriptor, SubmodelRegistryService.Result, IfNoneMatch>> {
        const { configuration, submodelIdentifier, ifNoneMatch } = options;

        try {
            const apiInstance = new SubmodelRegistryService.SubmodelRegistryAPIApi(
                applyDefaults(configuration, { ifNoneMatch })
            );

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
                etag: getEtag(response.raw),
            };
        } catch (err) {
            const notModified = getNotModifiedResult(err, ifNoneMatch);
            if (notModified) {
                return notModified;
            }

            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRegistryClient.extractStatusCode(err, customError),
                ...getConditionalErrorFields(err),
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
     *  - ifMatch?: Sent as `If-Match` header; the request fails with `preconditionFailed` if the resource has changed since the `etag` was issued
     *  - ifNoneMatch?: Sent as `If-None-Match` header; use `*` to only create the resource (fails with `preconditionFailed` if it exists)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putSubmodelDescriptorById(options: {
        configuration: Configuration;
        submodelIdentifier: string;
        submodelDescriptor: SubmodelDescriptor;
        ifMatch?: string;
        ifNoneMatch?: string;
    }): Promise<ApiResult<SubmodelDescriptor | void, SubmodelRegistryService.Result>> {
        const { configuration, submodelIdentifier, submodelDescriptor, ifMatch, ifNoneMatch } = options;

        try {
            const apiInstance = new SubmodelRegistryService.SubmodelRegistryAPIApi(
                applyDefaults(configuration, { ifMatch, ifNoneMatch })
            );

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
                    etag: getEtag(response.raw),
                };
            }

            const result = await response.value();

            return {
                success: true,
                data: result ? convertApiSubmodelDescriptorToCoreSubmodelDescriptor(result) : undefined,
                statusCode: response.raw.status,
                etag: getEtag(response.raw),
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRegistryClient.extractStatusCode(err, customError),
                ...getConditionalErrorFields(err),
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

            return { success: true, data: result, statusCode: response.raw.status, etag: getEtag(response.raw) };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: SubmodelRegistryClient.extractStatusCode(err, customError),
                ...getConditionalErrorFields(err),
            };
        }
    }
}
