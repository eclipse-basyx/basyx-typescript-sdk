import { AasRepositoryClient } from '../clients/AasRepositoryClient';
import { Configuration } from '../generated';
import { createDescription, createGlobalAssetId, createTestShell } from './fixtures/aasFixtures';
import { assertApiFailureCode, assertApiResult } from './fixtures/assertionHelpers';
import { createAasRepositoryPayloadFixtures } from './fixtures/requestPayloadFixtures';
import {
    createAttachmentBlob,
    createTestFileSubmodelElement,
    createTestOperationRequest,
    createTestSubmodel,
    createTestSubmodelElement,
    createTestSubmodelElementCollection,
} from './fixtures/submodelFixtures';
import { getIntegrationBasePath } from './testEngineConfig';

describe('AAS Repository Integration Tests', () => {
    const client = new AasRepositoryClient();
    const testShell = createTestShell();
    const testSubmodel = createTestSubmodel();
    const testSubmodelElement = createTestSubmodelElement();
    const testFileSubmodelElement = createTestFileSubmodelElement();
    const attachmentPayload = 'coverage-attachment-payload';
    const attachmentBlob = createAttachmentBlob(attachmentPayload);
    const attachmentIdShortPath = testFileSubmodelElement.idShort ?? 'testFileElement';
    const configuration = new Configuration({
        basePath: getIntegrationBasePath('aasRepository'),
    });
    const { submodelReference, submodelMetadataPatch, submodelElementMetadataPatch, operationRequestValueOnly } =
        createAasRepositoryPayloadFixtures(testSubmodel.id);

    const uniqueSuffix = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    function createUniqueShell(): ReturnType<typeof createTestShell> {
        const shell = createTestShell();
        const uniqueId = `https://example.com/ids/aas/it-${uniqueSuffix()}`;
        shell.id = uniqueId;
        shell.assetInformation.globalAssetId = createGlobalAssetId();
        return shell;
    }

    async function cleanupShell(aasIdentifier: string): Promise<void> {
        const cleanupResponse = await client.deleteAssetAdministrationShellById({
            configuration,
            aasIdentifier,
        });

        if (!cleanupResponse.success && cleanupResponse.statusCode !== 404) {
            throw new Error(`Failed to cleanup shell ${aasIdentifier} (status ${cleanupResponse.statusCode})`);
        }
    }

    function randomMissingAasIdentifier(): string {
        return `https://example.com/ids/aas/missing-${uniqueSuffix()}`;
    }

    function randomMissingSubmodelIdentifier(): string {
        return `https://example.com/ids/sm/missing-${uniqueSuffix()}`;
    }

    function randomMissingIdShortPath(): string {
        return `missingParent${Date.now()}${Math.random().toString(36).slice(2)}`;
    }

    async function createScopedSuperpathFixture(submodelIdentifier?: string): Promise<{
        shell: ReturnType<typeof createTestShell>;
        submodel: ReturnType<typeof createTestSubmodel>;
    }> {
        const shell = createUniqueShell();
        const shellResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: shell,
        });
        assertApiResult(shellResponse);

        const submodel = createTestSubmodel();
        submodel.id = submodelIdentifier ?? `${submodel.id}-aas-${uniqueSuffix()}`;
        submodel.idShort = `${submodel.idShort ?? 'submodel'}Aas${uniqueSuffix()}`;
        submodel.submodelElements = [
            createTestSubmodelElement(),
            createTestFileSubmodelElement(),
            createTestSubmodelElementCollection(),
        ];

        const submodelResponse = await client.putSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            submodel,
        });

        assertApiResult(submodelResponse);
        if (submodelResponse.success) {
            expect([201, 204]).toContain(submodelResponse.statusCode);
        }

        return { shell, submodel };
    }

    /**
     * @operation PostAssetAdministrationShell
     * @status 201
     */
    test('should create a new Asset Administration Shell', async () => {
        const createdShell = createUniqueShell();

        const response = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: createdShell,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(201);
                expect(response.data).toBeDefined();
                expect(response.data).toEqual(createdShell);
            }
        } finally {
            await cleanupShell(createdShell.id);
        }
    });

    /**
     * @operation PostAssetAdministrationShell
     * @status 400
     */
    test('should reject invalid Asset Administration Shell payload with bad request', async () => {
        const rawResponse = await fetch(`${configuration.basePath}/shells`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });

        expect(rawResponse.status).toBe(400);
    });

    /**
     * @operation PostAssetAdministrationShell
     * @status 409
     */
    test('should return conflict when creating a duplicate Asset Administration Shell', async () => {
        const duplicateShell = createTestShell();
        duplicateShell.id = `${duplicateShell.id}-duplicate-${uniqueSuffix()}`;

        const createResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: duplicateShell,
        });

        try {
            assertApiResult(createResponse);
            if (createResponse.success) {
                expect(createResponse.statusCode).toBe(201);
            }

            const duplicateResponse = await client.postAssetAdministrationShell({
                configuration,
                assetAdministrationShell: duplicateShell,
            });

            assertApiFailureCode(duplicateResponse, '409');
            if (!duplicateResponse.success) {
                expect(duplicateResponse.statusCode).toBe(409);
            }
        } finally {
            await cleanupShell(duplicateShell.id);
        }
    });

    /**
     * @operation GetAssetAdministrationShellById
     * @status 200
     */
    test('should fetch an Asset Administration Shell by ID', async () => {
        const scopedShell = createUniqueShell();
        const createResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: scopedShell,
        });

        assertApiResult(createResponse);

        const response = await client.getAssetAdministrationShellById({
            configuration,
            aasIdentifier: scopedShell.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
                expect(response.data).toBeDefined();
                expect(response.data).toEqual(scopedShell);
            }
        } finally {
            await cleanupShell(scopedShell.id);
        }
    });

    /**
     * @operation GetAssetAdministrationShellById
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier with bad request', async () => {
        const response = await client.getAssetAdministrationShellById({
            configuration,
            aasIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetAssetAdministrationShellById
     * @status 404
     */
    test('should return not found when fetching an Asset Administration Shell by non-existing ID', async () => {
        const nonExistingId = randomMissingAasIdentifier();
        const response = await client.getAssetAdministrationShellById({
            configuration,
            aasIdentifier: nonExistingId,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GetAllAssetAdministrationShells
     * @status 200
     */
    test('should fetch all Asset Administration Shells', async () => {
        const scopedShell = createUniqueShell();
        const createResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: scopedShell,
        });

        assertApiResult(createResponse);

        const response = await client.getAllAssetAdministrationShells({
            configuration,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
                expect(response.data).toBeDefined();
                expect(response.data.result.length).toBeGreaterThan(0);
                expect(response.data.result).toContainEqual(scopedShell);
            }
        } finally {
            await cleanupShell(scopedShell.id);
        }
    });

    /**
     * @operation GetAllAssetAdministrationShells
     * @status 400
     */
    test('should reject invalid Asset Administration Shell list query with bad request', async () => {
        const response = await client.getAllAssetAdministrationShells({
            configuration,
            limit: -1,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetAllAssetAdministrationShells-Reference
     * @status 200
     */
    test('should fetch references to all Asset Administration Shells', async () => {
        const scopedShell = createUniqueShell();
        const createResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: scopedShell,
        });

        assertApiResult(createResponse);

        const response = await client.getAllAssetAdministrationShellsReference({
            configuration,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
                expect(response.data).toBeDefined();
                expect(response.data.result.length).toBeGreaterThan(0);
            }
        } finally {
            await cleanupShell(scopedShell.id);
        }
    });

    /**
     * @operation GetAllAssetAdministrationShells-Reference
     * @status 400
     */
    test('should reject invalid Asset Administration Shell reference list query with bad request', async () => {
        const response = await client.getAllAssetAdministrationShellsReference({
            configuration,
            limit: -1,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetAssetAdministrationShellById-Reference_AasRepository
     * @status 200
     */
    test('should fetch Asset Administration Shell by ID in reference representation', async () => {
        const scopedShell = createUniqueShell();
        const createResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: scopedShell,
        });

        assertApiResult(createResponse);

        const response = await client.getAssetAdministrationShellByIdReferenceAasRepository({
            configuration,
            aasIdentifier: scopedShell.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
                expect(response.data).toBeDefined();
            }
        } finally {
            await cleanupShell(scopedShell.id);
        }
    });

    /**
     * @operation GetAssetAdministrationShellById-Reference_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in reference retrieval', async () => {
        const response = await client.getAssetAdministrationShellByIdReferenceAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetAssetAdministrationShellById-Reference_AasRepository
     * @status 404
     */
    test('should return not found in reference retrieval for missing Asset Administration Shell', async () => {
        const response = await client.getAssetAdministrationShellByIdReferenceAasRepository({
            configuration,
            aasIdentifier: randomMissingAasIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PutAssetAdministrationShellById
     * @status 201
     */
    test('should create an Asset Administration Shell through put by ID with created status', async () => {
        const putShell = createTestShell();
        putShell.id = `${putShell.id}-put-create-${uniqueSuffix()}`;

        const response = await client.putAssetAdministrationShellById({
            configuration,
            aasIdentifier: putShell.id,
            assetAdministrationShell: putShell,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(201);
            }
        } finally {
            await cleanupShell(putShell.id);
        }
    });

    /**
     * @operation PutAssetAdministrationShellById
     * @status 204
     */
    test('should update an Asset Administration Shell', async () => {
        const updatedShell = createTestShell();
        updatedShell.id = `${updatedShell.id}-put-update-${uniqueSuffix()}`;

        const createResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: updatedShell,
        });
        assertApiResult(createResponse);
        if (createResponse.success) {
            expect(createResponse.statusCode).toBe(201);
        }

        const description = createDescription();

        updatedShell.description = [description];

        const updateResponse = await client.putAssetAdministrationShellById({
            configuration,
            aasIdentifier: updatedShell.id,
            assetAdministrationShell: updatedShell,
        });

        try {
            assertApiResult(updateResponse);
            if (updateResponse.success) {
                expect(updateResponse.statusCode).toBe(204);
            }

            const fetchResponse = await client.getAssetAdministrationShellById({
                configuration,
                aasIdentifier: updatedShell.id,
            });

            assertApiResult(fetchResponse);
            if (fetchResponse.success) {
                expect(fetchResponse.data).toBeDefined();
                expect(fetchResponse.data).toEqual(updatedShell);
            }
        } finally {
            await cleanupShell(updatedShell.id);
        }
    });

    /**
     * @operation PutAssetAdministrationShellById
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in put by ID', async () => {
        const response = await client.putAssetAdministrationShellById({
            configuration,
            aasIdentifier: undefined as unknown as string,
            assetAdministrationShell: testShell,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetAssetInformation_AasRepository
     * @status 200
     */
    test('should get the Asset Information of an Asset Administration Shell', async () => {
        const scopedShell = createUniqueShell();
        const createResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: scopedShell,
        });

        assertApiResult(createResponse);

        const response = await client.getAssetInformation({
            configuration,
            aasIdentifier: scopedShell.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
                expect(response.data).toBeDefined();
                expect(response.data).toEqual(scopedShell.assetInformation);
            }
        } finally {
            await cleanupShell(scopedShell.id);
        }
    });

    /**
     * @operation GetAssetInformation_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get Asset Information', async () => {
        const response = await client.getAssetInformation({
            configuration,
            aasIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetAssetInformation_AasRepository
     * @status 404
     */
    test('should return not found when getting Asset Information for a missing Asset Administration Shell', async () => {
        const response = await client.getAssetInformation({
            configuration,
            aasIdentifier: randomMissingAasIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PutAssetInformation_AasRepository
     * @status 204
     */
    test('should update the Asset Information of an Asset Administration Shell', async () => {
        const scopedShell = createUniqueShell();
        const createResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: scopedShell,
        });

        assertApiResult(createResponse);

        const updatedAssetInfo = scopedShell.assetInformation;
        updatedAssetInfo.globalAssetId = createGlobalAssetId();

        const updateResponse = await client.putAssetInformation({
            configuration,
            aasIdentifier: scopedShell.id,
            assetInformation: updatedAssetInfo,
        });

        try {
            assertApiResult(updateResponse);
            if (updateResponse.success) {
                expect(updateResponse.statusCode).toBe(204);
            }

            const fetchResponse = await client.getAssetInformation({
                configuration,
                aasIdentifier: scopedShell.id,
            });

            assertApiResult(fetchResponse);
            if (fetchResponse.success) {
                expect(fetchResponse.data).toBeDefined();
                expect(fetchResponse.data).toEqual(updatedAssetInfo);
            }
        } finally {
            await cleanupShell(scopedShell.id);
        }
    });

    /**
     * @operation PutAssetInformation_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in put Asset Information', async () => {
        const response = await client.putAssetInformation({
            configuration,
            aasIdentifier: undefined as unknown as string,
            assetInformation: testShell.assetInformation,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PutAssetInformation_AasRepository
     * @status 404
     */
    test('should return not found when putting Asset Information for a missing Asset Administration Shell', async () => {
        const response = await client.putAssetInformation({
            configuration,
            aasIdentifier: randomMissingAasIdentifier(),
            assetInformation: testShell.assetInformation,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PutThumbnail_AasRepository
     * @status 204
     */
    test('should add a thumbnail to an Asset Administration Shell', async () => {
        const scopedShell = createUniqueShell();
        const createShellResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: scopedShell,
        });
        assertApiResult(createShellResponse);

        const fileName = 'test_thumbnail.png';
        const payload = 'base64_encoded_image_data';
        const file = new Blob([payload], { type: 'image/png' });

        const updateResponse = await client.putThumbnail({
            configuration,
            aasIdentifier: scopedShell.id,
            fileName,
            file,
        });

        try {
            assertApiResult(updateResponse);
            if (updateResponse.success) {
                expect(updateResponse.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(scopedShell.id);
        }
    });

    /**
     * @operation GetThumbnail_AasRepository
     * @status 200
     */
    test('should get thumbnail of an Asset Administration Shell', async () => {
        const scopedShell = createUniqueShell();
        const createShellResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: scopedShell,
        });
        assertApiResult(createShellResponse);

        const fileName = 'test_thumbnail.png';
        const payload = 'base64_encoded_image_data';
        const file = new Blob([payload], { type: 'image/png' });
        const putResponse = await client.putThumbnail({
            configuration,
            aasIdentifier: scopedShell.id,
            fileName,
            file,
        });
        assertApiResult(putResponse);

        const fetchResponse = await client.getThumbnail({
            configuration,
            aasIdentifier: scopedShell.id,
        });

        try {
            assertApiResult(fetchResponse);
            if (fetchResponse.success) {
                expect(fetchResponse.statusCode).toBe(200);
                expect(fetchResponse.data).toBeDefined();
                expect(fetchResponse.data.size).toBeGreaterThan(0);
            }
        } finally {
            await cleanupShell(scopedShell.id);
        }
    });

    /**
     * @operation GetThumbnail_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get thumbnail', async () => {
        const response = await client.getThumbnail({
            configuration,
            aasIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetThumbnail_AasRepository
     * @status 404
     */
    test('should return not found when getting thumbnail for a missing Asset Administration Shell', async () => {
        const response = await client.getThumbnail({
            configuration,
            aasIdentifier: randomMissingAasIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PutThumbnail_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in put thumbnail', async () => {
        const file = new Blob(['thumbnail-payload'], { type: 'image/png' });
        const response = await client.putThumbnail({
            configuration,
            aasIdentifier: undefined as unknown as string,
            fileName: 'thumbnail.png',
            file,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PutThumbnail_AasRepository
     * @status 404
     */
    test('should return not found when putting thumbnail for a missing Asset Administration Shell', async () => {
        const file = new Blob(['thumbnail-payload'], { type: 'image/png' });
        const response = await client.putThumbnail({
            configuration,
            aasIdentifier: randomMissingAasIdentifier(),
            fileName: 'thumbnail.png',
            file,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GenerateSerializationByIds
     * @status 200 [known-backend-bug]
     */
    test.skip('should generate serialization by IDs', async () => {
        const response = await client.generateSerializationByIds({
            configuration,
            includeConceptDescriptions: true,
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.size).toBeGreaterThan(0);
        }
    });

    /**
     * @operation GenerateSerializationByIds
     * @status 400 [known-backend-bug]
     */
    test.skip('should reject invalid serialization query with bad request', async () => {
        const rawResponse = await fetch(`${configuration.basePath}/serialization?includeConceptDescriptions=notabool`);

        expect(rawResponse.status).toBe(400);
    });

    /**
     * @operation GetSelfDescription
     * @status 200
     */
    test('should fetch AAS repository service description', async () => {
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
     * @operation GetAllSubmodelReferences_AasRepository
     * @status 200
     */
    test('should get all Submodel references through AAS repository superpath', async () => {
        const scopedShell = createUniqueShell();
        const createShellResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: scopedShell,
        });
        assertApiResult(createShellResponse);

        const response = await client.getAllSubmodelReferences({
            configuration,
            aasIdentifier: scopedShell.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
                expect(response.data).toBeDefined();
            }
        } finally {
            await cleanupShell(scopedShell.id);
        }
    });

    /**
     * @operation GetAllSubmodelReferences_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get all Submodel references', async () => {
        const response = await client.getAllSubmodelReferences({
            configuration,
            aasIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetAllSubmodelReferences_AasRepository
     * @status 404
     */
    test('should return not found when getting Submodel references for a missing Asset Administration Shell', async () => {
        const response = await client.getAllSubmodelReferences({
            configuration,
            aasIdentifier: randomMissingAasIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PostSubmodelReference_AasRepository
     * @status 201
     */
    test('should post Submodel reference through AAS repository superpath', async () => {
        const scopedShell = createUniqueShell();
        const createShellResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: scopedShell,
        });
        assertApiResult(createShellResponse);

        const response = await client.postSubmodelReference({
            configuration,
            aasIdentifier: scopedShell.id,
            submodelReference,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(201);
                expect(response.data).toBeDefined();
            }
        } finally {
            await cleanupShell(scopedShell.id);
        }
    });

    /**
     * @operation PostSubmodelReference_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in post Submodel reference', async () => {
        const response = await client.postSubmodelReference({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelReference,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PostSubmodelReference_AasRepository
     * @status 404
     */
    test('should return not found when posting Submodel reference for a missing Asset Administration Shell', async () => {
        const response = await client.postSubmodelReference({
            configuration,
            aasIdentifier: randomMissingAasIdentifier(),
            submodelReference,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PostSubmodelReference_AasRepository
     * @status 409
     */
    test('should return conflict when posting a duplicate Submodel reference', async () => {
        const scopedShell = createTestShell();
        scopedShell.id = `${scopedShell.id}-post-submodel-ref-dup-${uniqueSuffix()}`;

        const createShellResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: scopedShell,
        });
        assertApiResult(createShellResponse);
        if (createShellResponse.success) {
            expect(createShellResponse.statusCode).toBe(201);
        }

        const duplicateRef = submodelReference;

        const createResponse = await client.postSubmodelReference({
            configuration,
            aasIdentifier: scopedShell.id,
            submodelReference: duplicateRef,
        });

        try {
            assertApiResult(createResponse);
            if (createResponse.success) {
                expect(createResponse.statusCode).toBe(201);
            }

            const duplicateResponse = await client.postSubmodelReference({
                configuration,
                aasIdentifier: scopedShell.id,
                submodelReference: duplicateRef,
            });

            assertApiFailureCode(duplicateResponse, '409');
            if (!duplicateResponse.success) {
                expect(duplicateResponse.statusCode).toBe(409);
            }
        } finally {
            await cleanupShell(scopedShell.id);
        }
    });

    /**
     * @operation DeleteSubmodelReference_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in delete Submodel reference', async () => {
        const response = await client.deleteSubmodelReferenceById({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation DeleteSubmodelReference_AasRepository
     * @status 404
     */
    test('should return not found when deleting a missing Submodel reference', async () => {
        const scopedShell = createUniqueShell();
        const createShellResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: scopedShell,
        });
        assertApiResult(createShellResponse);

        const response = await client.deleteSubmodelReferenceById({
            configuration,
            aasIdentifier: scopedShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(scopedShell.id);
        }
    });

    /**
     * @operation PutSubmodelById_AasRepository
     * @status 201
     */
    test('should create Submodel by ID through AAS repository superpath', async () => {
        const scopedShell = createTestShell();
        scopedShell.id = `${scopedShell.id}-put-submodel-create-${uniqueSuffix()}`;

        const createShellResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: scopedShell,
        });
        assertApiResult(createShellResponse);

        const createdSubmodel = createTestSubmodel();
        createdSubmodel.id = `http://acplt.org/Submodels/Assets/TestAsset/Identification-${uniqueSuffix()}`;
        createdSubmodel.submodelElements = [createTestSubmodelElement()];

        const response = await client.putSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: scopedShell.id,
            submodelIdentifier: createdSubmodel.id,
            submodel: createdSubmodel,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(201);
            }
        } finally {
            await cleanupShell(scopedShell.id);
        }
    });

    /**
     * @operation PutSubmodelById_AasRepository
     * @status 204
     */
    test('should update Submodel by ID through AAS repository superpath', async () => {
        const scopedShell = createTestShell();
        scopedShell.id = `${scopedShell.id}-put-submodel-update-${uniqueSuffix()}`;

        const createShellResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: scopedShell,
        });
        assertApiResult(createShellResponse);

        const seededSubmodel = createTestSubmodel();
        seededSubmodel.id = `http://acplt.org/Submodels/Assets/TestAsset/Identification-${uniqueSuffix()}`;
        seededSubmodel.submodelElements = [createTestSubmodelElement()];

        const seedResponse = await client.putSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: scopedShell.id,
            submodelIdentifier: seededSubmodel.id,
            submodel: seededSubmodel,
        });
        assertApiResult(seedResponse);
        if (seedResponse.success) {
            expect(seedResponse.statusCode).toBe(201);
        }

        seededSubmodel.submodelElements = [testSubmodelElement, testFileSubmodelElement];
        const response = await client.putSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: scopedShell.id,
            submodelIdentifier: seededSubmodel.id,
            submodel: seededSubmodel,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(scopedShell.id);
        }
    });

    /**
     * @operation PutSubmodelById_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in put Submodel by ID', async () => {
        const payloadSubmodel = createTestSubmodel();
        payloadSubmodel.id = `http://acplt.org/Submodels/Assets/TestAsset/MissingAas-${uniqueSuffix()}`;

        const response = await client.putSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: payloadSubmodel.id,
            submodel: payloadSubmodel,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PutSubmodelById_AasRepository
     * @status 404
     */
    test('should return not found when putting Submodel by ID for a missing Asset Administration Shell', async () => {
        const payloadSubmodel = createTestSubmodel();
        payloadSubmodel.id = `http://acplt.org/Submodels/Assets/TestAsset/MissingAas-${uniqueSuffix()}`;

        const response = await client.putSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: randomMissingAasIdentifier(),
            submodelIdentifier: payloadSubmodel.id,
            submodel: payloadSubmodel,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GetSubmodelById_AasRepository
     * @status 200
     */
    test('should get Submodel by ID through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
                expect(response.data).toBeDefined();
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelById_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get Submodel by ID', async () => {
        const response = await client.getSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetSubmodelById_AasRepository
     * @status 404
     */
    test('should return not found when getting Submodel by missing ID', async () => {
        const { shell } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodel_AasRepository
     * @status 204
     */
    test('should patch Submodel through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.patchSubmodelAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            submodel,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodel_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in patch Submodel', async () => {
        const payloadSubmodel = createTestSubmodel();
        payloadSubmodel.id = `${payloadSubmodel.id}-missing-shell-${uniqueSuffix()}`;

        const response = await client.patchSubmodelAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: payloadSubmodel.id,
            submodel: payloadSubmodel,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PatchSubmodel_AasRepository
     * @status 404
     */
    test('should return not found when patching a missing Submodel', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.patchSubmodelAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            submodel,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelById-Metadata_AasRepository
     * @status 200
     */
    test('should get Submodel metadata by ID through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelByIdMetadataAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
                expect(response.data).toBeDefined();
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelById-Metadata_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get Submodel metadata', async () => {
        const response = await client.getSubmodelByIdMetadataAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetSubmodelById-Metadata_AasRepository
     * @status 404
     */
    test('should return not found when getting metadata for a missing Submodel', async () => {
        const { shell } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelByIdMetadataAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodelById-Metadata_AasRepository
     * @status 204
     */
    test('should patch Submodel metadata by ID through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const scopedMetadataPatch = {
            ...submodelMetadataPatch,
            id: submodel.id,
        };

        const response = await client.patchSubmodelByIdMetadataAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            submodelMetadata: scopedMetadataPatch,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodelById-Metadata_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in patch Submodel metadata', async () => {
        const response = await client.patchSubmodelByIdMetadataAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            submodelMetadata: submodelMetadataPatch,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PatchSubmodelById-Metadata_AasRepository
     * @status 404
     */
    test('should return not found when patching metadata for a missing Submodel', async () => {
        const { shell } = await createScopedSuperpathFixture();

        const response = await client.patchSubmodelByIdMetadataAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            submodelMetadata: submodelMetadataPatch,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelById-ValueOnly_AasRepository
     * @status 200
     */
    test('should get Submodel value-only by ID through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelByIdValueOnlyAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
                expect(response.data).toBeDefined();
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelById-ValueOnly_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get Submodel value-only', async () => {
        const response = await client.getSubmodelByIdValueOnlyAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetSubmodelById-ValueOnly_AasRepository
     * @status 404
     */
    test('should return not found when getting value-only for a missing Submodel', async () => {
        const { shell } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelByIdValueOnlyAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodelById-ValueOnly_AasRepository
     * @status 204
     */
    test('should patch Submodel value-only by ID through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.patchSubmodelByIdValueOnlyAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            body: {},
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodelById-ValueOnly_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in patch Submodel value-only', async () => {
        const response = await client.patchSubmodelByIdValueOnlyAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            body: {},
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PatchSubmodelById-ValueOnly_AasRepository
     * @status 404
     */
    test('should return not found when patching value-only for a missing Submodel', async () => {
        const { shell } = await createScopedSuperpathFixture();

        const response = await client.patchSubmodelByIdValueOnlyAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            body: {},
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelById-Reference_AasRepository
     * @status 200
     */
    test('should get Submodel reference by ID through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelByIdReferenceAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
                expect(response.data).toBeDefined();
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelById-Reference_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get Submodel reference', async () => {
        const response = await client.getSubmodelByIdReferenceAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetSubmodelById-Reference_AasRepository
     * @status 404
     */
    test('should return not found when getting reference for a missing Submodel', async () => {
        const { shell } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelByIdReferenceAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelById-Path_AasRepository
     * @status 200
     */
    test('should get Submodel path by ID through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelByIdPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
                expect(response.data).toBeDefined();
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelById-Path_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get Submodel path', async () => {
        const response = await client.getSubmodelByIdPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetSubmodelById-Path_AasRepository
     * @status 404
     */
    test('should return not found when getting path for a missing Submodel', async () => {
        const { shell } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelByIdPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements_AasRepository
     * @status 200
     */
    test('should get all SubmodelElements through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements_AasRepository
     * @status 200
     */
    test('should return all SubmodelElements with success status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements_AasRepository
     * @status 404
     */
    test('should return not found when getting SubmodelElements for a missing Submodel', async () => {
        const { shell } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get all SubmodelElements', async () => {
        const response = await client.getAllSubmodelElementsAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PostSubmodelElement_AasRepository
     * @status 201
     */
    test('should post SubmodelElement through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const element = createTestSubmodelElement();
        element.idShort = `postElement-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            submodelElement: element,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(201);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PostSubmodelElement_AasRepository
     * @status 201
     */
    test('should create SubmodelElement through AAS repository superpath with created status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const createdElement = createTestSubmodelElement();
        createdElement.idShort = `createdElement-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            submodelElement: createdElement,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(201);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PostSubmodelElement_AasRepository
     * @status 404
     */
    test('should return not found when posting SubmodelElement for a missing Submodel', async () => {
        const { shell } = await createScopedSuperpathFixture();
        const createdElement = createTestSubmodelElement();
        createdElement.idShort = `missingSubmodelElement-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            submodelElement: createdElement,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PostSubmodelElement_AasRepository
     * @status 409
     */
    test('should return conflict when posting duplicate SubmodelElement', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const duplicateElement = createTestSubmodelElement();
        duplicateElement.idShort = `duplicateElement-${uniqueSuffix()}`;

        const createResponse = await client.postSubmodelElementAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            submodelElement: duplicateElement,
        });

        try {
            assertApiResult(createResponse);

            const duplicateResponse = await client.postSubmodelElementAasRepository({
                configuration,
                aasIdentifier: shell.id,
                submodelIdentifier: submodel.id,
                submodelElement: duplicateElement,
            });

            assertApiFailureCode(duplicateResponse, '409');
            if (!duplicateResponse.success) {
                expect(duplicateResponse.statusCode).toBe(409);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PostSubmodelElement_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in post SubmodelElement', async () => {
        const element = createTestSubmodelElement();
        element.idShort = `missingAasElement-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            submodelElement: element,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Metadata_AasRepository
     * @status 200
     */
    test('should get all SubmodelElements metadata through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsMetadataAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Metadata_AasRepository
     * @status 200
     */
    test('should return SubmodelElements metadata with success status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsMetadataAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Metadata_AasRepository
     * @status 404
     */
    test('should return not found when getting SubmodelElements metadata for a missing Submodel', async () => {
        const { shell } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsMetadataAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Metadata_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get all SubmodelElements metadata', async () => {
        const response = await client.getAllSubmodelElementsMetadataAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get all SubmodelElements value-only through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsValueOnlyAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements-ValueOnly_AasRepository
     * @status 200
     */
    test('should return SubmodelElements value-only with success status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsValueOnlyAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements-ValueOnly_AasRepository
     * @status 404
     */
    test('should return not found when getting SubmodelElements value-only for a missing Submodel', async () => {
        const { shell } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsValueOnlyAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements-ValueOnly_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get all SubmodelElements value-only', async () => {
        const response = await client.getAllSubmodelElementsValueOnlyAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get all SubmodelElements reference through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsReferenceAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Reference_AasRepository
     * @status 200
     */
    test('should return SubmodelElements references with success status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsReferenceAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Reference_AasRepository
     * @status 404
     */
    test('should return not found when getting SubmodelElements references for a missing Submodel', async () => {
        const { shell } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsReferenceAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Reference_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get all SubmodelElements reference', async () => {
        const response = await client.getAllSubmodelElementsReferenceAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get all SubmodelElements path through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Path_AasRepository
     * @status 200
     */
    test('should return SubmodelElements paths with success status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Path_AasRepository
     * @status 404
     */
    test('should return not found when getting SubmodelElements paths for a missing Submodel', async () => {
        const { shell } = await createScopedSuperpathFixture();

        const response = await client.getAllSubmodelElementsPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Path_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get all SubmodelElements path', async () => {
        const response = await client.getAllSubmodelElementsPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get SubmodelElement by path through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath_AasRepository
     * @status 200
     */
    test('should return SubmodelElement by path with success status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath_AasRepository
     * @status 404
     */
    test('should return not found when getting SubmodelElement by missing path', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get SubmodelElement by path', async () => {
        const response = await client.getSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            idShortPath: 'testProperty',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should post SubmodelElement by path through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const element = createTestSubmodelElement();
        element.idShort = `postByPath-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'parentCollection',
            submodelElement: element,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(201);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PostSubmodelElementByPath_AasRepository
     * @status 201
     */
    test('should create SubmodelElement by path with created status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const createdElement = createTestSubmodelElement();
        createdElement.idShort = `post-by-path-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'parentCollection',
            submodelElement: createdElement,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(201);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PostSubmodelElementByPath_AasRepository
     * @status 404
     */
    test('should return not found when posting SubmodelElement by path for missing parent path', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const createdElement = createTestSubmodelElement();
        createdElement.idShort = `post-by-missing-path-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `missingParent-${uniqueSuffix()}`,
            submodelElement: createdElement,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PostSubmodelElementByPath_AasRepository
     * @status 409
     */
    test('should return conflict when posting duplicate SubmodelElement by path', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const duplicateElement = createTestSubmodelElement();
        duplicateElement.idShort = `post-by-path-duplicate-${uniqueSuffix()}`;

        const createResponse = await client.postSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'parentCollection',
            submodelElement: duplicateElement,
        });
        try {
            assertApiResult(createResponse);

            const duplicateResponse = await client.postSubmodelElementByPathAasRepository({
                configuration,
                aasIdentifier: shell.id,
                submodelIdentifier: submodel.id,
                idShortPath: 'parentCollection',
                submodelElement: duplicateElement,
            });

            assertApiFailureCode(duplicateResponse, '409');
            if (!duplicateResponse.success) {
                expect(duplicateResponse.statusCode).toBe(409);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PostSubmodelElementByPath_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in post SubmodelElement by path', async () => {
        const element = createTestSubmodelElement();
        element.idShort = `missingAasPostByPath-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            idShortPath: 'testProperty',
            submodelElement: element,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PutSubmodelElementByPath_AasRepository
     * @status 204
     */
    test('should put SubmodelElement by path through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const element = createTestSubmodelElement();
        element.idShort = `putByPath-${uniqueSuffix()}`;

        const response = await client.putSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
            submodelElement: element,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PutSubmodelElementByPath_AasRepository
     * @status 201
     */
    test('should create SubmodelElement by path with created status via put', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const putElement = createTestSubmodelElement();
        putElement.idShort = `PutByPath${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

        const response = await client.putSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `parentCollection.${putElement.idShort ?? `PutByPath${Date.now()}${Math.random().toString(36).slice(2, 8)}`}`,
            submodelElement: putElement,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(201);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PutSubmodelElementByPath_AasRepository
     * @status 204
     */
    test('should update SubmodelElement by path with no content status via put', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const updateElement = createTestSubmodelElement();
        updateElement.idShort = `UpdateByPath${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

        const createResponse = await client.putSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `parentCollection.${updateElement.idShort}`,
            submodelElement: updateElement,
        });

        try {
            assertApiResult(createResponse);
            if (createResponse.success) {
                expect(createResponse.statusCode).toBe(201);
            }

            const response = await client.putSubmodelElementByPathAasRepository({
                configuration,
                aasIdentifier: shell.id,
                submodelIdentifier: submodel.id,
                idShortPath: `parentCollection.${updateElement.idShort}`,
                submodelElement: updateElement,
            });

            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PutSubmodelElementByPath_AasRepository
     * @status 404
     */
    test('should return not found when putting SubmodelElement by path for missing parent path', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const putElement = createTestSubmodelElement();
        putElement.idShort = `PutMissingPath${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

        const response = await client.putSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `missingParent.${putElement.idShort ?? randomMissingIdShortPath()}`,
            submodelElement: putElement,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PutSubmodelElementByPath_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in put SubmodelElement by path', async () => {
        const element = createTestSubmodelElement();
        element.idShort = `missingAasPutByPath-${uniqueSuffix()}`;

        const response = await client.putSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            idShortPath: 'testProperty',
            submodelElement: element,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PatchSubmodelElementValueByPath_AasRepository
     * @status 204
     */
    test('should patch SubmodelElement value by path through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const element = createTestSubmodelElement();
        element.idShort = 'testProperty';

        const response = await client.patchSubmodelElementValueByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
            submodelElement: element,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodelElementValueByPath_AasRepository
     * @status 204
     */
    test('should patch SubmodelElement by path with no content status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const element = createTestSubmodelElement();
        element.idShort = 'testProperty';

        const response = await client.patchSubmodelElementValueByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
            submodelElement: element,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodelElementValueByPath_AasRepository
     * @status 404
     */
    test('should return not found when patching SubmodelElement by missing path', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const element = createTestSubmodelElement();
        element.idShort = `patchMissingPath-${uniqueSuffix()}`;

        const response = await client.patchSubmodelElementValueByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
            submodelElement: element,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodelElementValueByPath_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in patch SubmodelElement value by path', async () => {
        const element = createTestSubmodelElement();
        element.idShort = `missingAasPatchByPath-${uniqueSuffix()}`;

        const response = await client.patchSubmodelElementValueByPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            idShortPath: 'testProperty',
            submodelElement: element,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Metadata_AasRepository
     * @status 200
     */
    test('should get SubmodelElement metadata by path through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathMetadataAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Metadata_AasRepository
     * @status 200
     */
    test('should return SubmodelElement metadata by path with success status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathMetadataAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Metadata_AasRepository
     * @status 404
     */
    test('should return not found when getting SubmodelElement metadata by missing path', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathMetadataAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Metadata_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get SubmodelElement metadata by path', async () => {
        const response = await client.getSubmodelElementByPathMetadataAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            idShortPath: 'testProperty',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should patch SubmodelElement metadata by path through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.patchSubmodelElementValueByPathMetadata({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodelElementValueByPath-Metadata
     * @status 204
     */
    test('should patch SubmodelElement metadata by path with no content status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.patchSubmodelElementValueByPathMetadata({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodelElementValueByPath-Metadata
     * @status 404
     */
    test('should return not found when patching SubmodelElement metadata by missing path', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.patchSubmodelElementValueByPathMetadata({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodelElementValueByPath-Metadata
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in patch SubmodelElement metadata by path', async () => {
        const response = await client.patchSubmodelElementValueByPathMetadata({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            idShortPath: 'testProperty',
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get SubmodelElement value-only by path through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathValueOnlyAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-ValueOnly_AasRepository
     * @status 200
     */
    test('should return SubmodelElement value-only by path with success status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathValueOnlyAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-ValueOnly_AasRepository
     * @status 404
     */
    test('should return not found when getting SubmodelElement value-only by missing path', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathValueOnlyAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-ValueOnly_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get SubmodelElement value-only by path', async () => {
        const response = await client.getSubmodelElementByPathValueOnlyAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            idShortPath: 'testProperty',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should patch SubmodelElement value-only by path through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.patchSubmodelElementValueByPathValueOnly({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
            submodelElementValue: 'coverage-value',
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodelElementValueByPath-ValueOnly
     * @status 204
     */
    test('should patch SubmodelElement value-only by path with no content status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.patchSubmodelElementValueByPathValueOnly({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
            submodelElementValue: 'coverage-value',
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodelElementValueByPath-ValueOnly
     * @status 404
     */
    test('should return not found when patching SubmodelElement value-only by missing path', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.patchSubmodelElementValueByPathValueOnly({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
            submodelElementValue: 'coverage-value',
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PatchSubmodelElementValueByPath-ValueOnly
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in patch SubmodelElement value-only by path', async () => {
        const response = await client.patchSubmodelElementValueByPathValueOnly({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            idShortPath: 'testProperty',
            submodelElementValue: 'coverage-value',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get SubmodelElement reference by path through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathReferenceAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Reference_AasRepository
     * @status 200
     */
    test('should return SubmodelElement reference by path with success status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathReferenceAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Reference_AasRepository
     * @status 404
     */
    test('should return not found when getting SubmodelElement reference by missing path', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathReferenceAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Reference_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get SubmodelElement reference by path', async () => {
        const response = await client.getSubmodelElementByPathReferenceAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            idShortPath: 'testProperty',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get SubmodelElement path by path through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Path_AasRepository
     * @status 200
     */
    test('should return SubmodelElement path by path with success status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Path_AasRepository
     * @status 404
     */
    test('should return not found when getting SubmodelElement path by missing path', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getSubmodelElementByPathPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Path_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get SubmodelElement path by path', async () => {
        const response = await client.getSubmodelElementByPathPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            idShortPath: 'testProperty',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should upload file by path through AAS repository superpath for a File submodel element', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.putFileByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: attachmentIdShortPath,
            fileName: 'coverage-file.txt',
            file: attachmentBlob,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect([200, 204]).toContain(response.statusCode);
            } else {
                console.error('API Error:', JSON.stringify(response.error, null, 2));
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetFileByPath_AasRepository
     * @status 200
     */
    test('should download uploaded file by path through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const deterministicPayload = `coverage-attachment-${uniqueSuffix()}`;
        const deterministicBlob = createAttachmentBlob(deterministicPayload);

        const uploadResponse = await client.putFileByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: attachmentIdShortPath,
            fileName: 'coverage-file-for-download.txt',
            file: deterministicBlob,
        });

        try {
            assertApiResult(uploadResponse);

            const response = await client.getFileByPathAasRepository({
                configuration,
                aasIdentifier: shell.id,
                submodelIdentifier: submodel.id,
                idShortPath: attachmentIdShortPath,
            });

            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
                expect(response.data).toBeDefined();
                expect(response.data.size).toBeGreaterThan(0);

                const downloadedText = await response.data.text();
                const parsedPayload = JSON.parse(downloadedText) as {
                    Content?: string;
                };

                expect(parsedPayload.Content).toBeDefined();
                const decodedContent = Buffer.from(parsedPayload.Content ?? '', 'base64').toString('utf-8');
                expect(decodedContent).toContain('coverage-attachment');
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetFileByPath_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get file by path', async () => {
        const response = await client.getFileByPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            idShortPath: attachmentIdShortPath,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should reject file upload on non-File submodel element through AAS repository superpath with 405', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.putFileByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
            fileName: 'invalid-property-file.txt',
            file: createAttachmentBlob('invalid-property-payload'),
        });

        try {
            assertApiFailureCode(response, '405');
            if (!response.success) {
                expect(response.statusCode).toBe(405);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PutFileByPath_AasRepository
     * @status 204
     */
    test('should return no content when uploading file by path', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.putFileByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: attachmentIdShortPath,
            fileName: 'coverage-file-204.txt',
            file: attachmentBlob,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PutFileByPath_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in put file by path', async () => {
        const response = await client.putFileByPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            idShortPath: attachmentIdShortPath,
            fileName: 'coverage-file.txt',
            file: attachmentBlob,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetFileByPath_AasRepository
     * @status 404
     */
    test('should reject file download for missing submodel element through AAS repository superpath with 404', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.getFileByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'missingAttachmentPath',
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation PutFileByPath_AasRepository
     * @status 404
     */
    test('should return not found when uploading file for missing submodel element', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.putFileByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `missingAttachmentPath-${uniqueSuffix()}`,
            fileName: 'coverage-missing-file.txt',
            file: attachmentBlob,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation InvokeOperation_AasRepository
     * @status 200 [Currently not testable]
     */
    test.skip('should return operation invocation result with success status', async () => {
        const response = await client.invokeOperationAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            operationRequest: createTestOperationRequest(),
        });

        assertApiResult(response);
        if (response.success) {
            expect([200, 204]).toContain(response.statusCode);
        }
    });

    /**
     * @operation InvokeOperation_AasRepository
     * @status 404 [Currently not testable]
     */
    test.skip('should return not found when invoking missing operation by path', async () => {
        const response = await client.invokeOperationAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missingOperation-${uniqueSuffix()}`,
            operationRequest: createTestOperationRequest(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation InvokeOperation_AasRepository
     * @status 400 [Currently not testable]
     */
    test.skip('should reject missing Asset Administration Shell identifier in invoke operation', async () => {
        const response = await client.invokeOperationAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            operationRequest: createTestOperationRequest(),
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation InvokeOperation-ValueOnly_AasRepository
     * @status 200 [Currently not testable]
     */
    test.skip('should return operation value-only invocation result with success status', async () => {
        const response = await client.invokeOperationValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            operationRequestValueOnly,
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation InvokeOperation-ValueOnly_AasRepository
     * @status 404 [Currently not testable]
     */
    test.skip('should return not found when invoking missing operation value-only by path', async () => {
        const response = await client.invokeOperationValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missingOperation-${uniqueSuffix()}`,
            operationRequestValueOnly,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation InvokeOperation-ValueOnly_AasRepository
     * @status 400 [Currently not testable]
     */
    test.skip('should reject missing Asset Administration Shell identifier in invoke operation value-only', async () => {
        const response = await client.invokeOperationValueOnlyAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            operationRequestValueOnly,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation InvokeOperationAsync_AasRepository
     * @status 404 [Currently not testable]
     */
    test.skip('should return not found when invoking missing async operation by path', async () => {
        const response = await client.invokeOperationAsyncAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missingOperation-${uniqueSuffix()}`,
            operationRequest: createTestOperationRequest(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation InvokeOperationAsync_AasRepository
     * @status 400 [Currently not testable]
     */
    test.skip('should reject missing Asset Administration Shell identifier in invoke operation async', async () => {
        const response = await client.invokeOperationAsyncAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            operationRequest: createTestOperationRequest(),
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation InvokeOperationAsync-ValueOnly_AasRepository
     * @status 404 [Currently not testable]
     */
    test.skip('should return not found when invoking missing async operation value-only by path', async () => {
        const response = await client.invokeOperationAsyncValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missingOperation-${uniqueSuffix()}`,
            operationRequestValueOnly,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation InvokeOperationAsync-ValueOnly_AasRepository
     * @status 400 [Currently not testable]
     */
    test.skip('should reject missing Asset Administration Shell identifier in invoke operation async value-only', async () => {
        const response = await client.invokeOperationAsyncValueOnlyAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            operationRequestValueOnly,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetOperationAsyncStatus_AasRepository
     * @status 200 [Currently not testable]
     */
    test.skip('should return operation status for a valid async handle', async () => {
        const response = await client.getOperationAsyncStatusAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetOperationAsyncStatus_AasRepository
     * @status 404 [Currently not testable]
     */
    test.skip('should return not found for missing async status handle', async () => {
        const response = await client.getOperationAsyncStatusAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: `missing-handle-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GetOperationAsyncStatus_AasRepository
     * @status 400 [Currently not testable]
     */
    test.skip('should reject missing Asset Administration Shell identifier in get async operation status', async () => {
        const response = await client.getOperationAsyncStatusAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetOperationAsyncResult_AasRepository
     * @status 200 [Currently not testable]
     */
    test.skip('should return async operation result for a valid handle', async () => {
        const response = await client.getOperationAsyncResultAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetOperationAsyncResult_AasRepository
     * @status 404 [Currently not testable]
     */
    test.skip('should return not found for missing async result handle', async () => {
        const response = await client.getOperationAsyncResultAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: `missing-handle-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GetOperationAsyncResult_AasRepository
     * @status 400 [Currently not testable]
     */
    test.skip('should reject missing Asset Administration Shell identifier in get async operation result', async () => {
        const response = await client.getOperationAsyncResultAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetOperationAsyncResult-ValueOnly_AasRepository
     * @status 200 [Currently not testable]
     */
    test.skip('should return async operation value-only result for a valid handle', async () => {
        const response = await client.getOperationAsyncResultValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetOperationAsyncResult-ValueOnly_AasRepository
     * @status 404 [Currently not testable]
     */
    test.skip('should return not found for missing async value-only result handle', async () => {
        const response = await client.getOperationAsyncResultValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: `missing-handle-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GetOperationAsyncResult-ValueOnly_AasRepository
     * @status 400 [Currently not testable]
     */
    test.skip('should reject missing Asset Administration Shell identifier in get async operation value-only result', async () => {
        const response = await client.getOperationAsyncResultValueOnlyAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation DeleteFileByPath_AasRepository
     * @status 200
     */
    test('should delete file by path through AAS repository superpath for a File submodel element', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const uploadResponse = await client.putFileByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: attachmentIdShortPath,
            fileName: 'coverage-file-before-delete.txt',
            file: attachmentBlob,
        });

        try {
            assertApiResult(uploadResponse);

            const response = await client.deleteFileByPathAasRepository({
                configuration,
                aasIdentifier: shell.id,
                submodelIdentifier: submodel.id,
                idShortPath: attachmentIdShortPath,
            });

            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(200);
            } else {
                console.error('API Error:', JSON.stringify(response.error, null, 2));
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation DeleteFileByPath_AasRepository
     * @status 404
     */
    test('should return not found when deleting missing file by path', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.deleteFileByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `missingAttachmentPath-${uniqueSuffix()}`,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation GetFileByPath_AasRepository
     * @status 404
     */
    test('should return not found when downloading a deleted file through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const uploadResponse = await client.putFileByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: attachmentIdShortPath,
            fileName: 'coverage-file-before-download-after-delete.txt',
            file: attachmentBlob,
        });

        try {
            assertApiResult(uploadResponse);

            const deleteResponse = await client.deleteFileByPathAasRepository({
                configuration,
                aasIdentifier: shell.id,
                submodelIdentifier: submodel.id,
                idShortPath: attachmentIdShortPath,
            });

            assertApiResult(deleteResponse);

            const response = await client.getFileByPathAasRepository({
                configuration,
                aasIdentifier: shell.id,
                submodelIdentifier: submodel.id,
                idShortPath: attachmentIdShortPath,
            });

            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation DeleteFileByPath_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in delete file by path', async () => {
        const response = await client.deleteFileByPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            idShortPath: attachmentIdShortPath,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation DeleteSubmodelElementByPath_AasRepository
     * @status 204
     */
    test('should delete SubmodelElement by path through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.deleteSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: 'testProperty',
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation DeleteSubmodelElementByPath_AasRepository
     * @status 204
     */
    test('should delete SubmodelElement by path with no content status', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();
        const updateElement = createTestSubmodelElement();
        updateElement.idShort = `deleteByPath-${uniqueSuffix()}`;

        const prepareResponse = await client.putSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `parentCollection.${updateElement.idShort}`,
            submodelElement: updateElement,
        });

        try {
            assertApiResult(prepareResponse);
            if (prepareResponse.success) {
                expect([201, 204]).toContain(prepareResponse.statusCode);
            }

            const response = await client.deleteSubmodelElementByPathAasRepository({
                configuration,
                aasIdentifier: shell.id,
                submodelIdentifier: submodel.id,
                idShortPath: `parentCollection.${updateElement.idShort}`,
            });

            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation DeleteSubmodelElementByPath_AasRepository
     * @status 404
     */
    test('should return not found when deleting missing SubmodelElement by path', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.deleteSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation DeleteSubmodelElementByPath_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in delete SubmodelElement by path', async () => {
        const response = await client.deleteSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
            idShortPath: 'testProperty',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation DeleteSubmodelById_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in delete Submodel by ID', async () => {
        const response = await client.deleteSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation DeleteSubmodelById_AasRepository
     * @status 404
     */
    test('should return not found when deleting a missing Submodel by ID', async () => {
        const { shell } = await createScopedSuperpathFixture();

        const response = await client.deleteSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        try {
            assertApiFailureCode(response, '404');
            if (!response.success) {
                expect(response.statusCode).toBe(404);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation DeleteSubmodelById_AasRepository
     * @status 204
     */
    test('should delete Submodel by ID through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.deleteSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation DeleteSubmodelReference_AasRepository
     * @status 204
     */
    test('should delete Submodel reference by ID through AAS repository superpath', async () => {
        const { shell, submodel } = await createScopedSuperpathFixture();

        const response = await client.deleteSubmodelReferenceById({
            configuration,
            aasIdentifier: shell.id,
            submodelIdentifier: submodel.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation DeleteThumbnail_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in delete thumbnail', async () => {
        const response = await client.deleteThumbnail({
            configuration,
            aasIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation DeleteThumbnail_AasRepository
     * @status 404
     */
    test('should return not found when deleting thumbnail for a missing Asset Administration Shell', async () => {
        const response = await client.deleteThumbnail({
            configuration,
            aasIdentifier: randomMissingAasIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation DeleteThumbnail_AasRepository
     * @status 204
     */
    test('should delete thumbnail through AAS repository superpath', async () => {
        const shell = createUniqueShell();
        const createShellResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: shell,
        });

        assertApiResult(createShellResponse);

        const putThumbnailResponse = await client.putThumbnail({
            configuration,
            aasIdentifier: shell.id,
            fileName: 'thumb-before-delete.png',
            file: new Blob(['thumb'], { type: 'image/png' }),
        });

        const response = await client.deleteThumbnail({
            configuration,
            aasIdentifier: shell.id,
        });

        try {
            assertApiResult(putThumbnailResponse);
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });

    /**
     * @operation DeleteThumbnail_AasRepository
     * @status 200 [deprecated in AAS V3.1]
     */
    test.skip('should delete thumbnail through AAS repository superpath with success status', async () => {
        const prepareResponse = await client.putThumbnail({
            configuration,
            aasIdentifier: testShell.id,
            fileName: 'thumb-before-success-delete.png',
            file: new Blob(['thumb'], { type: 'image/png' }),
        });

        assertApiResult(prepareResponse);

        const response = await client.deleteThumbnail({
            configuration,
            aasIdentifier: testShell.id,
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation DeleteAssetAdministrationShellById
     * @status 404
     */
    test('should return not found when deleting missing Asset Administration Shell by ID', async () => {
        const response = await client.deleteAssetAdministrationShellById({
            configuration,
            aasIdentifier: randomMissingAasIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation DeleteAssetAdministrationShellById
     * @status 204
     */
    test('should delete Asset Administration Shell by ID', async () => {
        const shell = createUniqueShell();
        const createShellResponse = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: shell,
        });

        assertApiResult(createShellResponse);

        const response = await client.deleteAssetAdministrationShellById({
            configuration,
            aasIdentifier: shell.id,
        });

        try {
            assertApiResult(response);
            if (response.success) {
                expect(response.statusCode).toBe(204);
            }
        } finally {
            await cleanupShell(shell.id);
        }
    });
});
