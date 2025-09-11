import { SubmodelRegistryClient } from '../clients/SubmodelRegistryClient';
import { Configuration } from '../generated';
import { createDisplayName, createTestSubmodelDescriptor } from './fixtures/aasregistryFixtures';

describe('Submodel Registry Integration Tests', () => {
    const client = new SubmodelRegistryClient();
    const testSubmodelDescriptor = createTestSubmodelDescriptor();
    const configuration = new Configuration({
        basePath: 'http://localhost:8085',
    });

    test('should create a new Submodel Descriptor', async () => {
        const response = await client.postSubmodelDescriptor({
            configuration,
            submodelDescriptor: testSubmodelDescriptor,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testSubmodelDescriptor);
        }
    });

    test('should fetch a Submodel Descriptor by ID', async () => {
        const response = await client.getSubmodelDescriptorById({
            configuration,
            submodelIdentifier: testSubmodelDescriptor.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testSubmodelDescriptor);
        }
    });

    test('should fetch a Submodel Descriptor by non-existing ID', async () => {
        const nonExistingId = 'non-existing-id';
        const response = await client.getSubmodelDescriptorById({
            configuration,
            submodelIdentifier: nonExistingId,
        });
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeDefined();
            console.log('Error:', response.error);
        }
    });

    test('should fetch all Submodel Descriptors', async () => {
        const response = await client.getAllSubmodelDescriptors({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(testSubmodelDescriptor);
        }
    });

    test('should update a Submodel Descriptor', async () => {
        const updatedSubmodelDescriptor = testSubmodelDescriptor;
        const displayName = createDisplayName();

        updatedSubmodelDescriptor.displayName = [displayName];

        const updateResponse = await client.putSubmodelDescriptorById({
            configuration,
            submodelIdentifier: testSubmodelDescriptor.id,
            submodelDescriptor: updatedSubmodelDescriptor,
        });

        expect(updateResponse.success).toBe(true);

        const fetchResponse = await client.getSubmodelDescriptorById({
            configuration,
            submodelIdentifier: testSubmodelDescriptor.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedSubmodelDescriptor);
        }
    });
});
