/**
 * Model of the AAS Query Language (IDTA-01002-3, `$condition`, `$filters` and `$select`).
 *
 * The names, property order and constructor signatures follow the query region of the aas-core-meta V3.2 meta-model,
 * so that this model can be replaced by the classes aas-core-codegen generates for it. Properties carry the
 * meta-model names (e.g. `strVal`, `andOperands`); {@link toJsonableQuery} and {@link queryFromJsonable} map them to the
 * JSON names of the query language (e.g. `$strVal`, `$and`).
 *
 * See https://industrialdigitaltwin.io/aas-specifications/IDTA-01002/v3.2/query-language.html
 */

/**
 * Enumerate the global attributes which can be used in a query.
 */
export enum GlobalAttributeKind {
    /** The current date and time in the local time zone of the server (`LOCALNOW`) */
    LocalNow = 0,
    /** The current date and time in UTC (`UTCNOW`) */
    UtcNow = 1,
    /** The current date and time of the client (`CLIENTNOW`) */
    ClientNow = 2,
    /** The anonymous user, i.e. a request without authentication (`ANONYMOUS`) */
    Anonymous = 3,
}

/**
 * Enumerate the global attributes which can be used as a date-time operand in a query.
 *
 * This is a subset of {@link GlobalAttributeKind}.
 */
export enum DateTimeGlobalAttributeKind {
    /** The current date and time in the local time zone of the server (`LOCALNOW`) */
    LocalNow = 0,
    /** The current date and time in UTC (`UTCNOW`) */
    UtcNow = 1,
    /** The current date and time of the client (`CLIENTNOW`) */
    ClientNow = 2,
}

/**
 * Enumerate what a query returns instead of the full objects.
 */
export enum QuerySelect {
    /** Return only the identifiers of the matching objects (`id`) */
    Id = 0,
}

/**
 * Refer to a claim of the requester, e.g. from an access token (`CLAIM`).
 */
export class ClaimAttribute {
    constructor(
        /** Name of the claim */
        public claim: string
    ) {}
}

/**
 * Refer to a global attribute (`GLOBAL`).
 */
export class GlobalAttribute {
    constructor(
        /** Kind of the global attribute */
        public kind: GlobalAttributeKind
    ) {}
}

/**
 * Refer to an attribute of a referable (`REFERENCE`).
 */
export class ReferenceAttribute {
    constructor(
        /** Reference to the attribute, e.g. `(Submodel)*#idShort` */
        public reference: string
    ) {}
}

/**
 * Refer to a global attribute which gives a date and time (`GLOBAL`).
 */
export class DateTimeAttributeItem {
    constructor(
        /** Kind of the global attribute */
        public kind: DateTimeGlobalAttributeKind
    ) {}
}

/**
 * Refer to a field of the queried data (`$field`), e.g. `$aas#idShort` or `$sme.Temperature#value`.
 */
export class FieldOperand {
    constructor(
        /** Path to the field */
        public field: string
    ) {}
}

/**
 * Represent a string literal (`$strVal`).
 */
export class StringLiteral {
    constructor(public strVal: string) {}
}

/**
 * Use an attribute as an operand (`$attribute`).
 */
export class AttributeOperand {
    constructor(public attribute: AttributeItem) {}
}

/**
 * Represent a number literal (`$numVal`).
 */
export class NumberLiteral {
    constructor(public numVal: number) {}
}

/**
 * Represent a hexadecimal literal (`$hexVal`), e.g. `16#1F`.
 */
export class HexLiteral {
    constructor(public hexVal: string) {}
}

/**
 * Represent a date-time literal (`$dateTimeVal`), e.g. `2025-01-01T00:00:00Z`.
 */
export class DateTimeLiteral {
    constructor(public dateTimeVal: string) {}
}

/**
 * Represent a time literal (`$timeVal`), e.g. `12:00` or `12:00:00`.
 */
export class TimeLiteral {
    constructor(public timeVal: string) {}
}

/**
 * Represent a boolean literal (`$boolean`). It is both an operand and a logical expression.
 */
export class BooleanLiteral {
    constructor(public boolean: boolean) {}
}

/**
 * Cast the operand to a string (`$strCast`).
 */
export class StringCast {
    constructor(public strCast: Value) {}
}

/**
 * Cast the operand to a number (`$numCast`).
 */
export class NumberCast {
    constructor(public numCast: Value) {}
}

/**
 * Cast the operand to a hexadecimal (`$hexCast`).
 */
export class HexCast {
    constructor(public hexCast: Value) {}
}

/**
 * Cast the operand to a boolean (`$boolCast`).
 */
export class BooleanCast {
    constructor(public boolCast: Value) {}
}

/**
 * Cast the operand to a date-time (`$dateTimeCast`).
 */
export class DateTimeCast {
    constructor(public dateTimeCast: StringValue) {}
}

/**
 * Cast the operand to a time (`$timeCast`).
 */
export class TimeCast {
    constructor(public timeCast: TimeCastOperand) {}
}

/**
 * Extract the day of the week from a date-time (`$dayOfWeek`).
 */
export class DayOfWeek {
    constructor(public dayOfWeek: DateTimeOperand) {}
}

/**
 * Extract the day of the month from a date-time (`$dayOfMonth`).
 */
export class DayOfMonth {
    constructor(public dayOfMonth: DateTimeOperand) {}
}

/**
 * Extract the month from a date-time (`$month`).
 */
export class Month {
    constructor(public month: DateTimeOperand) {}
}

/**
 * Extract the year from a date-time (`$year`).
 */
export class Year {
    constructor(public year: DateTimeOperand) {}
}

/**
 * Use a date-time global attribute as an operand (`$attribute`).
 */
export class DateTimeAttributeOperand {
    constructor(public attribute: DateTimeAttributeItem) {}
}

/**
 * Check whether the two operands are equal (`$eq`).
 */
export class EqualComparison {
    constructor(public eq: [Value, Value]) {}
}

/**
 * Check whether the two operands are not equal (`$ne`).
 */
export class NotEqualComparison {
    constructor(public ne: [Value, Value]) {}
}

/**
 * Check whether the first operand is greater than the second (`$gt`).
 */
export class GreaterThanComparison {
    constructor(public gt: [Value, Value]) {}
}

/**
 * Check whether the first operand is greater than or equal to the second (`$ge`).
 */
export class GreaterThanOrEqualComparison {
    constructor(public ge: [Value, Value]) {}
}

/**
 * Check whether the first operand is less than the second (`$lt`).
 */
export class LessThanComparison {
    constructor(public lt: [Value, Value]) {}
}

/**
 * Check whether the first operand is less than or equal to the second (`$le`).
 */
export class LessThanOrEqualComparison {
    constructor(public le: [Value, Value]) {}
}

/**
 * Check whether the first operand contains the second (`$contains`).
 */
export class ContainsComparison {
    constructor(public contains: [StringValue, StringValue]) {}
}

/**
 * Check whether the first operand starts with the second (`$starts-with`).
 */
export class StartsWithComparison {
    constructor(public startsWith: [StringValue, StringValue]) {}
}

/**
 * Check whether the first operand ends with the second (`$ends-with`).
 */
export class EndsWithComparison {
    constructor(public endsWith: [StringValue, StringValue]) {}
}

/**
 * Check whether the first operand matches the regular expression given by the second (`$regex`).
 */
export class RegexComparison {
    constructor(public regex: [StringValue, StringValue]) {}
}

/**
 * Evaluate all the expressions against the same element of a list (`$match`), at least one.
 */
export class MatchClause {
    constructor(public matchOperands: Array<MatchExpression>) {}
}

/**
 * Check whether all the operands hold (`$and`), at least two.
 */
export class AndExpression {
    constructor(public andOperands: Array<LogicalExpression>) {}
}

/**
 * Check whether any of the operands holds (`$or`), at least two.
 */
export class OrExpression {
    constructor(public orOperands: Array<LogicalExpression>) {}
}

/**
 * Negate the operand (`$not`).
 */
export class NotExpression {
    constructor(public notOperand: LogicalExpression) {}
}

/**
 * Filter a fragment of the returned data by a condition (an entry of `$filters`).
 */
export class QueryFilter {
    constructor(
        /** The fragment of the returned data to which the filter applies (`$fragment`) */
        public fragment: string,
        /** The condition which the elements of the fragment need to fulfill (`$condition`) */
        public condition: LogicalExpression
    ) {}
}

/**
 * A query in the AAS Query Language.
 *
 * @example
 * ```typescript
 * const query = new Query(
 *     new EqualComparison([new FieldOperand('$aas#idShort'), new StringLiteral('Robot')])
 * );
 * ```
 */
export class Query {
    constructor(
        /** The condition which the returned objects need to fulfill (`$condition`) */
        public condition: LogicalExpression,
        /** What the query returns instead of the full objects (`$select`); full objects if `null` */
        public select: QuerySelect | null = null,
        /** Filters to reduce the returned data (`$filters`); at least one if set */
        public filters: Array<QueryFilter> | null = null
    ) {}
}

/** An attribute which can be used as an operand */
export type AttributeItem = ClaimAttribute | GlobalAttribute | ReferenceAttribute;

/** An operand which evaluates to a string */
export type StringValue = FieldOperand | StringLiteral | StringCast | AttributeOperand;

/** An operand which evaluates to a date and time */
export type DateTimeOperand = DateTimeLiteral | DateTimeCast | DateTimeAttributeOperand;

/** An operand which can be cast to `xs:time` */
export type TimeCastOperand = StringValue | DateTimeLiteral | DateTimeCast;

/** An operand which evaluates to a number */
export type NumericalOperand = NumberLiteral | NumberCast | DayOfWeek | DayOfMonth | Month | Year;

/** An operand which evaluates to a hexadecimal */
export type HexOperand = HexLiteral | HexCast;

/** An operand which evaluates to a boolean */
export type BoolOperand = BooleanLiteral | BooleanCast;

/** An operand which evaluates to a time */
export type TimeOperand = TimeLiteral | TimeCast;

/** Any operand of a comparison */
export type Value =
    | StringValue
    | NumericalOperand
    | HexOperand
    | BoolOperand
    | DateTimeLiteral
    | DateTimeCast
    | TimeOperand;

/** An expression which can be nested in a {@link MatchClause} */
export type MatchExpression =
    | MatchClause
    | EqualComparison
    | NotEqualComparison
    | GreaterThanComparison
    | GreaterThanOrEqualComparison
    | LessThanComparison
    | LessThanOrEqualComparison
    | ContainsComparison
    | StartsWithComparison
    | EndsWithComparison
    | RegexComparison;

/** An expression which evaluates to a boolean */
export type LogicalExpression = AndExpression | OrExpression | NotExpression | BooleanLiteral | MatchExpression;
