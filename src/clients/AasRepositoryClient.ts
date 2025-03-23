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

// Define specific response types for each operation
export type GetAllAssetAdministrationShellsResult = {
    result?: GetAllAssetAdministrationShellsResponse;
    error?: Error | AasRepository.GetAllAssetAdministrationShellsError;
};

export type PostAssetAdministrationShellResult = {
    result?: AssetAdministrationShell;
    error?: Error | AasRepository.PostAssetAdministrationShellError;
};

export type DeleteAssetAdministrationShellResult = {
    result?: AasRepository.DeleteAssetAdministrationShellByIdResponse;
    error?: Error | AasRepository.DeleteAssetAdministrationShellByIdError;
};

export type GetAssetAdministrationShellResult = {
    result?: AssetAdministrationShell;
    error?: Error | AasRepository.GetAssetAdministrationShellByIdError;
};

export type PutAssetAdministrationShellResult = {
    result?: AasRepository.PutAssetAdministrationShellByIdResponse;
    error?: Error | AasRepository.PutAssetAdministrationShellByIdError;
};

export type GetAssetInformationResult = {
    result?: AssetInformation;
    error?: Error | AasRepository.GetAssetInformationAasRepositoryError;
};

export type PutAssetInformationResult = {
    result?: AasRepository.PutAssetInformationAasRepositoryResponse;
    error?: Error | AasRepository.PutAssetInformationAasRepositoryError;
};

export type DeleteThumbnailResult = {
    result?: AasRepository.DeleteThumbnailAasRepositoryResponses;
    error?: Error | AasRepository.DeleteThumbnailAasRepositoryError;
};

export type GetThumbnailResult = {
    result?: Blob | File;
    error?: Error | AasRepository.GetThumbnailAasRepositoryError;
};

export type PutThumbnailResult = {
    result?: AasRepository.PutThumbnailAasRepositoryResponse;
    error?: Error | AasRepository.PutThumbnailAasRepositoryError;
};

export type GetAllSubmodelReferencesResult = {
    result?: GetAllSubmodelReferencesResponse;
    error?: Error | AasRepository.GetAllSubmodelReferencesAasRepositoryError;
};

export type PostSubmodelReferenceResult = {
    result?: Reference;
    error?: Error | AasRepository.PostSubmodelReferenceAasRepositoryError;
};

export type DeleteSubmodelReferenceResult = {
    result?: AasRepository.DeleteSubmodelReferenceByIdAasRepositoryResponse;
    error?: Error | AasRepository.DeleteSubmodelReferenceByIdAasRepositoryError;
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
     * @returns {Promise<GetAllAssetAdministrationShellsResult>} Requested Asset Administration Shells or error
     */
    async getAllAssetAdministrationShells({
        baseUrl,
        headers,
        assetIds,
        idShort,
        limit,
        cursor,
    }: GetAllAssetAdministrationShellsOptions): Promise<GetAllAssetAdministrationShellsResult> {
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
     * @returns {Promise<PostAssetAdministrationShellResult>} Asset Administration Shell created successfully or error
     */
    async postAssetAdministrationShell({
        baseUrl,
        assetAdministrationShell,
        headers,
    }: PostAssetAdministrationShellOptions): Promise<PostAssetAdministrationShellResult> {
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
     * @returns {Promise<DeleteAssetAdministrationShellResult>} Asset Administration Shell deleted successfully or error
     */
    async deleteAssetAdministrationShellById({
        baseUrl,
        aasIdentifier,
        headers,
    }: AasIdentifierOptions): Promise<DeleteAssetAdministrationShellResult> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { data, error } = await AasRepository.deleteAssetAdministrationShellById({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
            });

            if (error) {
                console.error('Error from server:', error);
                return { error };
            }

            return { result: data };
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
     * @returns {Promise<GetAssetAdministrationShellResult>} Requested Asset Administration Shell or error
     */
    async getAssetAdministrationShellById({
        baseUrl,
        aasIdentifier,
        headers,
    }: AasIdentifierOptions): Promise<GetAssetAdministrationShellResult> {
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
     * @returns {Promise<PutAssetAdministrationShellResult>} Asset Administration Shell updated successfully or error
     */
    async putAssetAdministrationShellById({
        baseUrl,
        aasIdentifier,
        assetAdministrationShell,
        headers,
    }: PutAssetAdministrationShellOptions): Promise<PutAssetAdministrationShellResult> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { data, error } = await AasRepository.putAssetAdministrationShellById({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
                body: convertCoreAasToApiAas(assetAdministrationShell),
            });

            if (error) {
                console.error('Error from server:', error);
                return { error };
            }

            return { result: data };
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
     * @returns {Promise<GetAssetInformationResult>} Requested Asset Information or error
     */
    async getAssetInformation({
        baseUrl,
        aasIdentifier,
        headers,
    }: AasIdentifierOptions): Promise<GetAssetInformationResult> {
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
     * @returns {Promise<PutAssetInformationResult>} Asset Information updated successfully or error
     */
    async putAssetInformation({
        baseUrl,
        aasIdentifier,
        assetInformation,
        headers,
    }: PutAssetInformationOptions): Promise<PutAssetInformationResult> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { data, error } = await AasRepository.putAssetInformationAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
                body: convertCoreAssetInformationToApiAssetInformation(assetInformation),
            });

            if (error) {
                console.error('Error from server:', error);
                return { error };
            }

            return { result: data };
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
     * @returns {Promise<DeleteThumbnailResult>} Thumbnail deletion successful or error
     */
    async deleteThumbnail({ baseUrl, aasIdentifier, headers }: AasIdentifierOptions): Promise<DeleteThumbnailResult> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { data, error } = await AasRepository.deleteThumbnailAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
            });

            if (error) {
                console.error('Error from server:', error);
                return { error };
            }

            return { result: data as AasRepository.DeleteThumbnailAasRepositoryResponses };
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
     * @returns {Promise<GetThumbnailResult>} The thumbnail of the Asset Information or error
     */
    async getThumbnail({ baseUrl, aasIdentifier, headers }: AasIdentifierOptions): Promise<GetThumbnailResult> {
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
     * @returns {Promise<PutThumbnailResult>} Thumbnail updated successfully or error
     */
    async putThumbnail({
        baseUrl,
        aasIdentifier,
        thumbnail,
        headers,
    }: PutThumbnailOptions): Promise<PutThumbnailResult> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);

            const { data, error } = await AasRepository.putThumbnailAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier },
                body: thumbnail,
            });

            if (error) {
                console.error('Error from server:', error);
                return { error };
            }

            return { result: data };
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
     * @returns {Promise<GetAllSubmodelReferencesResult>} Requested submodel references or error
     */
    async getAllSubmodelReferences({
        baseUrl,
        aasIdentifier,
        headers,
        limit,
        cursor,
    }: GetAllSubmodelReferencesOptions): Promise<GetAllSubmodelReferencesResult> {
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
     * @returns {Promise<PostSubmodelReferenceResult>} Submodel reference created successfully or error
     */
    async postSubmodelReference({
        baseUrl,
        aasIdentifier,
        submodelReference,
        headers,
    }: PostSubmodelReferenceOptions): Promise<PostSubmodelReferenceResult> {
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
     * @returns {Promise<DeleteSubmodelReferenceResult>} Submodel reference deleted successfully or error
     */
    async deleteSubmodelReferenceById({
        baseUrl,
        aasIdentifier,
        submodelIdentifier,
        headers,
    }: DeleteSubmodelReferenceByIdOptions): Promise<DeleteSubmodelReferenceResult> {
        try {
            const client = createCustomClient(baseUrl, headers);

            const encodedAasIdentifier = base64Encode(aasIdentifier);
            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const { data, error } = await AasRepository.deleteSubmodelReferenceByIdAasRepository({
                client,
                path: { aasIdentifier: encodedAasIdentifier, submodelIdentifier: encodedSubmodelIdentifier },
            });

            if (error) {
                console.error('Error from server:', error);
                return { error };
            }

            return { result: data };
        } catch (error) {
            console.error('Error deleting Submodel Reference:', error);
            return { error: error instanceof Error ? error : new Error(String(error)) };
        }
    }
}
