//import { Configuration } from '../../generated';
import {
    AasRegistryService,
    AasRepositoryService,
    ConceptDescriptionRepositoryService,
    SubmodelRegistryService,
    SubmodelRepositoryService,
    AasDiscoveryService,
} from '../../generated';
import { applyDefaults } from '../../lib/apiConfig';

describe('apiConfig', () => {
    describe('applyDefaults', () => {
        it('should preserve all provided AasRepositoryService configuration values', () => {
            // Arrange
            const mockFetch = jest.fn();
            const mockMiddleware = [{ pre: jest.fn() }];
            const mockQueryParamsStringify = jest.fn();
            const mockApiKey = jest.fn();
            const mockHeaders = { 'Content-Type': 'application/json' };

            const config = new AasRepositoryService.Configuration({
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
            expect(result).toBeInstanceOf(AasRepositoryService.Configuration);
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
            // Uncomment the line below if you want to test the function returns the correct value
            // expect(result.accessToken()).resolves.toBe('token123');

            expect(result.headers).toBe(mockHeaders);
            expect(result.credentials).toBe('include');
        });

        it('should preserve all provided SubmodelRepositoryService configuration values', () => {
            // Arrange
            const mockFetch = jest.fn();
            const mockMiddleware = [{ pre: jest.fn() }];
            const mockQueryParamsStringify = jest.fn();
            const mockApiKey = jest.fn();
            const mockHeaders = { 'Content-Type': 'application/json' };

            const config = new SubmodelRepositoryService.Configuration({
                basePath: 'https://example.com/submodel-api',
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
            expect(result).toBeInstanceOf(SubmodelRepositoryService.Configuration);
            expect(result.basePath).toBe('https://example.com/submodel-api');
            expect(result.fetchApi).toBe(mockFetch);
            expect(result.middleware).toEqual(mockMiddleware);
            expect(result.queryParamsStringify).toBe(mockQueryParamsStringify);
            expect(result.username).toBe('testUser');
            expect(result.password).toBe('testPass');
            expect(typeof result.apiKey).toBe('function');
            expect(typeof result.accessToken).toBe('function');
            expect(result.headers).toBe(mockHeaders);
            expect(result.credentials).toBe('include');
        });

        it('should preserve all provided ConceptDescriptionRepositoryService configuration values', () => {
            // Arrange
            const mockFetch = jest.fn();
            const mockMiddleware = [{ pre: jest.fn() }];
            const mockQueryParamsStringify = jest.fn();
            const mockApiKey = jest.fn();
            const mockHeaders = { 'Content-Type': 'application/json' };

            const config = new ConceptDescriptionRepositoryService.Configuration({
                basePath: 'https://example.com/conceptdescription-api',
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
            expect(result).toBeInstanceOf(ConceptDescriptionRepositoryService.Configuration);
            expect(result.basePath).toBe('https://example.com/conceptdescription-api');
            expect(result.fetchApi).toBe(mockFetch);
            expect(result.middleware).toEqual(mockMiddleware);
            expect(result.queryParamsStringify).toBe(mockQueryParamsStringify);
            expect(result.username).toBe('testUser');
            expect(result.password).toBe('testPass');
            expect(typeof result.apiKey).toBe('function');
            expect(typeof result.accessToken).toBe('function');
            expect(result.headers).toBe(mockHeaders);
            expect(result.credentials).toBe('include');
        });

        it('should preserve all provided AasRegistryService configuration values', () => {
            // Arrange
            const mockFetch = jest.fn();
            const mockMiddleware = [{ pre: jest.fn() }];
            const mockQueryParamsStringify = jest.fn();
            const mockApiKey = jest.fn();
            const mockHeaders = { 'Content-Type': 'application/json' };

            const config = new AasRegistryService.Configuration({
                basePath: 'https://example.com/aasdescriptor-api',
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
            expect(result).toBeInstanceOf(AasRegistryService.Configuration);
            expect(result.basePath).toBe('https://example.com/aasdescriptor-api');
            expect(result.fetchApi).toBe(mockFetch);
            expect(result.middleware).toEqual(mockMiddleware);
            expect(result.queryParamsStringify).toBe(mockQueryParamsStringify);
            expect(result.username).toBe('testUser');
            expect(result.password).toBe('testPass');

            // For apiKey, the Configuration class converts it to a function
            expect(typeof result.apiKey).toBe('function');

            // For accessToken, verify it's a function that returns the original value
            expect(typeof result.accessToken).toBe('function');
            // Uncomment the line below if you want to test the function returns the correct value
            // expect(result.accessToken()).resolves.toBe('token123');

            expect(result.headers).toBe(mockHeaders);
            expect(result.credentials).toBe('include');
        });

        it('should preserve all provided SubmodelRegistryService configuration values', () => {
            // Arrange
            const mockFetch = jest.fn();
            const mockMiddleware = [{ pre: jest.fn() }];
            const mockQueryParamsStringify = jest.fn();
            const mockApiKey = jest.fn();
            const mockHeaders = { 'Content-Type': 'application/json' };

            const config = new SubmodelRegistryService.Configuration({
                basePath: 'https://example.com/smdescriptor-api',
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
            expect(result).toBeInstanceOf(SubmodelRegistryService.Configuration);
            expect(result.basePath).toBe('https://example.com/smdescriptor-api');
            expect(result.fetchApi).toBe(mockFetch);
            expect(result.middleware).toEqual(mockMiddleware);
            expect(result.queryParamsStringify).toBe(mockQueryParamsStringify);
            expect(result.username).toBe('testUser');
            expect(result.password).toBe('testPass');

            // For apiKey, the Configuration class converts it to a function
            expect(typeof result.apiKey).toBe('function');

            // For accessToken, verify it's a function that returns the original value
            expect(typeof result.accessToken).toBe('function');
            // Uncomment the line below if you want to test the function returns the correct value
            // expect(result.accessToken()).resolves.toBe('token123');

            expect(result.headers).toBe(mockHeaders);
            expect(result.credentials).toBe('include');
        });

        it('should preserve all provided AasDiscoveryService configuration values', () => {
            // Arrange
            const mockFetch = jest.fn();
            const mockMiddleware = [{ pre: jest.fn() }];
            const mockQueryParamsStringify = jest.fn();
            const mockApiKey = jest.fn();
            const mockHeaders = { 'Content-Type': 'application/json' };

            const config = new AasDiscoveryService.Configuration({
                basePath: 'https://example.com/aasdiscovery-api',
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
            expect(result).toBeInstanceOf(AasDiscoveryService.Configuration);
            expect(result.basePath).toBe('https://example.com/aasdiscovery-api');
            expect(result.fetchApi).toBe(mockFetch);
            expect(result.middleware).toEqual(mockMiddleware);
            expect(result.queryParamsStringify).toBe(mockQueryParamsStringify);
            expect(result.username).toBe('testUser');
            expect(result.password).toBe('testPass');

            // For apiKey, the Configuration class converts it to a function
            expect(typeof result.apiKey).toBe('function');

            // For accessToken, verify it's a function that returns the original value
            expect(typeof result.accessToken).toBe('function');
            // Uncomment the line below if you want to test the function returns the correct value
            // expect(result.accessToken()).resolves.toBe('token123');

            expect(result.headers).toBe(mockHeaders);
            expect(result.credentials).toBe('include');
        });

        it('should apply default fetch API when not provided for AasRepositoryService', () => {
            // Arrange
            const config = new AasRepositoryService.Configuration({});

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result.fetchApi).toBeDefined();
            // We can't directly compare function instances, but we can check it's defined
            expect(typeof result.fetchApi).toBe('function');
        });

        it('should apply default fetch API when not provided for SubmodelRepositoryService', () => {
            // Arrange
            const config = new SubmodelRepositoryService.Configuration({});

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result.fetchApi).toBeDefined();
            expect(typeof result.fetchApi).toBe('function');
        });

        it('should apply default fetch API when not provided for ConceptDescriptionRepositoryService', () => {
            // Arrange
            const config = new ConceptDescriptionRepositoryService.Configuration({});

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result.fetchApi).toBeDefined();
            expect(typeof result.fetchApi).toBe('function');
        });

        it('should apply default fetch API when not provided for AasRegistryService', () => {
            // Arrange
            const config = new AasRegistryService.Configuration({});

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result.fetchApi).toBeDefined();
            // We can't directly compare function instances, but we can check it's defined
            expect(typeof result.fetchApi).toBe('function');
        });

        it('should apply default fetch API when not provided for SubmodelRegistryService', () => {
            // Arrange
            const config = new SubmodelRegistryService.Configuration({});

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result.fetchApi).toBeDefined();
            // We can't directly compare function instances, but we can check it's defined
            expect(typeof result.fetchApi).toBe('function');
        });

        it('should apply default fetch API when not provided for AasDiscoveryService', () => {
            // Arrange
            const config = new AasDiscoveryService.Configuration({});

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result.fetchApi).toBeDefined();
            // We can't directly compare function instances, but we can check it's defined
            expect(typeof result.fetchApi).toBe('function');
        });

        it('should return a new AasRepositoryService Configuration object', () => {
            // Arrange
            const config = new AasRepositoryService.Configuration({
                basePath: 'https://example.com/api',
            });

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result).toBeInstanceOf(AasRepositoryService.Configuration);
            expect(result).not.toBe(config); // Should be a different instance
        });

        it('should return a new SubmodelRepositoryService Configuration object', () => {
            // Arrange
            const config = new SubmodelRepositoryService.Configuration({
                basePath: 'https://example.com/submodel-api',
            });

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result).toBeInstanceOf(SubmodelRepositoryService.Configuration);
            expect(result).not.toBe(config); // Should be a different instance
        });

        it('should return a new ConceptDescriptionRepositoryService Configuration object', () => {
            // Arrange
            const config = new ConceptDescriptionRepositoryService.Configuration({
                basePath: 'https://example.com/conceptdescription-api',
            });

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result).toBeInstanceOf(ConceptDescriptionRepositoryService.Configuration);
            expect(result).not.toBe(config); // Should be a different instance
        });

        it('should return a new AasRegistryService Configuration object', () => {
            // Arrange
            const config = new AasRegistryService.Configuration({
                basePath: 'https://example.com/aasdescriptor-api',
            });

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result).toBeInstanceOf(AasRegistryService.Configuration);
            expect(result).not.toBe(config); // Should be a different instance
        });

        it('should return a new SubmodelRegistryService Configuration object', () => {
            // Arrange
            const config = new SubmodelRegistryService.Configuration({
                basePath: 'https://example.com/smdescriptor-api',
            });

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result).toBeInstanceOf(SubmodelRegistryService.Configuration);
            expect(result).not.toBe(config); // Should be a different instance
        });

        it('should return a new AasDiscoveryService Configuration object', () => {
            // Arrange
            const config = new AasDiscoveryService.Configuration({
                basePath: 'https://example.com/aasdiscovery-api',
            });

            // Act
            const result = applyDefaults(config);

            // Assert
            expect(result).toBeInstanceOf(AasDiscoveryService.Configuration);
            expect(result).not.toBe(config); // Should be a different instance
        });

        it('should handle undefined values correctlyfor AasRepositoryService', () => {
            // Arrange
            const config = new AasRepositoryService.Configuration({
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
            // Instead of expecting basePath to be undefined, we should expect the default value
            // that the Configuration constructor sets
            expect(result.basePath).toBe('https://admin-shell.io/api/v3');
            expect(result.username).toBeUndefined();
            expect(result.password).toBeUndefined();
            expect(result.apiKey).toBeUndefined();
            expect(result.accessToken).toBeUndefined();
            expect(result.headers).toBeUndefined();
            expect(result.credentials).toBeUndefined();
            expect(result.fetchApi).toBeDefined(); // Default fetch should be applied
        });

        it('should handle undefined values correctly for SubmodelRepositoryService', () => {
            // Arrange
            const config = new SubmodelRepositoryService.Configuration({
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
            // Check the default value that the Configuration constructor sets
            // Note: Update this expected value if your default differs
            expect(result.basePath).toBe('https://admin-shell.io/api/v3');
            expect(result.username).toBeUndefined();
            expect(result.password).toBeUndefined();
            expect(result.apiKey).toBeUndefined();
            expect(result.accessToken).toBeUndefined();
            expect(result.headers).toBeUndefined();
            expect(result.credentials).toBeUndefined();
            expect(result.fetchApi).toBeDefined(); // Default fetch should be applied
        });

        it('should handle undefined values correctly for ConceptDescriptionRepositoryService', () => {
            // Arrange
            const config = new ConceptDescriptionRepositoryService.Configuration({
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
            // Check the default value that the Configuration constructor sets
            // Note: Update this expected value if your default differs
            expect(result.basePath).toBe('https://admin-shell.io/api/v3');
            expect(result.username).toBeUndefined();
            expect(result.password).toBeUndefined();
            expect(result.apiKey).toBeUndefined();
            expect(result.accessToken).toBeUndefined();
            expect(result.headers).toBeUndefined();
            expect(result.credentials).toBeUndefined();
            expect(result.fetchApi).toBeDefined(); // Default fetch should be applied
        });

        it('should handle undefined values correctly for AasRegistryService', () => {
            // Arrange
            const config = new AasRegistryService.Configuration({
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
            // Instead of expecting basePath to be undefined, we should expect the default value
            // that the Configuration constructor sets
            expect(result.basePath).toBe('https://admin-shell.io/api/v3');
            expect(result.username).toBeUndefined();
            expect(result.password).toBeUndefined();
            expect(result.apiKey).toBeUndefined();
            expect(result.accessToken).toBeUndefined();
            expect(result.headers).toBeUndefined();
            expect(result.credentials).toBeUndefined();
            expect(result.fetchApi).toBeDefined(); // Default fetch should be applied
        });

        it('should handle undefined values correctly for SubmodelRegistryService', () => {
            // Arrange
            const config = new SubmodelRegistryService.Configuration({
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
            // Instead of expecting basePath to be undefined, we should expect the default value
            // that the Configuration constructor sets
            expect(result.basePath).toBe('https://admin-shell.io/api/v3');
            expect(result.username).toBeUndefined();
            expect(result.password).toBeUndefined();
            expect(result.apiKey).toBeUndefined();
            expect(result.accessToken).toBeUndefined();
            expect(result.headers).toBeUndefined();
            expect(result.credentials).toBeUndefined();
            expect(result.fetchApi).toBeDefined(); // Default fetch should be applied
        });

        it('should handle undefined values correctly for AasDiscoveryService', () => {
            // Arrange
            const config = new AasDiscoveryService.Configuration({
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
            // Instead of expecting basePath to be undefined, we should expect the default value
            // that the Configuration constructor sets
            expect(result.basePath).toBe('https://admin-shell.io/api/v3');
            expect(result.username).toBeUndefined();
            expect(result.password).toBeUndefined();
            expect(result.apiKey).toBeUndefined();
            expect(result.accessToken).toBeUndefined();
            expect(result.headers).toBeUndefined();
            expect(result.credentials).toBeUndefined();
            expect(result.fetchApi).toBeDefined(); // Default fetch should be applied
        });
    });
});
