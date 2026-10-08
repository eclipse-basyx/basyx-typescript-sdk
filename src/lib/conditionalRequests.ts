import type { ApiResult, NotModifiedResult } from '../models/api';

type ResponseLike = { status?: unknown; headers?: { get?: (name: string) => string | null } };

type ConditionalErrorFields = { etag?: string; preconditionFailed?: boolean; preconditionRequired?: boolean };

function getErrorResponse(err: unknown): ResponseLike | undefined {
    return (err as { response?: ResponseLike } | undefined)?.response;
}

/**
 * Returns the `ETag` header of a response, or `undefined` if the server sent none.
 * The entity tag is opaque and returned unchanged.
 */
export function getEtag(response: unknown): string | undefined {
    const headers = (response as ResponseLike | undefined)?.headers;
    if (typeof headers?.get !== 'function') {
        return undefined;
    }

    return headers.get('ETag') ?? undefined;
}

/**
 * Returns the conditional request fields of a failed request: the `ETag` of the error response and the flags for
 * `412 Precondition Failed` and `428 Precondition Required`. Fields that do not apply are omitted.
 */
export function getConditionalErrorFields(err: unknown): ConditionalErrorFields {
    const response = getErrorResponse(err);
    const etag = getEtag(response);

    return {
        ...(etag !== undefined && { etag }),
        ...(response?.status === 412 && { preconditionFailed: true }),
        ...(response?.status === 428 && { preconditionRequired: true }),
    };
}

/**
 * Returns the conditional request fields of a failed {@link ApiResult}, so that a composite operation can pass them on.
 */
export function pickConditionalErrorFields(
    result: Extract<ApiResult<unknown, unknown>, { success: false }>
): ConditionalErrorFields {
    return {
        ...(result.etag !== undefined && { etag: result.etag }),
        ...(result.preconditionFailed && { preconditionFailed: true }),
        ...(result.preconditionRequired && { preconditionRequired: true }),
    };
}

/**
 * Returns the {@link NotModifiedResult} for a `304 Not Modified` answer to a read with `ifNoneMatch`, or `undefined`
 * for any other error.
 */
export function getNotModifiedResult<IfNoneMatch extends string | undefined>(
    err: unknown,
    ifNoneMatch: IfNoneMatch | undefined
): (IfNoneMatch extends undefined ? never : NotModifiedResult) | undefined {
    const response = getErrorResponse(err);
    if (!ifNoneMatch || response?.status !== 304) {
        return undefined;
    }

    const etag = getEtag(response);
    const result: NotModifiedResult = {
        success: true,
        notModified: true,
        statusCode: 304,
        ...(etag !== undefined && { etag }),
    };
    return result as IfNoneMatch extends undefined ? never : NotModifiedResult;
}
