/**
 * A union for "no-throw" style responses:
 * Success => { success: true; data: T }
 * Failure => { success: false; error: E }
 */
export type ApiResult<T, E> = { success: true; data: T } | { success: false; error: E };
