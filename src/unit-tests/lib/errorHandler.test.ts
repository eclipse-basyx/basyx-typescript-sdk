//import { FetchError, RequiredError, ResponseError } from '../../generated';
import { AasRepositoryService, SubmodelRepositoryService } from '../../index';
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

    it('should handle AasRepositoryService.RequiredError correctly', async () => {
        const originalError = new AasRepositoryService.RequiredError('testField', 'Required parameter missing');
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0].code).toBe('400');
        expect(result.messages?.[0].messageType).toBe('Exception');
        expect(result.messages?.[0].text).toContain('Required parameter missing');
        expect(result.messages?.[0].timestamp).toBe('1744752054.63186');
    });

    it('should handle SubmodelRepositoryService.RequiredError correctly', async () => {
        const originalError = new SubmodelRepositoryService.RequiredError(
            'testField',
            'Required submodel parameter missing'
        );
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0].code).toBe('400');
        expect(result.messages?.[0].messageType).toBe('Exception');
        expect(result.messages?.[0].text).toContain('Required submodel parameter missing');
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

    it('should handle AasRepositoryService.ResponseError with parseable JSON response', async () => {
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
        const originalError = new AasRepositoryService.ResponseError(mockResponse, 'Access denied');
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0].code).toBe('403');
        expect(result.messages?.[0].text).toBe('Access forbidden');
    });

    it('should handle SubmodelRepositoryService.ResponseError with parseable JSON response', async () => {
        const mockJson = jest.fn().mockResolvedValue({
            messages: [
                {
                    code: '403',
                    messageType: 'Exception',
                    text: 'Submodel access forbidden',
                    timestamp: '1744752054.63186',
                },
            ],
        });

        const mockResponse = createMockResponse(403, mockJson);
        const originalError = new SubmodelRepositoryService.ResponseError(mockResponse, 'Submodel access denied');
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0].code).toBe('403');
        expect(result.messages?.[0].text).toBe('Submodel access forbidden');
    });

    it('should handle AasRepositoryService.ResponseError with unparseable JSON response', async () => {
        const mockJson = jest.fn().mockRejectedValue(new Error('Invalid JSON'));
        const mockResponse = createMockResponse(500, mockJson);
        const originalError = new AasRepositoryService.ResponseError(mockResponse, 'Server error');
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0].code).toBe('500');
        expect(result.messages?.[0].text).toContain('HTTP 500');
    });

    it('should handle SubmodelRepositoryService.ResponseError with unparseable JSON response', async () => {
        const mockJson = jest.fn().mockRejectedValue(new Error('Invalid JSON'));
        const mockResponse = createMockResponse(500, mockJson);
        const originalError = new SubmodelRepositoryService.ResponseError(mockResponse, 'Submodel server error');
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0].code).toBe('500');
        expect(result.messages?.[0].text).toContain('HTTP 500');
    });

    it('should handle AasRepositoryService.FetchError objects', async () => {
        const originalError = new AasRepositoryService.FetchError(new Error('Network failure'), 'Failed to fetch');
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0].code).toBe('0');
        expect(result.messages?.[0].text).toBe('Failed to fetch');
    });

    it('should handle SubmodelRepositoryService.FetchError objects', async () => {
        const originalError = new SubmodelRepositoryService.FetchError(
            new Error('Submodel network failure'),
            'Failed to fetch submodel'
        );
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0].code).toBe('0');
        expect(result.messages?.[0].text).toBe('Failed to fetch submodel');
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
        const originalError = new AasRepositoryService.RequiredError('testField', 'Test message');
        const result = await handleApiError(originalError);

        const serialized = JSON.stringify(result);
        const parsed = JSON.parse(serialized);

        expect(parsed.messages).toBeDefined();
        expect(parsed.messages.length).toBe(1);
        expect(parsed.messages[0].text).toContain('Test message');
        expect(parsed.messages[0].code).toBe('400');

        const submodelError = new SubmodelRepositoryService.RequiredError('testField', 'Submodel test message');
        const submodelResult = await handleApiError(submodelError);

        const submodelSerialized = JSON.stringify(submodelResult);
        const submodelParsed = JSON.parse(submodelSerialized);

        expect(submodelParsed.messages).toBeDefined();
        expect(submodelParsed.messages.length).toBe(1);
        expect(submodelParsed.messages[0].text).toContain('Submodel test message');
        expect(submodelParsed.messages[0].code).toBe('400');
    });

    it('should ensure all errors have a code', async () => {
        const originalError = new Error('Some error');
        const result = await handleApiError(originalError);

        expect(result.messages).toHaveLength(1);
        expect(result.messages?.[0]).toHaveProperty('code');
        expect(result.messages?.[0].code).toBeDefined();
    });
});
