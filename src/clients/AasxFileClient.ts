import type { ApiResult } from '../models/api';
import { AasxFileService } from '../generated';
import { Configuration, RequiredError } from '../generated/runtime';
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import { handleApiError } from '../lib/errorHandler';

export class AasxFileClient {
    private static requireIdentifier(value: string | null | undefined, field: string): string {
        if (value === null || value === undefined || value.trim() === '') {
            throw new RequiredError(field, `Required parameter "${field}" was null, undefined, or empty.`);
        }

        return value;
    }

    private static extractStatusCode(err: unknown, parsedError?: AasxFileService.Result): number | undefined {
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
     * Returns a list of available AASX packages at the server
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasId?: The Asset Administration Shell’s unique id
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllAASXPackageIds(options: {
        configuration: Configuration;
        aasId?: string;
        limit?: number;
        cursor?: string;
    }): Promise<
        ApiResult<
            {
                pagedResult: unknown | undefined;
                result: AasxFileService.PackageDescription[];
            },
            AasxFileService.Result
        >
    > {
        const { configuration, aasId, limit, cursor } = options;
        try {
            const apiInstance = new AasxFileService.AASXFileServerAPIApi(applyDefaults(configuration));
            const encodedAasIdentifier = aasId ? base64Encode(aasId) : undefined;

            const response = await apiInstance.getAllAASXPackageIdsRaw({
                aasId: encodedAasIdentifier,
                limit: limit,
                cursor: cursor,
            });
            const payload = await response.value();
            const result = payload.result ?? [];
            const pagedResult = payload.pagingMetadata ?? payload.paging_metadata;

            return {
                success: true,
                data: { pagedResult, result },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasxFileClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Stores the AASX package at the server
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - aasIds?: A list of Asset Administration Shells' unique ids
     *  - file: The file to upload
     *  - fileName: The name of the file
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postAASXPackage(options: {
        configuration: Configuration;
        aasIds?: string[];
        file: Blob;
        fileName: string;
    }): Promise<ApiResult<AasxFileService.PackageDescription, AasxFileService.Result>> {
        const { configuration, aasIds, file, fileName } = options;

        try {
            const apiInstance = new AasxFileService.AASXFileServerAPIApi(applyDefaults(configuration));

            const response = await apiInstance.postAASXPackageRaw({
                aasIds: aasIds,
                file: file,
                fileName: fileName,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasxFileClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns a specific AASX package from the server
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - packageId: The package Id (UTF8-BASE64-URL-encoded)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAASXByPackageId(options: {
        configuration: Configuration;
        packageId: string;
    }): Promise<ApiResult<Blob, AasxFileService.Result>> {
        const { configuration, packageId } = options;

        try {
            const apiInstance = new AasxFileService.AASXFileServerAPIApi(applyDefaults(configuration));

            const encodedPackageId = base64Encode(AasxFileClient.requireIdentifier(packageId, 'packageId'));

            const response = await apiInstance.getAASXByPackageIdRaw({
                packageId: encodedPackageId,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasxFileClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Updates the AASX package at the server
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - packageId: The package Id (UTF8-BASE64-URL-encoded)
     *  - aasIds?: A list of Asset Administration Shells' unique ids
     *  - file: The file to upload
     *  - fileName: The name of the file
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putAASXByPackageId(options: {
        configuration: Configuration;
        packageId: string;
        aasIds?: string[];
        file: Blob;
        fileName: string;
    }): Promise<ApiResult<void, AasxFileService.Result>> {
        const { configuration, packageId, aasIds, file, fileName } = options;

        try {
            const apiInstance = new AasxFileService.AASXFileServerAPIApi(applyDefaults(configuration));

            const encodedPackageId = base64Encode(AasxFileClient.requireIdentifier(packageId, 'packageId'));
            const response = await apiInstance.putAASXByPackageIdRaw({
                packageId: encodedPackageId,
                aasIds: aasIds,
                file: file,
                fileName: fileName,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasxFileClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Deletes a specific AASX package from the server
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - packageId: The package Id (UTF8-BASE64-URL-encoded)
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteAASXByPackageId(options: {
        configuration: Configuration;
        packageId: string;
    }): Promise<ApiResult<void, AasxFileService.Result>> {
        const { configuration, packageId } = options;

        try {
            const apiInstance = new AasxFileService.AASXFileServerAPIApi(applyDefaults(configuration));

            const encodedPackageId = base64Encode(AasxFileClient.requireIdentifier(packageId, 'packageId'));

            const response = await apiInstance.deleteAASXByPackageIdRaw({
                packageId: encodedPackageId,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasxFileClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns the self-describing information of a network resource (ServiceDescription)
     *
     */
    async getSelfDescription(options: {
        configuration: Configuration;
    }): Promise<ApiResult<AasxFileService.ServiceDescription, AasxFileService.Result>> {
        const { configuration } = options;

        try {
            const apiInstance = new AasxFileService.DescriptionAPIApi(applyDefaults(configuration));
            const response = await apiInstance.getSelfDescriptionRaw();
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: AasxFileClient.extractStatusCode(err, customError),
            };
        }
    }
}
