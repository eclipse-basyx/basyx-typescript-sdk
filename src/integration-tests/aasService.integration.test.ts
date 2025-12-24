import {
    Key,
    KeyTypes,
    Reference,
    ReferenceTypes,
    SpecificAssetId,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { AasDiscoveryClient } from '../clients/AasDiscoveryClient';
import { Configuration } from '../generated';
import { base64Encode } from '../lib/base64Url';
import { AasService } from '../services/AasService';
import { createTestShell } from './fixtures/aasFixtures';
import { createTestShellDescriptor } from './fixtures/aasregistryFixtures';

describe('AasService Integration Tests', () => {
    const aasRegistryConfig = new Configuration({ basePath: 'http://localhost:8084' });
    const aasRepositoryConfig = new Configuration({ basePath: 'http://localhost:8081' });
    const aasService = new AasService({ aasRegistryConfig, aasRepositoryConfig });

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
                aasRegistryConfig: new Configuration({ basePath: 'http://localhost:9999' }),
                aasRepositoryConfig,
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
        const repoOnlyService = new AasService({ aasRepositoryConfig });

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
            aasRegistryConfig,
            aasRepositoryConfig,
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

    describe('getAasByAssetId', () => {
        const discoveryConfig = new Configuration({ basePath: 'http://localhost:8086' });
        const aasServiceWithDiscovery = new AasService({ aasRegistryConfig, aasRepositoryConfig, discoveryConfig });

        test('should find AAS by asset IDs', async () => {
            const { testShell } = createUniqueTestData();

            // Create AAS
            const createResult = await aasServiceWithDiscovery.createAas({ shell: testShell });
            expect(createResult.success).toBe(true);

            // Register asset links (assuming the shell has asset information with specific asset IDs)
            const assetIds = [
                { name: 'serialNumber', value: `SN-${Date.now()}` },
                { name: 'deviceId', value: `DEV-${Date.now()}` },
            ];

            // Post asset links to discovery service
            const discoveryClient = new AasDiscoveryClient();
            await discoveryClient.postAllAssetLinksById({
                configuration: discoveryConfig,
                aasIdentifier: testShell.id,
                specificAssetId: assetIds.map((id) => new SpecificAssetId(id.name, id.value)),
            });

            // Find AAS by asset IDs
            const result = await aasServiceWithDiscovery.getAasByAssetId({ assetIds });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shells.length).toBeGreaterThan(0);
                expect(result.data.aasIds).toContain(testShell.id);
                const foundShell = result.data.shells.find((s) => s.id === testShell.id);
                expect(foundShell).toBeDefined();
            }

            // Cleanup
            await discoveryClient.deleteAllAssetLinksById({
                configuration: discoveryConfig,
                aasIdentifier: testShell.id,
            });
            await aasServiceWithDiscovery.deleteAas({ aasIdentifier: testShell.id });
        });

        test('should return empty result when no AAS matches asset IDs', async () => {
            const assetIds = [{ name: 'nonexistent', value: 'does-not-exist-12345' }];

            const result = await aasServiceWithDiscovery.getAasByAssetId({ assetIds });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shells).toHaveLength(0);
                expect(result.data.aasIds).toHaveLength(0);
            }
        });

        test('should handle multiple matching AAS', async () => {
            const { testShell: testShell1 } = createUniqueTestData();
            const { testShell: testShell2 } = createUniqueTestData();

            // Create two AAS
            await aasServiceWithDiscovery.createAas({ shell: testShell1 });
            await aasServiceWithDiscovery.createAas({ shell: testShell2 });

            // Register same asset ID for both (simulating multiple AAS with same asset)
            const sharedAssetId = { name: 'batchNumber', value: `BATCH-${Date.now()}` };
            const discoveryClient = new AasDiscoveryClient();

            await discoveryClient.postAllAssetLinksById({
                configuration: discoveryConfig,
                aasIdentifier: testShell1.id,
                specificAssetId: [new SpecificAssetId(sharedAssetId.name, sharedAssetId.value)],
            });

            await discoveryClient.postAllAssetLinksById({
                configuration: discoveryConfig,
                aasIdentifier: testShell2.id,
                specificAssetId: [new SpecificAssetId(sharedAssetId.name, sharedAssetId.value)],
            });

            // Find AAS by the shared asset ID
            const result = await aasServiceWithDiscovery.getAasByAssetId({ assetIds: [sharedAssetId] });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shells.length).toBeGreaterThanOrEqual(2);
                expect(result.data.aasIds).toContain(testShell1.id);
                expect(result.data.aasIds).toContain(testShell2.id);
            }

            // Cleanup
            await discoveryClient.deleteAllAssetLinksById({
                configuration: discoveryConfig,
                aasIdentifier: testShell1.id,
            });
            await discoveryClient.deleteAllAssetLinksById({
                configuration: discoveryConfig,
                aasIdentifier: testShell2.id,
            });
            await aasServiceWithDiscovery.deleteAas({ aasIdentifier: testShell1.id });
            await aasServiceWithDiscovery.deleteAas({ aasIdentifier: testShell2.id });
        });

        test('should fail when discovery service is not configured', async () => {
            const assetIds = [{ name: 'serialNumber', value: '12345' }];

            const result = await aasService.getAasByAssetId({ assetIds });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('ConfigurationError');
                expect(result.error.message).toContain('Discovery service configuration not provided');
            }
        });

        test('should support includeSubmodels option', async () => {
            const { testShell } = createUniqueTestData();

            // Create AAS
            await aasServiceWithDiscovery.createAas({ shell: testShell });

            // Register asset links
            const assetIds = [{ name: 'testSerial', value: `TS-${Date.now()}` }];
            const discoveryClient = new AasDiscoveryClient();

            await discoveryClient.postAllAssetLinksById({
                configuration: discoveryConfig,
                aasIdentifier: testShell.id,
                specificAssetId: [new SpecificAssetId(assetIds[0].name, assetIds[0].value)],
            });

            // Find AAS with submodels
            const result = await aasServiceWithDiscovery.getAasByAssetId({
                assetIds,
                includeSubmodels: true,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.shells.length).toBeGreaterThan(0);
                // Submodels would be included if the AAS had any
            }

            // Cleanup
            await discoveryClient.deleteAllAssetLinksById({
                configuration: discoveryConfig,
                aasIdentifier: testShell.id,
            });
            await aasServiceWithDiscovery.deleteAas({ aasIdentifier: testShell.id });
        });
    });

    describe('resolveReference', () => {
        const submodelRegistryConfig = new Configuration({ basePath: 'http://localhost:8085' });
        const submodelRepositoryConfig = new Configuration({ basePath: 'http://localhost:8082' });
        const serviceWithSubmodels = new AasService({
            aasRegistryConfig,
            aasRepositoryConfig,
            submodelRegistryConfig,
            submodelRepositoryConfig,
        });

        test('should resolve reference with AAS and Submodel', async () => {
            const { testShell } = createUniqueTestData();

            // Create AAS
            await serviceWithSubmodels.createAas({ shell: testShell });

            // Create reference to AAS only
            const reference = new Reference(ReferenceTypes.ModelReference, [
                new Key(KeyTypes.AssetAdministrationShell, testShell.id),
            ]);

            // Resolve reference
            const result = await serviceWithSubmodels.resolveReference({ reference });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.aasEndpoint).toBeDefined();
                expect(result.data.aasEndpoint).toContain('http://localhost:8081/shells/');
                expect(result.data.submodelEndpoint).toBeUndefined();
                expect(result.data.submodelElementPath).toBeUndefined();

                // Verify the endpoint is actually usable
                const shellByEndpoint = await serviceWithSubmodels.getAasByEndpoint({
                    endpoint: result.data.aasEndpoint!,
                });
                expect(shellByEndpoint.success).toBe(true);
                if (shellByEndpoint.success) {
                    expect(shellByEndpoint.data.shell.id).toBe(testShell.id);
                }
            }

            // Cleanup
            await serviceWithSubmodels.deleteAas({ aasIdentifier: testShell.id });
        });

        test('should resolve reference to non-existent AAS gracefully', async () => {
            const nonExistentId = 'https://example.com/ids/aas/non-existent-' + Date.now();

            const reference = new Reference(ReferenceTypes.ModelReference, [
                new Key(KeyTypes.AssetAdministrationShell, nonExistentId),
            ]);

            const result = await serviceWithSubmodels.resolveReference({ reference });

            // Should still return success with constructed endpoint (from repository config fallback)
            expect(result.success).toBe(true);
            if (result.success) {
                // Endpoint is constructed from repository config even if AAS doesn't exist
                expect(result.data.aasEndpoint).toBeDefined();
                expect(result.data.aasEndpoint).toContain('http://localhost:8081/shells/');

                // However, trying to use this endpoint should fail
                const shellByEndpoint = await serviceWithSubmodels.getAasByEndpoint({
                    endpoint: result.data.aasEndpoint!,
                });
                expect(shellByEndpoint.success).toBe(false);
            }
        });

        test('should reject ExternalReference', async () => {
            const reference = new Reference(ReferenceTypes.ExternalReference, [
                new Key(KeyTypes.GlobalReference, 'http://external.com/resource'),
            ]);

            const result = await serviceWithSubmodels.resolveReference({ reference });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('UnsupportedReferenceType');
            }
        });

        test('should reject empty reference keys', async () => {
            const reference = new Reference(ReferenceTypes.ModelReference, []);

            const result = await serviceWithSubmodels.resolveReference({ reference });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errorType).toBe('InvalidReference');
            }
        });

        test('should handle AAS without registry (repository only)', async () => {
            const { testShell } = createUniqueTestData();

            // Create AAS without registry
            await serviceWithSubmodels.createAas({ shell: testShell, registerInRegistry: false });

            // Create reference
            const reference = new Reference(ReferenceTypes.ModelReference, [
                new Key(KeyTypes.AssetAdministrationShell, testShell.id),
            ]);

            // Resolve reference with useRegistry=false in getAasEndpointById
            const result = await serviceWithSubmodels.resolveReference({ reference });

            expect(result.success).toBe(true);
            if (result.success) {
                // Should construct endpoint from repository config
                expect(result.data.aasEndpoint).toBeDefined();
                expect(result.data.aasEndpoint).toContain('http://localhost:8081/shells/');
            }

            // Cleanup
            await serviceWithSubmodels.deleteAas({ aasIdentifier: testShell.id, deleteFromRegistry: false });
        });
    });
});
