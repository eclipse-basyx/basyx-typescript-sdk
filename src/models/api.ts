/**
 * A union for "no-throw" style responses:
 * Success => { success: true; data: T; statusCode?: number; etag?: string }
 * Failure => { success: false; error: E; statusCode?: number; etag?: string; preconditionFailed?: boolean; preconditionRequired?: boolean }
 *
 * - `etag`: the opaque entity tag from the `ETag` response header, `undefined` when the server sends none
 * - `preconditionFailed`: `true` for `412 Precondition Failed` (an `If-Match` or `If-None-Match` condition was not met)
 * - `preconditionRequired`: `true` for `428 Precondition Required` (the server requires `If-Match` for the write)
 */
export type ApiResult<T, E> =
    | { success: true; data: T; statusCode?: number; etag?: string; notModified?: false }
    | {
          success: false;
          error: E;
          statusCode?: number;
          etag?: string;
          preconditionFailed?: boolean;
          preconditionRequired?: boolean;
      };

/**
 * Result of a read with `ifNoneMatch` whose representation has not changed (`304 Not Modified`).
 * It carries no data; the caller keeps using its cached representation.
 */
export type NotModifiedResult = {
    success: true;
    notModified: true;
    data?: undefined;
    statusCode: 304;
    etag?: string;
};

/**
 * Result of a read that supports `ifNoneMatch`.
 *
 * It is the plain {@link ApiResult} when no `ifNoneMatch` is passed and additionally {@link NotModifiedResult} when
 * it is, so only callers who opt in have to handle `notModified`.
 */
export type ConditionalApiResult<T, E, IfNoneMatch extends string | undefined = string> =
    | ApiResult<T, E>
    | (IfNoneMatch extends undefined ? never : NotModifiedResult);

/**
 * Conditional request headers (RFC 9110). Entity tags are opaque and sent unchanged.
 */
export type ConditionalRequestHeaders = {
    /** Sent as `If-Match`: an `etag` of a previous response, or `*` */
    ifMatch?: string;
    /** Sent as `If-None-Match`: an `etag` of a previous response, or `*` */
    ifNoneMatch?: string;
};
