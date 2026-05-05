import { Configuration } from '../generated';
import { base64Encode } from '../lib/base64Url';
import { SubmodelService } from '../services/SubmodelService';
import { createTestSubmodelDescriptor } from './fixtures/aasregistryFixtures';
import { assertApiFailure, assertApiResult } from './fixtures/assertionHelpers';
import { createTestSubmodel } from './fixtures/submodelFixtures';

describe('SubmodelService Integration Tests', () => {
    const submodelRegistryConfig = new Configuration({ basePath: 'http://localhost:8085' });
    const submodelRepositoryConfig = new Configuration({ basePath: 'http://localhost:8082' });
    const submodelService = new SubmodelService({ submodelRegistryConfig, submodelRepositoryConfig });

    // Helper function to create unique test data for each test
    function createUniqueTestData() {
        const uniqueId = `https://example.com/ids/sm/${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const testSubmodel = createTestSubmodel();
        testSubmodel.id = uniqueId;

        const testDescriptor = createTestSubmodelDescriptor();
        testDescriptor.id = uniqueId;
        testDescriptor.endpoints = [
            {
                _interface: 'SUBMODEL-3.0',
                protocolInformation: {
                    href: 'http://localhost:8082/submodels/' + base64Encode(uniqueId),
                    endpointProtocol: null,
                    endpointProtocolVersion: null,
                    subprotocol: null,
                    subprotocolBody: null,
                    subprotocolBodyEncoding: null,
                    securityAttributes: null,
                },
            },
        ];

        return { testSubmodel, testDescriptor };
    }

    describe('createSubmodel and deleteSubmodel', () => {
        test('should create Submodel in both repository and registry', async () => {
            const { testSubmodel } = createUniqueTestData();

            const createResult = await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            assertApiResult(createResult);
            if (createResult.success) {
                expect(createResult.data.submodel).toBeDefined();
                expect(createResult.data.submodel.id).toBe(testSubmodel.id);
                expect(createResult.data.descriptor).toBeDefined();
                expect(createResult.data.descriptor!.id).toBe(testSubmodel.id);
            }

            // Cleanup
            await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodel.id });
        });

        test('should deregister Submodel from both registry and repository', async () => {
            const { testSubmodel } = createUniqueTestData();

            // First create
            const createResult = await submodelService.createSubmodel({
                submodel: testSubmodel,
            });
            assertApiResult(createResult);

            // Then deregister
            const deregisterResult = await submodelService.deleteSubmodel({
                submodelIdentifier: testSubmodel.id,
            });

            assertApiResult(deregisterResult);
        });

        test('should fail to deregister non-existent Submodel', async () => {
            const deregisterResult = await submodelService.deleteSubmodel({
                submodelIdentifier: 'non-existent-id',
            });

            assertApiFailure(deregisterResult);
        });
    });

    describe('updateSubmodel', () => {
        test('should update Submodel in both repository and registry', async () => {
            const { testSubmodel } = createUniqueTestData();

            // First create the Submodel
            await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            // Modify the submodel
            testSubmodel.idShort = 'UpdatedShortId';

            // Update the Submodel
            const updateResult = await submodelService.updateSubmodel({
                submodel: testSubmodel,
            });

            assertApiResult(updateResult);
            if (updateResult.success) {
                expect(updateResult.data.submodel).toBeDefined();
                expect(updateResult.data.submodel.id).toBe(testSubmodel.id);
                expect(updateResult.data.submodel.idShort).toBe('UpdatedShortId');
                // descriptor may be undefined if it already existed (204 response)
            }

            // Cleanup
            await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodel.id });
        });
    });

    describe('getSubmodelEndpointById', () => {
        test('should get endpoint from registry', async () => {
            const { testSubmodel } = createUniqueTestData();

            // Create Submodel in registry first
            await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            // Get endpoint
            const endpointResult = await submodelService.getSubmodelEndpointById({
                submodelIdentifier: testSubmodel.id,
            });

            assertApiResult(endpointResult);
            if (endpointResult.success) {
                expect(endpointResult.data).toContain('/submodels/');
                expect(endpointResult.data).toContain('http://localhost:8082');
            }

            // Cleanup
            await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodel.id });
        });

        test('should construct endpoint when registry not used', async () => {
            const { testSubmodel } = createUniqueTestData();

            // Create Submodel without registry
            await submodelService.createSubmodel({
                submodel: testSubmodel,
                registerInRegistry: false,
            });

            // Get endpoint without registry
            const endpointResult = await submodelService.getSubmodelEndpointById({
                submodelIdentifier: testSubmodel.id,
                useRegistry: false,
            });

            assertApiResult(endpointResult);
            if (endpointResult.success) {
                expect(endpointResult.data).toContain('/submodels/');
                expect(endpointResult.data).toContain('http://localhost:8082');
            }

            // Cleanup
            await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodel.id, deleteFromRegistry: false });
        });
    });

    describe('getSubmodelByEndpoint', () => {
        test('should retrieve Submodel using endpoint', async () => {
            const { testSubmodel } = createUniqueTestData();

            // Create Submodel first
            await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            // Get endpoint
            const endpointResult = await submodelService.getSubmodelEndpointById({
                submodelIdentifier: testSubmodel.id,
            });

            assertApiResult(endpointResult);

            if (endpointResult.success) {
                // Use endpoint to fetch Submodel
                const submodelResult = await submodelService.getSubmodelByEndpoint({
                    endpoint: endpointResult.data,
                });

                assertApiResult(submodelResult);
                if (submodelResult.success) {
                    expect(submodelResult.data.submodel).toBeDefined();
                    expect(submodelResult.data.submodel.id).toBe(testSubmodel.id);
                }
            }

            // Cleanup
            await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodel.id });
        });

        test('should handle invalid endpoint format', async () => {
            const invalidEndpoint = 'http://localhost:8082/invalid/path';

            const result = await submodelService.getSubmodelByEndpoint({
                endpoint: invalidEndpoint,
            });

            assertApiFailure(result);
            if (!result.success) {
                expect(result.error.errorType).toBe('InvalidEndpoint');
            }
        });
    });

    describe('getSubmodelList', () => {
        test('should retrieve Submodel list from registry', async () => {
            const { testSubmodel } = createUniqueTestData();

            // Register a Submodel first
            await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            const result = await submodelService.getSubmodelList({ preferRegistry: true });

            assertApiResult(result);
            if (result.success) {
                expect(result.data.source).toBe('registry');
                expect(result.data.submodels).toBeDefined();
                expect(Array.isArray(result.data.submodels)).toBe(true);
                // Verify our specific Submodel is in the list
                const foundSubmodel = result.data.submodels.find((s) => s.id === testSubmodel.id);
                expect(foundSubmodel).toBeDefined();
                expect(foundSubmodel?.id).toBe(testSubmodel.id);
            }

            // Cleanup
            await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodel.id });
        });

        test('should retrieve Submodel list from repository', async () => {
            const { testSubmodel } = createUniqueTestData();

            // Register a Submodel first
            await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            const result = await submodelService.getSubmodelList({ preferRegistry: false });

            assertApiResult(result);
            if (result.success) {
                expect(result.data.source).toBe('repository');
                expect(result.data.submodels).toBeDefined();
                expect(Array.isArray(result.data.submodels)).toBe(true);
                expect(result.data.submodels!.length).toBeGreaterThan(0);
            }

            // Cleanup
            await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodel.id });
        });

        test('should respect limit parameter', async () => {
            const { testSubmodel } = createUniqueTestData();

            // Register a Submodel first
            await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            const result = await submodelService.getSubmodelList({ limit: 1, preferRegistry: true });

            assertApiResult(result);
            if (result.success) {
                expect(result.data.source).toBe('registry');
                // The limit parameter should restrict the result to at most 1 item
                expect(result.data.submodels.length).toBeLessThanOrEqual(1);
                expect(result.data.submodels.length).toBeGreaterThanOrEqual(0);
            }

            // Cleanup
            await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodel.id });
        });
    });

    describe('getSubmodelById', () => {
        test('should retrieve Submodel using registry endpoint', async () => {
            const { testSubmodel, testDescriptor } = createUniqueTestData();

            // Register a Submodel first
            await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            const result = await submodelService.getSubmodelById({
                submodelIdentifier: testSubmodel.id,
                useRegistryEndpoint: true,
            });

            assertApiResult(result);
            if (result.success) {
                expect(result.data.submodel).toBeDefined();
                expect(result.data.submodel.id).toBe(testSubmodel.id);
                expect(result.data.descriptor).toBeDefined();
                if (result.data.descriptor) {
                    expect(result.data.descriptor.id).toBe(testDescriptor.id);
                }
            }

            // Cleanup
            await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodel.id });
        });

        test('should retrieve Submodel directly from repository', async () => {
            const { testSubmodel } = createUniqueTestData();

            // Register a Submodel first
            await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            const result = await submodelService.getSubmodelById({
                submodelIdentifier: testSubmodel.id,
                useRegistryEndpoint: false,
            });

            assertApiResult(result);
            if (result.success) {
                expect(result.data.submodel).toBeDefined();
                expect(result.data.submodel.id).toBe(testSubmodel.id);
                expect(result.data.descriptor).toBeUndefined();
            }

            // Cleanup
            await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodel.id });
        });

        test('should fail to retrieve non-existent Submodel', async () => {
            const result = await submodelService.getSubmodelById({
                submodelIdentifier: 'non-existent-id',
                useRegistryEndpoint: false,
            });

            assertApiFailure(result);
        });
    });

    describe('fallback behavior', () => {
        test('should fall back to repository when registry is unavailable', async () => {
            const { testSubmodel } = createUniqueTestData();

            // Create service with invalid registry config
            const serviceWithBadRegistry = new SubmodelService({
                submodelRegistryConfig: new Configuration({ basePath: 'http://localhost:9999' }),
                submodelRepositoryConfig,
            });

            // Register Submodel using standard service
            await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            // Try to get list with bad registry - should fall back to repository
            const result = await serviceWithBadRegistry.getSubmodelList();

            assertApiResult(result);
            if (result.success) {
                expect(result.data.source).toBe('repository');
                expect(result.data.submodels).toBeDefined();
            }

            // Cleanup
            await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodel.id });
        });
    });

    describe('service with only repository config', () => {
        const repoOnlyService = new SubmodelService({ submodelRepositoryConfig });

        test('should work with only repository configuration', async () => {
            const result = await repoOnlyService.getSubmodelList();

            assertApiResult(result);
            if (result.success) {
                expect(result.data.source).toBe('repository');
            }
        });
    });

    describe('service with no configuration', () => {
        const emptyService = new SubmodelService({});

        test('should fail when no configuration is provided', async () => {
            const result = await emptyService.getSubmodelList();

            assertApiFailure(result);
            if (!result.success) {
                expect(result.error.errorType).toBe('ConfigurationError');
            }
        });
    });

    describe('includeConceptDescriptions functionality', () => {
        const cdRepositoryConfig = new Configuration({ basePath: 'http://localhost:8083' });
        const serviceWithCD = new SubmodelService({
            submodelRegistryConfig,
            submodelRepositoryConfig,
            conceptDescriptionRepositoryConfig: cdRepositoryConfig,
        });

        test('getSubmodelList with includeConceptDescriptions should not fail when CD repo unavailable', async () => {
            const { testSubmodel } = createUniqueTestData();

            // Create a submodel in repository
            await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            // Fetch with concept descriptions (should not fail even if none found)
            const result = await serviceWithCD.getSubmodelList({
                preferRegistry: false,
                includeConceptDescriptions: true,
            });

            assertApiResult(result);
            if (result.success) {
                expect(result.data.submodels.length).toBeGreaterThan(0);
                expect(result.data.conceptDescriptions).toBeDefined();
                // Concept descriptions may be empty array if none found
                expect(Array.isArray(result.data.conceptDescriptions)).toBe(true);
            }

            // Cleanup
            await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodel.id });
        });

        test('getSubmodelById with includeConceptDescriptions should work', async () => {
            const { testSubmodel } = createUniqueTestData();

            // Create a submodel in repository
            await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            // Fetch with concept descriptions
            const result = await serviceWithCD.getSubmodelById({
                submodelIdentifier: testSubmodel.id,
                useRegistryEndpoint: false,
                includeConceptDescriptions: true,
            });

            assertApiResult(result);
            if (result.success) {
                expect(result.data.submodel.id).toBe(testSubmodel.id);
                expect(result.data.conceptDescriptions).toBeDefined();
                expect(Array.isArray(result.data.conceptDescriptions)).toBe(true);
            }

            // Cleanup
            await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodel.id });
        });

        test('getSubmodelByEndpoint with includeConceptDescriptions should work', async () => {
            const { testSubmodel } = createUniqueTestData();

            // Create a submodel in repository
            await submodelService.createSubmodel({
                submodel: testSubmodel,
            });

            const endpoint = `http://localhost:8082/submodels/${base64Encode(testSubmodel.id)}`;

            // Fetch with concept descriptions
            const result = await serviceWithCD.getSubmodelByEndpoint({
                endpoint,
                includeConceptDescriptions: true,
            });

            assertApiResult(result);
            if (result.success) {
                expect(result.data.submodel.id).toBe(testSubmodel.id);
                expect(result.data.conceptDescriptions).toBeDefined();
                expect(Array.isArray(result.data.conceptDescriptions)).toBe(true);
            }

            // Cleanup
            await submodelService.deleteSubmodel({ submodelIdentifier: testSubmodel.id });
        });
    });
});
