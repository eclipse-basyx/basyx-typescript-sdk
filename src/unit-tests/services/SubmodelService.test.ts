import { ModellingKind, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelRegistryClient } from '../../clients/SubmodelRegistryClient';
import { SubmodelRepositoryClient } from '../../clients/SubmodelRepositoryClient';
import { Configuration } from '../../generated/runtime';
import { SubmodelDescriptor } from '../../models/Descriptors';
import { SubmodelService } from '../../services/SubmodelService';

// Mock the clients
jest.mock('../../clients/SubmodelRegistryClient');
jest.mock('../../clients/SubmodelRepositoryClient');

describe('SubmodelService Unit Tests', () => {
    let submodelService: SubmodelService;
    let mockRegistryClient: jest.Mocked<SubmodelRegistryClient>;
    let mockRepositoryClient: jest.Mocked<SubmodelRepositoryClient>;
    let submodelRegistryConfig: Configuration;
    let submodelRepositoryConfig: Configuration;

    const testSubmodelId = 'https://example.com/ids/sm/test-123';
    const testDescriptor = new SubmodelDescriptor(testSubmodelId, [
        {
            _interface: 'SUBMODEL-3.0',
            protocolInformation: {
                href: 'http://localhost:8081/submodels/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvc20vdGVzdC0xMjM',
                endpointProtocol: null,
                endpointProtocolVersion: null,
                subprotocol: null,
                subprotocolBody: null,
                subprotocolBodyEncoding: null,
                securityAttributes: null,
            },
        },
    ]);
    const testSubmodel = new Submodel(
        testSubmodelId,
        null,
        null,
        'TestSubmodel',
        null,
        null,
        null,
        ModellingKind.Instance
    );

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Create configuration objects
        submodelRegistryConfig = new Configuration({ basePath: 'http://localhost:8084' });
        submodelRepositoryConfig = new Configuration({ basePath: 'http://localhost:8081' });

        // Initialize service with configs
        submodelService = new SubmodelService({
            submodelRegistryConfig,
            submodelRepositoryConfig,
        });

        // Get mocked instances
        mockRegistryClient = (SubmodelRegistryClient as jest.MockedClass<typeof SubmodelRegistryClient>).mock
            .instances[0] as jest.Mocked<SubmodelRegistryClient>;
        mockRepositoryClient = (SubmodelRepositoryClient as jest.MockedClass<typeof SubmodelRepositoryClient>).mock
            .instances[0] as jest.Mocked<SubmodelRepositoryClient>;
    });

    describe('getSubmodelList', () => {
        it("should return submodels from registry descriptors' endpoints", async () => {
            const mockDescriptors = [testDescriptor];
            mockRegistryClient.getAllSubmodelDescriptors = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    result: mockDescriptors,
                    pagedResult: undefined,
                },
            });
            mockRepositoryClient.getSubmodelById = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });

            const result = await submodelService.getSubmodelList();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.source).toBe('registry');
                expect(result.data.submodels).toHaveLength(1);
                expect(result.data.submodels[0]).toEqual(testSubmodel);
            }
            expect(mockRegistryClient.getAllSubmodelDescriptors).toHaveBeenCalledTimes(1);
            expect(mockRepositoryClient.getSubmodelById).toHaveBeenCalledTimes(1);
        });

        it('should fall back to repository when registry fails', async () => {
            const mockSubmodels = [testSubmodel];
            mockRegistryClient.getAllSubmodelDescriptors = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NetworkError', message: 'Registry unavailable' },
            });
            mockRepositoryClient.getAllSubmodels = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    result: mockSubmodels,
                    pagedResult: undefined,
                },
            });

            const result = await submodelService.getSubmodelList();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.source).toBe('repository');
                expect(result.data.submodels).toEqual(mockSubmodels);
            }
            expect(mockRegistryClient.getAllSubmodelDescriptors).toHaveBeenCalledTimes(1);
            expect(mockRepositoryClient.getAllSubmodels).toHaveBeenCalledTimes(1);
        });

        it('should use repository directly when preferRegistry is false', async () => {
            const mockSubmodels = [testSubmodel];
            mockRepositoryClient.getAllSubmodels = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    result: mockSubmodels,
                    pagedResult: undefined,
                },
            });

            const result = await submodelService.getSubmodelList({ preferRegistry: false });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.source).toBe('repository');
            }
            expect(mockRegistryClient.getAllSubmodelDescriptors).not.toHaveBeenCalled();
            expect(mockRepositoryClient.getAllSubmodels).toHaveBeenCalledTimes(1);
        });

        it('should return error when repository fails', async () => {
            mockRegistryClient.getAllSubmodelDescriptors = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NetworkError', message: 'Registry unavailable' },
            });
            mockRepositoryClient.getAllSubmodels = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NetworkError', message: 'Repository unavailable' },
            });

            const result = await submodelService.getSubmodelList();

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('NetworkError');
            }
        });

        it('should forward pagination parameters', async () => {
            const limit = 10;
            const cursor = 'cursor-123';

            mockRegistryClient.getAllSubmodelDescriptors = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    result: [],
                    pagedResult: undefined,
                },
            });

            await submodelService.getSubmodelList({ limit, cursor });

            expect(mockRegistryClient.getAllSubmodelDescriptors).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit,
                    cursor,
                })
            );
        });
    });

    describe('getSubmodelById', () => {
        it('should fetch Submodel using endpoint from registry descriptor', async () => {
            mockRegistryClient.getSubmodelDescriptorById = jest.fn().mockResolvedValue({
                success: true,
                data: testDescriptor,
            });
            mockRepositoryClient.getSubmodelById = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });

            const result = await submodelService.getSubmodelById({ submodelIdentifier: testSubmodelId });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.submodel).toEqual(testSubmodel);
                expect(result.data.descriptor).toEqual(testDescriptor);
            }
            expect(mockRegistryClient.getSubmodelDescriptorById).toHaveBeenCalledWith({
                configuration: submodelRegistryConfig,
                submodelIdentifier: testSubmodelId,
            });
            // Should use descriptor endpoint, not repository config
            expect(mockRepositoryClient.getSubmodelById).toHaveBeenCalledWith(
                expect.objectContaining({
                    submodelIdentifier: testSubmodelId,
                })
            );
        });

        it('should use repository directly when useRegistryEndpoint is false', async () => {
            mockRepositoryClient.getSubmodelById = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });

            const result = await submodelService.getSubmodelById({
                submodelIdentifier: testSubmodelId,
                useRegistryEndpoint: false,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.submodel).toEqual(testSubmodel);
                expect(result.data.descriptor).toBeUndefined();
            }
            expect(mockRegistryClient.getSubmodelDescriptorById).not.toHaveBeenCalled();
            expect(mockRepositoryClient.getSubmodelById).toHaveBeenCalledWith({
                configuration: submodelRepositoryConfig,
                submodelIdentifier: testSubmodelId,
            });
        });

        it('should fall back to repository config when descriptor has no endpoint', async () => {
            const descriptorWithoutEndpoint = new SubmodelDescriptor(testSubmodelId, []);

            mockRegistryClient.getSubmodelDescriptorById = jest.fn().mockResolvedValue({
                success: true,
                data: descriptorWithoutEndpoint,
            });
            mockRepositoryClient.getSubmodelById = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });

            const result = await submodelService.getSubmodelById({ submodelIdentifier: testSubmodelId });

            expect(result.success).toBe(true);
            expect(mockRepositoryClient.getSubmodelById).toHaveBeenCalledWith({
                configuration: submodelRepositoryConfig,
                submodelIdentifier: testSubmodelId,
            });
        });

        it('should return error when both descriptor endpoint and repository fail', async () => {
            mockRegistryClient.getSubmodelDescriptorById = jest.fn().mockResolvedValue({
                success: true,
                data: testDescriptor,
            });
            mockRepositoryClient.getSubmodelById = jest
                .fn()
                .mockResolvedValueOnce({
                    success: false,
                    error: { errorType: 'NotFoundError', message: 'Not found at endpoint' },
                })
                .mockResolvedValueOnce({
                    success: false,
                    error: { errorType: 'NotFoundError', message: 'Submodel not found' },
                });

            const result = await submodelService.getSubmodelById({ submodelIdentifier: testSubmodelId });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('NotFoundError');
            }
            // Should have been called twice - once with endpoint, once with repository config
            expect(mockRepositoryClient.getSubmodelById).toHaveBeenCalledTimes(2);
        });
    });

    describe('getSubmodelEndpointById', () => {
        it('should get endpoint from registry descriptor', async () => {
            mockRegistryClient.getSubmodelDescriptorById = jest.fn().mockResolvedValue({
                success: true,
                data: testDescriptor,
            });

            const result = await submodelService.getSubmodelEndpointById({ submodelIdentifier: testSubmodelId });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe(
                    'http://localhost:8081/submodels/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvc20vdGVzdC0xMjM'
                );
            }
            expect(mockRegistryClient.getSubmodelDescriptorById).toHaveBeenCalledWith({
                configuration: submodelRegistryConfig,
                submodelIdentifier: testSubmodelId,
            });
        });

        it('should construct endpoint from repository config when registry not available', async () => {
            mockRegistryClient.getSubmodelDescriptorById = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NotFoundError', message: 'Not found' },
            });

            const result = await submodelService.getSubmodelEndpointById({ submodelIdentifier: testSubmodelId });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toContain('/submodels/');
                expect(result.data).toContain('http://localhost:8081');
            }
        });

        it('should construct endpoint when useRegistry is false', async () => {
            const result = await submodelService.getSubmodelEndpointById({
                submodelIdentifier: testSubmodelId,
                useRegistry: false,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toContain('/submodels/');
                expect(result.data).toContain('http://localhost:8081');
            }
            expect(mockRegistryClient.getSubmodelDescriptorById).not.toHaveBeenCalled();
        });

        it('should return error when no repository config available', async () => {
            const serviceWithoutRepo = new SubmodelService({ submodelRegistryConfig });

            // Get the mock instance for the new service
            const newMockRegistryClient = (SubmodelRegistryClient as jest.MockedClass<typeof SubmodelRegistryClient>)
                .mock.instances[1] as jest.Mocked<SubmodelRegistryClient>;

            newMockRegistryClient.getSubmodelDescriptorById = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NotFoundError', message: 'Not found' },
            });

            const result = await serviceWithoutRepo.getSubmodelEndpointById({ submodelIdentifier: testSubmodelId });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('ConfigurationError');
            }
        });
    });

    describe('getSubmodelByEndpoint', () => {
        it('should extract ID from endpoint and fetch submodel', async () => {
            const endpoint = 'http://localhost:8081/submodels/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvc20vdGVzdC0xMjM';

            mockRepositoryClient.getSubmodelById = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });

            const result = await submodelService.getSubmodelByEndpoint({ endpoint });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.submodel).toEqual(testSubmodel);
            }
            expect(mockRepositoryClient.getSubmodelById).toHaveBeenCalledWith(
                expect.objectContaining({
                    submodelIdentifier: testSubmodelId,
                })
            );
        });

        it('should handle endpoints with different ports', async () => {
            const endpoint = 'http://localhost:9999/submodels/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvc20vdGVzdC0xMjM';

            mockRepositoryClient.getSubmodelById = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });

            const result = await submodelService.getSubmodelByEndpoint({ endpoint });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.submodel).toEqual(testSubmodel);
            }
        });

        it('should handle https endpoints', async () => {
            const endpoint = 'https://example.com/submodels/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvc20vdGVzdC0xMjM';

            mockRepositoryClient.getSubmodelById = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });

            const result = await submodelService.getSubmodelByEndpoint({ endpoint });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.submodel).toEqual(testSubmodel);
            }
        });

        it('should return error for invalid endpoint format', async () => {
            const invalidEndpoint = 'http://localhost:8081/invalid/path';

            const result = await submodelService.getSubmodelByEndpoint({ endpoint: invalidEndpoint });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('InvalidEndpoint');
            }
        });

        it('should return error when submodel fetch fails', async () => {
            const endpoint = 'http://localhost:8081/submodels/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvc20vdGVzdC0xMjM';

            mockRepositoryClient.getSubmodelById = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NotFoundError', message: 'Submodel not found' },
            });

            const result = await submodelService.getSubmodelByEndpoint({ endpoint });

            expect(result.success).toBe(false);
        });
    });

    describe('createSubmodel', () => {
        it('should create Submodel in repository and register in registry', async () => {
            mockRepositoryClient.postSubmodel = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });
            mockRegistryClient.postSubmodelDescriptor = jest.fn().mockResolvedValue({
                success: true,
                data: testDescriptor,
            });

            const result = await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.submodel).toEqual(testSubmodel);
                expect(result.data.descriptor).toEqual(testDescriptor);
            }
            expect(mockRepositoryClient.postSubmodel).toHaveBeenCalledWith({
                configuration: submodelRepositoryConfig,
                submodel: testSubmodel,
            });
            expect(mockRegistryClient.postSubmodelDescriptor).toHaveBeenCalledWith(
                expect.objectContaining({
                    configuration: submodelRegistryConfig,
                })
            );
        });

        it('should return error when repository creation fails', async () => {
            mockRepositoryClient.postSubmodel = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'ValidationError', message: 'Invalid submodel' },
            });

            const result = await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('ValidationError');
            }
            expect(mockRegistryClient.postSubmodelDescriptor).not.toHaveBeenCalled();
        });

        it('should return error when registry registration fails', async () => {
            mockRepositoryClient.postSubmodel = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });
            mockRegistryClient.postSubmodelDescriptor = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NetworkError', message: 'Registry unavailable' },
            });

            const result = await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            expect(result.success).toBe(false);
        });

        it('should work without registry when only repository is configured', async () => {
            const serviceWithoutRegistry = new SubmodelService({ submodelRepositoryConfig });
            const newMockRepositoryClient = (
                SubmodelRepositoryClient as jest.MockedClass<typeof SubmodelRepositoryClient>
            ).mock.instances[1] as jest.Mocked<SubmodelRepositoryClient>;

            newMockRepositoryClient.postSubmodel = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });

            const result = await serviceWithoutRegistry.createSubmodel({
                submodel: testSubmodel,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.submodel).toEqual(testSubmodel);
                expect(result.data.descriptor).toBeUndefined();
            }
        });
    });

    describe('updateSubmodel', () => {
        it('should update Submodel in repository and registry', async () => {
            mockRepositoryClient.putSubmodelById = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });
            mockRegistryClient.putSubmodelDescriptorById = jest.fn().mockResolvedValue({
                success: true,
                data: testDescriptor,
            });

            const result = await submodelService.updateSubmodel({
                submodel: testSubmodel,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.submodel).toEqual(testSubmodel);
                expect(result.data.descriptor).toEqual(testDescriptor);
            }
            expect(mockRepositoryClient.putSubmodelById).toHaveBeenCalledWith({
                configuration: submodelRepositoryConfig,
                submodelIdentifier: testSubmodel.id,
                submodel: testSubmodel,
            });
            expect(mockRegistryClient.putSubmodelDescriptorById).toHaveBeenCalledWith(
                expect.objectContaining({
                    configuration: submodelRegistryConfig,
                    submodelIdentifier: testSubmodel.id,
                })
            );
        });

        it('should return error when repository update fails', async () => {
            mockRepositoryClient.putSubmodelById = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NotFoundError', message: 'Submodel not found' },
            });

            const result = await submodelService.updateSubmodel({
                submodel: testSubmodel,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('NotFoundError');
            }
            expect(mockRegistryClient.putSubmodelDescriptorById).not.toHaveBeenCalled();
        });

        it('should return error when registry update fails', async () => {
            mockRepositoryClient.putSubmodelById = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });
            mockRegistryClient.putSubmodelDescriptorById = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NetworkError', message: 'Registry unavailable' },
            });

            const result = await submodelService.updateSubmodel({
                submodel: testSubmodel,
            });

            expect(result.success).toBe(false);
        });

        it('should work without registry when only repository is configured', async () => {
            const serviceWithoutRegistry = new SubmodelService({ submodelRepositoryConfig });
            const newMockRepositoryClient = (
                SubmodelRepositoryClient as jest.MockedClass<typeof SubmodelRepositoryClient>
            ).mock.instances[1] as jest.Mocked<SubmodelRepositoryClient>;

            newMockRepositoryClient.putSubmodelById = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });

            const result = await serviceWithoutRegistry.updateSubmodel({
                submodel: testSubmodel,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.submodel).toEqual(testSubmodel);
                expect(result.data.descriptor).toBeUndefined();
            }
        });
    });

    describe('deleteSubmodel', () => {
        it('should remove from registry and repository', async () => {
            mockRegistryClient.deleteSubmodelDescriptorById = jest.fn().mockResolvedValue({
                success: true,
                data: undefined,
            });
            mockRepositoryClient.deleteSubmodelById = jest.fn().mockResolvedValue({
                success: true,
                data: undefined,
            });

            const result = await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodelId });

            expect(result.success).toBe(true);
            expect(mockRegistryClient.deleteSubmodelDescriptorById).toHaveBeenCalledWith({
                configuration: submodelRegistryConfig,
                submodelIdentifier: testSubmodelId,
            });
            expect(mockRepositoryClient.deleteSubmodelById).toHaveBeenCalledWith({
                configuration: submodelRepositoryConfig,
                submodelIdentifier: testSubmodelId,
            });
        });

        it('should return error when registry deletion fails', async () => {
            mockRegistryClient.deleteSubmodelDescriptorById = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NotFoundError', message: 'Descriptor not found' },
            });

            const result = await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodelId });

            expect(result.success).toBe(false);
            expect(mockRepositoryClient.deleteSubmodelById).not.toHaveBeenCalled();
        });

        it('should return error when repository deletion fails', async () => {
            mockRegistryClient.deleteSubmodelDescriptorById = jest.fn().mockResolvedValue({
                success: true,
                data: undefined,
            });
            mockRepositoryClient.deleteSubmodelById = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NotFoundError', message: 'Submodel not found' },
            });

            const result = await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodelId });

            expect(result.success).toBe(false);
        });

        it('should work without registry when only repository is configured', async () => {
            const serviceWithoutRegistry = new SubmodelService({ submodelRepositoryConfig });
            const newMockRepositoryClient = (
                SubmodelRepositoryClient as jest.MockedClass<typeof SubmodelRepositoryClient>
            ).mock.instances[1] as jest.Mocked<SubmodelRepositoryClient>;

            newMockRepositoryClient.deleteSubmodelById = jest.fn().mockResolvedValue({
                success: true,
                data: undefined,
            });

            const result = await serviceWithoutRegistry.deleteSubmodel({ submodelIdentifier: testSubmodelId });

            expect(result.success).toBe(true);
        });
    });

    describe('Configuration handling', () => {
        it('should return error when no configuration is provided', async () => {
            const emptyService = new SubmodelService({});

            const result = await emptyService.getSubmodelList();

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('ConfigurationError');
            }
        });

        it('should return error when getSubmodelById has no configuration', async () => {
            const emptyService = new SubmodelService({});

            const result = await emptyService.getSubmodelById({
                submodelIdentifier: testSubmodelId,
                useRegistryEndpoint: false,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('ConfigurationError');
            }
        });

        it('should return error when createSubmodel has no repository config', async () => {
            const serviceWithoutRepo = new SubmodelService({ submodelRegistryConfig });

            const result = await serviceWithoutRepo.createSubmodel({
                submodel: testSubmodel,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('ConfigurationError');
            }
        });
    });

    describe('includeConceptDescriptions functionality', () => {
        it('getSubmodelList should support includeConceptDescriptions parameter', async () => {
            const mockSubmodels = [testSubmodel];
            mockRepositoryClient.getAllSubmodels = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    result: mockSubmodels,
                    pagedResult: undefined,
                },
            });

            const result = await submodelService.getSubmodelList({
                preferRegistry: false,
                includeConceptDescriptions: false,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.submodels).toEqual(mockSubmodels);
                expect(result.data.conceptDescriptions).toBeUndefined();
            }
        });

        it('getSubmodelById should support includeConceptDescriptions parameter', async () => {
            mockRepositoryClient.getSubmodelById = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });

            const result = await submodelService.getSubmodelById({
                submodelIdentifier: testSubmodelId,
                useRegistryEndpoint: false,
                includeConceptDescriptions: false,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.submodel).toEqual(testSubmodel);
                expect(result.data.conceptDescriptions).toBeUndefined();
            }
        });

        it('getSubmodelByEndpoint should support includeConceptDescriptions parameter', async () => {
            const endpoint = 'http://localhost:8081/submodels/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvc20vdGVzdC0xMjM';
            mockRepositoryClient.getSubmodelById = jest.fn().mockResolvedValue({
                success: true,
                data: testSubmodel,
            });

            const result = await submodelService.getSubmodelByEndpoint({
                endpoint,
                includeConceptDescriptions: false,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.submodel).toEqual(testSubmodel);
                expect(result.data.conceptDescriptions).toBeUndefined();
            }
        });
    });
});
