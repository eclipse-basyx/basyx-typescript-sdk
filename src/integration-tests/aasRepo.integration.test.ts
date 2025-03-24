import { AasRepositoryClient } from '../clients/AasRepositoryClient';
import { Configuration, ConfigurationParameters } from '../generated/AasRepositoryService';
import { createDescription, createGlobalAssetId, createTestShell } from './fixtures/aasFixtures';

describe('AAS Repository Integration Tests', () => {
    const client = new AasRepositoryClient();
    const testShell = createTestShell();
    const configuration = new Configuration({
        basePath: 'http://localhost:8081',
    } as ConfigurationParameters);

    test('should create a new Asset Administration Shell', async () => {
        const response = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: testShell,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testShell);
        }
    });

    test('should fetch an Asset Administration Shell by ID', async () => {
        const response = await client.getAssetAdministrationShellById({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testShell);
        }
    });

    test('should fetch an Asset Administration Shell by non-existing ID', async () => {
        const nonExistingId = 'non-existing-id';
        const response = await client.getAssetAdministrationShellById({
            configuration,
            aasIdentifier: nonExistingId,
        });
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeDefined();
            console.log('Error:', response.error);
        }
    });

    test('should fetch all Asset Administration Shells', async () => {
        const response = await client.getAllAssetAdministrationShells({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(testShell);
        }
    });

    test('should update an Asset Administration Shell', async () => {
        const updatedShell = testShell;
        const description = createDescription();

        updatedShell.description = [description];

        const updateResponse = await client.putAssetAdministrationShellById({
            configuration,
            aasIdentifier: testShell.id,
            assetAdministrationShell: updatedShell,
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
            expect(updateResponse.data).toBeDefined();
        }

        const fetchResponse = await client.getAssetAdministrationShellById({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedShell);
        }
    });

    test('should get the Asset Information of an Asset Administration Shell', async () => {
        const response = await client.getAssetInformation({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testShell.assetInformation);
        }
    });

    test('should update the Asset Information of an Asset Administration Shell', async () => {
        const updatedAssetInfo = testShell.assetInformation;
        updatedAssetInfo.globalAssetId = createGlobalAssetId();

        const updateResponse = await client.putAssetInformation({
            configuration,
            aasIdentifier: testShell.id,
            assetInformation: updatedAssetInfo,
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
            expect(updateResponse.data).toBeDefined();
        }

        const fetchResponse = await client.getAssetInformation({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedAssetInfo);
        }
    });

    test('should add a thumbnail to an Asset Administration Shell', async () => {
        const fileName = 'test_thumbnail.png';
        const file = new Blob(['base64_encoded_image_data'], { type: 'image/png' });

        const updateResponse = await client.putThumbnail({
            configuration,
            aasIdentifier: testShell.id,
            fileName,
            file,
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
            expect(updateResponse.data).toBeDefined();
        }

        const fetchResponse = await client.getThumbnail({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(file);
        }
    });
});
