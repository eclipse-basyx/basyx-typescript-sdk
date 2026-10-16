import type { OperationHandle } from '../models/api';

type ResponseLike = { headers?: { get?: (name: string) => string | null } };

const OPERATION_STATUS_SEGMENT = /\/operation-status\/([^/?#]+)\/?(?:[?#].*)?$/;

/**
 * Returns the handle of an asynchronously invoked Operation from the `Location` header of the `202 Accepted`
 * response, or `undefined` if the header is missing or does not point to an `operation-status` resource.
 *
 * The `Location` header is returned unchanged. The handle id is URL-decoded, so it can be passed to
 * `getOperationAsyncStatus` and `getOperationAsyncResult` as is.
 */
export function getOperationHandle(response: unknown): OperationHandle | undefined {
    const headers = (response as ResponseLike | undefined)?.headers;
    if (typeof headers?.get !== 'function') {
        return undefined;
    }

    const location = headers.get('Location');
    const encodedHandleId = location?.match(OPERATION_STATUS_SEGMENT)?.[1];
    if (location == null || encodedHandleId === undefined) {
        return undefined;
    }

    try {
        return { handleId: decodeURIComponent(encodedHandleId), location };
    } catch {
        return { handleId: encodedHandleId, location };
    }
}
