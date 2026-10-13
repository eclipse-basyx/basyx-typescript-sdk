import { common } from '@aas-core-works/aas-core3.1-typescript';
import {
    DeserializationError,
    IndexSegment,
    JsonObject,
    JsonValue,
    Path,
    PropertySegment,
} from '@aas-core-works/aas-core3.1-typescript/jsonization';
import {
    AndExpression,
    AttributeItem,
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
    DateTimeOperand,
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
    LogicalExpression,
    MatchClause,
    MatchExpression,
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
    StringValue,
    TimeCast,
    TimeCastOperand,
    TimeLiteral,
    Value,
    Year,
} from '../models/Query';

// The JSON names of the global attribute kinds, indexed by the enum values. DateTimeGlobalAttributeKind uses the first
// three of them.
const GLOBAL_ATTRIBUTE_KIND_JSON_NAMES = ['LOCALNOW', 'UTCNOW', 'CLIENTNOW', 'ANONYMOUS'];

const QUERY_SELECT_JSON_NAMES = ['id'];

// The JSON name of each property of the expression classes. Every expression class has exactly one property.
const PROPERTY_JSON_NAMES: Array<[string, string]> = [
    ['claim', 'CLAIM'],
    ['kind', 'GLOBAL'],
    ['reference', 'REFERENCE'],
    ['field', '$field'],
    ['strVal', '$strVal'],
    ['attribute', '$attribute'],
    ['numVal', '$numVal'],
    ['hexVal', '$hexVal'],
    ['dateTimeVal', '$dateTimeVal'],
    ['timeVal', '$timeVal'],
    ['boolean', '$boolean'],
    ['strCast', '$strCast'],
    ['numCast', '$numCast'],
    ['hexCast', '$hexCast'],
    ['boolCast', '$boolCast'],
    ['dateTimeCast', '$dateTimeCast'],
    ['timeCast', '$timeCast'],
    ['dayOfWeek', '$dayOfWeek'],
    ['dayOfMonth', '$dayOfMonth'],
    ['month', '$month'],
    ['year', '$year'],
    ['eq', '$eq'],
    ['ne', '$ne'],
    ['gt', '$gt'],
    ['ge', '$ge'],
    ['lt', '$lt'],
    ['le', '$le'],
    ['contains', '$contains'],
    ['startsWith', '$starts-with'],
    ['endsWith', '$ends-with'],
    ['regex', '$regex'],
    ['matchOperands', '$match'],
    ['andOperands', '$and'],
    ['orOperands', '$or'],
    ['notOperand', '$not'],
];

type QueryExpression =
    | LogicalExpression
    | Value
    | AttributeItem
    | DateTimeAttributeItem
    | DateTimeAttributeOperand
    | TimeCastOperand;

/**
 * Serialize a query to the JSON of the AAS Query Language, as sent in the body of the `/query/*` endpoints.
 *
 * @param query The query to serialize
 * @returns The JSON-able object, e.g. `{ "$condition": { "$eq": [{ "$field": "$aas#idShort" }, { "$strVal": "x" }] } }`
 */
export function toJsonableQuery(query: Query): JsonObject {
    const jsonable: JsonObject = {};

    if (query.select !== null && query.select !== undefined) {
        jsonable['$select'] = enumToJsonable(QUERY_SELECT_JSON_NAMES, query.select, 'QuerySelect');
    }

    jsonable['$condition'] = expressionToJsonable(query.condition);

    if (query.filters !== null && query.filters !== undefined) {
        jsonable['$filters'] = query.filters.map((filter) => ({
            $fragment: filter.fragment,
            $condition: expressionToJsonable(filter.condition),
        }));
    }

    return jsonable;
}

function expressionToJsonable(expression: QueryExpression): JsonObject {
    const properties = expression as unknown as Record<string, unknown>;
    for (const [property, jsonName] of PROPERTY_JSON_NAMES) {
        const value = properties?.[property];
        if (value !== undefined) {
            return { [jsonName]: propertyToJsonable(property, value) };
        }
    }

    throw new Error(`Unexpected query expression: ${JSON.stringify(expression)}`);
}

function propertyToJsonable(property: string, value: unknown): JsonValue {
    if (property === 'kind') {
        return enumToJsonable(GLOBAL_ATTRIBUTE_KIND_JSON_NAMES, value as number, 'GlobalAttributeKind');
    }
    if (Array.isArray(value)) {
        return value.map((item) => expressionToJsonable(item));
    }
    if (typeof value === 'object' && value !== null) {
        return expressionToJsonable(value as QueryExpression);
    }

    return value as string | number | boolean;
}

function enumToJsonable(jsonNames: string[], value: number, enumName: string): string {
    const jsonName = jsonNames[value];
    if (jsonName === undefined) {
        throw new Error(`Unexpected ${enumName} value: ${value}`);
    }

    return jsonName;
}

/**
 * Parse the JSON of the AAS Query Language as a {@link Query}.
 *
 * @param jsonable The JSON-able value to parse, e.g. the result of `JSON.parse`
 * @returns Either the parsed query, or the error with the path to the invalid value
 */
export function queryFromJsonable(jsonable: JsonValue): common.Either<Query, DeserializationError> {
    try {
        return new common.Either<Query, DeserializationError>(parseQuery(jsonable), null);
    } catch (err) {
        if (err instanceof ParseError) {
            return new common.Either<Query, DeserializationError>(
                null,
                new DeserializationError(err.message, err.path)
            );
        }
        throw err;
    }
}

class ParseError {
    readonly path = new Path();

    constructor(readonly message: string) {}
}

type Parse<T> = (jsonable: JsonValue) => T;

function fail(message: string): never {
    throw new ParseError(message);
}

function describeJsonValue(jsonable: JsonValue | undefined): string {
    if (jsonable === null) {
        return 'null';
    }
    if (Array.isArray(jsonable)) {
        return 'an array';
    }

    return typeof jsonable;
}

function asObject(jsonable: JsonValue): JsonObject {
    if (typeof jsonable !== 'object' || jsonable === null || Array.isArray(jsonable)) {
        fail(`Expected a JSON object, but got ${describeJsonValue(jsonable)}`);
    }

    return jsonable as JsonObject;
}

function asString(jsonable: JsonValue): string {
    if (typeof jsonable !== 'string') {
        fail(`Expected a string, but got ${describeJsonValue(jsonable)}`);
    }

    return jsonable;
}

function asNumber(jsonable: JsonValue): number {
    if (typeof jsonable !== 'number') {
        fail(`Expected a number, but got ${describeJsonValue(jsonable)}`);
    }

    return jsonable;
}

function asBoolean(jsonable: JsonValue): boolean {
    if (typeof jsonable !== 'boolean') {
        fail(`Expected a boolean, but got ${describeJsonValue(jsonable)}`);
    }

    return jsonable;
}

function asArray(jsonable: JsonValue): JsonValue[] {
    if (!Array.isArray(jsonable)) {
        fail(`Expected an array, but got ${describeJsonValue(jsonable)}`);
    }

    return jsonable;
}

function listOf<T>(parse: Parse<T>): Parse<T[]> {
    return (jsonable) => {
        const items = asArray(jsonable);
        return items.map((item, index) => {
            try {
                return parse(item);
            } catch (err) {
                if (err instanceof ParseError) {
                    err.path.prepend(new IndexSegment(items, index));
                }
                throw err;
            }
        });
    };
}

function pairOf<T>(parse: Parse<T>): Parse<[T, T]> {
    return (jsonable) => {
        const items = asArray(jsonable);
        if (items.length !== 2) {
            fail(`Expected exactly two operands, but got ${items.length}`);
        }

        const [left, right] = listOf(parse)(items);
        return [left, right];
    };
}

function enumFromJsonable(jsonNames: string[], enumName: string): Parse<number> {
    return (jsonable) => {
        const value = jsonNames.indexOf(asString(jsonable));
        if (value === -1) {
            fail(`Expected a ${enumName} (${jsonNames.join(', ')}), but got ${JSON.stringify(jsonable)}`);
        }

        return value;
    };
}

function property<T>(jsonObject: JsonObject, name: string, parse: Parse<T>): T {
    try {
        if (jsonObject[name] === undefined) {
            fail(`The required property is missing`);
        }

        return parse(jsonObject[name]);
    } catch (err) {
        if (err instanceof ParseError) {
            err.path.prepend(new PropertySegment(jsonObject, name));
        }
        throw err;
    }
}

function expectOnlyProperties(jsonObject: JsonObject, names: string[], typeName: string): void {
    const unexpected = Object.keys(jsonObject).filter((key) => !names.includes(key));
    if (unexpected.length > 0) {
        fail(`Unexpected properties for ${typeName}: ${unexpected.join(', ')}`);
    }
}

type Parsers<T> = Record<string, (jsonObject: JsonObject) => T>;

/**
 * Parse an expression of a union by the one property that names its class, as the JSON of the query language has no
 * `modelType`.
 */
function oneOf<T>(typeName: string, parsers: () => Parsers<T>): Parse<T> {
    return (jsonable) => {
        const jsonObject = asObject(jsonable);
        const available = parsers();
        const names = Object.keys(jsonObject);
        if (names.length !== 1 || available[names[0]] === undefined) {
            fail(
                `Expected exactly one of the properties ${Object.keys(available).join(', ')} for ${typeName}, ` +
                    `but got: ${names.join(', ') || 'none'}`
            );
        }

        return available[names[0]](jsonObject);
    };
}

const parseGlobalAttributeKind = enumFromJsonable(
    GLOBAL_ATTRIBUTE_KIND_JSON_NAMES,
    'GlobalAttributeKind'
) as Parse<GlobalAttributeKind>;
const parseDateTimeGlobalAttributeKind = enumFromJsonable(
    GLOBAL_ATTRIBUTE_KIND_JSON_NAMES.slice(0, 3),
    'DateTimeGlobalAttributeKind'
) as Parse<DateTimeGlobalAttributeKind>;
const parseQuerySelect = enumFromJsonable(QUERY_SELECT_JSON_NAMES, 'QuerySelect') as Parse<QuerySelect>;

const parseAttributeItem: Parse<AttributeItem> = oneOf<AttributeItem>('AttributeItem', () => ({
    CLAIM: (o) => new ClaimAttribute(property(o, 'CLAIM', asString)),
    GLOBAL: (o) => new GlobalAttribute(property(o, 'GLOBAL', parseGlobalAttributeKind)),
    REFERENCE: (o) => new ReferenceAttribute(property(o, 'REFERENCE', asString)),
}));

const parseDateTimeAttributeItem: Parse<DateTimeAttributeItem> = oneOf<DateTimeAttributeItem>(
    'DateTimeAttributeItem',
    () => ({
        GLOBAL: (o) => new DateTimeAttributeItem(property(o, 'GLOBAL', parseDateTimeGlobalAttributeKind)),
    })
);

const stringValueParsers = (): Parsers<StringValue> => ({
    $field: (o) => new FieldOperand(property(o, '$field', asString)),
    $strVal: (o) => new StringLiteral(property(o, '$strVal', asString)),
    $strCast: (o) => new StringCast(property(o, '$strCast', parseValue)),
    $attribute: (o) => new AttributeOperand(property(o, '$attribute', parseAttributeItem)),
});

const dateTimeLiteralParsers = (): Parsers<DateTimeLiteral | DateTimeCast> => ({
    $dateTimeVal: (o) => new DateTimeLiteral(property(o, '$dateTimeVal', asString)),
    $dateTimeCast: (o) => new DateTimeCast(property(o, '$dateTimeCast', parseStringValue)),
});

const parseStringValue: Parse<StringValue> = oneOf<StringValue>('StringValue', stringValueParsers);

const parseDateTimeOperand: Parse<DateTimeOperand> = oneOf<DateTimeOperand>('DateTimeOperand', () => ({
    ...dateTimeLiteralParsers(),
    $attribute: (o) => new DateTimeAttributeOperand(property(o, '$attribute', parseDateTimeAttributeItem)),
}));

const parseTimeCastOperand: Parse<TimeCastOperand> = oneOf<TimeCastOperand>('TimeCastOperand', () => ({
    ...stringValueParsers(),
    ...dateTimeLiteralParsers(),
}));

const parseValue: Parse<Value> = oneOf<Value>('Value', () => ({
    ...stringValueParsers(),
    $numVal: (o) => new NumberLiteral(property(o, '$numVal', asNumber)),
    $numCast: (o) => new NumberCast(property(o, '$numCast', parseValue)),
    $dayOfWeek: (o) => new DayOfWeek(property(o, '$dayOfWeek', parseDateTimeOperand)),
    $dayOfMonth: (o) => new DayOfMonth(property(o, '$dayOfMonth', parseDateTimeOperand)),
    $month: (o) => new Month(property(o, '$month', parseDateTimeOperand)),
    $year: (o) => new Year(property(o, '$year', parseDateTimeOperand)),
    $hexVal: (o) => new HexLiteral(property(o, '$hexVal', asString)),
    $hexCast: (o) => new HexCast(property(o, '$hexCast', parseValue)),
    $boolean: (o) => new BooleanLiteral(property(o, '$boolean', asBoolean)),
    $boolCast: (o) => new BooleanCast(property(o, '$boolCast', parseValue)),
    ...dateTimeLiteralParsers(),
    $timeVal: (o) => new TimeLiteral(property(o, '$timeVal', asString)),
    $timeCast: (o) => new TimeCast(property(o, '$timeCast', parseTimeCastOperand)),
}));

const matchExpressionParsers = (): Parsers<MatchExpression> => ({
    $match: (o) => new MatchClause(property(o, '$match', listOf(parseMatchExpression))),
    $eq: (o) => new EqualComparison(property(o, '$eq', pairOf(parseValue))),
    $ne: (o) => new NotEqualComparison(property(o, '$ne', pairOf(parseValue))),
    $gt: (o) => new GreaterThanComparison(property(o, '$gt', pairOf(parseValue))),
    $ge: (o) => new GreaterThanOrEqualComparison(property(o, '$ge', pairOf(parseValue))),
    $lt: (o) => new LessThanComparison(property(o, '$lt', pairOf(parseValue))),
    $le: (o) => new LessThanOrEqualComparison(property(o, '$le', pairOf(parseValue))),
    $contains: (o) => new ContainsComparison(property(o, '$contains', pairOf(parseStringValue))),
    '$starts-with': (o) => new StartsWithComparison(property(o, '$starts-with', pairOf(parseStringValue))),
    '$ends-with': (o) => new EndsWithComparison(property(o, '$ends-with', pairOf(parseStringValue))),
    $regex: (o) => new RegexComparison(property(o, '$regex', pairOf(parseStringValue))),
});

const parseMatchExpression: Parse<MatchExpression> = oneOf<MatchExpression>('MatchExpression', matchExpressionParsers);

const parseLogicalExpression: Parse<LogicalExpression> = oneOf<LogicalExpression>('LogicalExpression', () => ({
    $and: (o) => new AndExpression(property(o, '$and', listOf(parseLogicalExpression))),
    $or: (o) => new OrExpression(property(o, '$or', listOf(parseLogicalExpression))),
    $not: (o) => new NotExpression(property(o, '$not', parseLogicalExpression)),
    $boolean: (o) => new BooleanLiteral(property(o, '$boolean', asBoolean)),
    ...matchExpressionParsers(),
}));

function parseQueryFilter(jsonable: JsonValue): QueryFilter {
    const jsonObject = asObject(jsonable);
    expectOnlyProperties(jsonObject, ['$fragment', '$condition'], 'QueryFilter');

    return new QueryFilter(
        property(jsonObject, '$fragment', asString),
        property(jsonObject, '$condition', parseLogicalExpression)
    );
}

function parseQuery(jsonable: JsonValue): Query {
    const jsonObject = asObject(jsonable);
    expectOnlyProperties(jsonObject, ['$select', '$condition', '$filters'], 'Query');

    return new Query(
        property(jsonObject, '$condition', parseLogicalExpression),
        jsonObject['$select'] === undefined ? null : property(jsonObject, '$select', parseQuerySelect),
        jsonObject['$filters'] === undefined ? null : property(jsonObject, '$filters', listOf(parseQueryFilter))
    );
}
