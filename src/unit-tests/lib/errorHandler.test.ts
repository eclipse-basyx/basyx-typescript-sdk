import { FetchError, RequiredError, ResponseError } from '../../generated';
import { handleApiError } from '../../lib/errorHandler';

describe('handleApiError', () => {
    it('should preserve RequiredError field and message', () => {
        const originalError = new RequiredError('testField', 'Test message');
        const result = handleApiError(originalError);

        expect(result.field).toBe('testField');
        expect(result.message).toContain('Test message');
        expect(result.errorType).toBe('RequiredError');
    });

    it('should handle generic Error objects', () => {
        const originalError = new Error('Generic error');
        const result = handleApiError(originalError);

        expect(result.field).toBe('N/A');
        expect(result.message).toContain('Generic error');
        expect(result.errorType).toBe('Error');
    });

    it('should extract HTTP status codes from response', () => {
        const originalError = new Error('API failed');
        (originalError as any).response = { status: 404 };
        const result = handleApiError(originalError);

        expect(result.statusCode).toBe(404);
        expect(result.message).toContain('HTTP 404');
        expect(result.message).toContain('API failed');
    });

    it('should handle non-Error objects', () => {
        const result = handleApiError('just a string');

        expect(result.field).toBe('N/A');
        expect(result.message).toContain('Unknown error');
        expect(result.errorType).toBe('UnknownError');
    });

    it('should handle ResponseError objects', () => {
        const mockResponse = {
            status: 403,
            statusText: 'Forbidden',
        } as Response;
        const originalError = new ResponseError(mockResponse, 'Access denied');
        const result = handleApiError(originalError);

        expect(result.statusCode).toBe(403);
        expect(result.message).toContain('Access denied');
        expect(result.errorType).toBe('ResponseError');
    });

    it('should handle FetchError objects', () => {
        const originalError = new FetchError(new Error('Network failure'), 'Failed to fetch');
        const result = handleApiError(originalError);

        expect(result.message).toContain('Failed to fetch');
        expect(result.errorType).toBe('FetchError');
    });

    it('should safely handle null/undefined messages', () => {
        const originalError = new Error();
        (originalError as any).message = undefined;
        const result = handleApiError(originalError);

        expect(result.message).toBe('Unknown error occurred');
    });

    it('should handle errors with response data', () => {
        const originalError = new Error('API error');
        (originalError as any).response = {
            status: 400,
            data: { error: 'Bad Request: Invalid parameter' },
        };
        const result = handleApiError(originalError);

        expect(result.statusCode).toBe(400);
        expect(result.message).toContain('Bad Request: Invalid parameter');
    });

    it('should ensure error properties are enumerable', () => {
        const originalError = new RequiredError('testField', 'Test message');
        const result = handleApiError(originalError);

        const serialized = JSON.stringify(result);
        const parsed = JSON.parse(serialized);

        expect(parsed.message).toBe('Test message');
        expect(parsed.field).toBe('testField');
        expect(parsed.errorType).toBe('RequiredError');
        expect(parsed.statusCode).toBe('N/A');
    });
});
