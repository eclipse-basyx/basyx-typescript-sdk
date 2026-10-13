import { RequiredError } from '../../generated/runtime';
import { convertQueryResult, toQueryRequestBody } from '../../lib/queryRequests';
import { BooleanLiteral, Query, QuerySelect } from '../../models/Query';

const QUERY = new Query(new BooleanLiteral(true));
const ID_QUERY = new Query(new BooleanLiteral(true), QuerySelect.Id);
const toUpperCase = (item: { id: string }) => item.id.toUpperCase();

describe('toQueryRequestBody', () => {
    it('serializes the query', () => {
        expect(toQueryRequestBody(ID_QUERY)).toEqual({ $select: 'id', $condition: { $boolean: true } });
    });

    it.each([null, undefined])('throws a RequiredError for %s', (query) => {
        expect(() => toQueryRequestBody(query as unknown as Query)).toThrow(RequiredError);
    });
});

describe('convertQueryResult', () => {
    it('converts the returned objects', () => {
        const pagingMetadata = { cursor: 'next' };

        const result = convertQueryResult(
            { paging_metadata: pagingMetadata, result: [{ id: 'a' }, { id: 'b' }] },
            QUERY,
            'Item',
            toUpperCase
        );

        expect(result).toEqual({ pagedResult: pagingMetadata, resultType: 'Item', result: ['A', 'B'] });
    });

    it('returns an empty result if the server sends none', () => {
        expect(convertQueryResult({}, QUERY, 'Item', toUpperCase)).toEqual({
            pagedResult: undefined,
            resultType: 'Item',
            result: [],
        });
    });

    it('returns identifiers if the query selects them', () => {
        const result = convertQueryResult({ paging_metadata: {}, result: ['a', 'b'] }, ID_QUERY, 'Item', toUpperCase);

        expect(result).toEqual({ pagedResult: {}, resultType: 'Identifier', result: ['a', 'b'] });
    });

    it('returns identifiers if the server reports them', () => {
        const result = convertQueryResult(
            { paging_metadata: { resultType: 'Identifier' }, result: ['a'] },
            QUERY,
            'Item',
            toUpperCase
        );

        expect(result.resultType).toBe('Identifier');
        expect(result.result).toEqual(['a']);
    });

    it('uses the id of objects returned for an identifier query', () => {
        const result = convertQueryResult({ result: [{ id: 'a' }, 'b'] }, ID_QUERY, 'Item', toUpperCase);

        expect(result.result).toEqual(['a', 'b']);
    });

    it('throws for an identifier query result without identifiers', () => {
        expect(() => convertQueryResult({ result: [{ idShort: 'a' }] }, ID_QUERY, 'Item', toUpperCase)).toThrow(
            'Expected an identifier in the query result'
        );
    });
});
