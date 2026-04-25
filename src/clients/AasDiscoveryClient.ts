import type { SpecificAssetId } from '@aas-core-works/aas-core3.1-typescript/types';
import type { ApiResult } from '../models/api';
import type { AssetId } from '../models/AssetId';
import { AasDiscoveryService } from '../generated';
import { Configuration, RequiredError } from '../generated/runtime';
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import { convertApiAssetIdToCoreAssetId, convertCoreAssetIdToApiAssetId } from '../lib/convertAasDiscoveryTypes';
import { handleApiError } from '../lib/errorHandler';

export class AasDiscoveryClient {
    private static extractStatusCode(err: unknown, parsedError?: AasDiscoveryService.Result): number | undefined {
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
        configuration: Configuration;
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

            const response = await apiInstance.getAllAssetAdministrationShellIdsByAssetLinkRaw({
                assetIds: encodedAssetIds,
                limit: limit,
                cursor: cursor,
            });
            const result = await response.value();

            const shellIds = result.result ?? [];

            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: shellIds },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasDiscoveryClient.extractStatusCode(err, customError),
            };
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
        configuration: Configuration;
        aasIdentifier: string;
        specificAssetId: Array<SpecificAssetId>;
    }): Promise<ApiResult<Array<SpecificAssetId>, AasDiscoveryService.Result>> {
        const { configuration, aasIdentifier, specificAssetId } = options;

        try {
            const apiInstance = new AasDiscoveryService.AssetAdministrationShellBasicDiscoveryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const response = await apiInstance.postAllAssetLinksByIdRaw({
                aasIdentifier: encodedAasIdentifier,
                specificAssetId: specificAssetId.map(convertCoreAssetIdToApiAssetId),
            });
            const result = await response.value();

            return {
                success: true,
                data: result.map(convertApiAssetIdToCoreAssetId),
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasDiscoveryClient.extractStatusCode(err, customError),
            };
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
        configuration: Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<void, AasDiscoveryService.Result>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasDiscoveryService.AssetAdministrationShellBasicDiscoveryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const response = await apiInstance.deleteAllAssetLinksByIdRaw({
                aasIdentifier: encodedAasIdentifier,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasDiscoveryClient.extractStatusCode(err, customError),
            };
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
        configuration: Configuration;
        aasIdentifier: string;
    }): Promise<ApiResult<Array<SpecificAssetId>, AasDiscoveryService.Result>> {
        const { configuration, aasIdentifier } = options;

        try {
            const apiInstance = new AasDiscoveryService.AssetAdministrationShellBasicDiscoveryAPIApi(
                applyDefaults(configuration)
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const response = await apiInstance.getAllAssetLinksByIdRaw({
                aasIdentifier: encodedAasIdentifier,
            });
            const result = await response.value();

            return {
                success: true,
                data: result.map(convertApiAssetIdToCoreAssetId),
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasDiscoveryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns a list of Asset Administration Shell IDs linked to specific asset identifiers or the global asset ID
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - assetLink?: A list of specific Asset identifiers
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async searchAllAssetAdministrationShellIdsByAssetLink(options: {
        configuration: Configuration;
        assetLink?: AssetId[];
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
        const { configuration, assetLink, limit, cursor } = options;

        try {
            const apiInstance = new AasDiscoveryService.AssetAdministrationShellBasicDiscoveryAPIApi(
                applyDefaults(configuration)
            );

            const response = await apiInstance.searchAllAssetAdministrationShellIdsByAssetLinkRaw({
                assetLink: assetLink?.map((id) => ({ name: id.name, value: id.value })),
                limit: limit,
                cursor: cursor,
            });
            const result = await response.value();

            const shellIds = result.result ?? [];

            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: shellIds },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasDiscoveryClient.extractStatusCode(err, customError),
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
    }): Promise<ApiResult<AasDiscoveryService.ServiceDescription, AasDiscoveryService.Result>> {
        const { configuration } = options;

        try {
            const apiInstance = new AasDiscoveryService.DescriptionAPIApi(applyDefaults(configuration));
            const response = await apiInstance.getSelfDescriptionRaw();
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasDiscoveryClient.extractStatusCode(err, customError),
            };
        }
    }
}
