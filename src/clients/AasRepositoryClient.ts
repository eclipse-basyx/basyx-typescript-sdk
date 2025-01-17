import type { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import * as AasRepository from '@/generated/aas-repository';
import { convertApiAasToCoreAas, convertCoreAasToApiAas } from '@/lib/convertAasTypes';
import { createCustomClient } from '@/lib/createAasRepoClient';
import { GetAllAssetAdministrationShellsResponse } from '@/models/aas-repository';

export class AasRepositoryClient {
    /**
     * Returns all Asset Administration Shells
     * @param baseURL The API base URL
     * @param headers Optional request headers
     * @param assetIds Optional list of asset ids
     * @param idShort Optional idShort
     * @param limit Optional limit
     * @param cursor Optional cursor
     * @returns A list of Asset Administration Shells
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
     * @param assetAdministrationShell The Asset Administration Shell to create
     * @param headers Optional request headers
     * @returns The created Asset Administration Shell
     */
    async postAssetAdministrationShell(
        baseURL: string,
        aas: AssetAdministrationShell,
        headers?: Headers
    ): Promise<AssetAdministrationShell> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { data, error } = await AasRepository.postAssetAdministrationShell({
                client,
                body: convertCoreAasToApiAas(aas),
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
     * Returns a specific Asset Administration Shell
     *
     * @param aasIdentifier The AAS’s unique id
     * @param baseURL The API base URL
     * @param headers Optional request headers
     * @returns The Asset Administration Shell
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
}
