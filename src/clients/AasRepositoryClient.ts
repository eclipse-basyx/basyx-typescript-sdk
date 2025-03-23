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

// Generic response type for all methods that includes possible error
type ClientResponse<T> = {
    result?: T;
    error?:
        | Error
        | AasRepository.PostAssetAdministrationShellError
        | AasRepository.DeleteAssetAdministrationShellByIdError
        | AasRepository.GetAssetAdministrationShellByIdError
        | AasRepository.PutAssetAdministrationShellByIdError
        | AasRepository.GetAssetInformationAasRepositoryError
        | AasRepository.PutAssetInformationAasRepositoryError
        | AasRepository.DeleteThumbnailAasRepositoryError
        | AasRepository.GetThumbnailAasRepositoryError
        | AasRepository.PutThumbnailAasRepositoryError
        | AasRepository.GetAllSubmodelReferencesAasRepositoryError
        | AasRepository.PostSubmodelReferenceAasRepositoryError
        | AasRepository.DeleteSubmodelReferenceByIdAasRepositoryError
        | AasRepository.GetAllAssetAdministrationShellsError;
};

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
     * @returns {Promise<ClientResponse<GetAllAssetAdministrationShellsResponse>>} Requested Asset Administration Shells or error
     */
    async getAllAssetAdministrationShells({
        baseUrl,
        headers,
        assetIds,
        idShort,
        limit,
        cursor,
    }: GetAllAssetAdministrationShellsOptions): Promise<ClientResponse<GetAllAssetAdministrationShellsResponse>> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const { data, error } = await AasRepository.getAllAssetAdministrationShells({
                client,
                query: { assetIds, idShort, limit, cursor },
            });

            if (error) {
                console.error('Error from server:', error);
                return { error };
            }

            const shells = (data.result ?? []).map(convertApiAasToCoreAas);

            return {
                result: {
                    pagedResult: data.paging_metadata,
                    result: shells,
                },
            };
        } catch (error) {
            console.error('Error fetching Asset Administration Shells:', error);
            return { error: error instanceof Error ? error : new Error(String(error)) };
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
     * @returns {Promise<ClientResponse<AssetAdministrationShell>>} Asset Administration Shell created successfully or error
     */
    async postAssetAdministrationShell({
        baseUrl,
        assetAdministrationShell,
        headers,
    }: PostAssetAdministrationShellOptions): Promise<ClientResponse<AssetAdministrationShell>> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const { data, error } = await AasRepository.postAssetAdministrationShell({
                client,
                body: convertCoreAasToApiAas(assetAdministrationShell),
            });

            if (error) {
                console.error('Error from server:', error);
                return { error };
            }

            return { result: convertApiAasToCoreAas(data) };
        } catch (error) {
            console.error('Error creating Asset Administration Shell:', error);
            return { error: error instanceof Error ? error : new Error(String(error)) };
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
     * @returns {Promise<ClientResponse<void>>} Asset Administration Shell deleted successfully or error
     */
    async deleteAssetAdministrationShellById({
        baseUrl,
        aasIdentifier,
        headers,
    }: AasIdentifierOptions): Promise<ClientResponse<void>> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { error } = await AasRepository.deleteAssetAdministrationShellById({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
            });

            if (error) {
                console.error('Error from server:', error);
                return { error };
            }

            return { result: undefined };
        } catch (error) {
            console.error('Error deleting Asset Administration Shell:', error);
            return { error: error instanceof Error ? error : new Error(String(error)) };
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
     * @returns {Promise<ClientResponse<AssetAdministrationShell>>} Requested Asset Administration Shell or error
     */
    async getAssetAdministrationShellById({
        baseUrl,
        aasIdentifier,
        headers,
    }: AasIdentifierOptions): Promise<ClientResponse<AssetAdministrationShell>> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { data, error } = await AasRepository.getAssetAdministrationShellById({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
            });

            if (error) {
                console.error('Error from server:', error);
                return { error };
            }

            return { result: convertApiAasToCoreAas(data) };
        } catch (error) {
            console.error('Error fetching Asset Administration Shell:', error);
            return { error: error instanceof Error ? error : new Error(String(error)) };
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
     * @returns {Promise<ClientResponse<void>>} Asset Administration Shell updated successfully or error
     */
    async putAssetAdministrationShellById({
        baseUrl,
        aasIdentifier,
        assetAdministrationShell,
        headers,
    }: PutAssetAdministrationShellOptions): Promise<ClientResponse<void>> {
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
                return { error };
            }

            return { result: undefined };
        } catch (error) {
            console.error('Error updating Asset Administration Shell:', error);
            return { error: error instanceof Error ? error : new Error(String(error)) };
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
     * @returns {Promise<ClientResponse<AssetInformation>>} Requested Asset Information or error
     */
    async getAssetInformation({
        baseUrl,
        aasIdentifier,
        headers,
    }: AasIdentifierOptions): Promise<ClientResponse<AssetInformation>> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { data, error } = await AasRepository.getAssetInformationAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
            });

            if (error) {
                console.error('Error from server:', error);
                return { error };
            }

            return { result: convertApiAssetInformationToCoreAssetInformation(data) };
        } catch (error) {
            console.error('Error fetching Asset Information:', error);
            return { error: error instanceof Error ? error : new Error(String(error)) };
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
     * @returns {Promise<ClientResponse<void>>} Asset Information updated successfully or error
     */
    async putAssetInformation({
        baseUrl,
        aasIdentifier,
        assetInformation,
        headers,
    }: PutAssetInformationOptions): Promise<ClientResponse<void>> {
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
                return { error };
            }

            return { result: undefined };
        } catch (error) {
            console.error('Error updating Asset Information:', error);
            return { error: error instanceof Error ? error : new Error(String(error)) };
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
     * @returns {Promise<ClientResponse<void>>} Thumbnail deletion successful or error
     */
    async deleteThumbnail({ baseUrl, aasIdentifier, headers }: AasIdentifierOptions): Promise<ClientResponse<void>> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { error } = await AasRepository.deleteThumbnailAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
            });

            if (error) {
                console.error('Error from server:', error);
                return { error };
            }

            return { result: undefined };
        } catch (error) {
            console.error('Error deleting Thumbnail:', error);
            return { error: error instanceof Error ? error : new Error(String(error)) };
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
     * @returns {Promise<ClientResponse<Blob | File>>} The thumbnail of the Asset Information or error
     */
    async getThumbnail({
        baseUrl,
        aasIdentifier,
        headers,
    }: AasIdentifierOptions): Promise<ClientResponse<Blob | File>> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { data, error } = await AasRepository.getThumbnailAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
            });

            if (error) {
                console.error('Error from server:', error);
                return { error };
            }

            return { result: data };
        } catch (error) {
            console.error('Error fetching Thumbnail:', error);
            return { error: error instanceof Error ? error : new Error(String(error)) };
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
     * @returns {Promise<ClientResponse<void>>} Thumbnail updated successfully or error
     */
    async putThumbnail({
        baseUrl,
        aasIdentifier,
        thumbnail,
        headers,
    }: PutThumbnailOptions): Promise<ClientResponse<void>> {
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
                return { error };
            }

            return { result: undefined };
        } catch (error) {
            console.error('Error updating Thumbnail:', error);
            return { error: error instanceof Error ? error : new Error(String(error)) };
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
     * @returns {Promise<ClientResponse<GetAllSubmodelReferencesResponse>>} Requested submodel references or error
     */
    async getAllSubmodelReferences({
        baseUrl,
        aasIdentifier,
        headers,
        limit,
        cursor,
    }: GetAllSubmodelReferencesOptions): Promise<ClientResponse<GetAllSubmodelReferencesResponse>> {
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
                return { error };
            }

            const submodelReferences = (data.result ?? []).map(convertApiReferenceToCoreReference);

            return {
                result: {
                    pagedResult: data.paging_metadata,
                    result: submodelReferences,
                },
            };
        } catch (error) {
            console.error('Error fetching Submodel References:', error);
            return { error: error instanceof Error ? error : new Error(String(error)) };
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
     * @returns {Promise<ClientResponse<Reference>>} Submodel reference created successfully or error
     */
    async postSubmodelReference({
        baseUrl,
        aasIdentifier,
        submodelReference,
        headers,
    }: PostSubmodelReferenceOptions): Promise<ClientResponse<Reference>> {
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
                return { error };
            }

            return { result: convertApiReferenceToCoreReference(data) };
        } catch (error) {
            console.error('Error creating Submodel Reference:', error);
            return { error: error instanceof Error ? error : new Error(String(error)) };
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
     * @returns {Promise<ClientResponse<void>>} Submodel reference deleted successfully or error
     */
    async deleteSubmodelReferenceById({
        baseUrl,
        aasIdentifier,
        submodelIdentifier,
        headers,
    }: DeleteSubmodelReferenceByIdOptions): Promise<ClientResponse<void>> {
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
                return { error };
            }

            return { result: undefined };
        } catch (error) {
            console.error('Error deleting Submodel Reference:', error);
            return { error: error instanceof Error ? error : new Error(String(error)) };
        }
    }
}
