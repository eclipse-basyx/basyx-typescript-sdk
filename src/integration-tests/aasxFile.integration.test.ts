import fs from 'fs';
import { AasxFileClient } from '../clients/AasxFileClient';
import { AasxFileService } from '../generated';
import { createTestShell } from './fixtures/aasxFileFixtures';

describe('AASX File Server Integration Tests', () => {
    const client = new AasxFileClient();
    const testShell = createTestShell();
    //const testPackageDescription = createTestPackageDescription();
    const fileName = 'sample.aasx';
    const file = new Blob([fs.readFileSync('test-data/sample.aasx')], {
        type: 'application/asset-administration-shell-package+xml',
    });
    //const packageId = 'aasx-package-01';
    let createdPackageId: string;

    const configuration = new AasxFileService.Configuration({
        basePath: 'http://localhost:8087',
    });

    test('should store the AASX package at the server', async () => {
        const response = await client.postAASXPackage({
            configuration,
            aasIds: [testShell.id],
            fileName,
            file,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.packageId).toBeDefined();
            createdPackageId = response.data.packageId!;
            //expect(response.data).toEqual(testPackageDescription);
        }
    });

    test('should fetch a specific AASX package from the server', async () => {
        const response = await client.getAASXByPackageId({
            configuration,
            packageId: createdPackageId,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            //expect(response.data).toEqual(file);
        }
    });

    test('should fetch a specific AASX package by non-existing ID', async () => {
        const nonExistingId = 'non-existing-id';
        const response = await client.getAASXByPackageId({
            configuration,
            packageId: nonExistingId,
        });
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeDefined();
            console.log('Error:', response.error);
        }
    });

    test('should update the AASX package at the server', async () => {
        const updateResponse = await client.putAASXByPackageId({
            configuration,
            packageId: createdPackageId,
            aasIds: [testShell.id],
            fileName,
            file,
        });

        console.log('Update Response:', updateResponse);

        expect(updateResponse.success).toBe(true);

        const fetchResponse = await client.getAASXByPackageId({
            configuration,
            packageId: createdPackageId,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            //expect(fetchResponse.data).toEqual(file);
        }
    });

    test('should fetch a list of available AASX packages', async () => {
        const response = await client.getAllAASXPackageIds({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.result).toBeDefined();

            const serverResponse = response.data.result as any;
            expect(serverResponse.result).toBeDefined();
            expect(Array.isArray(serverResponse.result)).toBe(true);
            expect(serverResponse.result.length).toBeGreaterThan(0);
            //expect(response.data.result.length).toBeGreaterThan(0);
            //expect(response.data.result).toContainEqual([testPackageDescription]);
        }
    });
});
