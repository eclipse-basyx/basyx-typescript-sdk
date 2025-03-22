import { AasRepositoryClient } from '../clients/AasRepositoryClient';

describe('AAS Repository Integration Tests', () => {
    const baseURL = 'http://localhost:8081';

    test('should fetch all shells from the AAS Repository container', async () => {
        const client = new AasRepositoryClient();
        const shells = await client.getAllAssetAdministrationShells(baseURL);
        console.log('Fetched shells:', shells);
        expect(shells).toBeDefined();
        // Additional assertions depending on your API behavior
    });
});
