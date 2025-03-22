import type { AssetinformationThumbnailBody } from '../generated/types.gen';
import { AasRepositoryClient } from '../clients/AasRepositoryClient';
import { createDescription, createGlobalAssetId, createTestShell } from './fixtures/aasFixtures';

describe('AAS Repository Integration Tests', () => {
    const baseURL = 'http://localhost:8081';
    const client = new AasRepositoryClient();
    const testShell = createTestShell();

    test('should create a new Asset Administration Shell', async () => {
        try {
            const createdShell = await client.postAssetAdministrationShell({
                baseUrl: baseURL,
                assetAdministrationShell: testShell,
            });

            expect(createdShell).toBeDefined();
            expect(createdShell).toEqual(testShell);
        } catch (error) {
            console.error('Error creating Asset Administration Shell:', error);
            throw error;
        }
    });

    test('should fetch an Asset Administration Shell by ID', async () => {
        try {
            const shell = await client.getAssetAdministrationShellById({
                baseUrl: baseURL,
                aasIdentifier: testShell.id,
            });

            expect(shell).toBeDefined();
            expect(shell).toEqual(testShell);
        } catch (error) {
            console.error('Error fetching Asset Administration Shell:', error);
            throw error;
        }
    });

    test('should update an Asset Administration Shell', async () => {
        try {
            const updatedShell = testShell;
            const desciption = createDescription();

            updatedShell.description = [desciption];

            await client.putAssetAdministrationShellById({
                baseUrl: baseURL,
                aasIdentifier: testShell.id,
                assetAdministrationShell: updatedShell,
            });

            const fetchedShell = await client.getAssetAdministrationShellById({
                baseUrl: baseURL,
                aasIdentifier: testShell.id,
            });

            expect(fetchedShell).toBeDefined();
            expect(fetchedShell).toEqual(updatedShell);
        } catch (error) {
            console.error('Error updating Asset Administration Shell:', error);
            throw error;
        }
    });

    test('should get the Asset Information of an Asset Administration Shell', async () => {
        try {
            const assetInfo = await client.getAssetInformation({
                baseUrl: baseURL,
                aasIdentifier: testShell.id,
            });

            expect(assetInfo).toBeDefined();
            expect(assetInfo).toEqual(testShell.assetInformation);
        } catch (error) {
            console.error('Error fetching Asset Information:', error);
            throw error;
        }
    });

    test('should update the Asset Information of an Asset Administration Shell', async () => {
        try {
            const updatedAssetInfo = testShell.assetInformation;
            updatedAssetInfo.globalAssetId = createGlobalAssetId();

            await client.putAssetInformation({
                baseUrl: baseURL,
                aasIdentifier: testShell.id,
                assetInformation: updatedAssetInfo,
            });

            const fetchedAssetInfo = await client.getAssetInformation({
                baseUrl: baseURL,
                aasIdentifier: testShell.id,
            });

            expect(fetchedAssetInfo).toBeDefined();
            expect(fetchedAssetInfo).toEqual(updatedAssetInfo);
        } catch (error) {
            console.error('Error updating Asset Information:', error);
            throw error;
        }
    });

    test('should add a thumbnail to an Asset Administration Shell', async () => {
        try {
            const thumbnail = {
                fileName: 'test_thumbnail.png',
                file: new Blob(['base64_encoded_image_data'], { type: 'image/png' }),
            } as AssetinformationThumbnailBody;

            await client.putThumbnail({
                baseUrl: baseURL,
                aasIdentifier: testShell.id,
                thumbnail,
            });

            const fetchedThumbnail = await client.getThumbnail({
                baseUrl: baseURL,
                aasIdentifier: testShell.id,
            });

            expect(fetchedThumbnail).toBeDefined();
            expect(fetchedThumbnail).toEqual(thumbnail.file);
        } catch (error) {
            console.error('Error adding thumbnail:', error);
            throw error;
        }
    });
});
