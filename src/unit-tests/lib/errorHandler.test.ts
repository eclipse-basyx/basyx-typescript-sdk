import { FetchError, RequiredError, ResponseError } from '../../generated';
import { handleApiError } from '../../lib/errorHandler';

describe('handleApiError', () => {
    // Mock Response object for testing
    const createMockResponse = (status: number, json: () => Promise<any>) => {
        return { status, json } as unknown as Response;
    };

    beforeEach(() => {
        // Mock Date.getTime to return a consistent timestamp for testing
        jest.spyOn(Date.prototype, 'getTime').mockReturnValue(1744752054631.86);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should handle errors that already have messages array', async () => {
        const errorWithMessages = {
            messages: [
                {
                    code: '404',
                    messageType: 'Exception',
                    text: 'Resource not found',
                    timestamp: '1744752054.63186',
                },
            ],
        };

        const result = await handleApiError(errorWithMessages);
        expect(result.messages).toEqual(errorWithMessages.messages);
    });

    it('should handle RequiredError correctly', async () => {
        const originalError = new RequiredError('testField', 'Required parameter missing');
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0].code).toBe('400');
        expect(result.messages?.[0].messageType).toBe('Exception');
        expect(result.messages?.[0].text).toContain('Required parameter missing');
        expect(result.messages?.[0].timestamp).toBe('1744752054.63186');
    });

    it('should handle generic Error objects', async () => {
        const originalError = new Error('Generic error');
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0].messageType).toBe('Exception');
        expect(result.messages?.[0].text).toBe('Generic error');
        expect(result.messages?.[0].timestamp).toBe('1744752054.63186');
    });

    it('should handle ResponseError with parseable JSON response', async () => {
        const mockJson = jest.fn().mockResolvedValue({
            messages: [
                {
                    code: '403',
                    messageType: 'Exception',
                    text: 'Access forbidden',
                    timestamp: '1744752054.63186',
                },
            ],
        });

        const mockResponse = createMockResponse(403, mockJson);
        const originalError = new ResponseError(mockResponse, 'Access denied');
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0].code).toBe('403');
        expect(result.messages?.[0].text).toBe('Access forbidden');
    });

    it('should handle ResponseError with unparseable JSON response', async () => {
        const mockJson = jest.fn().mockRejectedValue(new Error('Invalid JSON'));
        const mockResponse = createMockResponse(500, mockJson);
        const originalError = new ResponseError(mockResponse, 'Server error');
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0].code).toBe('500');
        expect(result.messages?.[0].text).toContain('HTTP 500');
    });

    it('should handle FetchError objects', async () => {
        const originalError = new FetchError(new Error('Network failure'), 'Failed to fetch');
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0].code).toBe('0');
        expect(result.messages?.[0].text).toBe('Failed to fetch');
    });

    it('should safely handle null/undefined messages', async () => {
        const originalError = new Error();
        (originalError as any).message = undefined;
        const result = await handleApiError(originalError);

        expect(result.messages?.[0].text).toBe('Unknown error occurred');
    });

    it('should handle non-Error objects', async () => {
        const result = await handleApiError('just a string');

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0].text).toBe('Unknown error');
    });

    it('should produce valid JSON when serialized', async () => {
        const originalError = new RequiredError('testField', 'Test message');
        const result = await handleApiError(originalError);

        const serialized = JSON.stringify(result);
        const parsed = JSON.parse(serialized);

        expect(parsed.messages).toBeDefined();
        expect(parsed.messages.length).toBe(1);
        expect(parsed.messages[0].text).toContain('Test message');
        expect(parsed.messages[0].code).toBe('400');
    });

    it('should ensure all errors have a code', async () => {
        const originalError = new Error('Some error');
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0]).toHaveProperty('code');
        expect(result.messages?.[0].code).toBeDefined();
    });
});
