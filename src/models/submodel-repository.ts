import type { Reference, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import type { PagedResultPagingMetadata } from '../generated/types.gen';

export interface GetAllSubmodelsResponse {
    pagedResult: PagedResultPagingMetadata | undefined;
    result: Submodel[] | undefined;
}

export interface getAllSubmodelReferencesResponse {
    pagedResult: PagedResultPagingMetadata | undefined;
    result: Reference[] | undefined;
}
