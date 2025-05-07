import { SubmodelRepositoryClient } from '../clients/SubmodelRepositoryClient';
//import { Configuration } from '../generated';
import { SubmodelRepositoryService } from '../generated';
import { createDescription, createTestSubmodel, createTestSubmodelElement } from './fixtures/submodelFixtures';

describe('Submodel Repository Integration Tests', () => {
    const client = new SubmodelRepositoryClient();
    const testSubmodel = createTestSubmodel();
    const testSubmodelElement = createTestSubmodelElement();
    const configuration = new SubmodelRepositoryService.Configuration({
        basePath: 'http://localhost:8082',
    });

    test('should create a new Submodel', async () => {
        const response = await client.postSubmodel({
            configuration,
            submodel: testSubmodel,
        });

        // Log the error details if the request failed
        if (!response.success && response.error) {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testSubmodel);
        }
    });

    test('should fetch a Submodel by ID', async () => {
        const response = await client.getSubmodelById({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testSubmodel);
        }
    });

    test('should fetch a Submodel by non-existing ID', async () => {
        const nonExistingId = 'non-existing-id';
        const response = await client.getSubmodelById({
            configuration,
            submodelIdentifier: nonExistingId,
        });
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeDefined();
            console.log('Error:', response.error);
        }
    });

    test('should fetch all Submodels', async () => {
        const response = await client.getAllSubmodels({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(testSubmodel);
        }
    });

    test('should create a new SubmodelElement', async () => {
        const response = await client.postSubmodelElement({
            configuration,
            submodelIdentifier: testSubmodel.id,
            submodelElement: testSubmodelElement,
        });

        // Log the error details if the request failed
        if (!response.success && response.error) {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testSubmodelElement);
        }
       
    });

    test('should update a Submodel', async () => {
        const updatedSubmodel = testSubmodel;
        const description = createDescription();

        updatedSubmodel.description = [description];
        updatedSubmodel.submodelElements = [testSubmodelElement];

        const updateResponse = await client.putSubmodelById({
            configuration,
            submodelIdentifier: testSubmodel.id,
            submodel: updatedSubmodel,
        });

        expect(updateResponse.success).toBe(true);

        const fetchResponse = await client.getSubmodelById({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedSubmodel);
        }
    });


    test('should fetch all SubmodelElements', async () => {
        const response = await client.getAllSubmodelElements({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(testSubmodelElement);
        }
    });
});
