import type {
    AssetAdministrationShell,
    AssetInformation,
    Reference,
} from '@aas-core-works/aas-core3.0-typescript/types';
import * as AasRepository from '../generated';
import { base64Encode } from '../lib/base64Url';
import {
    convertApiAasToCoreAas,
    convertApiAssetInformationToCoreAssetInformation,
    convertApiReferenceToCoreReference,
    convertCoreAasToApiAas,
    convertCoreAssetInformationToApiAssetInformation,
    convertCoreReferenceToApiReference,
} from '../lib/convertAasTypes';
import { createCustomClient } from '../lib/createAasRepoClient';
import {
    AasIdentifierOptions,
    DeleteSubmodelReferenceByIdOptions,
    GetAllAssetAdministrationShellsOptions,
    GetAllAssetAdministrationShellsResponse,
    GetAllSubmodelReferencesOptions,
    GetAllSubmodelReferencesResponse,
    PostAssetAdministrationShellOptions,
    PostSubmodelReferenceOptions,
    PutAssetAdministrationShellOptions,
    PutAssetInformationOptions,
    PutThumbnailOptions,
} from '../models/aas-repository';

export class AasRepositoryClient {
    /**
     * Returns all Asset Administration Shells
     *
     * @function getAllAssetAdministrationShells
     * @param {GetAllAssetAdministrationShellsOptions} options - Options object.
     * @param {string} options.baseUrl - The API base URL
     * @param {Headers} [options.headers] - Request headers
     * @param {string[]} [options.assetIds] - A list of specific Asset identifiers. Every single value asset identifier is a base64-url-encoded
     * @param {string} [options.idShort] - The Asset Administration Shell's IdShort
     * @param {number} [options.limit] - The maximum number of elements in the response array
     * @param {string} [options.cursor] - A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     * @returns {Promise<GetAllAssetAdministrationShellsResponse>} Requested Asset Administration Shells
     */
    async getAllAssetAdministrationShells({
        baseUrl,
        headers,
        assetIds,
        idShort,
        limit,
        cursor,
    }: GetAllAssetAdministrationShellsOptions): Promise<GetAllAssetAdministrationShellsResponse> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const { data, error } = await AasRepository.getAllAssetAdministrationShells({
                client,
                query: { assetIds, idShort, limit, cursor },
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
     * @function postAssetAdministrationShell
     * @param {PostAssetAdministrationShellOptions} options - Options object.
     * @param {string} options.baseUrl - The API base URL
     * @param {AssetAdministrationShell} options.assetAdministrationShell - Asset Administration Shell object
     * @param {Headers} [options.headers] - Request headers
     * @returns {Promise<AssetAdministrationShell>} Asset Administration Shell created successfully
     */
    async postAssetAdministrationShell({
        baseUrl,
        assetAdministrationShell,
        headers,
    }: PostAssetAdministrationShellOptions): Promise<AssetAdministrationShell> {
        try {
            const client = createCustomClient(baseUrl, headers);

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
     * @function deleteAssetAdministrationShellById
     * @param {AasIdentifierOptions} options - Options object.
     * @param {string} options.baseUrl - The API base URL
     * @param {string} options.aasIdentifier - The Asset Administration Shell's unique id
     * @param {Headers} [options.headers] - Request headers
     * @returns {Promise<void>} Asset Administration Shell deleted successfully
     */
    async deleteAssetAdministrationShellById({ baseUrl, aasIdentifier, headers }: AasIdentifierOptions): Promise<void> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { error } = await AasRepository.deleteAssetAdministrationShellById({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
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
     * @function getAssetAdministrationShellById
     * @param {AasIdentifierOptions} options - Options object.
     * @param {string} options.baseUrl - The API base URL
     * @param {string} options.aasIdentifier - The Asset Administration Shell's unique id
     * @param {Headers} [options.headers] - Request headers
     * @returns {Promise<AssetAdministrationShell>} Requested Asset Administration Shell
     */
    async getAssetAdministrationShellById({
        baseUrl,
        aasIdentifier,
        headers,
    }: AasIdentifierOptions): Promise<AssetAdministrationShell> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { data, error } = await AasRepository.getAssetAdministrationShellById({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
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
     * @function putAssetAdministrationShellById
     * @param {PutAssetAdministrationShellOptions} options - Options object.
     * @param {string} options.baseUrl - The API base URL
     * @param {string} options.aasIdentifier - The Asset Administration Shell's unique id
     * @param {AssetAdministrationShell} options.assetAdministrationShell - Asset Administration Shell object
     * @param {Headers} [options.headers] - Request headers
     * @returns {Promise<void>} Asset Administration Shell updated successfully
     */
    async putAssetAdministrationShellById({
        baseUrl,
        aasIdentifier,
        assetAdministrationShell,
        headers,
    }: PutAssetAdministrationShellOptions): Promise<void> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { error } = await AasRepository.putAssetAdministrationShellById({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
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
     * @function getAssetInformation
     * @param {AasIdentifierOptions} options - Options object.
     * @param {string} options.baseUrl - The API base URL
     * @param {string} options.aasIdentifier - The Asset Administration Shell's unique id
     * @param {Headers} [options.headers] - Request headers
     * @returns {Promise<AssetInformation>} Requested Asset Information
     */
    async getAssetInformation({ baseUrl, aasIdentifier, headers }: AasIdentifierOptions): Promise<AssetInformation> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { data, error } = await AasRepository.getAssetInformationAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
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
     * @function putAssetInformation
     * @param {PutAssetInformationOptions} options - Options object.
     * @param {string} options.baseUrl - The API base URL
     * @param {string} options.aasIdentifier - The Asset Administration Shell's unique id
     * @param {AssetInformation} options.assetInformation - Asset Information object
     * @param {Headers} [options.headers] - Request headers
     * @returns {Promise<void>} Asset Information updated successfully
     */
    async putAssetInformation({
        baseUrl,
        aasIdentifier,
        assetInformation,
        headers,
    }: PutAssetInformationOptions): Promise<void> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { error } = await AasRepository.putAssetInformationAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
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
     * @function deleteThumbnail
     * @param {AasIdentifierOptions} options - Options object.
     * @param {string} options.baseUrl - The API base URL
     * @param {string} options.aasIdentifier - The Asset Administration Shell's unique id
     * @param {Headers} [options.headers] - Request headers
     * @returns {Promise<void>} Thumbnail deletion successful
     */
    async deleteThumbnail({ baseUrl, aasIdentifier, headers }: AasIdentifierOptions): Promise<void> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { error } = await AasRepository.deleteThumbnailAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
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
     * @function getThumbnail
     * @param {AasIdentifierOptions} options - Options object.
     * @param {string} options.baseUrl - The API base URL
     * @param {string} options.aasIdentifier - The Asset Administration Shell's unique id
     * @param {Headers} [options.headers] - Request headers
     * @returns {Promise<Blob | File>} The thumbnail of the Asset Information.
     */
    async getThumbnail({ baseUrl, aasIdentifier, headers }: AasIdentifierOptions): Promise<Blob | File> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { data, error } = await AasRepository.getThumbnailAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
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
     * @function putThumbnail
     * @param {PutThumbnailOptions} options - Options object.
     * @param {string} options.baseUrl - The API base URL
     * @param {string} options.aasIdentifier - The Asset Administration Shell's unique id
     * @param {AssetinformationThumbnailBody} options.thumbnail - Thumbnail to upload
     * @param {Headers} [options.headers] - Request headers
     * @returns {Promise<void>} Thumbnail updated successfully
     */
    async putThumbnail({ baseUrl, aasIdentifier, thumbnail, headers }: PutThumbnailOptions): Promise<void> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { error } = await AasRepository.putThumbnailAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
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
     * @function getAllSubmodelReferences
     * @param {GetAllSubmodelReferencesOptions} options - Options object.
     * @param {string} options.baseUrl - The API base URL
     * @param {string} options.aasIdentifier - The Asset Administration Shell's unique id
     * @param {Headers} [options.headers] - Request headers
     * @param {number} [options.limit] - The maximum number of elements in the response array
     * @param {string} [options.cursor] - A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     * @returns {Promise<GetAllSubmodelReferencesResponse>} Requested submodel references
     */
    async getAllSubmodelReferences({
        baseUrl,
        aasIdentifier,
        headers,
        limit,
        cursor,
    }: GetAllSubmodelReferencesOptions): Promise<GetAllSubmodelReferencesResponse> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { data, error } = await AasRepository.getAllSubmodelReferencesAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
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
     * @function postSubmodelReference
     * @param {PostSubmodelReferenceOptions} options - Options object.
     * @param {string} options.baseUrl - The API base URL
     * @param {string} options.aasIdentifier - The Asset Administration Shell's unique id
     * @param {Reference} options.submodelReference - Reference to the Submodel
     * @param {Headers} [options.headers] - Request headers
     * @returns {Promise<Reference>} Submodel reference created successfully
     */
    async postSubmodelReference({
        baseUrl,
        aasIdentifier,
        submodelReference,
        headers,
    }: PostSubmodelReferenceOptions): Promise<Reference> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { data, error } = await AasRepository.postSubmodelReferenceAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
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
     * @function deleteSubmodelReferenceById
     * @param {DeleteSubmodelReferenceByIdOptions} options - Options object.
     * @param {string} options.baseUrl - The API base URL
     * @param {string} options.aasIdentifier - The Asset Administration Shell's unique id
     * @param {string} options.submodelIdentifier - The Submodel's unique id
     * @param {Headers} [options.headers] - Request headers
     * @returns {Promise<void>} Submodel reference deleted successfully
     */
    async deleteSubmodelReferenceById({
        baseUrl,
        aasIdentifier,
        submodelIdentifier,
        headers,
    }: DeleteSubmodelReferenceByIdOptions): Promise<void> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const { error } = await AasRepository.deleteSubmodelReferenceByIdAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier, submodelIdentifier: encodedSubmodelIdentifier },
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
