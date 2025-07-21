import { AasDiscoveryClient } from '../clients/AasDiscoveryClient';
import { AasDiscoveryService } from '../generated';
import {
    createTestShell,
    createTestSpecificAssetId1,
    createTestSpecificAssetId2,
} from './fixtures/aasDiscoveryFixtures';

describe('AAS Discovery Integration Tests', () => {
    const client = new AasDiscoveryClient();
    const testShell = createTestShell();
    const testSpecificAssetId1 = createTestSpecificAssetId1();
    const testSpecificAssetId2 = createTestSpecificAssetId2();
    const configuration = new AasDiscoveryService.Configuration({
        basePath: 'http://localhost:8086',
    });

    test('should create specific asset identifiers linked to an Asset Administration Shell', async () => {
        const response = await client.postAllAssetLinksById({
            configuration,
            aasIdentifier: testShell.id,
            specificAssetId: [testSpecificAssetId1, testSpecificAssetId2],
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual([testSpecificAssetId1, testSpecificAssetId2]);
        }
    });

    test('should fetch a list of specific asset identifiers based on an Asset Administration Shell ID', async () => {
        const response = await client.getAllAssetLinksById({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual([testSpecificAssetId1, testSpecificAssetId2]);
        }
    });

    test('should fetch a list of specific asset identifiers based on by non-existing Asset Administration Shell ID', async () => {
        const nonExistingId = 'non-existing-id';
        const response = await client.getAllAssetLinksById({
            configuration,
            aasIdentifier: nonExistingId,
        });
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeDefined();
            console.log('Error:', response.error);
        }
    });

    test('should fetch a list of Asset Administration Shell IDs', async () => {
        const response = await client.getAllAssetAdministrationShellIdsByAssetLink({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(testShell.id);
        }
    });
});
