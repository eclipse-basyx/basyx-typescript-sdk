/**
 * A union for "no-throw" style responses:
 * Success => { success: true; data: T; statusCode?: number }
 * Failure => { success: false; error: E; statusCode?: number }
 */
export type ApiResult<T, E> =
    | { success: true; data: T; statusCode?: number }
    | { success: false; error: E; statusCode?: number };
