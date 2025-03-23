import type { AssetinformationThumbnailBody } from '../generated/types.gen';
import { AasRepositoryClient } from '../clients/AasRepositoryClient';
import { createDescription, createGlobalAssetId, createTestShell } from './fixtures/aasFixtures';

describe('AAS Repository Integration Tests', () => {
    const baseURL = 'http://localhost:8081';
    const client = new AasRepositoryClient();
    const testShell = createTestShell();

    test('should create a new Asset Administration Shell', async () => {
        const response = await client.postAssetAdministrationShell({
            baseUrl: baseURL,
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
            baseUrl: baseURL,
            aasIdentifier: testShell.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testShell);
        }
    });

    test('should update an Asset Administration Shell', async () => {
        const updatedShell = testShell;
        const description = createDescription();

        updatedShell.description = [description];

        const updateResponse = await client.putAssetAdministrationShellById({
            baseUrl: baseURL,
            aasIdentifier: testShell.id,
            assetAdministrationShell: updatedShell,
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
            expect(updateResponse.data).toBeDefined();
        }

        const fetchResponse = await client.getAssetAdministrationShellById({
            baseUrl: baseURL,
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
            baseUrl: baseURL,
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
            baseUrl: baseURL,
            aasIdentifier: testShell.id,
            assetInformation: updatedAssetInfo,
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
            expect(updateResponse.data).toBeDefined();
        }

        const fetchResponse = await client.getAssetInformation({
            baseUrl: baseURL,
            aasIdentifier: testShell.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedAssetInfo);
        }
    });

    test('should add a thumbnail to an Asset Administration Shell', async () => {
        const thumbnail = {
            fileName: 'test_thumbnail.png',
            file: new Blob(['base64_encoded_image_data'], { type: 'image/png' }),
        } as AssetinformationThumbnailBody;

        const updateResponse = await client.putThumbnail({
            baseUrl: baseURL,
            aasIdentifier: testShell.id,
            thumbnail,
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
            expect(updateResponse.data).toBeDefined();
        }

        const fetchResponse = await client.getThumbnail({
            baseUrl: baseURL,
            aasIdentifier: testShell.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(thumbnail.file);
        }
    });
});
