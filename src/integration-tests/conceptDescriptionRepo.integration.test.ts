import { ConceptDescriptionRepositoryClient } from '../clients/ConceptDescriptionRepositoryClient';
//import { Configuration } from '../generated';
import { ConceptDescriptionRepositoryService } from '../generated';
import { createDescription, createTestCD } from './fixtures/conceptDescriptionFixtures';

describe('Concept Description Repository Integration Tests', () => {
    const client = new ConceptDescriptionRepositoryClient();
    const testCD = createTestCD();
    const configuration = new ConceptDescriptionRepositoryService.Configuration({
        basePath: 'http://localhost:8083',
    });

    test('should create a new Concept Description', async () => {
        const response = await client.postConceptDescription({
            configuration,
            conceptDescription: testCD,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testCD);
        }
    });

    test('should fetch a Concept Description by ID', async () => {
        const response = await client.getConceptDescriptionById({
            configuration,
            cdIdentifier: testCD.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testCD);
        }
    });

    test('should fetch a Concept Description by non-existing ID', async () => {
        const nonExistingId = 'non-existing-id';
        const response = await client.getConceptDescriptionById({
            configuration,
            cdIdentifier: nonExistingId,
        });
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeDefined();
            console.log('Error:', response.error);
        }
    });

    test('should fetch all Concept Descriptions', async () => {
        const response = await client.getAllConceptDescriptions({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(testCD);
        }
    });

    test('should update a Concept Description', async () => {
        const updatedCD = testCD;
        const description = createDescription();

        updatedCD.description = [description];

        const updateResponse = await client.putConceptDescriptionById({
            configuration,
            cdIdentifier: testCD.id,
            conceptDescription: updatedCD,
        });

        expect(updateResponse.success).toBe(true);

        const fetchResponse = await client.getConceptDescriptionById({
            configuration,
            cdIdentifier: testCD.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedCD);
        }
    });
});
