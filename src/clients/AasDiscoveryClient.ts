import type { SpecificAssetId } from '@aas-core-works/aas-core3.1-typescript/types';
import type { ApiResult, ConditionalApiResult } from '../models/api';
import type { AssetId } from '../models/AssetId';
import { AasDiscoveryService } from '../generated';
import { Configuration, RequiredError } from '../generated/runtime';
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import { getConditionalErrorFields, getEtag, getNotModifiedResult } from '../lib/conditionalRequests';
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
     *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
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
            // Only name and value: objects such as core SpecificAssetIds carry further fields that may be null
            const encodedAssetIds = assetIds?.map((id) =>
                base64Encode(JSON.stringify({ name: id.name, value: id.value }))
            );

            const response = await apiInstance.getAllAssetAdministrationShellIdsByAssetLinkRaw({
                assetIds: encodedAssetIds,
                limit: limit,
                cursor: cursor,
            });
            const result = await response.value();

            const shellIds = result.result ?? [];
            const pagedResult = result.paging_metadata;

            return {
                success: true,
                data: { pagedResult, result: shellIds },
                statusCode: response.raw.status,
                etag: getEtag(response.raw),
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasDiscoveryClient.extractStatusCode(err, customError),
                ...getConditionalErrorFields(err),
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
     *  - ifMatch?: Sent as `If-Match` header; the request fails with `preconditionFailed` if the resource has changed since the `etag` was issued
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postAllAssetLinksById(options: {
        configuration: Configuration;
        aasIdentifier: string;
        specificAssetId: Array<SpecificAssetId>;
        ifMatch?: string;
    }): Promise<ApiResult<Array<SpecificAssetId>, AasDiscoveryService.Result>> {
        const { configuration, aasIdentifier, specificAssetId, ifMatch } = options;

        try {
            const apiInstance = new AasDiscoveryService.AssetAdministrationShellBasicDiscoveryAPIApi(
                applyDefaults(configuration, { ifMatch })
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
                etag: getEtag(response.raw),
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasDiscoveryClient.extractStatusCode(err, customError),
                ...getConditionalErrorFields(err),
            };
        }
    }

    /**
     * Deletes specified specific asset identifiers linked to an Asset Administration Shell
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - ifMatch?: Sent as `If-Match` header; the request fails with `preconditionFailed` if the resource has changed since the `etag` was issued
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteAllAssetLinksById(options: {
        configuration: Configuration;
        aasIdentifier: string;
        ifMatch?: string;
    }): Promise<ApiResult<void, AasDiscoveryService.Result>> {
        const { configuration, aasIdentifier, ifMatch } = options;

        try {
            const apiInstance = new AasDiscoveryService.AssetAdministrationShellBasicDiscoveryAPIApi(
                applyDefaults(configuration, { ifMatch })
            );

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const response = await apiInstance.deleteAllAssetLinksByIdRaw({
                aasIdentifier: encodedAasIdentifier,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status, etag: getEtag(response.raw) };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasDiscoveryClient.extractStatusCode(err, customError),
                ...getConditionalErrorFields(err),
            };
        }
    }

    /**
     * Returns a list of specific asset identifiers based on an Asset Administration Shell ID to edit discoverable content.
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIdentifier: The Asset Administration Shell’s unique id
     *  - ifNoneMatch?: Sent as `If-None-Match` header; returns `{ success: true; notModified: true }` without data if the representation still has this `etag`
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllAssetLinksById<IfNoneMatch extends string | undefined = undefined>(options: {
        configuration: Configuration;
        aasIdentifier: string;
        ifNoneMatch?: IfNoneMatch;
    }): Promise<ConditionalApiResult<Array<SpecificAssetId>, AasDiscoveryService.Result, IfNoneMatch>> {
        const { configuration, aasIdentifier, ifNoneMatch } = options;

        try {
            const apiInstance = new AasDiscoveryService.AssetAdministrationShellBasicDiscoveryAPIApi(
                applyDefaults(configuration, { ifNoneMatch })
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
                statusCode: AasDiscoveryClient.extractStatusCode(err, customError),
                ...getConditionalErrorFields(err),
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
     *  - cursor?: A server-generated identifier retrieved from paging_metadata that specifies from which position the result listing should continue
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
            const pagedResult = result.paging_metadata;

            return {
                success: true,
                data: { pagedResult, result: shellIds },
                statusCode: response.raw.status,
                etag: getEtag(response.raw),
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasDiscoveryClient.extractStatusCode(err, customError),
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
    }): Promise<ApiResult<AasDiscoveryService.ServiceDescription, AasDiscoveryService.Result>> {
        const { configuration } = options;

        try {
            const apiInstance = new AasDiscoveryService.DescriptionAPIApi(applyDefaults(configuration));
            const response = await apiInstance.getSelfDescriptionRaw();
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status, etag: getEtag(response.raw) };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasDiscoveryClient.extractStatusCode(err, customError),
                ...getConditionalErrorFields(err),
            };
        }
    }
}
