import type { SpecificAssetId } from '@aas-core-works/aas-core3.0-typescript/types';
import type { ApiResult } from '../models/api';
import type { AssetId } from '../models/AssetId';
import { AasDiscoveryService } from '../generated';
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import { convertApiAssetIdToCoreAssetId, convertCoreAssetIdToApiAssetId } from '../lib/convertAasDiscoveryTypes';
import { handleApiError } from '../lib/errorHandler';

export class AasDiscoveryClient {
    /**
     * Returns a list of Asset Administration Shell IDs linked to specific asset identifiers or the global asset ID
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - assetIds?: A list of specific Asset identifiers
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllAssetAdministrationShellIdsByAssetLink(options: {
        configuration: AasDiscoveryService.Configuration;
        assetIds?: AssetId[];
        limit?: number;
        cursor?: string;
    }): Promise<
        ApiResult<
            {
                pagedResult: AasDiscoveryService.PagedResultPagingMetadata | undefined;
                result: string[];
            },
            AasDiscoveryService.Result
        >
    > {
        const { configuration, assetIds, limit, cursor } = options;

        try {
            const apiInstance = new AasDiscoveryService.AssetAdministrationShellBasicDiscoveryAPIApi(
                applyDefaults(configuration)
            );
            const encodedAssetIds = assetIds?.map((id) => base64Encode(JSON.stringify(id)));

            const result = await apiInstance.getAllAssetAdministrationShellIdsByAssetLink({
                assetIds: encodedAssetIds,
                limit: limit,
                cursor: cursor,
            });

            const shellIds = result.result ?? [];
            console.log('all shellIds:', shellIds);
            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: shellIds },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Creates specific asset identifiers linked to an Asset Administration Shell to edit discoverable content
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - specificAssetId: A set of specific asset identifiers
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postAllAssetLinksById(options: {
        configuration: AasDiscoveryService.Configuration;
        aasIdentifier: string;
        specificAssetId: Array<SpecificAssetId>;
    }): Promise<ApiResult<Array<SpecificAssetId>, AasDiscoveryService.Result>> {
        const { configuration, aasIdentifier, specificAssetId } = options;

        try {
            const apiInstance = new AasDiscoveryService.AssetAdministrationShellBasicDiscoveryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.postAllAssetLinksById({
                aasIdentifier: encodedAasIdentifier,
                specificAssetId: specificAssetId.map(convertCoreAssetIdToApiAssetId),
            });
            console.log('created asset links:', result);
            return { success: true, data: result.map(convertApiAssetIdToCoreAssetId) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Deletes specified specific asset identifiers linked to an Asset Administration Shell
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteAllAssetLinksById(options: {
        configuration: AasDiscoveryService.Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<void, AasDiscoveryService.Result>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasDiscoveryService.AssetAdministrationShellBasicDiscoveryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.deleteAllAssetLinksById({
                aasIdentifier: encodedAasIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    /**
     * Returns a list of specific asset identifiers based on an Asset Administration Shell ID to edit discoverable content.
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllAssetLinksById(options: {
        configuration: AasDiscoveryService.Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<Array<SpecificAssetId>, AasDiscoveryService.Result>> {
        
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasDiscoveryService.AssetAdministrationShellBasicDiscoveryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const result = await apiInstance.getAllAssetLinksById({
                aasIdentifier: encodedAasIdentifier,
            });

            return { success: true, data: result.map(convertApiAssetIdToCoreAssetId) };
            
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }
}
