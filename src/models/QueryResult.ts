/**
 * A page of query results.
 *
 * `resultType` tells the two shapes apart, as in `paging_metadata.resultType` of the AAS API: `'Identifier'` if the
 * query selected only identifiers (`select: QuerySelect.Id`), otherwise the type of the returned objects.
 *
 * @example
 * ```typescript
 * if (response.success && response.data.resultType === 'Identifier') {
 *     response.data.result; // string[]
 * }
 * ```
 */
export type QueryResult<T, ResultType extends string, PagingMetadata> =
    | { pagedResult: PagingMetadata | undefined; resultType: ResultType; result: T[] }
    | { pagedResult: PagingMetadata | undefined; resultType: 'Identifier'; result: string[] };
