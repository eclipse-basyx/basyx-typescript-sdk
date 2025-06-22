import { AasRegistryClient } from '../clients/AasRegistryClient';
import { AasRegistryService } from '../generated';
import {
    createDescription,
    createDisplayName,
    createTestShellDescriptor,
    createTestSubmodelDescriptor,
} from './fixtures/aasregistryFixtures';

describe('AAS Registry Integration Tests', () => {
    const client = new AasRegistryClient();
    const testShellDescriptor = createTestShellDescriptor();
    const testSubmodelDescriptor = createTestSubmodelDescriptor();
    const configuration = new AasRegistryService.Configuration({
        basePath: 'http://localhost:8084',
    });

    test('should create a new Asset Administration Shell Descriptor', async () => {
        const response = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: testShellDescriptor,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testShellDescriptor);
        }
    });

    test('should fetch an Asset Administration Shell Descriptor by ID', async () => {
        const response = await client.getAssetAdministrationShellDescriptorById({
            configuration,
            aasIdentifier: testShellDescriptor.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testShellDescriptor);
        }
    });

    test('should fetch an Asset Administration Shell Descriptor by non-existing ID', async () => {
        const nonExistingId = 'non-existing-id';
        const response = await client.getAssetAdministrationShellDescriptorById({
            configuration,
            aasIdentifier: nonExistingId,
        });
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeDefined();
            console.log('Error:', response.error);
        }
    });

    test('should fetch all Asset Administration Shell Descriptors', async () => {
        const response = await client.getAllAssetAdministrationShellDescriptors({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(testShellDescriptor);
        }
    });

    test('should update an Asset Administration Shell Descriptor', async () => {
        const updatedShellDescriptor = testShellDescriptor;
        const description = createDescription();

        updatedShellDescriptor.description = [description];
        //updatedShellDescriptor.submodelDescriptors = [testSubmodelDescriptor];

        const updateResponse = await client.putAssetAdministrationShellDescriptorById({
            configuration,
            aasIdentifier: testShellDescriptor.id,
            assetAdministrationShellDescriptor: updatedShellDescriptor,
        });

        expect(updateResponse.success).toBe(true);

        const fetchResponse = await client.getAssetAdministrationShellDescriptorById({
            configuration,
            aasIdentifier: testShellDescriptor.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedShellDescriptor);
        }
    });

    test('should create a new Submodel Descriptor', async () => {
        const response = await client.postSubmodelDescriptorThroughSuperpath({
            configuration,
            aasIdentifier: testShellDescriptor.id,
            submodelDescriptor: testSubmodelDescriptor,
        });
        console.log('Submitted:', testSubmodelDescriptor);

        expect(response.success).toBe(true);

        if (response.success) {
            console.log('Received:', response.data);
            expect(response.data).toBeDefined();
            expect(response.data?.id).toEqual(testSubmodelDescriptor.id);
            expect(response.data?.endpoints).toEqual(testSubmodelDescriptor.endpoints);

            expect(response.data).toEqual(testSubmodelDescriptor);
        }
    });

    test('should fetch a Submodel Descriptor by ID', async () => {
        const response = await client.getSubmodelDescriptorByIdThroughSuperpath({
            configuration,
            aasIdentifier: testShellDescriptor.id,
            submodelIdentifier: testSubmodelDescriptor.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testSubmodelDescriptor);
        }
    });

    test('should fetch all Submodel Descriptors', async () => {
        const response = await client.getAllSubmodelDescriptorsThroughSuperpath({
            configuration,
            aasIdentifier: testShellDescriptor.id,
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

        const updateResponse = await client.putSubmodelDescriptorByIdThroughSuperpath({
            configuration,
            aasIdentifier: testShellDescriptor.id,
            submodelIdentifier: testSubmodelDescriptor.id,
            submodelDescriptor: updatedSubmodelDescriptor,
        });

        expect(updateResponse.success).toBe(true);

        const fetchResponse = await client.getSubmodelDescriptorByIdThroughSuperpath({
            configuration,
            aasIdentifier: testShellDescriptor.id,
            submodelIdentifier: testSubmodelDescriptor.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedSubmodelDescriptor);
        }
    });
});
