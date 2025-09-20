//import type { AssetKind } from '@aas-core-works/aas-core3.0-typescript/types';
import type { ApiResult } from '../models/api';
import { AasRegistryService } from '../generated';
import { Configuration } from '../generated/runtime';
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

            const result = await apiInstance.getAllAssetAdministrationShellDescriptors({
                limit: limit,
                cursor: cursor,
                assetKind: assetKind,
                assetType: encodedAssetType,
            });
            const aasDescriptors = (result.result ?? []).map(convertApiAasDescriptorToCoreAasDescriptor);

            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: aasDescriptors },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            const result = await apiInstance.postAssetAdministrationShellDescriptor({
                assetAdministrationShellDescriptor: convertCoreAasDescriptorToApiAasDescriptor(
                    assetAdministrationShellDescriptor
                ),
            });

            return { success: true, data: convertApiAasDescriptorToCoreAasDescriptor(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.deleteAssetAdministrationShellDescriptorById({
                aasIdentifier: encodedAasIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.getAssetAdministrationShellDescriptorById({
                aasIdentifier: encodedAasIdentifier,
            });

            return { success: true, data: convertApiAasDescriptorToCoreAasDescriptor(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.putAssetAdministrationShellDescriptorById({
                aasIdentifier: encodedAasIdentifier,
                assetAdministrationShellDescriptor: convertCoreAasDescriptorToApiAasDescriptor(
                    assetAdministrationShellDescriptor
                ),
            });

            return { success: true, data: result ? convertApiAasDescriptorToCoreAasDescriptor(result) : undefined };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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
            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.getAllSubmodelDescriptorsThroughSuperpath({
                aasIdentifier: encodedAasIdentifier,
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

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.postSubmodelDescriptorThroughSuperpath({
                aasIdentifier: encodedAasIdentifier,
                submodelDescriptor: convertCoreSubmodelDescriptorToApiSubmodelDescriptor(submodelDescriptor),
            });

            return { success: true, data: convertApiSubmodelDescriptorToCoreSubmodelDescriptor(result) };
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

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelDescriptorByIdThroughSuperpath({
                aasIdentifier: encodedAasIdentifier,
                submodelIdentifier: encodedSubmodelIdentifier,
            });

            return { success: true, data: convertApiSubmodelDescriptorToCoreSubmodelDescriptor(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.deleteSubmodelDescriptorByIdThroughSuperpath({
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

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.putSubmodelDescriptorByIdThroughSuperpath({
                aasIdentifier: encodedAasIdentifier,
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
