import type { PagedResultPagingMetadata } from '@/generated/aas-repository/types.gen';
import type { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';

export interface GetAllAssetAdministrationShellsResponse {
    pagedResult: PagedResultPagingMetadata | undefined;
    result: AssetAdministrationShell[] | undefined;
}
