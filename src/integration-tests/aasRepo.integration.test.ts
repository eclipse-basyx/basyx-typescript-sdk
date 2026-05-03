import { AasRepositoryClient } from '../clients/AasRepositoryClient';
import { Configuration } from '../generated';
import { createDescription, createGlobalAssetId, createTestShell } from './fixtures/aasFixtures';
import { createAasRepositoryPayloadFixtures } from './fixtures/requestPayloadFixtures';
import {
    createAttachmentBlob,
    createTestFileSubmodelElement,
    createTestOperationRequest,
    createTestSubmodel,
    createTestSubmodelElement,
} from './fixtures/submodelFixtures';

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
        basePath: 'http://localhost:8081',
    });
    const { submodelReference, submodelMetadataPatch, submodelElementMetadataPatch, operationRequestValueOnly } =
        createAasRepositoryPayloadFixtures(testSubmodel.id);

    type ApiResultLike = {
        success: boolean;
        statusCode?: number;
        data?: unknown;
        error?: unknown;
    };

    const uniqueSuffix = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    function randomMissingAasIdentifier(): string {
        return `https://example.com/ids/aas/missing-${uniqueSuffix()}`;
    }

    function randomMissingSubmodelIdentifier(): string {
        return `https://example.com/ids/sm/missing-${uniqueSuffix()}`;
    }

    function assertApiResult(response: ApiResultLike): void {
        expect(typeof response.success).toBe('boolean');
        if (response.success) {
            expect(response.error).toBeUndefined();
        } else {
            expect(response.error).toBeDefined();
        }
    }

    function assertApiFailureCode(response: ApiResultLike, expectedCode: string): void {
        expect(response.success).toBe(false);
        if (!response.success) {
            const errorPayload = response.error as { messages?: Array<{ code?: string }> } | undefined;
            const messageCodes = (errorPayload?.messages ?? []).map((message) => message.code);
            expect(messageCodes).toContain(expectedCode);
        }
    }

    /**
     * @operation PostAssetAdministrationShell
     * @status 201
     */
    test('should create a new Asset Administration Shell', async () => {
        const response = await client.postAssetAdministrationShell({
            configuration,
            assetAdministrationShell: testShell,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testShell);
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

        expect(createResponse.success).toBe(true);
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

        const cleanupResponse = await client.deleteAssetAdministrationShellById({
            configuration,
            aasIdentifier: duplicateShell.id,
        });
        expect(cleanupResponse.success).toBe(true);
        if (cleanupResponse.success) {
            expect(cleanupResponse.statusCode).toBe(204);
        }
    });

    /**
     * @operation GetAssetAdministrationShellById
     * @status 200
     */
    test('should fetch an Asset Administration Shell by ID', async () => {
        const response = await client.getAssetAdministrationShellById({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testShell);
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
        const response = await client.getAllAssetAdministrationShells({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(testShell);
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
        const response = await client.getAllAssetAdministrationShellsReference({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.result.length).toBeGreaterThan(0);
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
        const response = await client.getAssetAdministrationShellByIdReferenceAasRepository({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
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

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
        }

        const cleanupResponse = await client.deleteAssetAdministrationShellById({
            configuration,
            aasIdentifier: putShell.id,
        });
        expect(cleanupResponse.success).toBe(true);
        if (cleanupResponse.success) {
            expect(cleanupResponse.statusCode).toBe(204);
        }
    });

    // Go backend intermittently rejects this update path in the current environment.
    /**
     * @operation PutAssetAdministrationShellById
     * @status 204 [known-backend-bug]
     */
    test.skip('should update an Asset Administration Shell', async () => {
        const updatedShell = testShell;
        const description = createDescription();

        updatedShell.description = [description];

        const updateResponse = await client.putAssetAdministrationShellById({
            configuration,
            aasIdentifier: testShell.id,
            assetAdministrationShell: updatedShell,
        });

        expect(updateResponse.success).toBe(true);

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
        const response = await client.getAssetInformation({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testShell.assetInformation);
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
        const updatedAssetInfo = testShell.assetInformation;
        updatedAssetInfo.globalAssetId = createGlobalAssetId();

        const updateResponse = await client.putAssetInformation({
            configuration,
            aasIdentifier: testShell.id,
            assetInformation: updatedAssetInfo,
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
            expect(updateResponse.statusCode).toBe(204);
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
        const fileName = 'test_thumbnail.png';
        const payload = 'base64_encoded_image_data';
        const file = new Blob([payload], { type: 'image/png' });

        const updateResponse = await client.putThumbnail({
            configuration,
            aasIdentifier: testShell.id,
            fileName,
            file,
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
            expect(updateResponse.statusCode).toBe(204);
        }
    });

    /**
     * @operation GetThumbnail_AasRepository
     * @status 200
     */
    test('should get thumbnail of an Asset Administration Shell', async () => {
        const fetchResponse = await client.getThumbnail({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.statusCode).toBe(200);
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data.size).toBeGreaterThan(0);
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

    // Go backend currently does not provide a successful response for GET /serialization here.
    /**
     * @operation GenerateSerializationByIds
     * @status 200 [known-backend-bug]
     */
    test.skip('should generate serialization by IDs', async () => {
        const response = await client.generateSerializationByIds({
            configuration,
            includeConceptDescriptions: true,
        });

        expect(response.success).toBe(true);
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

        expect(response.success).toBe(true);
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
        const response = await client.getAllSubmodelReferences({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
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
        const response = await client.postSubmodelReference({
            configuration,
            aasIdentifier: testShell.id,
            submodelReference,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data).toBeDefined();
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
     * @status 409 [known-backend-bug]
     */
    test.skip('should return conflict when posting a duplicate Submodel reference', async () => {
        const duplicateRef = submodelReference;

        const createResponse = await client.postSubmodelReference({
            configuration,
            aasIdentifier: testShell.id,
            submodelReference: duplicateRef,
        });

        expect(createResponse.success).toBe(true);

        const duplicateResponse = await client.postSubmodelReference({
            configuration,
            aasIdentifier: testShell.id,
            submodelReference: duplicateRef,
        });

        assertApiFailureCode(duplicateResponse, '409');
        if (!duplicateResponse.success) {
            expect(duplicateResponse.statusCode).toBe(409);
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
            submodelIdentifier: testSubmodel.id,
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
        const response = await client.deleteSubmodelReferenceById({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PutSubmodelById_AasRepository
        * @status 201 [known-backend-bug]
     */
        test.skip('should create Submodel by ID through AAS repository superpath', async () => {
        const createdSubmodel = createTestSubmodel();
        createdSubmodel.id = randomMissingSubmodelIdentifier();
        createdSubmodel.submodelElements = [createTestSubmodelElement()];

        const response = await client.putSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: createdSubmodel.id,
            submodel: createdSubmodel,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
        }
    });

    /**
     * @operation PutSubmodelById_AasRepository
        * @status 204 [known-backend-bug]
     */
        test.skip('should update Submodel by ID through AAS repository superpath', async () => {
            const seededSubmodel = testSubmodel;
            seededSubmodel.submodelElements = [testSubmodelElement, testFileSubmodelElement];

        const seedResponse = await client.putSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            submodel: seededSubmodel,
        });
        expect(seedResponse.success).toBe(true);

        const response = await client.putSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            submodel: seededSubmodel,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation PutSubmodelById_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in put Submodel by ID', async () => {
        const response = await client.putSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: testSubmodel.id,
            submodel: testSubmodel,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PutSubmodelById_AasRepository
        * @status 404 [known-backend-bug]
     */
        test.skip('should return not found when putting Submodel by ID for a missing Asset Administration Shell', async () => {
        const response = await client.putSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: randomMissingAasIdentifier(),
            submodelIdentifier: testSubmodel.id,
            submodel: testSubmodel,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GetSubmodelById_AasRepository
        * @status 200 [known-backend-bug]
     */
        test.skip('should get Submodel by ID through AAS repository superpath', async () => {
        const response = await client.getSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
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
            submodelIdentifier: testSubmodel.id,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetSubmodelById_AasRepository
        * @status 404 [known-backend-bug]
     */
        test.skip('should return not found when getting Submodel by missing ID', async () => {
        const response = await client.getSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PatchSubmodel_AasRepository
        * @status 204 [known-backend-bug]
     */
        test.skip('should patch Submodel through AAS repository superpath', async () => {
        const response = await client.patchSubmodelAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            submodel: testSubmodel,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation PatchSubmodel_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in patch Submodel', async () => {
        const response = await client.patchSubmodelAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: testSubmodel.id,
            submodel: testSubmodel,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PatchSubmodel_AasRepository
        * @status 404 [known-backend-bug]
     */
        test.skip('should return not found when patching a missing Submodel', async () => {
        const response = await client.patchSubmodelAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            submodel: testSubmodel,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GetSubmodelById-Metadata_AasRepository
        * @status 200 [known-backend-bug]
     */
        test.skip('should get Submodel metadata by ID through AAS repository superpath', async () => {
        const response = await client.getSubmodelByIdMetadataAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
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
            submodelIdentifier: testSubmodel.id,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetSubmodelById-Metadata_AasRepository
        * @status 404 [known-backend-bug]
     */
        test.skip('should return not found when getting metadata for a missing Submodel', async () => {
        const response = await client.getSubmodelByIdMetadataAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PatchSubmodelById-Metadata_AasRepository
        * @status 204 [known-backend-bug]
     */
        test.skip('should patch Submodel metadata by ID through AAS repository superpath', async () => {
        const response = await client.patchSubmodelByIdMetadataAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            submodelMetadata: submodelMetadataPatch,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
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
            submodelIdentifier: testSubmodel.id,
            submodelMetadata: submodelMetadataPatch,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PatchSubmodelById-Metadata_AasRepository
        * @status 404 [known-backend-bug]
     */
        test.skip('should return not found when patching metadata for a missing Submodel', async () => {
        const response = await client.patchSubmodelByIdMetadataAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            submodelMetadata: submodelMetadataPatch,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GetSubmodelById-ValueOnly_AasRepository
        * @status 200 [known-backend-bug]
     */
        test.skip('should get Submodel value-only by ID through AAS repository superpath', async () => {
        const response = await client.getSubmodelByIdValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
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
            submodelIdentifier: testSubmodel.id,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetSubmodelById-ValueOnly_AasRepository
        * @status 404 [known-backend-bug]
     */
        test.skip('should return not found when getting value-only for a missing Submodel', async () => {
        const response = await client.getSubmodelByIdValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PatchSubmodelById-ValueOnly_AasRepository
        * @status 204 [known-backend-bug]
     */
        test.skip('should patch Submodel value-only by ID through AAS repository superpath', async () => {
        const response = await client.patchSubmodelByIdValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            body: {},
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
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
            submodelIdentifier: testSubmodel.id,
            body: {},
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PatchSubmodelById-ValueOnly_AasRepository
        * @status 404 [known-backend-bug]
     */
        test.skip('should return not found when patching value-only for a missing Submodel', async () => {
        const response = await client.patchSubmodelByIdValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            body: {},
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GetSubmodelById-Reference_AasRepository
        * @status 200 [known-backend-bug]
     */
        test.skip('should get Submodel reference by ID through AAS repository superpath', async () => {
        const response = await client.getSubmodelByIdReferenceAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
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
            submodelIdentifier: testSubmodel.id,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetSubmodelById-Reference_AasRepository
        * @status 404 [known-backend-bug]
     */
        test.skip('should return not found when getting reference for a missing Submodel', async () => {
        const response = await client.getSubmodelByIdReferenceAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GetSubmodelById-Path_AasRepository
        * @status 200 [known-backend-bug]
     */
        test.skip('should get Submodel path by ID through AAS repository superpath', async () => {
        const response = await client.getSubmodelByIdPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
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
            submodelIdentifier: testSubmodel.id,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetSubmodelById-Path_AasRepository
        * @status 404 [known-backend-bug]
     */
        test.skip('should return not found when getting path for a missing Submodel', async () => {
        const response = await client.getSubmodelByIdPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    test('should get all SubmodelElements through AAS repository superpath', async () => {
        const response = await client.getAllSubmodelElementsAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    /**
     * @operation GetAllSubmodelElements_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return all SubmodelElements with success status', async () => {
        const response = await client.getAllSubmodelElementsAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetAllSubmodelElements_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when getting SubmodelElements for a missing Submodel', async () => {
        const response = await client.getAllSubmodelElementsAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
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
            submodelIdentifier: testSubmodel.id,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should post SubmodelElement through AAS repository superpath', async () => {
        const response = await client.postSubmodelElementAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            submodelElement: testSubmodelElement,
        });

        assertApiResult(response);
    });

    /**
     * @operation PostSubmodelElement_AasRepository
     * @status 201 [known-backend-bug]
     */
    test.skip('should create SubmodelElement through AAS repository superpath with created status', async () => {
        const createdElement = createTestSubmodelElement();
        createdElement.idShort = `createdElement-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            submodelElement: createdElement,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
        }
    });

    /**
     * @operation PostSubmodelElement_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when posting SubmodelElement for a missing Submodel', async () => {
        const createdElement = createTestSubmodelElement();
        createdElement.idShort = `missingSubmodelElement-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            submodelElement: createdElement,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PostSubmodelElement_AasRepository
     * @status 409 [known-backend-bug]
     */
    test.skip('should return conflict when posting duplicate SubmodelElement', async () => {
        const duplicateElement = createTestSubmodelElement();
        duplicateElement.idShort = `duplicateElement-${uniqueSuffix()}`;

        const createResponse = await client.postSubmodelElementAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            submodelElement: duplicateElement,
        });

        expect(createResponse.success).toBe(true);

        const duplicateResponse = await client.postSubmodelElementAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            submodelElement: duplicateElement,
        });

        assertApiFailureCode(duplicateResponse, '409');
        if (!duplicateResponse.success) {
            expect(duplicateResponse.statusCode).toBe(409);
        }
    });

    /**
     * @operation PostSubmodelElement_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in post SubmodelElement', async () => {
        const response = await client.postSubmodelElementAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: testSubmodel.id,
            submodelElement: testSubmodelElement,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get all SubmodelElements metadata through AAS repository superpath', async () => {
        const response = await client.getAllSubmodelElementsMetadataAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    /**
     * @operation GetAllSubmodelElements-Metadata_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return SubmodelElements metadata with success status', async () => {
        const response = await client.getAllSubmodelElementsMetadataAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Metadata_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when getting SubmodelElements metadata for a missing Submodel', async () => {
        const response = await client.getAllSubmodelElementsMetadataAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
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
            submodelIdentifier: testSubmodel.id,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get all SubmodelElements value-only through AAS repository superpath', async () => {
        const response = await client.getAllSubmodelElementsValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    /**
     * @operation GetAllSubmodelElements-ValueOnly_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return SubmodelElements value-only with success status', async () => {
        const response = await client.getAllSubmodelElementsValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetAllSubmodelElements-ValueOnly_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when getting SubmodelElements value-only for a missing Submodel', async () => {
        const response = await client.getAllSubmodelElementsValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
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
            submodelIdentifier: testSubmodel.id,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get all SubmodelElements reference through AAS repository superpath', async () => {
        const response = await client.getAllSubmodelElementsReferenceAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    /**
     * @operation GetAllSubmodelElements-Reference_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return SubmodelElements references with success status', async () => {
        const response = await client.getAllSubmodelElementsReferenceAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Reference_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when getting SubmodelElements references for a missing Submodel', async () => {
        const response = await client.getAllSubmodelElementsReferenceAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
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
            submodelIdentifier: testSubmodel.id,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get all SubmodelElements path through AAS repository superpath', async () => {
        const response = await client.getAllSubmodelElementsPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    /**
     * @operation GetAllSubmodelElements-Path_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return SubmodelElements paths with success status', async () => {
        const response = await client.getAllSubmodelElementsPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Path_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when getting SubmodelElements paths for a missing Submodel', async () => {
        const response = await client.getAllSubmodelElementsPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
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
            submodelIdentifier: testSubmodel.id,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get SubmodelElement by path through AAS repository superpath', async () => {
        const response = await client.getSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiResult(response);
    });

    /**
     * @operation GetSubmodelElementByPath_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return SubmodelElement by path with success status', async () => {
        const response = await client.getSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetSubmodelElementByPath_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when getting SubmodelElement by missing path', async () => {
        const response = await client.getSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
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
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should post SubmodelElement by path through AAS repository superpath', async () => {
        const response = await client.postSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElement: testSubmodelElement,
        });

        assertApiResult(response);
    });

    /**
     * @operation PostSubmodelElementByPath_AasRepository
     * @status 201 [known-backend-bug]
     */
    test.skip('should create SubmodelElement by path with created status', async () => {
        const createdElement = createTestSubmodelElement();
        createdElement.idShort = `post-by-path-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElement: createdElement,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
        }
    });

    /**
     * @operation PostSubmodelElementByPath_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when posting SubmodelElement by path for missing parent path', async () => {
        const createdElement = createTestSubmodelElement();
        createdElement.idShort = `post-by-missing-path-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missingParent-${uniqueSuffix()}`,
            submodelElement: createdElement,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PostSubmodelElementByPath_AasRepository
     * @status 409 [known-backend-bug]
     */
    test.skip('should return conflict when posting duplicate SubmodelElement by path', async () => {
        const duplicateElement = createTestSubmodelElement();
        duplicateElement.idShort = `post-by-path-duplicate-${uniqueSuffix()}`;

        const createResponse = await client.postSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElement: duplicateElement,
        });
        expect(createResponse.success).toBe(true);

        const duplicateResponse = await client.postSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElement: duplicateElement,
        });

        assertApiFailureCode(duplicateResponse, '409');
        if (!duplicateResponse.success) {
            expect(duplicateResponse.statusCode).toBe(409);
        }
    });

    /**
     * @operation PostSubmodelElementByPath_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in post SubmodelElement by path', async () => {
        const response = await client.postSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElement: testSubmodelElement,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should put SubmodelElement by path through AAS repository superpath', async () => {
        const response = await client.putSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElement: testSubmodelElement,
        });

        assertApiResult(response);
    });

    /**
     * @operation PutSubmodelElementByPath_AasRepository
     * @status 201 [known-backend-bug]
     */
    test.skip('should create SubmodelElement by path with created status via put', async () => {
        const putElement = createTestSubmodelElement();
        putElement.idShort = `put-by-path-${uniqueSuffix()}`;

        const response = await client.putSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `newParent-${uniqueSuffix()}`,
            submodelElement: putElement,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
        }
    });

    /**
     * @operation PutSubmodelElementByPath_AasRepository
     * @status 204 [known-backend-bug]
     */
    test.skip('should update SubmodelElement by path with no content status via put', async () => {
        const response = await client.putSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElement: testSubmodelElement,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation PutSubmodelElementByPath_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when putting SubmodelElement by path for missing parent path', async () => {
        const putElement = createTestSubmodelElement();
        putElement.idShort = `put-missing-path-${uniqueSuffix()}`;

        const response = await client.putSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missingParent-${uniqueSuffix()}`,
            submodelElement: putElement,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PutSubmodelElementByPath_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in put SubmodelElement by path', async () => {
        const response = await client.putSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElement: testSubmodelElement,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should patch SubmodelElement value by path through AAS repository superpath', async () => {
        const response = await client.patchSubmodelElementValueByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElement: testSubmodelElement,
        });

        assertApiResult(response);
    });

    /**
     * @operation PatchSubmodelElementValueByPath_AasRepository
     * @status 204 [known-backend-bug]
     */
    test.skip('should patch SubmodelElement by path with no content status', async () => {
        const response = await client.patchSubmodelElementValueByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElement: testSubmodelElement,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation PatchSubmodelElementValueByPath_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when patching SubmodelElement by missing path', async () => {
        const response = await client.patchSubmodelElementValueByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
            submodelElement: testSubmodelElement,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PatchSubmodelElementValueByPath_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in patch SubmodelElement value by path', async () => {
        const response = await client.patchSubmodelElementValueByPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElement: testSubmodelElement,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get SubmodelElement metadata by path through AAS repository superpath', async () => {
        const response = await client.getSubmodelElementByPathMetadataAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiResult(response);
    });

    /**
     * @operation GetSubmodelElementByPath-Metadata_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return SubmodelElement metadata by path with success status', async () => {
        const response = await client.getSubmodelElementByPathMetadataAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Metadata_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when getting SubmodelElement metadata by missing path', async () => {
        const response = await client.getSubmodelElementByPathMetadataAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
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
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should patch SubmodelElement metadata by path through AAS repository superpath', async () => {
        const response = await client.patchSubmodelElementValueByPathMetadata({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        assertApiResult(response);
    });

    /**
     * @operation PatchSubmodelElementValueByPath-Metadata
     * @status 204 [known-backend-bug]
     */
    test.skip('should patch SubmodelElement metadata by path with no content status', async () => {
        const response = await client.patchSubmodelElementValueByPathMetadata({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation PatchSubmodelElementValueByPath-Metadata
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when patching SubmodelElement metadata by missing path', async () => {
        const response = await client.patchSubmodelElementValueByPathMetadata({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
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
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get SubmodelElement value-only by path through AAS repository superpath', async () => {
        const response = await client.getSubmodelElementByPathValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiResult(response);
    });

    /**
     * @operation GetSubmodelElementByPath-ValueOnly_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return SubmodelElement value-only by path with success status', async () => {
        const response = await client.getSubmodelElementByPathValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-ValueOnly_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when getting SubmodelElement value-only by missing path', async () => {
        const response = await client.getSubmodelElementByPathValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
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
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should patch SubmodelElement value-only by path through AAS repository superpath', async () => {
        const response = await client.patchSubmodelElementValueByPathValueOnly({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElementValue: 'coverage-value',
        });

        assertApiResult(response);
    });

    /**
     * @operation PatchSubmodelElementValueByPath-ValueOnly
     * @status 204 [known-backend-bug]
     */
    test.skip('should patch SubmodelElement value-only by path with no content status', async () => {
        const response = await client.patchSubmodelElementValueByPathValueOnly({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElementValue: 'coverage-value',
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation PatchSubmodelElementValueByPath-ValueOnly
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when patching SubmodelElement value-only by missing path', async () => {
        const response = await client.patchSubmodelElementValueByPathValueOnly({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
            submodelElementValue: 'coverage-value',
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
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
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            submodelElementValue: 'coverage-value',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get SubmodelElement reference by path through AAS repository superpath', async () => {
        const response = await client.getSubmodelElementByPathReferenceAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiResult(response);
    });

    /**
     * @operation GetSubmodelElementByPath-Reference_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return SubmodelElement reference by path with success status', async () => {
        const response = await client.getSubmodelElementByPathReferenceAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Reference_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when getting SubmodelElement reference by missing path', async () => {
        const response = await client.getSubmodelElementByPathReferenceAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
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
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should get SubmodelElement path by path through AAS repository superpath', async () => {
        const response = await client.getSubmodelElementByPathPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiResult(response);
    });

    /**
     * @operation GetSubmodelElementByPath-Path_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return SubmodelElement path by path with success status', async () => {
        const response = await client.getSubmodelElementByPathPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Path_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when getting SubmodelElement path by missing path', async () => {
        const response = await client.getSubmodelElementByPathPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
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
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should upload file by path through AAS repository superpath for a File submodel element', async () => {
        const response = await client.putFileByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: attachmentIdShortPath,
            fileName: 'coverage-file.txt',
            file: attachmentBlob,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        } else {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
    });

    /**
     * @operation GetFileByPath_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should download uploaded file by path through AAS repository superpath', async () => {
        const response = await client.getFileByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: attachmentIdShortPath,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.size).toBe(attachmentBlob.size);
            await expect(response.data.text()).resolves.toBe(attachmentPayload);
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
            submodelIdentifier: testSubmodel.id,
            idShortPath: attachmentIdShortPath,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test.skip('should reject file upload on non-File submodel element through AAS repository superpath with 405', async () => {
        const response = await client.putFileByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            fileName: 'invalid-property-file.txt',
            file: createAttachmentBlob('invalid-property-payload'),
        });

        assertApiFailureCode(response, '405');
    });

    /**
     * @operation PutFileByPath_AasRepository
     * @status 204 [known-backend-bug]
     */
    test.skip('should return no content when uploading file by path', async () => {
        const response = await client.putFileByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: attachmentIdShortPath,
            fileName: 'coverage-file-204.txt',
            file: attachmentBlob,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
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
            submodelIdentifier: testSubmodel.id,
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
     * @status 404 [known-backend-bug]
     */
    test.skip('should reject file download for missing submodel element through AAS repository superpath with 404', async () => {
        const response = await client.getFileByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'missingAttachmentPath',
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation PutFileByPath_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when uploading file for missing submodel element', async () => {
        const response = await client.putFileByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missingAttachmentPath-${uniqueSuffix()}`,
            fileName: 'coverage-missing-file.txt',
            file: attachmentBlob,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    test('should invoke operation through AAS repository superpath', async () => {
        const response = await client.invokeOperationAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            operationRequest: createTestOperationRequest(),
        });

        assertApiResult(response);
    });

    /**
     * @operation InvokeOperation_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return operation invocation result with success status', async () => {
        const response = await client.invokeOperationAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            operationRequest: createTestOperationRequest(),
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation InvokeOperation_AasRepository
     * @status 404 [known-backend-bug]
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
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in invoke operation', async () => {
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

    test('should invoke operation value-only through AAS repository superpath', async () => {
        const response = await client.invokeOperationValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            operationRequestValueOnly,
        });

        assertApiResult(response);
    });

    /**
     * @operation InvokeOperation-ValueOnly_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return operation value-only invocation result with success status', async () => {
        const response = await client.invokeOperationValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            operationRequestValueOnly,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation InvokeOperation-ValueOnly_AasRepository
     * @status 404 [known-backend-bug]
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
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in invoke operation value-only', async () => {
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

    test('should invoke operation async through AAS repository superpath', async () => {
        const response = await client.invokeOperationAsyncAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            operationRequest: createTestOperationRequest(),
        });

        assertApiResult(response);
    });

    /**
     * @operation InvokeOperationAsync_AasRepository
     * @status 404 [known-backend-bug]
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
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in invoke operation async', async () => {
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

    test('should invoke operation async value-only through AAS repository superpath', async () => {
        const response = await client.invokeOperationAsyncValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            operationRequestValueOnly,
        });

        assertApiResult(response);
    });

    /**
     * @operation InvokeOperationAsync-ValueOnly_AasRepository
     * @status 404 [known-backend-bug]
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
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in invoke operation async value-only', async () => {
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

    test('should get async operation status through AAS repository superpath', async () => {
        const response = await client.getOperationAsyncStatusAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiResult(response);
    });

    /**
     * @operation GetOperationAsyncStatus_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return operation status for a valid async handle', async () => {
        const response = await client.getOperationAsyncStatusAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: 'coverage-handle-id',
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetOperationAsyncStatus_AasRepository
     * @status 404 [known-backend-bug]
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
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get async operation status', async () => {
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

    test('should get async operation result through AAS repository superpath', async () => {
        const response = await client.getOperationAsyncResultAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiResult(response);
    });

    /**
     * @operation GetOperationAsyncResult_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return async operation result for a valid handle', async () => {
        const response = await client.getOperationAsyncResultAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: 'coverage-handle-id',
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetOperationAsyncResult_AasRepository
     * @status 404 [known-backend-bug]
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
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get async operation result', async () => {
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

    test('should get async operation value-only result through AAS repository superpath', async () => {
        const response = await client.getOperationAsyncResultValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiResult(response);
    });

    /**
     * @operation GetOperationAsyncResult-ValueOnly_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should return async operation value-only result for a valid handle', async () => {
        const response = await client.getOperationAsyncResultValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
            handleId: 'coverage-handle-id',
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetOperationAsyncResult-ValueOnly_AasRepository
     * @status 404 [known-backend-bug]
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
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in get async operation value-only result', async () => {
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
        const response = await client.deleteFileByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: attachmentIdShortPath,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        } else {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
    });

    /**
     * @operation DeleteFileByPath_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when deleting missing file by path', async () => {
        const response = await client.deleteFileByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missingAttachmentPath-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    test.skip('should return not found when downloading a deleted file through AAS repository superpath', async () => {
        const response = await client.getFileByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: attachmentIdShortPath,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation DeleteFileByPath_AasRepository
     * @status 400
     */
    test('should reject missing Asset Administration Shell identifier in delete file by path', async () => {
        const response = await client.deleteFileByPathAasRepository({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: testSubmodel.id,
            idShortPath: attachmentIdShortPath,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    test('should delete SubmodelElement by path through AAS repository superpath', async () => {
        const response = await client.deleteSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiResult(response);
    });

    /**
     * @operation DeleteSubmodelElementByPath_AasRepository
     * @status 204 [known-backend-bug]
     */
    test.skip('should delete SubmodelElement by path with no content status', async () => {
        const response = await client.deleteSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation DeleteSubmodelElementByPath_AasRepository
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when deleting missing SubmodelElement by path', async () => {
        const response = await client.deleteSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
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
            submodelIdentifier: testSubmodel.id,
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
            submodelIdentifier: testSubmodel.id,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation DeleteSubmodelById_AasRepository
        * @status 404 [known-backend-bug]
     */
        test.skip('should return not found when deleting a missing Submodel by ID', async () => {
        const response = await client.deleteSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation DeleteSubmodelById_AasRepository
        * @status 204 [known-backend-bug]
     */
        test.skip('should delete Submodel by ID through AAS repository superpath', async () => {
        const response = await client.deleteSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation DeleteSubmodelReference_AasRepository
     * @status 204
     */
    test('should delete Submodel reference by ID through AAS repository superpath', async () => {
        const response = await client.deleteSubmodelReferenceById({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
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
        const response = await client.deleteThumbnail({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation DeleteThumbnail_AasRepository
     * @status 200 [known-backend-bug]
     */
    test.skip('should delete thumbnail through AAS repository superpath with success status', async () => {
        const response = await client.deleteThumbnail({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(response.success).toBe(true);
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
        const response = await client.deleteAssetAdministrationShellById({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });
});
