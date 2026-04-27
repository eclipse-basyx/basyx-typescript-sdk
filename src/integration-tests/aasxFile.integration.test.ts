import fs from 'node:fs';
import { AasxFileClient } from '../clients/AasxFileClient';
import { Configuration } from '../generated';
import { AasxFileService } from '../generated';
import { base64Encode } from '../lib/base64Url';
import { createTestShell } from './fixtures/aasxFileFixtures';

type StoredPackageDescription = AasxFileService.PackageDescription & { packageId: string };

describe('AASX File Server Integration Tests', () => {
    const client = new AasxFileClient();
    const testShell = createTestShell();
    const configuration = new Configuration({
        basePath: 'http://localhost:8087',
    });

    const createdPackageIds: string[] = [];
    const uniqueSuffix = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const unavailableCursor = (): string =>
        base64Encode(`https://example.com/ids/non-existing-cursor-${uniqueSuffix()}`);
    const createPackageFile = (): Blob =>
        new Blob([fs.readFileSync('test-data/sample.aasx')], {
            type: 'application/asset-administration-shell-package',
        });
    const createFileName = (): string => `sample-${uniqueSuffix()}.aasx`;

    const postPackage = async (): Promise<StoredPackageDescription> => {
        const response = await client.postAASXPackage({
            configuration,
            aasIds: [testShell.id],
            fileName: createFileName(),
            file: createPackageFile(),
        });

        expect(response.success).toBe(true);
        if (!response.success) {
            throw new Error('Failed to create AASX package fixture');
        }

        expect(response.data.packageId).toBeDefined();
        if (!response.data.packageId) {
            throw new Error('AASX package fixture did not return a packageId');
        }

        createdPackageIds.push(response.data.packageId);
        return response.data as StoredPackageDescription;
    };

    afterEach(async () => {
        const packageIds = createdPackageIds.splice(0);
        await Promise.all(
            packageIds.map((packageId) =>
                client.deleteAASXByPackageId({
                    configuration,
                    packageId,
                })
            )
        );
    });

    /**
     * @operation GetAllAASXPackageIds
     * @status 200
     */
    test('should fetch a list of available AASX packages', async () => {
        const response = await client.getAllAASXPackageIds({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.data.result)).toBe(true);
        }
    });

    /**
     * @operation GetAllAASXPackageIds
     * @status 400 [known-backend-bug]
     *
     * The current AASX file server backend returns 500 instead of 400 for invalid paging parameters.
     */
    test.skip('should reject invalid AASX package paging parameters with bad request when backend validation is fixed', async () => {
        const response = await client.getAllAASXPackageIds({
            configuration,
            limit: -1,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation GetAllAASXPackageIds
     * @status 200
     */
    test('should return an empty AASX package page for an unavailable cursor', async () => {
        const response = await client.getAllAASXPackageIds({
            configuration,
            cursor: unavailableCursor(),
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.pagedResult).toEqual({});
            expect(response.data.result).toEqual([]);
        }
    });

    /**
     * @operation PostAASXPackage
     * @status 201 [known-backend-bug]
     *
     * The current AASX file server backend incorrectly expects Base64URL-encoded multipart aasIds and fileName fields.
     */
    test.skip('should store an AASX package at the server when multipart fields are accepted as specified', async () => {
        const response = await client.postAASXPackage({
            configuration,
            aasIds: [testShell.id],
            fileName: createFileName(),
            file: createPackageFile(),
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data.packageId).toBeDefined();
            expect(response.data.aasIds).toContain(testShell.id);
            if (response.data.packageId) {
                createdPackageIds.push(response.data.packageId);
            }
        }
    });

    /**
     * @operation PostAASXPackage
     * @status 400
     */
    test('should reject invalid AASX package upload with bad request', async () => {
        const response = await client.postAASXPackage({
            configuration,
            fileName: '',
            file: new Blob([], { type: 'application/asset-administration-shell-package' }),
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation PostAASXPackage
     * @status 409 [non-blocking] [known-backend-bug]
     *
     * The duplicate-path setup depends on successful spec-compliant multipart package creation.
     */
    test.skip('should surface conflict status for duplicate AASX package creation when backend enforces it', async () => {
        const fileName = createFileName();
        const file = createPackageFile();

        const initialResponse = await client.postAASXPackage({
            configuration,
            aasIds: [testShell.id],
            fileName,
            file,
        });
        expect(initialResponse.success).toBe(true);
        if (initialResponse.success && initialResponse.data.packageId) {
            createdPackageIds.push(initialResponse.data.packageId);
        }

        const duplicateResponse = await client.postAASXPackage({
            configuration,
            aasIds: [testShell.id],
            fileName,
            file,
        });

        if (duplicateResponse.success) {
            expect(duplicateResponse.statusCode).toBe(201);
            if (duplicateResponse.data.packageId) {
                createdPackageIds.push(duplicateResponse.data.packageId);
            }
        } else {
            expect(duplicateResponse.statusCode).toBe(409);
            expect(duplicateResponse.error.messages?.[0]?.code).toBe('409');
        }
    });

    /**
     * @operation GetAASXByPackageId
     * @status 200 [known-backend-bug]
     *
     * The fixture setup depends on successful spec-compliant multipart package creation.
     */
    test.skip('should fetch a specific AASX package from the server when package creation works as specified', async () => {
        const packageDescription = await postPackage();

        const response = await client.getAASXByPackageId({
            configuration,
            packageId: packageDescription.packageId,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.size).toBeGreaterThan(0);
        }
    });

    /**
     * @operation GetAASXByPackageId
     * @status 400
     */
    test('should reject missing AASX package identifier when fetching by ID', async () => {
        const response = await client.getAASXByPackageId({
            configuration,
            packageId: undefined as unknown as string,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation GetAASXByPackageId
     * @status 404
     */
    test('should return not found for a non-existing AASX package', async () => {
        const response = await client.getAASXByPackageId({
            configuration,
            packageId: `non-existing-${uniqueSuffix()}`,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation PutAASXByPackageId
     * @status 201 [known-backend-bug]
     *
     * The current AASX file server backend does not create missing packages through PUT and incorrectly expects
     * Base64URL-encoded multipart aasIds and fileName fields.
     */
    test.skip('should create an AASX package through put by ID with created status when backend support exists', async () => {
        const packageId = `aasx-put-${uniqueSuffix()}`;

        const response = await client.putAASXByPackageId({
            configuration,
            packageId,
            aasIds: [testShell.id],
            fileName: createFileName(),
            file: createPackageFile(),
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            createdPackageIds.push(packageId);
        }
    });

    /**
     * @operation PutAASXByPackageId
     * @status 204 [known-backend-bug]
     *
     * The fixture/update setup depends on successful spec-compliant multipart package handling.
     */
    test.skip('should update an AASX package through put by ID with no content status when multipart fields are accepted as specified', async () => {
        const packageDescription = await postPackage();

        const response = await client.putAASXByPackageId({
            configuration,
            packageId: packageDescription.packageId,
            aasIds: [testShell.id],
            fileName: createFileName(),
            file: createPackageFile(),
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
            expect(response.data).toBeUndefined();
        }
    });

    /**
     * @operation PutAASXByPackageId
     * @status 400
     */
    test('should reject missing AASX package identifier when updating by ID', async () => {
        const response = await client.putAASXByPackageId({
            configuration,
            packageId: undefined as unknown as string,
            fileName: createFileName(),
            file: createPackageFile(),
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation DeleteAASXByPackageId
     * @status 204 [known-backend-bug]
     *
     * The fixture setup depends on successful spec-compliant multipart package creation.
     */
    test.skip('should delete a specific AASX package from the server when package creation works as specified', async () => {
        const packageDescription = await postPackage();

        const response = await client.deleteAASXByPackageId({
            configuration,
            packageId: packageDescription.packageId,
        });
        createdPackageIds.splice(createdPackageIds.indexOf(packageDescription.packageId), 1);

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
            expect(response.data).toBeUndefined();
        }
    });

    /**
     * @operation DeleteAASXByPackageId
     * @status 400
     */
    test('should reject missing AASX package identifier when deleting by ID', async () => {
        const response = await client.deleteAASXByPackageId({
            configuration,
            packageId: undefined as unknown as string,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation DeleteAASXByPackageId
     * @status 404
     */
    test('should return not found when deleting a non-existing AASX package', async () => {
        const response = await client.deleteAASXByPackageId({
            configuration,
            packageId: `non-existing-${uniqueSuffix()}`,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation GetSelfDescription
     * @status 200
     */
    test('should fetch AASX file server service description', async () => {
        const response = await client.getSelfDescription({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(Array.isArray(response.data.profiles)).toBe(true);
        }
    });

    /**
     * @operation GetSelfDescription
     * @status 400 [known-specification-bug]
     *
     * The fixed self-description endpoint has no request input that can produce a 400 response.
     */
    test.skip('should reject invalid self-description requests with bad request when the API exposes invalid input', async () => {
        const response = await client.getSelfDescription({
            configuration,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation GetSelfDescription
     * @status 404 [known-specification-bug]
     *
     * The fixed self-description endpoint has no resource identifier that can address a missing resource.
     */
    test.skip('should return not found for missing self-description resources when the API exposes an addressable resource', async () => {
        const response = await client.getSelfDescription({
            configuration,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });
});
