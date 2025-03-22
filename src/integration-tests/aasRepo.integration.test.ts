import { AasRepositoryClient } from '../clients/AasRepositoryClient';
import { createTestShell } from './fixtures/aasFixtures';

describe('AAS Repository Integration Tests', () => {
    const baseURL = 'http://localhost:8081';
    const client = new AasRepositoryClient();
    const testShell = createTestShell();

    console.log('Test Shell:', JSON.stringify(testShell, null, 2));

    test('should create a new Asset Administration Shell', async () => {
        try {
            const createdShell = await client.postAssetAdministrationShell(baseURL, testShell);
            console.log('Created Shell:', JSON.stringify(createdShell, null, 2));

            expect(createdShell).toBeDefined();
            expect(createdShell).toEqual(testShell);
        } catch (error) {
            console.error('Error creating Asset Administration Shell:', error);
            throw error;
        }
    });

    test('should fetch an Asset Administration Shell by ID', async () => {
        try {
            const shell = await client.getAssetAdministrationShellById(baseURL, testShell.id);
            console.log('Fetched Shell:', JSON.stringify(shell, null, 2));

            expect(shell).toBeDefined();
            expect(shell).toEqual(testShell);
        } catch (error) {
            console.error('Error fetching Asset Administration Shell:', error);
            throw error;
        }
    });
});
