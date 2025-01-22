import type { PagedResultPagingMetadata } from '@/generated/aas-repository/types.gen';
import type { AssetAdministrationShell, Reference } from '@aas-core-works/aas-core3.0-typescript/types';

export interface GetAllAssetAdministrationShellsResponse {
    pagedResult: PagedResultPagingMetadata | undefined;
    result: AssetAdministrationShell[] | undefined;
}

export interface getAllSubmodelReferencesResponse {
    pagedResult: PagedResultPagingMetadata | undefined;
    result: Reference[] | undefined;
}
