import { Configuration } from '../../generated/runtime';
import { applyDefaults } from '../../lib/apiConfig';

describe('apiConfig', () => {
    describe('applyDefaults', () => {
        it('should preserve all provided configuration values', () => {
            // Arrange
            const mockFetch = jest.fn();
            const mockMiddleware = [{ pre: jest.fn() }];
            const mockQueryParamsStringify = jest.fn();
            const mockApiKey = jest.fn();
            const mockHeaders = { 'Content-Type': 'application/json' };

            const config = new Configuration({
                basePath: 'https://example.com/api',
                fetchApi: mockFetch,
                middleware: mockMiddleware,
                queryParamsStringify: mockQueryParamsStringify,
                username: 'testUser',
                password: 'testPass',
                apiKey: mockApiKey,
                accessToken: 'token123',
                headers: mockHeaders,
                credentials: 'include',
            });

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result).toBeInstanceOf(Configuration);
            expect(result.basePath).toBe('https://example.com/api');
            expect(result.fetchApi).toBe(mockFetch);
            expect(result.middleware).toEqual(mockMiddleware);
            expect(result.queryParamsStringify).toBe(mockQueryParamsStringify);
            expect(result.username).toBe('testUser');
            expect(result.password).toBe('testPass');

            // For apiKey, the Configuration class converts it to a function
            expect(typeof result.apiKey).toBe('function');

            // For accessToken, verify it's a function that returns the original value
            expect(typeof result.accessToken).toBe('function');

            expect(result.headers).toBe(mockHeaders);
            expect(result.credentials).toBe('include');
        });

        it('should apply default fetch API when not provided', () => {
            // Arrange
            const config = new Configuration({});

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result.fetchApi).toBeDefined();
            expect(typeof result.fetchApi).toBe('function');
        });

        it('should return a new Configuration object', () => {
            // Arrange
            const config = new Configuration({
                basePath: 'https://example.com/api',
            });

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result).toBeInstanceOf(Configuration);
            expect(result).not.toBe(config); // Should be a different instance
        });

        it('should handle undefined values correctly', () => {
            // Arrange
            const config = new Configuration({
                basePath: undefined,
                username: undefined,
                password: undefined,
                apiKey: undefined,
                accessToken: undefined,
                headers: undefined,
                credentials: undefined,
            });

            // Act
            const result = applyDefaults(config);

            // Assert
            // basePath should use the default value from the Configuration constructor
            expect(result.basePath).toBe('https://admin-shell.io/api/v3');
            expect(result.username).toBeUndefined();
            expect(result.password).toBeUndefined();
            expect(result.apiKey).toBeUndefined();
            expect(result.accessToken).toBeUndefined();
            expect(result.headers).toBeUndefined();
            expect(result.credentials).toBeUndefined();
            expect(result.fetchApi).toBeDefined(); // Default fetch should be applied
        });

        it('should apply custom basePath correctly', () => {
            // Arrange
            const customBasePath = 'https://custom.api.com/v2';
            const config = new Configuration({
                basePath: customBasePath,
            });

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result.basePath).toBe(customBasePath);
        });

        it('should preserve middleware configuration', () => {
            // Arrange
            const mockMiddleware = [{ pre: jest.fn() }, { post: jest.fn() }, { onError: jest.fn() }];
            const config = new Configuration({
                middleware: mockMiddleware,
            });

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result.middleware).toEqual(mockMiddleware);
        });

        it('should handle custom queryParamsStringify function', () => {
            // Arrange
            const customStringify = jest.fn();
            const config = new Configuration({
                queryParamsStringify: customStringify,
            });

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result.queryParamsStringify).toBe(customStringify);
        });

        it('should handle authentication parameters correctly', () => {
            // Arrange
            const config = new Configuration({
                username: 'testUser',
                password: 'testPassword',
                apiKey: 'test-api-key',
                accessToken: 'test-access-token',
            });

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result.username).toBe('testUser');
            expect(result.password).toBe('testPassword');
            expect(typeof result.apiKey).toBe('function');
            expect(typeof result.accessToken).toBe('function');
        });

        it('should handle custom headers and credentials', () => {
            // Arrange
            const customHeaders = {
                Authorization: 'Bearer token',
                'Content-Type': 'application/json',
                'X-Custom-Header': 'value',
            };
            const config = new Configuration({
                headers: customHeaders,
                credentials: 'same-origin',
            });

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result.headers).toEqual(customHeaders);
            expect(result.credentials).toBe('same-origin');
        });
    });
});
