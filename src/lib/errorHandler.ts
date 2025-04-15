import { RequiredError } from '../generated';

export function handleApiError(err: unknown): RequiredError {
    let message = 'Unknown error';
    let statusCode = 'N/A';
    let field = 'N/A';

    if (err instanceof RequiredError) {
        field = err.field;
        message = err.message;
    } else if (err instanceof Error) {
        message = err.toString().split('\n')[0];
    }

    const response = (err as any)?.response;
    if (response?.status) {
        statusCode = response.status;
        message = `HTTP ${statusCode} - ${message}`;
    }

    return new RequiredError(field, ` message: ${message}`);
}
