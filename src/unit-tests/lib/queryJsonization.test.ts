import type { JsonValue } from '@aas-core-works/aas-core3.1-typescript/jsonization';
import { queryFromJsonable, toJsonableQuery } from '../../lib/queryJsonization';
import {
    AndExpression,
    AttributeOperand,
    BooleanCast,
    BooleanLiteral,
    ClaimAttribute,
    ContainsComparison,
    DateTimeAttributeItem,
    DateTimeAttributeOperand,
    DateTimeCast,
    DateTimeGlobalAttributeKind,
    DateTimeLiteral,
    DayOfMonth,
    DayOfWeek,
    EndsWithComparison,
    EqualComparison,
    FieldOperand,
    GlobalAttribute,
    GlobalAttributeKind,
    GreaterThanComparison,
    GreaterThanOrEqualComparison,
    HexCast,
    HexLiteral,
    LessThanComparison,
    LessThanOrEqualComparison,
    MatchClause,
    Month,
    NotEqualComparison,
    NotExpression,
    NumberCast,
    NumberLiteral,
    OrExpression,
    Query,
    QueryFilter,
    QuerySelect,
    ReferenceAttribute,
    RegexComparison,
    StartsWithComparison,
    StringCast,
    StringLiteral,
    TimeCast,
    TimeLiteral,
    Year,
} from '../../models/Query';

const field = (path: string) => new FieldOperand(path);
const str = (value: string) => new StringLiteral(value);

// Uses every class of the query model once
const FULL_QUERY = new Query(
    new AndExpression([
        new OrExpression([
            new EqualComparison([field('$aas#idShort'), str('Robot')]),
            new NotEqualComparison([field('$aas#idShort'), new StringCast(new NumberLiteral(1))]),
        ]),
        new NotExpression(new BooleanLiteral(false)),
        new GreaterThanComparison([field('$sme.Temperature#value'), new NumberCast(str('20'))]),
        new GreaterThanOrEqualComparison([new HexLiteral('16#1F'), new HexCast(field('$sme.Code#value'))]),
        new LessThanComparison([
            new DateTimeLiteral('2025-01-01T00:00:00Z'),
            new DateTimeCast(new AttributeOperand(new GlobalAttribute(GlobalAttributeKind.UtcNow))),
        ]),
        new LessThanOrEqualComparison([
            new TimeLiteral('12:00'),
            new TimeCast(new DateTimeLiteral('2025-01-01T08:00:00Z')),
        ]),
        new EqualComparison([new BooleanLiteral(true), new BooleanCast(field('$sme.Enabled#value'))]),
        new EqualComparison([
            new DayOfWeek(
                new DateTimeAttributeOperand(new DateTimeAttributeItem(DateTimeGlobalAttributeKind.LocalNow))
            ),
            new DayOfMonth(new DateTimeLiteral('2025-01-01T00:00:00Z')),
        ]),
        new EqualComparison([
            new Month(new DateTimeCast(str('2025-01-01T00:00:00Z'))),
            new Year(new DateTimeLiteral('2025-01-01T00:00:00Z')),
        ]),
        new MatchClause([
            new ContainsComparison([field('$sm#idShort'), new AttributeOperand(new ClaimAttribute('role'))]),
            new StartsWithComparison([
                field('$sm#idShort'),
                new AttributeOperand(new ReferenceAttribute('(Submodel)*#idShort')),
            ]),
            new EndsWithComparison([field('$sm#idShort'), str('plate')]),
            new RegexComparison([field('$sm#idShort'), str('^Name')]),
            new MatchClause([new EqualComparison([field('$sm#id'), str('x')])]),
        ]),
    ]),
    QuerySelect.Id,
    [new QueryFilter('$sm#supplementalSemanticIds[]', new BooleanLiteral(true))]
);

const FULL_QUERY_JSON: JsonValue = {
    $select: 'id',
    $condition: {
        $and: [
            {
                $or: [
                    { $eq: [{ $field: '$aas#idShort' }, { $strVal: 'Robot' }] },
                    { $ne: [{ $field: '$aas#idShort' }, { $strCast: { $numVal: 1 } }] },
                ],
            },
            { $not: { $boolean: false } },
            { $gt: [{ $field: '$sme.Temperature#value' }, { $numCast: { $strVal: '20' } }] },
            { $ge: [{ $hexVal: '16#1F' }, { $hexCast: { $field: '$sme.Code#value' } }] },
            {
                $lt: [
                    { $dateTimeVal: '2025-01-01T00:00:00Z' },
                    { $dateTimeCast: { $attribute: { GLOBAL: 'UTCNOW' } } },
                ],
            },
            { $le: [{ $timeVal: '12:00' }, { $timeCast: { $dateTimeVal: '2025-01-01T08:00:00Z' } }] },
            { $eq: [{ $boolean: true }, { $boolCast: { $field: '$sme.Enabled#value' } }] },
            {
                $eq: [
                    { $dayOfWeek: { $attribute: { GLOBAL: 'LOCALNOW' } } },
                    { $dayOfMonth: { $dateTimeVal: '2025-01-01T00:00:00Z' } },
                ],
            },
            {
                $eq: [
                    { $month: { $dateTimeCast: { $strVal: '2025-01-01T00:00:00Z' } } },
                    { $year: { $dateTimeVal: '2025-01-01T00:00:00Z' } },
                ],
            },
            {
                $match: [
                    { $contains: [{ $field: '$sm#idShort' }, { $attribute: { CLAIM: 'role' } }] },
                    {
                        '$starts-with': [
                            { $field: '$sm#idShort' },
                            { $attribute: { REFERENCE: '(Submodel)*#idShort' } },
                        ],
                    },
                    { '$ends-with': [{ $field: '$sm#idShort' }, { $strVal: 'plate' }] },
                    { $regex: [{ $field: '$sm#idShort' }, { $strVal: '^Name' }] },
                    { $match: [{ $eq: [{ $field: '$sm#id' }, { $strVal: 'x' }] }] },
                ],
            },
        ],
    },
    $filters: [{ $fragment: '$sm#supplementalSemanticIds[]', $condition: { $boolean: true } }],
};

describe('toJsonableQuery', () => {
    it('serializes every expression with the JSON names of the query language', () => {
        expect(toJsonableQuery(FULL_QUERY)).toEqual(FULL_QUERY_JSON);
    });

    it('omits $select and $filters if they are not set', () => {
        const query = new Query(new BooleanLiteral(true));

        expect(toJsonableQuery(query)).toEqual({ $condition: { $boolean: true } });
    });

    it('serializes plain objects that match the classes', () => {
        const query = new Query({ eq: [{ field: '$aas#idShort' }, { strVal: 'Robot' }] });

        expect(toJsonableQuery(query)).toEqual({
            $condition: { $eq: [{ $field: '$aas#idShort' }, { $strVal: 'Robot' }] },
        });
    });

    it('throws for an object that is not a query expression', () => {
        const query = new Query({ unknown: true } as unknown as BooleanLiteral);

        expect(() => toJsonableQuery(query)).toThrow('Unexpected query expression');
    });

    it('throws for an invalid enumeration value', () => {
        const query = new Query(
            new EqualComparison([new AttributeOperand(new GlobalAttribute(42 as GlobalAttributeKind)), str('x')])
        );

        expect(() => toJsonableQuery(query)).toThrow('Unexpected GlobalAttributeKind value: 42');
    });
});

describe('queryFromJsonable', () => {
    it('parses every expression into the classes of the query model', () => {
        const result = queryFromJsonable(FULL_QUERY_JSON);

        expect(result.error).toBeNull();
        expect(result.value).toEqual(FULL_QUERY);
        expect(result.value?.condition).toBeInstanceOf(AndExpression);
    });

    it('round-trips through toJsonableQuery', () => {
        const query = queryFromJsonable(FULL_QUERY_JSON).mustValue();

        expect(toJsonableQuery(query)).toEqual(FULL_QUERY_JSON);
    });

    it('parses a query without $select and $filters', () => {
        const query = queryFromJsonable({ $condition: { $boolean: true } }).mustValue();

        expect(query).toEqual(new Query(new BooleanLiteral(true), null, null));
    });

    it('tells the date-time attribute operand from the string attribute operand', () => {
        const query = queryFromJsonable({
            $condition: {
                $eq: [{ $year: { $attribute: { GLOBAL: 'CLIENTNOW' } } }, { $attribute: { GLOBAL: 'ANONYMOUS' } }],
            },
        }).mustValue();
        const [left, right] = (query.condition as EqualComparison).eq;

        expect((left as Year).year).toBeInstanceOf(DateTimeAttributeOperand);
        expect(right).toEqual(new AttributeOperand(new GlobalAttribute(GlobalAttributeKind.Anonymous)));
    });

    it.each<[string, JsonValue, string, string]>([
        ['a query that is not an object', [] as JsonValue, 'Expected a JSON object, but got an array', ''],
        ['a missing $condition', {}, 'The required property is missing', '$condition'],
        [
            'an unknown property of the query',
            { $condition: { $boolean: true }, $limit: 1 },
            'Unexpected properties for Query: $limit',
            '',
        ],
        [
            'an unknown $select',
            { $select: 'idShort', $condition: { $boolean: true } },
            'Expected a QuerySelect',
            '$select',
        ],
        ['an unknown operator', { $condition: { $bogus: [] } }, 'Expected exactly one of the properties', '$condition'],
        [
            'two operators in one expression',
            { $condition: { $boolean: true, $not: { $boolean: false } } },
            'but got: $boolean, $not',
            '$condition',
        ],
        [
            'a comparison with one operand',
            { $condition: { $eq: [{ $field: '$aas#idShort' }] } },
            'Expected exactly two operands, but got 1',
            '$condition.$eq',
        ],
        [
            'a non-string operand of a string operation',
            { $condition: { $contains: [{ $field: '$aas#idShort' }, { $numVal: 1 }] } },
            'Expected exactly one of the properties $field, $strVal, $strCast, $attribute for StringValue',
            '$condition.$contains[1]',
        ],
        [
            'a literal of the wrong type',
            { $condition: { $and: [{ $boolean: true }, { $boolean: 'yes' }] } },
            'Expected a boolean, but got string',
            '$condition.$and[1].$boolean',
        ],
        [
            'ANONYMOUS as a date-time attribute',
            { $condition: { $eq: [{ $year: { $attribute: { GLOBAL: 'ANONYMOUS' } } }, { $numVal: 2025 }] } },
            'Expected a DateTimeGlobalAttributeKind',
            '$condition.$eq[0].$year.$attribute.GLOBAL',
        ],
        [
            'an unknown property of a filter',
            {
                $condition: { $boolean: true },
                $filters: [{ $fragment: '$sm#id', $condition: { $boolean: true }, $match: true }],
            },
            'Unexpected properties for QueryFilter: $match',
            '$filters[0]',
        ],
    ])('reports %s', (_, jsonable, message, path) => {
        const result = queryFromJsonable(jsonable);

        expect(result.value).toBeNull();
        expect(result.error?.message).toContain(message);
        expect(result.error?.path.toString()).toBe(path);
    });

    it.each(['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'valueOf'])(
        'reports the inherited property name %s as an unknown operator',
        (name) => {
            const jsonables = [
                `{"$condition":{"${name}":[]}}`,
                `{"$condition":{"$eq":[{"${name}":[]},{"$strVal":"x"}]}}`,
                `{"$condition":{"$eq":[{"$attribute":{"${name}":"x"}},{"$strVal":"x"}]}}`,
            ];

            for (const json of jsonables) {
                const result = queryFromJsonable(JSON.parse(json));

                expect(result.value).toBeNull();
                expect(result.error?.message).toContain('Expected exactly one of the properties');
            }
        }
    );

    it('rethrows unexpected errors', () => {
        const throwing = {
            get $condition(): JsonValue {
                throw new TypeError('boom');
            },
        } as unknown as JsonValue;

        expect(() => queryFromJsonable(throwing)).toThrow('boom');
    });
});
