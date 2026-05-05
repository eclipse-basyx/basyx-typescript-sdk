import { SpecificAssetId as CoreSpecificAssetId } from '@aas-core-works/aas-core3.1-typescript/types';
import { AasDiscoveryClient } from '../clients/AasDiscoveryClient';
import { Configuration } from '../generated';
import { base64Encode } from '../lib/base64Url';
import {
    createTestSpecificAssetId1,
    createTestSpecificAssetId2,
} from './fixtures/aasDiscoveryFixtures';
import { createPerTestCleanupRunner } from './fixtures/testCleanup';
import { getIntegrationBasePath } from './testEngineConfig';

describe('AAS Discovery Integration Tests', () => {
    const client = new AasDiscoveryClient();
    const configuration = new Configuration({
        basePath: getIntegrationBasePath('aasDiscovery'),
    });
    const { track } = createPerTestCleanupRunner();

    const uniqueSuffix = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const unavailableCursor = (): string =>
        base64Encode(`https://example.com/ids/non-existing-cursor-${uniqueSuffix()}`);

    const createUniqueShellId = (): string => `https://example.com/ids/aas/discovery-${uniqueSuffix()}`;
    const createUniqueSpecificAssetId1 = () => {
        const specificAssetId = createTestSpecificAssetId1();
        specificAssetId.value = `https://example.com/ids/asset/discovery-1-${uniqueSuffix()}`;
        return specificAssetId;
    };
    const createUniqueSpecificAssetId2 = () => {
        const specificAssetId = createTestSpecificAssetId2();
        specificAssetId.value = `https://example.com/ids/asset/discovery-2-${uniqueSuffix()}`;
        return specificAssetId;
    };

    const registerAssetLinkCleanup = (aasIdentifier: string) => {
        track(async () => {
            const cleanupResponse = await client.deleteAllAssetLinksById({
                configuration,
                aasIdentifier,
            });

            if (!cleanupResponse.success && cleanupResponse.statusCode !== 404) {
                throw new Error(`Failed to cleanup asset links for ${aasIdentifier} (status ${cleanupResponse.statusCode})`);
            }
        });
    };

    const seedAssetLinks = async () => {
        const aasIdentifier = createUniqueShellId();
        const specificAssetId1 = createUniqueSpecificAssetId1();
        const specificAssetId2 = createUniqueSpecificAssetId2();

        const createResponse = await client.postAllAssetLinksById({
            configuration,
            aasIdentifier,
            specificAssetId: [specificAssetId1, specificAssetId2],
        });

        expect(createResponse.success).toBe(true);
        if (!createResponse.success) {
            throw new Error('Failed to seed AAS discovery asset links fixture');
        }

        registerAssetLinkCleanup(aasIdentifier);
        return { aasIdentifier, specificAssetId1, specificAssetId2 };
    };

    /**
     * @operation PostAllAssetLinksById
     * @status 201
     */
    test('should create specific asset identifiers linked to an Asset Administration Shell', async () => {
        const aasIdentifier = createUniqueShellId();
        const specificAssetId1 = createUniqueSpecificAssetId1();
        const specificAssetId2 = createUniqueSpecificAssetId2();

        const response = await client.postAllAssetLinksById({
            configuration,
            aasIdentifier,
            specificAssetId: [specificAssetId1, specificAssetId2],
        });

        expect(response.success).toBe(true);
        if (response.success) {
            registerAssetLinkCleanup(aasIdentifier);
            expect(response.statusCode).toBe(201);
            expect(response.data).toBeDefined();
            expect(response.data).toEqual([specificAssetId1, specificAssetId2]);
        }
    });

    /**
     * @operation GetAllAssetLinksById
     * @status 200
     */
    test('should fetch a list of specific asset identifiers based on an Asset Administration Shell ID', async () => {
        const { aasIdentifier, specificAssetId1, specificAssetId2 } = await seedAssetLinks();

        const response = await client.getAllAssetLinksById({
            configuration,
            aasIdentifier,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data).toEqual([specificAssetId1, specificAssetId2]);
        }
    });

    /**
     * @operation GetAllAssetLinksById
     * @status 404
     */
    test('should fetch a list of specific asset identifiers based on by non-existing Asset Administration Shell ID', async () => {
        const nonExistingId = 'non-existing-id';
        const response = await client.getAllAssetLinksById({
            configuration,
            aasIdentifier: nonExistingId,
        });
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error).toBeDefined();
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation GetAllAssetAdministrationShellIdsByAssetLink
     * @status 200
     */
    test('should return collection response for trailing slash on shells endpoint', async () => {
        const rawResponse = await fetch(`${configuration.basePath}/lookup/shells/`);
        const responseBody = (await rawResponse.json()) as { result?: unknown[]; paging_metadata?: object };
        const statusCode = rawResponse.status;

        expect(statusCode).toBe(200);
        expect(responseBody).toBeDefined();
        expect(Array.isArray(responseBody.result)).toBe(true);
        expect(responseBody.paging_metadata).toBeDefined();
    });

    /**
     * @operation GetAllAssetAdministrationShellIdsByAssetLink
     * @status 200
     */
    test('should fetch a list of Asset Administration Shell IDs', async () => {
        const { aasIdentifier, specificAssetId1, specificAssetId2 } = await seedAssetLinks();

        const response = await client.getAllAssetAdministrationShellIdsByAssetLink({
            configuration,
            assetIds: [specificAssetId1, specificAssetId2],
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(aasIdentifier);
        }
    });

    /**
     * @operation GetAllAssetAdministrationShellIdsByAssetLink
     * @status 400
     */
    test('should reject invalid AAS discovery lookup limit with bad request', async () => {
        const specificAssetId1 = createUniqueSpecificAssetId1();
        const specificAssetId2 = createUniqueSpecificAssetId2();

        const response = await client.getAllAssetAdministrationShellIdsByAssetLink({
            configuration,
            assetIds: [specificAssetId1, specificAssetId2],
            limit: -1,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation GetAllAssetAdministrationShellIdsByAssetLink
     * @status 200
     */
    test('should return an empty AAS discovery lookup page for an unavailable cursor', async () => {
        const specificAssetId1 = createUniqueSpecificAssetId1();
        const specificAssetId2 = createUniqueSpecificAssetId2();

        const response = await client.getAllAssetAdministrationShellIdsByAssetLink({
            configuration,
            assetIds: [specificAssetId1, specificAssetId2],
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
     * @operation SearchAllAssetAdministrationShellIdsByAssetLink
     * @status 200
     */
    test('should fetch a list of Asset Administration Shell IDs via search endpoint', async () => {
        const { aasIdentifier, specificAssetId1, specificAssetId2 } = await seedAssetLinks();

        const response = await client.searchAllAssetAdministrationShellIdsByAssetLink({
            configuration,
            assetLink: [specificAssetId1, specificAssetId2],
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.result).toContainEqual(aasIdentifier);
        }
    });

    /**
     * @operation SearchAllAssetAdministrationShellIdsByAssetLink
     * @status 400
     */
    test('should reject malformed search payload with bad request', async () => {
        const response = await client.searchAllAssetAdministrationShellIdsByAssetLink({
            configuration,
            assetLink: [{ name: 'globalAssetId' } as unknown as CoreSpecificAssetId],
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation SearchAllAssetAdministrationShellIdsByAssetLink
     * @status 200
     */
    test('should return an empty AAS discovery search page for an unavailable cursor', async () => {
        const specificAssetId1 = createUniqueSpecificAssetId1();
        const specificAssetId2 = createUniqueSpecificAssetId2();

        const response = await client.searchAllAssetAdministrationShellIdsByAssetLink({
            configuration,
            assetLink: [specificAssetId1, specificAssetId2],
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
     * @operation PostAllAssetLinksById
     * @status 400
     */
    test('should reject invalid specific asset IDs with bad request', async () => {
        const invalidSpecificAssetId = new CoreSpecificAssetId('', '');
        const aasIdentifier = createUniqueShellId();

        const response = await client.postAllAssetLinksById({
            configuration,
            aasIdentifier,
            specificAssetId: [invalidSpecificAssetId],
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation PostAllAssetLinksById
     * @status 405
     */
    test('should reject trailing slash (empty aasIdentifier) for post by id with method not allowed', async () => {
        const specificAssetId1 = createUniqueSpecificAssetId1();

        const response = await client.postAllAssetLinksById({
            configuration,
            aasIdentifier: '',
            specificAssetId: [specificAssetId1],
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(405);
            expect(response.error.messages?.[0]?.code).toBe('405');
        }
    });

    /**
     * @operation PostAllAssetLinksById
     * @status 404 [known-specification-bug]
     */
    test.skip('should return not found when creating links for a non-existing AAS (spec mismatch: endpoint behaves as create-or-update)', async () => {
        const specificAssetId1 = createUniqueSpecificAssetId1();

        const response = await client.postAllAssetLinksById({
            configuration,
            aasIdentifier: 'https://example.com/ids/aas/does-not-exist',
            specificAssetId: [specificAssetId1],
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation PostAllAssetLinksById
     * @status 409 [known-specification-bug]
     */
    test.skip('should surface conflict status for duplicate link creation when backend enforces it', async () => {
        const { aasIdentifier, specificAssetId1 } = await seedAssetLinks();

        const response = await client.postAllAssetLinksById({
            configuration,
            aasIdentifier,
            specificAssetId: [specificAssetId1],
        });

        if (response.success) {
            expect([201, 204]).toContain(response.statusCode);
            expect(response.data).toBeUndefined();
        } else {
            expect(response.statusCode).toBe(409);
            expect(response.error.messages?.[0]?.code).toBe('409');
        }
    });

    /**
     * @operation DeleteAllAssetLinksById
     * @status 204
     */
    test('should delete all specific asset identifiers for an Asset Administration Shell ID', async () => {
        const { aasIdentifier } = await seedAssetLinks();

        const response = await client.deleteAllAssetLinksById({
            configuration,
            aasIdentifier,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
            expect(response.data).toBeUndefined();
        }
    });

    /**
     * @operation DeleteAllAssetLinksById
     * @status 404
     */
    test('should return not found when deleting links for a non-existing AAS', async () => {
        const nonExistingAasIdentifier = `https://example.com/ids/aas/does-not-exist-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const response = await client.deleteAllAssetLinksById({
            configuration,
            aasIdentifier: nonExistingAasIdentifier,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation DeleteAllAssetLinksById
     * @status 405
     */
    test('should reject trailing slash (empty aasIdentifier) for delete by id', async () => {
        const response = await client.deleteAllAssetLinksById({
            configuration,
            aasIdentifier: '',
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(405);
            expect(response.error.messages?.[0]?.code).toBe('405');
        }
    });

    /**
     * @operation GetSelfDescription
     * @status 200
     */
    test('should fetch discovery service description', async () => {
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
});
