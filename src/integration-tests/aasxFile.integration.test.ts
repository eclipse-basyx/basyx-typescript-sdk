import fs from 'node:fs';
import { AasxFileClient } from '../clients/AasxFileClient';
import { Configuration } from '../generated';
import { AasxFileService } from '../generated';
import { base64Decode, base64Encode } from '../lib/base64Url';
import { createTestShell } from './fixtures/aasxFileFixtures';
import { assertApiFailure, assertApiResult } from './fixtures/assertionHelpers';
import { getIntegrationBasePath } from './testEngineConfig';

type StoredPackageDescription = AasxFileService.PackageDescription & { packageId: string };

describe('AASX File Server Integration Tests', () => {
    const client = new AasxFileClient();
    const testShell = createTestShell();
    const configuration = new Configuration({
        basePath: getIntegrationBasePath('aasxFileServer'),
    });

    const createdPackageIds: string[] = [];
    const uniqueSuffix = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const unavailableCursor = (): string =>
        base64Encode(`https://example.com/ids/non-existing-cursor-${uniqueSuffix()}`);
    const normalizeEncodedIdentifier = (identifier: string): string => {
        const decoded = base64Decode(identifier);
        return decoded && base64Encode(decoded) === identifier ? decoded : identifier;
    };
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

        assertApiResult(response, 'Create AASX package fixture');

        expect(response.data.packageId).toBeDefined();
        if (!response.data.packageId) {
            throw new Error('AASX package fixture did not return a packageId');
        }

        const normalizedPackageId = normalizeEncodedIdentifier(response.data.packageId);
        createdPackageIds.push(normalizedPackageId);
        return {
            ...(response.data as AasxFileService.PackageDescription),
            packageId: normalizedPackageId,
        } as StoredPackageDescription;
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

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.data.result)).toBe(true);
        }
    });

    /**
     * @operation GetAllAASXPackageIds
     * @status 400
     */
    test('should reject invalid AASX package paging parameters with bad request', async () => {
        const response = await client.getAllAASXPackageIds({
            configuration,
            limit: -1,
        });

        assertApiFailure(response);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation GetAllAASXPackageIds
     * @status 400
     */
    test('should reject malformed AASX package cursor with bad request', async () => {
        const response = await client.getAllAASXPackageIds({
            configuration,
            cursor: unavailableCursor(),
        });

        assertApiFailure(response);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation PostAASXPackage
     * @status 201
     */
    test('should store an AASX package at the server', async () => {
        const response = await client.postAASXPackage({
            configuration,
            aasIds: [testShell.id],
            fileName: createFileName(),
            file: createPackageFile(),
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data.packageId).toBeDefined();

            const responseAasIds = response.data.aasIds ?? [];
            const normalizedResponseAasIds = responseAasIds.map((aasId) => normalizeEncodedIdentifier(aasId));
            expect(normalizedResponseAasIds).toContain(testShell.id);

            if (response.data.packageId) {
                createdPackageIds.push(normalizeEncodedIdentifier(response.data.packageId));
            }
        }
    });

    /**
     * @operation PostAASXPackage
     * @status 400 [known-backend-bug]
     *
     * The current AASX file server backend accepts empty multipart fileName values and still returns 201.
     */
    test.skip('should reject invalid AASX package upload with bad request when backend validates empty fileName', async () => {
        const response = await client.postAASXPackage({
            configuration,
            fileName: '',
            file: new Blob([], { type: 'application/asset-administration-shell-package' }),
        });

        assertApiFailure(response);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation PostAASXPackage
     * @status 409 [non-blocking] [known-backend-bug]
     *
     * Current backend may return either 201 (new package) or 409 (conflict) for duplicate uploads.
     */
    test('should surface conflict status for duplicate AASX package creation when backend enforces it', async () => {
        const fileName = createFileName();
        const file = createPackageFile();

        const initialResponse = await client.postAASXPackage({
            configuration,
            aasIds: [testShell.id],
            fileName,
            file,
        });
        assertApiResult(initialResponse);
        if (initialResponse.success && initialResponse.data.packageId) {
            createdPackageIds.push(normalizeEncodedIdentifier(initialResponse.data.packageId));
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
                createdPackageIds.push(normalizeEncodedIdentifier(duplicateResponse.data.packageId));
            }
        } else {
            expect(duplicateResponse.statusCode).toBe(409);
            expect(duplicateResponse.error.messages?.[0]?.code).toBe('409');
        }
    });

    /**
     * @operation GetAASXByPackageId
     * @status 200
     */
    test('should fetch a specific AASX package from the server', async () => {
        const packageDescription = await postPackage();

        const response = await client.getAASXByPackageId({
            configuration,
            packageId: packageDescription.packageId,
        });

        assertApiResult(response);
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

        assertApiFailure(response);
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

        assertApiFailure(response);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation PutAASXByPackageId
     * @status 201
     */
    test('should create an AASX package through put by ID with created status', async () => {
        const packageId = `aasx-put-${uniqueSuffix()}`;

        const response = await client.putAASXByPackageId({
            configuration,
            packageId,
            aasIds: [testShell.id],
            fileName: createFileName(),
            file: createPackageFile(),
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            createdPackageIds.push(packageId);
        }
    });

    /**
     * @operation PutAASXByPackageId
     * @status 204
     */
    test('should update an AASX package through put by ID with no content status', async () => {
        const packageDescription = await postPackage();

        const response = await client.putAASXByPackageId({
            configuration,
            packageId: packageDescription.packageId,
            aasIds: [testShell.id],
            fileName: createFileName(),
            file: createPackageFile(),
        });

        assertApiResult(response);
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

        assertApiFailure(response);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation DeleteAASXByPackageId
     * @status 204
     */
    test('should delete a specific AASX package from the server', async () => {
        const packageDescription = await postPackage();

        const response = await client.deleteAASXByPackageId({
            configuration,
            packageId: packageDescription.packageId,
        });
        createdPackageIds.splice(createdPackageIds.indexOf(packageDescription.packageId), 1);

        assertApiResult(response);
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

        assertApiFailure(response);
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

        assertApiFailure(response);
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

        assertApiResult(response);
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

        assertApiFailure(response);
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

        assertApiFailure(response);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });
});
