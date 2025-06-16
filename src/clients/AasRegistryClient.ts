//import type { AssetKind } from '@aas-core-works/aas-core3.0-typescript/types';
import type { ApiResult } from '../models/api';
import { AasRegistryService } from '../generated';
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import {
    convertApiAasDescriptorToCoreAasDescriptor,
    convertCoreAasDescriptorToApiAasDescriptor,
} from '../lib/convertAasDescriptorTypes';
import { handleApiError } from '../lib/errorHandler';
import {
    AssetAdministrationShellDescriptor,
    // SubmodelDescriptor
} from '../models/Descriptors';

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
        configuration: AasRegistryService.Configuration;
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
            console.log('all aas descriptors:', aasDescriptors);
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
        configuration: AasRegistryService.Configuration;
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
            console.log('created aas descriptor:', result);
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
        configuration: AasRegistryService.Configuration;
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
        configuration: AasRegistryService.Configuration;
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
        configuration: AasRegistryService.Configuration;
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
}
