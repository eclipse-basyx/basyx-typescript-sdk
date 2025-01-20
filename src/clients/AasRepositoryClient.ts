import type { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import * as AasRepository from '@/generated/aas-repository';
import { convertApiAasToCoreAas, convertCoreAasToApiAas } from '@/lib/convertAasTypes';
import { createCustomClient } from '@/lib/createAasRepoClient';
import { GetAllAssetAdministrationShellsResponse } from '@/models/aas-repository';

export class AasRepositoryClient {
    /**
     * Returns all Asset Administration Shells
     * @param baseURL The API base URL
     * @param headers Request headers
     * @param assetIds A list of specific Asset identifiers. Every single value asset identifier is a base64-url-encoded
     * @param idShort The Asset Administration Shell’s IdShort
     * @param limit The maximum number of elements in the response array
     * @param cursor A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     * @returns {Promise<GetAllAssetAdministrationShellsResponse>} Requested Asset Administration Shells
     */
    async getAllAssetAdministrationShells(
        baseURL: string,
        headers?: Headers,
        assetIds?: string[],
        idShort?: string,
        limit?: number,
        cursor?: string
    ): Promise<GetAllAssetAdministrationShellsResponse> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { data, error } = await AasRepository.getAllAssetAdministrationShells({
                client,
                query: {
                    assetIds,
                    idShort,
                    limit,
                    cursor,
                },
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            const shells = (data.result ?? []).map(convertApiAasToCoreAas);

            return {
                pagedResult: data.paging_metadata,
                result: shells,
            };
        } catch (error) {
            console.error('Error fetching Asset Administration Shells:', error);
            throw error;
        }
    }

    /**
     * Creates a new Asset Administration Shell
     * @param baseURL The API base URL
     * @param assetAdministrationShell Asset Administration Shell object
     * @param headers Request headers
     * @returns {Promise<AssetAdministrationShell>} Asset Administration Shell created successfully
     */
    async postAssetAdministrationShell(
        baseURL: string,
        assetAdministrationShell: AssetAdministrationShell,
        headers?: Headers
    ): Promise<AssetAdministrationShell> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { data, error } = await AasRepository.postAssetAdministrationShell({
                client,
                body: convertCoreAasToApiAas(assetAdministrationShell),
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            return convertApiAasToCoreAas(data);
        } catch (error) {
            console.error('Error creating Asset Administration Shell:', error);
            throw error;
        }
    }

    /**
     * Deletes an Asset Administration Shell
     * @param baseURL The API base URL
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param headers Request headers
     * @returns Asset Administration Shell deleted successfully
     */
    async deleteAssetAdministrationShellById(baseURL: string, aasIdentifier: string, headers?: Headers): Promise<void> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { error } = await AasRepository.deleteAssetAdministrationShellById({
                client,
                path: { aasIdentifier },
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            return;
        } catch (error) {
            console.error('Error deleting Asset Administration Shell:', error);
            throw error;
        }
    }

    /**
     * Returns a specific Asset Administration Shell
     * @param baseURL The API base URL
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param headers Request headers
     * @returns {Promise<AssetAdministrationShell>} Requested Asset Administration Shell
     */
    async getAssetAdministrationShellById(
        baseURL: string,
        aasIdentifier: string,
        headers?: Headers
    ): Promise<AssetAdministrationShell> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { data, error } = await AasRepository.getAssetAdministrationShellById({
                client,
                path: { aasIdentifier },
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            return convertApiAasToCoreAas(data);
        } catch (error) {
            console.error('Error fetching Asset Administration Shell:', error);
            throw error;
        }
    }

    /**
     * Updates an existing Asset Administration Shell
     * @param baseURL The API base URL
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param assetAdministrationShell Asset Administration Shell object
     * @param headers Request headers
     * @returns Asset Administration Shell updated successfully
     */
    async putAssetAdministrationShellById(
        baseURL: string,
        aasIdentifier: string,
        assetAdministrationShell: AssetAdministrationShell,
        headers?: Headers
    ): Promise<void> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { error } = await AasRepository.putAssetAdministrationShellById({
                client,
                path: { aasIdentifier },
                body: convertCoreAasToApiAas(assetAdministrationShell),
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            return;
        } catch (error) {
            console.error('Error updating Asset Administration Shell:', error);
            throw error;
        }
    }
}
