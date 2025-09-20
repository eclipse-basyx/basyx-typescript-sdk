import type { ApiResult } from '../models/api';
import { AasxFileService } from '../generated';
import { Configuration } from '../generated/runtime';
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import { handleApiError } from '../lib/errorHandler';

export class AasxFileClient {
    /**
     * Returns a list of available AASX packages at the server
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasId?: The Asset Administration Shell’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllAASXPackageIds(options: { configuration: Configuration; aasId?: string }): Promise<
        ApiResult<
            {
                result: AasxFileService.PackageDescription[];
            },
            AasxFileService.Result
        >
    > {
        const { configuration, aasId } = options;

        try {
            const apiInstance = new AasxFileService.AASXFileServerAPIApi(applyDefaults(configuration));

            //const encodedAasIdentifier = aasId ? base64Encode(aasId) : undefined;

            const result = await apiInstance.getAllAASXPackageIds({
                aasId: aasId,
            });

            return {
                success: true,
                data: { result },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            //const encodedAasIdentifiers = aasIds?.map((id) => base64Encode(id));
            //const encodedFileName = base64Encode(fileName);

            const result = await apiInstance.postAASXPackage({
                aasIds: aasIds,
                file: file,
                fileName: fileName,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            const encodedPackageId = base64Encode(packageId);

            const result = await apiInstance.getAASXByPackageId({
                packageId: encodedPackageId,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            //const encodedAasIdentifiers = aasIds?.map((id) => base64Encode(id));
            const encodedPackageId = base64Encode(packageId);
            //const encodedFileName = base64Encode(fileName);
            const result = await apiInstance.putAASXByPackageId({
                packageId: encodedPackageId,
                aasIds: aasIds,
                file: file,
                fileName: fileName,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            const encodedPackageId = base64Encode(packageId);

            const result = await apiInstance.deleteAASXByPackageId({
                packageId: encodedPackageId,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }
}
