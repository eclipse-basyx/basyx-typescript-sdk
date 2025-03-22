import type {
    AssetAdministrationShell,
    AssetInformation,
    Reference,
} from '@aas-core-works/aas-core3.0-typescript/types';
import type { AssetinformationThumbnailBody, PagedResultPagingMetadata } from '../generated/types.gen';

export interface GetAllAssetAdministrationShellsOptions {
    baseUrl: string;
    headers?: Headers;
    assetIds?: string[];
    idShort?: string;
    limit?: number;
    cursor?: string;
}

export interface GetAllAssetAdministrationShellsResponse {
    pagedResult: PagedResultPagingMetadata | undefined;
    result: AssetAdministrationShell[] | undefined;
}

export interface PostAssetAdministrationShellOptions {
    baseUrl: string;
    assetAdministrationShell: AssetAdministrationShell;
    headers?: Headers;
}

export interface AasIdentifierOptions {
    baseUrl: string;
    aasIdentifier: string;
    headers?: Headers;
}

export interface PutAssetAdministrationShellOptions {
    baseUrl: string;
    aasIdentifier: string;
    assetAdministrationShell: AssetAdministrationShell;
    headers?: Headers;
}

export interface PutAssetInformationOptions {
    baseUrl: string;
    aasIdentifier: string;
    assetInformation: AssetInformation;
    headers?: Headers;
}

export interface PutThumbnailOptions {
    baseUrl: string;
    aasIdentifier: string;
    thumbnail: AssetinformationThumbnailBody;
    headers?: Headers;
}

export interface GetAllSubmodelReferencesOptions {
    baseUrl: string;
    aasIdentifier: string;
    headers?: Headers;
    limit?: number;
    cursor?: string;
}

export interface PostSubmodelReferenceOptions {
    baseUrl: string;
    aasIdentifier: string;
    submodelReference: Reference;
    headers?: Headers;
}

export interface DeleteSubmodelReferenceByIdOptions {
    baseUrl: string;
    aasIdentifier: string;
    submodelIdentifier: string;
    headers?: Headers;
}

export interface GetAllSubmodelReferencesResponse {
    pagedResult: PagedResultPagingMetadata | undefined;
    result: Reference[] | undefined;
}
