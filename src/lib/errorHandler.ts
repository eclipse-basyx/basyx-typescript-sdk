import { FetchError, RequiredError, ResponseError } from '../generated';

export class ApiError extends Error {
    statusCode: string | number;
    field: string;
    errorType: string;

    constructor(
        message: string,
        options: {
            statusCode?: string | number;
            field?: string;
            errorType?: string;
        } = {}
    ) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = options.statusCode || 'N/A';
        this.field = options.field || 'N/A';
        this.errorType = options.errorType || 'UnknownError';

        // Make properties enumerable so they appear in serialized output
        Object.defineProperty(this, 'statusCode', { enumerable: true });
        Object.defineProperty(this, 'message', { enumerable: true, value: message });
        Object.defineProperty(this, 'field', { enumerable: true });
        Object.defineProperty(this, 'errorType', { enumerable: true });
    }
}

export function handleApiError(err: unknown): ApiError {
    let message = 'Unknown error';
    let statusCode: string | number = 'N/A';
    let field = 'N/A';
    let errorType = 'UnknownError';

    try {
        // Handle different error types
        if (err instanceof RequiredError) {
            field = err.field || 'N/A';
            message = err.message || 'Required field error';
            errorType = 'RequiredError';
        } else if (err instanceof ResponseError) {
            statusCode = err.response.status;
            message = err.message || 'Response returned an error code';
            errorType = 'ResponseError';
        } else if (err instanceof FetchError) {
            message = err.message || 'Network request failed';
            errorType = 'FetchError';
        } else if (err instanceof Error) {
            message = err.message || 'Unknown error occurred';
            errorType = err.name || 'Error';
        }

        // Extract additional response details if available
        const response = (err as any)?.response;
        if (response?.status) {
            statusCode = response.status;

            // Try to get more detailed error information from response body
            if (response.data?.error) {
                message = response.data.error;
            }

            message = `HTTP ${statusCode} - ${message}`;
        }

        // Extra safeguard for message handling
        let safeMessage = 'Unknown error';

        if (message !== null && message !== undefined) {
            if (typeof message === 'string') {
                safeMessage = message.trim();
            } else {
                safeMessage = String(message);
            }
        }

        return new ApiError(safeMessage, {
            statusCode,
            field,
            errorType,
        });
    } catch (handlerError) {
        // If our error handler throws an error, capture that and return a fallback error
        console.error('Error in error handler:', handlerError);
        return new ApiError('An error occurred while processing another error', {
            errorType: 'ErrorHandlerError',
        });
    }
}
