import { Configuration } from '../generated';
import { base64Encode } from '../lib/base64Url';
import { AasService } from '../services/AasService';
import { createTestShell } from './fixtures/aasFixtures';
import { createTestShellDescriptor } from './fixtures/aasregistryFixtures';

describe('AasService Integration Tests', () => {
    const registryConfig = new Configuration({ basePath: 'http://localhost:8084' });
    const repositoryConfig = new Configuration({ basePath: 'http://localhost:8081' });
    const aasService = new AasService({ registryConfig, repositoryConfig });

    // Helper function to create unique test data for each test
    function createUniqueTestData() {
        const uniqueId = `https://example.com/ids/aas/${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const testShell = createTestShell();
        testShell.id = uniqueId;

        const testDescriptor = createTestShellDescriptor();
        testDescriptor.id = uniqueId;
        testDescriptor.endpoints = [
            {
                _interface: 'AAS-3.0',
                protocolInformation: {
                    href: 'http://localhost:8081/shells/' + base64Encode(uniqueId),
                    endpointProtocol: null,
                    endpointProtocolVersion: null,
                    subprotocol: null,
                    subprotocolBody: null,
                    subprotocolBodyEncoding: null,
                    securityAttributes: null,
                },
            },
        ];

        return { testShell, testDescriptor };
    }

    describe('createAas and deleteAas', () => {
        test('should create AAS in both repository and registry', async () => {
            const { testShell } = createUniqueTestData();

            const createResult = await aasService.createAas({
                shell: testShell,
            });

            expect(createResult.success).toBe(true);
            if (createResult.success) {
                expect(createResult.data.shell).toBeDefined();
                expect(createResult.data.shell.id).toBe(testShell.id);
                expect(createResult.data.descriptor).toBeDefined();
                expect(createResult.data.descriptor!.id).toBe(testShell.id);
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });

        test('should deregister AAS from both registry and repository', async () => {
            const { testShell } = createUniqueTestData();

            // First create
            const createResult = await aasService.createAas({
                shell: testShell,
            });
            expect(createResult.success).toBe(true);

            // Then deregister
            const deregisterResult = await aasService.deleteAas({
                aasIdentifier: testShell.id,
            });

            expect(deregisterResult.success).toBe(true);
        });

        test('should fail to deregister non-existent AAS', async () => {
            const deregisterResult = await aasService.deleteAas({
                aasIdentifier: 'non-existent-id',
            });

            expect(deregisterResult.success).toBe(false);
        });
    });

    describe('updateAas', () => {
        test('should update AAS in both repository and registry', async () => {
            const { testShell } = createUniqueTestData();

            // First create the AAS
            await aasService.createAas({
                shell: testShell,
            });

            // Modify the shell
            testShell.idShort = 'UpdatedShortId';

            // Update the AAS
            const updateResult = await aasService.updateAas({
                shell: testShell,
            });

            expect(updateResult.success).toBe(true);
            if (updateResult.success) {
                expect(updateResult.data.shell).toBeDefined();
                expect(updateResult.data.shell.id).toBe(testShell.id);
                expect(updateResult.data.shell.idShort).toBe('UpdatedShortId');
                expect(updateResult.data.descriptor).toBeDefined();
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });
    });

    describe('getAasEndpointById', () => {
        test('should get endpoint from registry', async () => {
            const { testShell } = createUniqueTestData();

            // Create AAS in registry first
            await aasService.createAas({
                shell: testShell,
            });

            // Get endpoint
            const endpointResult = await aasService.getAasEndpointById({
                aasIdentifier: testShell.id,
            });

            expect(endpointResult.success).toBe(true);
            if (endpointResult.success) {
                expect(endpointResult.data).toContain('/shells/');
                expect(endpointResult.data).toContain('http://localhost:8081');
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });

        test('should construct endpoint when registry not used', async () => {
            const { testShell } = createUniqueTestData();

            // Create AAS without registry
            await aasService.createAas({
                shell: testShell,
                registerInRegistry: false,
            });

            // Get endpoint without registry
            const endpointResult = await aasService.getAasEndpointById({
                aasIdentifier: testShell.id,
                useRegistry: false,
            });

            expect(endpointResult.success).toBe(true);
            if (endpointResult.success) {
                expect(endpointResult.data).toContain('/shells/');
                expect(endpointResult.data).toContain('http://localhost:8081');
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id, deleteFromRegistry: false });
        });
    });

    describe('getAasByEndpoint', () => {
        test('should retrieve AAS using endpoint', async () => {
            const { testShell } = createUniqueTestData();

            // Create AAS first
            await aasService.createAas({
                shell: testShell,
            });

            // Get endpoint
            const endpointResult = await aasService.getAasEndpointById({
                aasIdentifier: testShell.id,
            });

            expect(endpointResult.success).toBe(true);

            if (endpointResult.success) {
                // Use endpoint to fetch AAS
                const shellResult = await aasService.getAasByEndpoint({
                    endpoint: endpointResult.data,
                });

                expect(shellResult.success).toBe(true);
                if (shellResult.success) {
                    expect(shellResult.data.shell).toBeDefined();
                    expect(shellResult.data.shell.id).toBe(testShell.id);
                }
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });

        test('should handle invalid endpoint format', async () => {
            const invalidEndpoint = 'http://localhost:8081/invalid/path';

            const result = await aasService.getAasByEndpoint({
                endpoint: invalidEndpoint,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('InvalidEndpoint');
            }
        });
    });

    describe('getAasList', () => {
        test('should retrieve AAS list from registry', async () => {
            const { testShell } = createUniqueTestData();

            // Register an AAS first
            await aasService.createAas({
                shell: testShell,
            });

            const result = await aasService.getAasList({ preferRegistry: true });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.source).toBe('registry');
                expect(result.data.shells).toBeDefined();
                expect(Array.isArray(result.data.shells)).toBe(true);
                // Verify our specific AAS is in the list
                const foundShell = result.data.shells.find((s) => s.id === testShell.id);
                expect(foundShell).toBeDefined();
                expect(foundShell?.id).toBe(testShell.id);
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });

        test('should retrieve AAS list from repository', async () => {
            const { testShell } = createUniqueTestData();

            // Register an AAS first
            await aasService.createAas({
                shell: testShell,
            });

            const result = await aasService.getAasList({ preferRegistry: false });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.source).toBe('repository');
                expect(result.data.shells).toBeDefined();
                expect(Array.isArray(result.data.shells)).toBe(true);
                expect(result.data.shells!.length).toBeGreaterThan(0);
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });

        test('should respect limit parameter', async () => {
            const { testShell } = createUniqueTestData();

            // Register an AAS first
            await aasService.createAas({
                shell: testShell,
            });

            const result = await aasService.getAasList({ limit: 1, preferRegistry: true });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.source).toBe('registry');
                // The limit parameter should restrict the result to at most 1 item
                expect(result.data.shells.length).toBeLessThanOrEqual(1);
                expect(result.data.shells.length).toBeGreaterThanOrEqual(0);
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });
    });

    describe('getAasById', () => {
        test('should retrieve AAS using registry endpoint', async () => {
            const { testShell, testDescriptor } = createUniqueTestData();

            // Register an AAS first
            await aasService.createAas({
                shell: testShell,
            });

            const result = await aasService.getAasById({
                aasIdentifier: testShell.id,
                useRegistryEndpoint: true,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shell).toBeDefined();
                expect(result.data.shell.id).toBe(testShell.id);
                expect(result.data.descriptor).toBeDefined();
                if (result.data.descriptor) {
                    expect(result.data.descriptor.id).toBe(testDescriptor.id);
                }
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });

        test('should retrieve AAS directly from repository', async () => {
            const { testShell } = createUniqueTestData();

            // Register an AAS first
            await aasService.createAas({
                shell: testShell,
            });

            const result = await aasService.getAasById({
                aasIdentifier: testShell.id,
                useRegistryEndpoint: false,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shell).toBeDefined();
                expect(result.data.shell.id).toBe(testShell.id);
                expect(result.data.descriptor).toBeUndefined();
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });

        test('should fail to retrieve non-existent AAS', async () => {
            const result = await aasService.getAasById({
                aasIdentifier: 'non-existent-id',
                useRegistryEndpoint: false,
            });

            expect(result.success).toBe(false);
        });
    });

    describe('fallback behavior', () => {
        test('should fall back to repository when registry is unavailable', async () => {
            const { testShell } = createUniqueTestData();

            // Create service with invalid registry config
            const serviceWithBadRegistry = new AasService({
                registryConfig: new Configuration({ basePath: 'http://localhost:9999' }),
                repositoryConfig,
            });

            // Register AAS using standard service
            await aasService.createAas({
                shell: testShell,
            });

            // Try to get list with bad registry - should fall back to repository
            const result = await serviceWithBadRegistry.getAasList();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.source).toBe('repository');
                expect(result.data.shells).toBeDefined();
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });
    });

    describe('service with only repository config', () => {
        const repoOnlyService = new AasService({ repositoryConfig });

        test('should work with only repository configuration', async () => {
            const result = await repoOnlyService.getAasList();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.source).toBe('repository');
            }
        });
    });

    describe('service with no configuration', () => {
        const emptyService = new AasService({});

        test('should fail when no configuration is provided', async () => {
            const result = await emptyService.getAasList();

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('ConfigurationError');
            }
        });
    });

    describe('includeSubmodels functionality', () => {
        test('should include submodels when requested in getAasList', async () => {
            const { testShell } = createUniqueTestData();

            // Create AAS
            await aasService.createAas({ shell: testShell });

            // Get list with submodels
            const result = await aasService.getAasList({
                preferRegistry: false,
                includeSubmodels: true,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shells).toBeDefined();
                expect(result.data.submodels).toBeDefined();
                expect(typeof result.data.submodels).toBe('object');
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });

        test('should not include submodels when not requested in getAasList', async () => {
            const { testShell } = createUniqueTestData();

            // Create AAS
            await aasService.createAas({ shell: testShell });

            // Get list without submodels
            const result = await aasService.getAasList({
                preferRegistry: false,
                includeSubmodels: false,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shells).toBeDefined();
                expect(result.data.submodels).toBeUndefined();
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });

        test('should include submodels when requested in getAasById', async () => {
            const { testShell } = createUniqueTestData();

            // Create AAS
            await aasService.createAas({ shell: testShell });

            // Get by ID with submodels
            const result = await aasService.getAasById({
                aasIdentifier: testShell.id,
                useRegistryEndpoint: false,
                includeSubmodels: true,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shell).toBeDefined();
                expect(result.data.submodels).toBeDefined();
                expect(Array.isArray(result.data.submodels)).toBe(true);
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });

        test('should include submodels when requested in getAasByEndpoint', async () => {
            const { testShell } = createUniqueTestData();

            // Create AAS
            await aasService.createAas({ shell: testShell });

            // Get endpoint
            const endpointResult = await aasService.getAasEndpointById({
                aasIdentifier: testShell.id,
            });

            expect(endpointResult.success).toBe(true);

            if (endpointResult.success) {
                // Get by endpoint with submodels
                const result = await aasService.getAasByEndpoint({
                    endpoint: endpointResult.data,
                    includeSubmodels: true,
                });

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.shell).toBeDefined();
                    expect(result.data.submodels).toBeDefined();
                    expect(Array.isArray(result.data.submodels)).toBe(true);
                }
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });
    });

    describe('includeConceptDescriptions functionality', () => {
        const cdRepositoryConfig = new Configuration({ basePath: 'http://localhost:8083' });
        const serviceWithCD = new AasService({
            registryConfig,
            repositoryConfig,
            conceptDescriptionRepositoryConfig: cdRepositoryConfig,
        });

        test('getAasList with includeSubmodels and includeConceptDescriptions should work', async () => {
            const { testShell } = createUniqueTestData();

            // Create AAS
            await aasService.createAas({ shell: testShell });

            // Fetch with concept descriptions
            const result = await serviceWithCD.getAasList({
                preferRegistry: false,
                includeSubmodels: true,
                includeConceptDescriptions: true,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shells.length).toBeGreaterThan(0);
                expect(result.data.submodels).toBeDefined();
                // Concept descriptions are fetched through submodel service
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });

        test('getAasById with includeSubmodels and includeConceptDescriptions should work', async () => {
            const { testShell } = createUniqueTestData();

            // Create AAS
            await aasService.createAas({ shell: testShell });

            // Fetch with concept descriptions
            const result = await serviceWithCD.getAasById({
                aasIdentifier: testShell.id,
                useRegistryEndpoint: false,
                includeSubmodels: true,
                includeConceptDescriptions: true,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shell.id).toBe(testShell.id);
                expect(result.data.submodels).toBeDefined();
                // Concept descriptions are fetched through submodel service
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });

        test('getAasByEndpoint with includeSubmodels and includeConceptDescriptions should work', async () => {
            const { testShell } = createUniqueTestData();

            // Create AAS
            await aasService.createAas({ shell: testShell });

            const endpoint = `http://localhost:8081/shells/${base64Encode(testShell.id)}`;

            // Fetch with concept descriptions
            const result = await serviceWithCD.getAasByEndpoint({
                endpoint,
                includeSubmodels: true,
                includeConceptDescriptions: true,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shell.id).toBe(testShell.id);
                expect(result.data.submodels).toBeDefined();
                // Concept descriptions are fetched through submodel service
            }

            // Cleanup
            await aasService.deleteAas({ aasIdentifier: testShell.id });
        });
    });
});
