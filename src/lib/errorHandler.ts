import { RequiredError } from '../generated';

export function handleApiError(err: unknown): RequiredError {
    let message = 'Unknown error';
    let statusCode: string | number = 'N/A';
    let field = 'N/A';

    if (err instanceof RequiredError) {
        field = err.field;
        message = err.message || 'Required field error';
    } else if (err instanceof Error) {
        message = err.message || err.toString().split('\n')[0];
    }

    // Extract response details if available
    const response = (err as any)?.response;
    if (response?.status) {
        statusCode = response.status;

        // Try to get more detailed error information from response body
        if (response.data?.error) {
            message = response.data.error;
        }

        message = `HTTP ${statusCode} - ${message}`;
    }

    return new RequiredError(field, message.trim());
}
