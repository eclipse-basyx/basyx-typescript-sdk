import type { JsonObject } from '@aas-core-works/aas-core3.1-typescript/jsonization';
import type { QueryResult } from '../models/QueryResult';
import { RequiredError } from '../generated/runtime';
import { Query, QuerySelect } from '../models/Query';
import { toJsonableQuery } from './queryJsonization';

/**
 * Serialize the query for the body of a `/query/*` request.
 *
 * @throws RequiredError if no query is given
 */
export function toQueryRequestBody(query: Query): JsonObject {
    if (query === null || query === undefined) {
        throw new RequiredError('query', 'Required parameter "query" was null or undefined.');
    }

    return toJsonableQuery(query);
}

/**
 * Convert the response of a `/query/*` request.
 *
 * The result holds identifiers if the server reports `resultType: 'Identifier'` or the query selected them. Servers
 * that return objects for `select: QuerySelect.Id` anyway are tolerated: the `id` of each object is used.
 *
 * @param response The parsed response body
 * @param query The query that was sent
 * @param resultType The `resultType` of a result with objects
 * @param convertItem Converts a returned object
 */
export function convertQueryResult<ApiItem, T, ResultType extends string, PagingMetadata>(
    response: { paging_metadata?: PagingMetadata; result?: Array<ApiItem | string> },
    query: Query,
    resultType: ResultType,
    convertItem: (item: ApiItem) => T
): QueryResult<T, ResultType, PagingMetadata> {
    const pagedResult = response.paging_metadata;
    const items = response.result ?? [];
    const reportedResultType = (pagedResult as { resultType?: unknown } | undefined)?.resultType;

    if (reportedResultType === 'Identifier' || query.select === QuerySelect.Id) {
        return { pagedResult, resultType: 'Identifier', result: items.map(toIdentifier) };
    }

    return { pagedResult, resultType, result: items.map((item) => convertItem(item as ApiItem)) };
}

function toIdentifier(item: unknown): string {
    if (typeof item === 'string') {
        return item;
    }

    const id = (item as { id?: unknown } | null)?.id;
    if (typeof id === 'string') {
        return id;
    }

    throw new Error(`Expected an identifier in the query result, but got: ${JSON.stringify(item)}`);
}
