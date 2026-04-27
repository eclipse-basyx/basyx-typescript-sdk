//import type { AssetKind } from '@aas-core-works/aas-core3.1-typescript/types';
import type { ApiResult } from '../models/api';
import { AasRegistryService } from '../generated';
import { Configuration, RequiredError } from '../generated/runtime';
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import {
    convertApiAasDescriptorToCoreAasDescriptor,
    convertApiSubmodelDescriptorToCoreSubmodelDescriptor,
    convertCoreAasDescriptorToApiAasDescriptor,
    convertCoreSubmodelDescriptorToApiSubmodelDescriptor,
} from '../lib/convertAasDescriptorTypes';
import { handleApiError } from '../lib/errorHandler';
import { AssetAdministrationShellDescriptor, SubmodelDescriptor } from '../models/Descriptors';

export class AasRegistryClient {
    private static requireIdentifier(value: string | null | undefined, field: string): string {
        if (value === null || value === undefined || value.trim() === '') {
            throw new RequiredError(field, `Required parameter "${field}" was null, undefined, or empty.`);
        }

        return value;
    }

    private static extractStatusCode(err: unknown, parsedError?: AasRegistryService.Result): number | undefined {
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
     * Returns all Asset Administration Shell Descriptors
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *  - assetKind?: The Asset's kind (Instance or Type)
     *  - assetType?: The Asset's type (UTF8-BASE64-URL-encoded)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllAssetAdministrationShellDescriptors(options: {
        configuration: Configuration;
        limit?: number;
        cursor?: string;
        assetKind?: AasRegistryService.AssetKind;
        assetType?: string;
    }): Promise<
        ApiResult<
            {
                pagedResult: AasRegistryService.PagedResultPagingMetadata | undefined;
                result: AssetAdministrationShellDescriptor[];
            },
            AasRegistryService.Result
        >
    > {
        const { configuration, limit, cursor, assetKind, assetType } = options;

        try {
            const apiInstance = new AasRegistryService.AssetAdministrationShellRegistryAPIApi(
                applyDefaults(configuration)
            );
            const encodedAssetType = assetType ? base64Encode(assetType) : undefined;

            const response = await apiInstance.getAllAssetAdministrationShellDescriptorsRaw({
                limit: limit,
                cursor: cursor,
                assetKind: assetKind,
                assetType: encodedAssetType,
            });
            const result = await response.value();
            const aasDescriptors = (result.result ?? []).map(convertApiAasDescriptorToCoreAasDescriptor);
            const pagedResult =
                result.pagingMetadata ??
                (result as typeof result & { paging_metadata?: AasRegistryService.PagedResultPagingMetadata })
                    .paging_metadata;

            return {
                success: true,
                data: { pagedResult, result: aasDescriptors },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRegistryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Creates a new Asset Administration Shell Descriptor, i.e. registers an AAS
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - assetAdministrationShellDescriptor: Asset Administration Shell Descriptor object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postAssetAdministrationShellDescriptor(options: {
        configuration: Configuration;
        assetAdministrationShellDescriptor: AssetAdministrationShellDescriptor;
    }): Promise<ApiResult<AssetAdministrationShellDescriptor, AasRegistryService.Result>> {
        const { configuration, assetAdministrationShellDescriptor } = options;

        try {
            const apiInstance = new AasRegistryService.AssetAdministrationShellRegistryAPIApi(
                applyDefaults(configuration)
            );

            const response = await apiInstance.postAssetAdministrationShellDescriptorRaw({
                assetAdministrationShellDescriptor: convertCoreAasDescriptorToApiAasDescriptor(
                    assetAdministrationShellDescriptor
                ),
            });
            const result = await response.value();

            return {
                success: true,
                data: convertApiAasDescriptorToCoreAasDescriptor(result),
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRegistryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Deletes an Asset Administration Shell Descriptor, i.e. de-registers an AAS
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteAssetAdministrationShellDescriptorById(options: {
        configuration: Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<void, AasRegistryService.Result>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasRegistryService.AssetAdministrationShellRegistryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(
                AasRegistryClient.requireIdentifier(aasIdentifier, 'aasIdentifier')
            );

            const response = await apiInstance.deleteAssetAdministrationShellDescriptorByIdRaw({
                aasIdentifier: encodedAasIdentifier,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRegistryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns a specific Asset Administration Shell Descriptor
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAssetAdministrationShellDescriptorById(options: {
        configuration: Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<AssetAdministrationShellDescriptor, AasRegistryService.Result>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasRegistryService.AssetAdministrationShellRegistryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(
                AasRegistryClient.requireIdentifier(aasIdentifier, 'aasIdentifier')
            );

            const response = await apiInstance.getAssetAdministrationShellDescriptorByIdRaw({
                aasIdentifier: encodedAasIdentifier,
            });
            const result = await response.value();

            return {
                success: true,
                data: convertApiAasDescriptorToCoreAasDescriptor(result),
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRegistryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Creates or updates an existing Asset Administration Shell Descriptor
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     *  - assetAdministrationShellDescriptor: Asset Administration Shell Descriptor object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putAssetAdministrationShellDescriptorById(options: {
        configuration: Configuration;
        aasIdentifier: string;
        assetAdministrationShellDescriptor: AssetAdministrationShellDescriptor;
    }): Promise<ApiResult<AssetAdministrationShellDescriptor | void, AasRegistryService.Result>> {
        const { configuration, aasIdentifier, assetAdministrationShellDescriptor } = options;

        try {
            const apiInstance = new AasRegistryService.AssetAdministrationShellRegistryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(
                AasRegistryClient.requireIdentifier(aasIdentifier, 'aasIdentifier')
            );

            const response = await apiInstance.putAssetAdministrationShellDescriptorByIdRaw({
                aasIdentifier: encodedAasIdentifier,
                assetAdministrationShellDescriptor: convertCoreAasDescriptorToApiAasDescriptor(
                    assetAdministrationShellDescriptor
                ),
            });

            if (response.raw.status === 204) {
                return { success: true, data: undefined, statusCode: response.raw.status };
            }

            const result = await response.value();

            return {
                success: true,
                data: result ? convertApiAasDescriptorToCoreAasDescriptor(result) : undefined,
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRegistryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns all Submodel Descriptors
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllSubmodelDescriptorsThroughSuperpath(options: {
        configuration: Configuration;
        aasIdentifier: string;
        limit?: number;
        cursor?: string;
    }): Promise<
        ApiResult<
            {
                pagedResult: AasRegistryService.PagedResultPagingMetadata | undefined;
                result: SubmodelDescriptor[];
            },
            AasRegistryService.Result
        >
    > {
        const { configuration, aasIdentifier, limit, cursor } = options;

        try {
            const apiInstance = new AasRegistryService.AssetAdministrationShellRegistryAPIApi(
                applyDefaults(configuration)
            );
            const encodedAasIdentifier = base64Encode(
                AasRegistryClient.requireIdentifier(aasIdentifier, 'aasIdentifier')
            );

            const response = await apiInstance.getAllSubmodelDescriptorsThroughSuperpathRaw({
                aasIdentifier: encodedAasIdentifier,
                limit: limit,
                cursor: cursor,
            });
            const result = await response.value();
            const submodelDescriptors = (result.result ?? []).map(convertApiSubmodelDescriptorToCoreSubmodelDescriptor);
            const pagedResult =
                result.pagingMetadata ??
                (result as typeof result & { paging_metadata?: AasRegistryService.PagedResultPagingMetadata })
                    .paging_metadata;

            return {
                success: true,
                data: { pagedResult, result: submodelDescriptors },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRegistryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Creates a new Submodel Descriptor, i.e. registers a submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - aasIdentifier: The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     *  - submodelDescriptor: Submodel Descriptor object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postSubmodelDescriptorThroughSuperpath(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelDescriptor: SubmodelDescriptor;
    }): Promise<ApiResult<SubmodelDescriptor, AasRegistryService.Result>> {
        const { configuration, aasIdentifier, submodelDescriptor } = options;

        try {
            const apiInstance = new AasRegistryService.AssetAdministrationShellRegistryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(
                AasRegistryClient.requireIdentifier(aasIdentifier, 'aasIdentifier')
            );

            const response = await apiInstance.postSubmodelDescriptorThroughSuperpathRaw({
                aasIdentifier: encodedAasIdentifier,
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
                statusCode: AasRegistryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns a specific Submodel Descriptor
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     *  - submodelIdentifier: The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSubmodelDescriptorByIdThroughSuperpath(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
    }): Promise<ApiResult<SubmodelDescriptor, AasRegistryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier } = options;

        try {
            const apiInstance = new AasRegistryService.AssetAdministrationShellRegistryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(
                AasRegistryClient.requireIdentifier(aasIdentifier, 'aasIdentifier')
            );
            const encodedSubmodelIdentifier = base64Encode(
                AasRegistryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.getSubmodelDescriptorByIdThroughSuperpathRaw({
                aasIdentifier: encodedAasIdentifier,
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
                statusCode: AasRegistryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Deletes a Submodel Descriptor, i.e. de-registers a submodel
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     *  - submodelIdentifier: The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteSubmodelDescriptorByIdThroughSuperpath(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
    }): Promise<ApiResult<void, AasRegistryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier } = options;

        try {
            const apiInstance = new AasRegistryService.AssetAdministrationShellRegistryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(
                AasRegistryClient.requireIdentifier(aasIdentifier, 'aasIdentifier')
            );
            const encodedSubmodelIdentifier = base64Encode(
                AasRegistryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.deleteSubmodelDescriptorByIdThroughSuperpathRaw({
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
                statusCode: AasRegistryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Creates or updates an existing Submodel Descriptor
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     *  - submodelIdentifier: The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     *  - submodelDescriptor: Submodel Descriptor object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putSubmodelDescriptorByIdThroughSuperpath(options: {
        configuration: Configuration;
        aasIdentifier: string;
        submodelIdentifier: string;
        submodelDescriptor: SubmodelDescriptor;
    }): Promise<ApiResult<SubmodelDescriptor | void, AasRegistryService.Result>> {
        const { configuration, aasIdentifier, submodelIdentifier, submodelDescriptor } = options;

        try {
            const apiInstance = new AasRegistryService.AssetAdministrationShellRegistryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(
                AasRegistryClient.requireIdentifier(aasIdentifier, 'aasIdentifier')
            );
            const encodedSubmodelIdentifier = base64Encode(
                AasRegistryClient.requireIdentifier(submodelIdentifier, 'submodelIdentifier')
            );

            const response = await apiInstance.putSubmodelDescriptorByIdThroughSuperpathRaw({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
                submodelDescriptor: convertCoreSubmodelDescriptorToApiSubmodelDescriptor(submodelDescriptor),
            });

            if (response.raw.status === 204) {
                return { success: true, data: undefined, statusCode: response.raw.status };
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
                statusCode: AasRegistryClient.extractStatusCode(err, customError),
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
    }): Promise<ApiResult<AasRegistryService.ServiceDescription, AasRegistryService.Result>> {
        const { configuration } = options;

        try {
            const apiInstance = new AasRegistryService.DescriptionAPIApi(applyDefaults(configuration));
            const response = await apiInstance.getSelfDescriptionRaw();
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasRegistryClient.extractStatusCode(err, customError),
            };
        }
    }
}
