import { AssetAdministrationShell, AssetInformation, AssetKind } from '@aas-core-works/aas-core3.0-typescript/types';
import { AasRegistryClient } from '../../clients/AasRegistryClient';
import { AasRepositoryClient } from '../../clients/AasRepositoryClient';
import { Configuration } from '../../generated/runtime';
import { AssetAdministrationShellDescriptor } from '../../models/Descriptors';
import { AasService } from '../../services/AasService';

// Mock the clients
jest.mock('../../clients/AasRegistryClient');
jest.mock('../../clients/AasRepositoryClient');

describe('AasService Unit Tests', () => {
    let aasService: AasService;
    let mockRegistryClient: jest.Mocked<AasRegistryClient>;
    let mockRepositoryClient: jest.Mocked<AasRepositoryClient>;
    let registryConfig: Configuration;
    let repositoryConfig: Configuration;

    const testAasId = 'https://example.com/ids/aas/test-123';
    const testDescriptor = new AssetAdministrationShellDescriptor(
        testAasId,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        [
            {
                _interface: 'AAS-3.0',
                protocolInformation: {
                    href: 'http://localhost:8081/shells/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvYWFzL3Rlc3QtMTIz',
                    endpointProtocol: null,
                    endpointProtocolVersion: null,
                    subprotocol: null,
                    subprotocolBody: null,
                    subprotocolBodyEncoding: null,
                    securityAttributes: null,
                },
            },
        ]
    );
    const testShell = new AssetAdministrationShell(testAasId, new AssetInformation(AssetKind.Instance));

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Create configuration objects
        registryConfig = new Configuration({ basePath: 'http://localhost:8084' });
        repositoryConfig = new Configuration({ basePath: 'http://localhost:8081' });

        // Initialize service with configs
        aasService = new AasService({
            registryConfig,
            repositoryConfig,
        });

        // Get mocked instances
        mockRegistryClient = (AasRegistryClient as jest.MockedClass<typeof AasRegistryClient>).mock
            .instances[0] as jest.Mocked<AasRegistryClient>;
        mockRepositoryClient = (AasRepositoryClient as jest.MockedClass<typeof AasRepositoryClient>).mock
            .instances[0] as jest.Mocked<AasRepositoryClient>;
    });

    describe('getAasList', () => {
        it("should return shells from registry descriptors' endpoints", async () => {
            const mockDescriptors = [testDescriptor];
            mockRegistryClient.getAllAssetAdministrationShellDescriptors = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    result: mockDescriptors,
                    pagedResult: undefined,
                },
            });
            mockRepositoryClient.getAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: true,
                data: testShell,
            });

            const result = await aasService.getAasList();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.source).toBe('registry');
                expect(result.data.shells).toHaveLength(1);
                expect(result.data.shells[0]).toEqual(testShell);
            }
            expect(mockRegistryClient.getAllAssetAdministrationShellDescriptors).toHaveBeenCalledTimes(1);
            expect(mockRepositoryClient.getAssetAdministrationShellById).toHaveBeenCalledTimes(1);
        });

        it('should fall back to repository when registry fails', async () => {
            const mockShells = [testShell];
            mockRegistryClient.getAllAssetAdministrationShellDescriptors = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NetworkError', message: 'Registry unavailable' },
            });
            mockRepositoryClient.getAllAssetAdministrationShells = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    result: mockShells,
                    pagedResult: undefined,
                },
            });

            const result = await aasService.getAasList();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.source).toBe('repository');
                expect(result.data.shells).toEqual(mockShells);
            }
            expect(mockRegistryClient.getAllAssetAdministrationShellDescriptors).toHaveBeenCalledTimes(1);
            expect(mockRepositoryClient.getAllAssetAdministrationShells).toHaveBeenCalledTimes(1);
        });

        it('should use repository directly when preferRegistry is false', async () => {
            const mockShells = [testShell];
            mockRepositoryClient.getAllAssetAdministrationShells = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    result: mockShells,
                    pagedResult: undefined,
                },
            });

            const result = await aasService.getAasList({ preferRegistry: false });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.source).toBe('repository');
            }
            expect(mockRegistryClient.getAllAssetAdministrationShellDescriptors).not.toHaveBeenCalled();
            expect(mockRepositoryClient.getAllAssetAdministrationShells).toHaveBeenCalledTimes(1);
        });

        it('should return error when repository fails', async () => {
            mockRegistryClient.getAllAssetAdministrationShellDescriptors = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NetworkError', message: 'Registry unavailable' },
            });
            mockRepositoryClient.getAllAssetAdministrationShells = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NetworkError', message: 'Repository unavailable' },
            });

            const result = await aasService.getAasList();

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('NetworkError');
            }
        });

        it('should forward pagination parameters', async () => {
            const limit = 10;
            const cursor = 'cursor-123';

            mockRegistryClient.getAllAssetAdministrationShellDescriptors = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    result: [],
                    pagedResult: undefined,
                },
            });

            await aasService.getAasList({ limit, cursor });

            expect(mockRegistryClient.getAllAssetAdministrationShellDescriptors).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit,
                    cursor,
                })
            );
        });
    });

    describe('getAasById', () => {
        it('should fetch AAS using endpoint from registry descriptor', async () => {
            mockRegistryClient.getAssetAdministrationShellDescriptorById = jest.fn().mockResolvedValue({
                success: true,
                data: testDescriptor,
            });
            mockRepositoryClient.getAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: true,
                data: testShell,
            });

            const result = await aasService.getAasById({ aasIdentifier: testAasId });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shell).toEqual(testShell);
                expect(result.data.descriptor).toEqual(testDescriptor);
            }
            expect(mockRegistryClient.getAssetAdministrationShellDescriptorById).toHaveBeenCalledWith({
                configuration: registryConfig,
                aasIdentifier: testAasId,
            });
            // Should use descriptor endpoint, not repository config
            expect(mockRepositoryClient.getAssetAdministrationShellById).toHaveBeenCalledWith(
                expect.objectContaining({
                    aasIdentifier: testAasId,
                })
            );
        });

        it('should use repository directly when useRegistryEndpoint is false', async () => {
            mockRepositoryClient.getAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: true,
                data: testShell,
            });

            const result = await aasService.getAasById({
                aasIdentifier: testAasId,
                useRegistryEndpoint: false,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shell).toEqual(testShell);
                expect(result.data.descriptor).toBeUndefined();
            }
            expect(mockRegistryClient.getAssetAdministrationShellDescriptorById).not.toHaveBeenCalled();
            expect(mockRepositoryClient.getAssetAdministrationShellById).toHaveBeenCalledWith({
                configuration: repositoryConfig,
                aasIdentifier: testAasId,
            });
        });

        it('should fall back to repository config when descriptor has no endpoint', async () => {
            const descriptorWithoutEndpoint = new AssetAdministrationShellDescriptor(testAasId);

            mockRegistryClient.getAssetAdministrationShellDescriptorById = jest.fn().mockResolvedValue({
                success: true,
                data: descriptorWithoutEndpoint,
            });
            mockRepositoryClient.getAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: true,
                data: testShell,
            });

            const result = await aasService.getAasById({ aasIdentifier: testAasId });

            expect(result.success).toBe(true);
            expect(mockRepositoryClient.getAssetAdministrationShellById).toHaveBeenCalledWith({
                configuration: repositoryConfig,
                aasIdentifier: testAasId,
            });
        });

        it('should return error when both descriptor endpoint and repository fail', async () => {
            mockRegistryClient.getAssetAdministrationShellDescriptorById = jest.fn().mockResolvedValue({
                success: true,
                data: testDescriptor,
            });
            mockRepositoryClient.getAssetAdministrationShellById = jest
                .fn()
                .mockResolvedValueOnce({
                    success: false,
                    error: { errorType: 'NotFoundError', message: 'Not found at endpoint' },
                })
                .mockResolvedValueOnce({
                    success: false,
                    error: { errorType: 'NotFoundError', message: 'AAS not found' },
                });

            const result = await aasService.getAasById({ aasIdentifier: testAasId });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('NotFoundError');
            }
            // Should have been called twice - once with endpoint, once with repository config
            expect(mockRepositoryClient.getAssetAdministrationShellById).toHaveBeenCalledTimes(2);
        });
    });

    describe('getAasEndpointById', () => {
        it('should get endpoint from registry descriptor', async () => {
            mockRegistryClient.getAssetAdministrationShellDescriptorById = jest.fn().mockResolvedValue({
                success: true,
                data: testDescriptor,
            });

            const result = await aasService.getAasEndpointById({ aasIdentifier: testAasId });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe(
                    'http://localhost:8081/shells/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvYWFzL3Rlc3QtMTIz'
                );
            }
            expect(mockRegistryClient.getAssetAdministrationShellDescriptorById).toHaveBeenCalledWith({
                configuration: registryConfig,
                aasIdentifier: testAasId,
            });
        });

        it('should construct endpoint from repository config when registry not available', async () => {
            mockRegistryClient.getAssetAdministrationShellDescriptorById = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NotFoundError', message: 'Not found' },
            });

            const result = await aasService.getAasEndpointById({ aasIdentifier: testAasId });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe(
                    'http://localhost:8081/shells/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvYWFzL3Rlc3QtMTIz'
                );
            }
        });

        it('should construct endpoint when useRegistry is false', async () => {
            const result = await aasService.getAasEndpointById({
                aasIdentifier: testAasId,
                useRegistry: false,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe(
                    'http://localhost:8081/shells/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvYWFzL3Rlc3QtMTIz'
                );
            }
            expect(mockRegistryClient.getAssetAdministrationShellDescriptorById).not.toHaveBeenCalled();
        });

        it('should return error when no repository config available', async () => {
            const serviceWithoutRepo = new AasService({ registryConfig });

            // Get the mock instance for the new service
            const newMockRegistryClient = (AasRegistryClient as jest.MockedClass<typeof AasRegistryClient>).mock
                .instances[1] as jest.Mocked<AasRegistryClient>;

            newMockRegistryClient.getAssetAdministrationShellDescriptorById = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NotFoundError', message: 'Not found' },
            });

            const result = await serviceWithoutRepo.getAasEndpointById({ aasIdentifier: testAasId });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('ConfigurationError');
            }
        });
    });

    describe('getAasByEndpoint', () => {
        it('should extract ID from endpoint and fetch shell', async () => {
            const endpoint = 'http://localhost:8081/shells/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvYWFzL3Rlc3QtMTIz';

            mockRepositoryClient.getAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: true,
                data: testShell,
            });

            const result = await aasService.getAasByEndpoint({ endpoint });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shell).toEqual(testShell);
            }
            expect(mockRepositoryClient.getAssetAdministrationShellById).toHaveBeenCalledWith({
                configuration: expect.objectContaining({
                    basePath: 'http://localhost:8081',
                }),
                aasIdentifier: testAasId,
            });
        });

        it('should handle endpoints with different ports', async () => {
            const endpoint = 'http://example.com:9090/shells/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvYWFzL3Rlc3QtMTIz';

            mockRepositoryClient.getAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: true,
                data: testShell,
            });

            const result = await aasService.getAasByEndpoint({ endpoint });

            expect(result.success).toBe(true);
            expect(mockRepositoryClient.getAssetAdministrationShellById).toHaveBeenCalledWith({
                configuration: expect.objectContaining({
                    basePath: 'http://example.com:9090',
                }),
                aasIdentifier: testAasId,
            });
        });

        it('should handle https endpoints', async () => {
            const endpoint = 'https://secure.example.com/shells/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvYWFzL3Rlc3QtMTIz';

            mockRepositoryClient.getAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: true,
                data: testShell,
            });

            const result = await aasService.getAasByEndpoint({ endpoint });

            expect(result.success).toBe(true);
            expect(mockRepositoryClient.getAssetAdministrationShellById).toHaveBeenCalledWith({
                configuration: expect.objectContaining({
                    basePath: 'https://secure.example.com',
                }),
                aasIdentifier: testAasId,
            });
        });

        it('should return error for invalid endpoint format', async () => {
            const invalidEndpoint = 'http://localhost:8081/invalid/path';

            const result = await aasService.getAasByEndpoint({ endpoint: invalidEndpoint });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('InvalidEndpoint');
                expect(result.error.message).toContain('Invalid endpoint format');
            }
        });

        it('should return error when shell fetch fails', async () => {
            const endpoint = 'http://localhost:8081/shells/aHR0cHM6Ly9leGFtcGxlLmNvbS9pZHMvYWFzL3Rlc3QtMTIz';

            mockRepositoryClient.getAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NotFoundError', message: 'Shell not found' },
            });

            const result = await aasService.getAasByEndpoint({ endpoint });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('NotFoundError');
            }
        });
    });

    describe('createAas', () => {
        it('should create AAS in repository and register in registry', async () => {
            mockRepositoryClient.postAssetAdministrationShell = jest.fn().mockResolvedValue({
                success: true,
                data: testShell,
            });

            const createdDescriptor = new AssetAdministrationShellDescriptor(testShell.id);
            mockRegistryClient.postAssetAdministrationShellDescriptor = jest.fn().mockResolvedValue({
                success: true,
                data: createdDescriptor,
            });

            const result = await aasService.createAas({
                shell: testShell,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shell).toEqual(testShell);
                expect(result.data.descriptor).toBeDefined();
                expect(result.data.descriptor!.id).toBe(testShell.id);
            }
            expect(mockRepositoryClient.postAssetAdministrationShell).toHaveBeenCalledWith({
                configuration: repositoryConfig,
                assetAdministrationShell: testShell,
            });
            expect(mockRegistryClient.postAssetAdministrationShellDescriptor).toHaveBeenCalledWith(
                expect.objectContaining({
                    configuration: registryConfig,
                })
            );
        });

        it('should return error when repository creation fails', async () => {
            mockRepositoryClient.postAssetAdministrationShell = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'ConflictError', message: 'AAS already exists' },
            });

            const result = await aasService.createAas({
                shell: testShell,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('ConflictError');
            }
            expect(mockRegistryClient.postAssetAdministrationShellDescriptor).not.toHaveBeenCalled();
        });

        it('should return error when registry registration fails', async () => {
            mockRepositoryClient.postAssetAdministrationShell = jest.fn().mockResolvedValue({
                success: true,
                data: testShell,
            });
            mockRegistryClient.postAssetAdministrationShellDescriptor = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NetworkError', message: 'Registry unavailable' },
            });

            const result = await aasService.createAas({
                shell: testShell,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('NetworkError');
            }
        });

        it('should work without registry when only repository is configured', async () => {
            const serviceWithoutRegistry = new AasService({ repositoryConfig });
            const mockRepoClient = (AasRepositoryClient as jest.MockedClass<typeof AasRepositoryClient>).mock
                .instances[1] as jest.Mocked<AasRepositoryClient>;

            mockRepoClient.postAssetAdministrationShell = jest.fn().mockResolvedValue({
                success: true,
                data: testShell,
            });

            const result = await serviceWithoutRegistry.createAas({
                shell: testShell,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shell).toEqual(testShell);
                expect(result.data.descriptor).toBeUndefined();
            }
        });
    });

    describe('updateAas', () => {
        it('should update AAS in repository and registry', async () => {
            mockRepositoryClient.putAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: true,
                data: testShell,
            });

            const updatedDescriptor = new AssetAdministrationShellDescriptor(testShell.id);
            mockRegistryClient.putAssetAdministrationShellDescriptorById = jest.fn().mockResolvedValue({
                success: true,
                data: updatedDescriptor,
            });

            const result = await aasService.updateAas({
                shell: testShell,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shell).toEqual(testShell);
                expect(result.data.descriptor).toBeDefined();
                expect(result.data.descriptor!.id).toBe(testShell.id);
            }
            expect(mockRepositoryClient.putAssetAdministrationShellById).toHaveBeenCalledWith({
                configuration: repositoryConfig,
                aasIdentifier: testShell.id,
                assetAdministrationShell: testShell,
            });
            expect(mockRegistryClient.putAssetAdministrationShellDescriptorById).toHaveBeenCalledWith(
                expect.objectContaining({
                    configuration: registryConfig,
                    aasIdentifier: testShell.id,
                })
            );
        });

        it('should return error when repository update fails', async () => {
            mockRepositoryClient.putAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NotFoundError', message: 'AAS not found' },
            });

            const result = await aasService.updateAas({
                shell: testShell,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('NotFoundError');
            }
            expect(mockRegistryClient.putAssetAdministrationShellDescriptorById).not.toHaveBeenCalled();
        });

        it('should return error when registry update fails', async () => {
            mockRepositoryClient.putAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: true,
                data: testShell,
            });
            mockRegistryClient.putAssetAdministrationShellDescriptorById = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NetworkError', message: 'Registry unavailable' },
            });

            const result = await aasService.updateAas({
                shell: testShell,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('NetworkError');
            }
        });

        it('should work without registry when only repository is configured', async () => {
            const serviceWithoutRegistry = new AasService({ repositoryConfig });
            const mockRepoClient = (AasRepositoryClient as jest.MockedClass<typeof AasRepositoryClient>).mock
                .instances[1] as jest.Mocked<AasRepositoryClient>;

            mockRepoClient.putAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: true,
                data: testShell,
            });

            const result = await serviceWithoutRegistry.updateAas({
                shell: testShell,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shell).toEqual(testShell);
                expect(result.data.descriptor).toBeUndefined();
            }
        });
    });

    describe('deleteAas', () => {
        it('should remove from registry and repository', async () => {
            mockRegistryClient.deleteAssetAdministrationShellDescriptorById = jest.fn().mockResolvedValue({
                success: true,
                data: undefined,
            });
            mockRepositoryClient.deleteAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: true,
                data: undefined,
            });

            const result = await aasService.deleteAas({ aasIdentifier: testAasId });

            expect(result.success).toBe(true);
            expect(mockRegistryClient.deleteAssetAdministrationShellDescriptorById).toHaveBeenCalledWith({
                configuration: registryConfig,
                aasIdentifier: testAasId,
            });
            expect(mockRepositoryClient.deleteAssetAdministrationShellById).toHaveBeenCalledWith({
                configuration: repositoryConfig,
                aasIdentifier: testAasId,
            });
        });

        it('should return error when registry deletion fails', async () => {
            mockRegistryClient.deleteAssetAdministrationShellDescriptorById = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NotFoundError', message: 'Descriptor not found' },
            });

            const result = await aasService.deleteAas({ aasIdentifier: testAasId });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('NotFoundError');
            }
            expect(mockRepositoryClient.deleteAssetAdministrationShellById).not.toHaveBeenCalled();
        });

        it('should return error when repository deletion fails', async () => {
            mockRegistryClient.deleteAssetAdministrationShellDescriptorById = jest.fn().mockResolvedValue({
                success: true,
                data: undefined,
            });
            mockRepositoryClient.deleteAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: false,
                error: { errorType: 'NotFoundError', message: 'AAS not found' },
            });

            const result = await aasService.deleteAas({ aasIdentifier: testAasId });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('NotFoundError');
            }
        });

        it('should work without registry when only repository is configured', async () => {
            const serviceWithoutRegistry = new AasService({ repositoryConfig });
            const mockRepoClient = (AasRepositoryClient as jest.MockedClass<typeof AasRepositoryClient>).mock
                .instances[1] as jest.Mocked<AasRepositoryClient>;

            mockRepoClient.deleteAssetAdministrationShellById = jest.fn().mockResolvedValue({
                success: true,
                data: undefined,
            });

            const result = await serviceWithoutRegistry.deleteAas({ aasIdentifier: testAasId });

            expect(result.success).toBe(true);
        });
    });

    describe('Configuration handling', () => {
        it('should return error when no configuration is provided', async () => {
            const serviceWithoutConfig = new AasService({});

            const result = await serviceWithoutConfig.getAasList();

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('ConfigurationError');
            }
        });

        it('should return error when getAasById has no configuration', async () => {
            const serviceWithoutConfig = new AasService({});

            const result = await serviceWithoutConfig.getAasById({
                aasIdentifier: testAasId,
                useRegistryEndpoint: false,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('ConfigurationError');
            }
        });

        it('should return error when createAas has no repository config', async () => {
            const serviceWithoutRepo = new AasService({ registryConfig });

            const result = await serviceWithoutRepo.createAas({
                shell: testShell,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('ConfigurationError');
            }
        });
    });
});
