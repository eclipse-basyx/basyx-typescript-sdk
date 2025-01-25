import type {
    AssetAdministrationShell,
    AssetInformation,
    Reference,
} from '@aas-core-works/aas-core3.0-typescript/types';
import * as AasRepository from '../generated';
import { AssetinformationThumbnailBody } from '../generated/types.gen';
import {
    convertApiAasToCoreAas,
    convertApiAssetInformationToCoreAssetInformation,
    convertApiReferenceToCoreReference,
    convertCoreAasToApiAas,
    convertCoreAssetInformationToApiAssetInformation,
    convertCoreReferenceToApiReference,
} from '../lib/convertAasTypes';
import { createCustomClient } from '../lib/createCustomClient';
import { GetAllAssetAdministrationShellsResponse, getAllSubmodelReferencesResponse } from '../models/aas-repository';

export class AasRepositoryClient {
    /**
     * Returns all Asset Administration Shells
     *
     * @async
     * @function getAllAssetAdministrationShells
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
     *
     * @async
     * @function postAssetAdministrationShell
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
     *
     * @async
     * @function deleteAssetAdministrationShellById
     * @param baseURL The API base URL
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param headers Request headers
     * @returns {Promise<void>} Asset Administration Shell deleted successfully
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
     *
     * @async
     * @function getAssetAdministrationShellById
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
     *
     * @async
     * @function putAssetAdministrationShellById
     * @param baseURL The API base URL
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param assetAdministrationShell Asset Administration Shell object
     * @param headers Request headers
     * @returns {Promise<void>} Asset Administration Shell updated successfully
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

    /**
     * Returns the Asset Information
     *
     * @async
     * @function getAssetInformation
     * @param baseURL The API base URL
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param headers Request headers
     * @returns {Promise<AssetInformation>} Requested Asset Information
     */
    async getAssetInformation(baseURL: string, aasIdentifier: string, headers?: Headers): Promise<AssetInformation> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { data, error } = await AasRepository.getAssetInformationAasRepository({
                client,
                path: { aasIdentifier },
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            return convertApiAssetInformationToCoreAssetInformation(data);
        } catch (error) {
            console.error('Error fetching Asset Information:', error);
            throw error;
        }
    }

    /**
     * Updates the Asset Information
     *
     * @async
     * @function putAssetInformation
     * @param baseURL The API base URL
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param assetInformation Asset Information object
     * @param headers Request headers
     * @returns {Promise<void>} Asset Information updated successfully
     */
    async putAssetInformation(
        baseURL: string,
        aasIdentifier: string,
        assetInformation: AssetInformation,
        headers?: Headers
    ): Promise<void> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { error } = await AasRepository.putAssetInformationAasRepository({
                client,
                path: { aasIdentifier },
                body: convertCoreAssetInformationToApiAssetInformation(assetInformation),
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            return;
        } catch (error) {
            console.error('Error updating Asset Information:', error);
            throw error;
        }
    }

    /**
     * Deletes the Thumbnail
     *
     * @async
     * @function deleteThumbnail
     * @param baseURL The API base URL
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param headers Request headers
     * @returns {Promise<void>} Thumbnail deletion successful
     */
    async deleteThumbnail(baseURL: string, aasIdentifier: string, headers?: Headers): Promise<void> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { error } = await AasRepository.deleteThumbnailAasRepository({
                client,
                path: { aasIdentifier },
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            return;
        } catch (error) {
            console.error('Error deleting Thumbnail:', error);
            throw error;
        }
    }

    /**
     * Returns the Thumbnail
     *
     * @async
     * @function getThumbnail
     * @param baseURL The API base URL
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param headers Request headers
     * @returns {Promise<Blob | File>} The thumbnail of the Asset Information.
     */
    async getThumbnail(baseURL: string, aasIdentifier: string, headers?: Headers): Promise<Blob | File> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { data, error } = await AasRepository.getThumbnailAasRepository({
                client,
                path: { aasIdentifier },
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            return data;
        } catch (error) {
            console.error('Error fetching Thumbnail:', error);
            throw error;
        }
    }

    /**
     * Updates the Thumbnail
     *
     * @async
     * @function putThumbnail
     * @param baseURL The API base URL
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param thumbnail Thumbnail to upload
     * @param headers Request headers
     * @returns {Promise<void>} Thumbnail updated successfully
     */
    async putThumbnail(
        baseURL: string,
        aasIdentifier: string,
        thumbnail: AssetinformationThumbnailBody,
        headers?: Headers
    ): Promise<void> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { error } = await AasRepository.putThumbnailAasRepository({
                client,
                path: { aasIdentifier },
                body: thumbnail,
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            return;
        } catch (error) {
            console.error('Error updating Thumbnail:', error);
            throw error;
        }
    }

    /**
     * Returns all submodel references
     *
     * @async
     * @function getAllSubmodelReferences
     * @param baseURL The API base URL
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param headers Request headers
     * @param limit The maximum number of elements in the response array
     * @param cursor A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     * @returns {Promise<getAllSubmodelReferencesResponse>} Requested submodel references
     */
    async getAllSubmodelReferences(
        baseURL: string,
        aasIdentifier: string,
        headers?: Headers,
        limit?: number,
        cursor?: string
    ): Promise<getAllSubmodelReferencesResponse> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { data, error } = await AasRepository.getAllSubmodelReferencesAasRepository({
                client,
                path: { aasIdentifier },
                query: {
                    limit,
                    cursor,
                },
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            const submodelReferences = (data.result ?? []).map(convertApiReferenceToCoreReference);

            return {
                pagedResult: data.paging_metadata,
                result: submodelReferences,
            };
        } catch (error) {
            console.error('Error fetching Submodel References:', error);
            throw error;
        }
    }

    /**
     * Creates a submodel reference at the Asset Administration Shell
     *
     * @async
     * @function postSubmodelReference
     * @param baseURL The API base URL
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelReference Reference to the Submodel
     * @param headers Request headers
     * @returns {promise<Reference>} Submodel reference created successfully
     */
    async postSubmodelReference(
        baseURL: string,
        aasIdentifier: string,
        submodelReference: Reference,
        headers?: Headers
    ): Promise<Reference> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { data, error } = await AasRepository.postSubmodelReferenceAasRepository({
                client,
                path: { aasIdentifier },
                body: convertCoreReferenceToApiReference(submodelReference),
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            return convertApiReferenceToCoreReference(data);
        } catch (error) {
            console.error('Error creating Submodel Reference:', error);
            throw error;
        }
    }

    /**
     * Deletes the submodel reference from the Asset Administration Shell. Does not delete the submodel itself!
     *
     * @async
     * @function deleteSubmodelReferenceById
     * @param baseURL The API base URL
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param headers Request headers
     * @returns {Promise<void>} Submodel reference deleted successfully
     */
    async deleteSubmodelReferenceById(
        baseURL: string,
        aasIdentifier: string,
        submodelIdentifier: string,
        headers?: Headers
    ): Promise<void> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { error } = await AasRepository.deleteSubmodelReferenceByIdAasRepository({
                client,
                path: { aasIdentifier, submodelIdentifier },
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            return;
        } catch (error) {
            console.error('Error deleting Submodel Reference:', error);
            throw error;
        }
    }
}
