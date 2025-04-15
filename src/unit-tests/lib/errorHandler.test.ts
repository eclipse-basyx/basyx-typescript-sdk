import { RequiredError } from '../../generated';
import { handleApiError } from '../../lib/errorHandler';

describe('handleApiError', () => {
    it('should preserve RequiredError field and message', () => {
        const originalError = new RequiredError('testField', 'Test message');
        const result = handleApiError(originalError);

        expect(result.field).toBe('testField');
        expect(result.message).toContain('Test message');
        expect(result.name).toBe('RequiredError');
    });

    it('should handle generic Error objects', () => {
        const originalError = new Error('Generic error');
        const result = handleApiError(originalError);

        expect(result.field).toBe('N/A');
        expect(result.message).toContain('Generic error');
    });

    it('should extract HTTP status codes from response', () => {
        const originalError = new Error('API failed');
        (originalError as any).response = { status: 404 };
        const result = handleApiError(originalError);

        expect(result.message).toContain('HTTP 404');
        expect(result.message).toContain('API failed');
    });

    it('should handle non-Error objects', () => {
        const result = handleApiError('just a string');

        expect(result.field).toBe('N/A');
        expect(result.message).toContain('Unknown error');
    });
});
