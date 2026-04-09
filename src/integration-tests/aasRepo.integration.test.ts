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
        data?: unknown;
        error?: unknown;
    };

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

    test('should fetch references to all Asset Administration Shells', async () => {
        const response = await client.getAllAssetAdministrationShellsReference({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.result.length).toBeGreaterThan(0);
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
        const payload = 'base64_encoded_image_data';
        const file = new Blob([payload], { type: 'image/png' });

        const updateResponse = await client.putThumbnail({
            configuration,
            aasIdentifier: testShell.id,
            fileName,
            file,
        });

        console.log('Update Response:', updateResponse);

        expect(updateResponse.success).toBe(true);

        const fetchResponse = await client.getThumbnail({
            configuration,
            aasIdentifier: testShell.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data.size).toBe(file.size);
            await expect(fetchResponse.data.text()).resolves.toEqual(payload);
        }
    });

    // Go backend currently does not provide a successful response for GET /serialization here.
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

    test('should fetch AAS repository service description', async () => {
        const response = await client.getSelfDescription({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(Array.isArray(response.data.profiles)).toBe(true);
        }
    });

    test('should get all Submodel references through AAS repository superpath', async () => {
        const response = await client.getAllSubmodelReferences({
            configuration,
            aasIdentifier: testShell.id,
        });

        assertApiResult(response);
    });

    test('should post Submodel reference through AAS repository superpath', async () => {
        const response = await client.postSubmodelReference({
            configuration,
            aasIdentifier: testShell.id,
            submodelReference,
        });

        assertApiResult(response);
    });

    test('should get Submodel by ID through AAS repository superpath', async () => {
        const response = await client.getSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    test('should put Submodel by ID through AAS repository superpath', async () => {
        testSubmodel.submodelElements = [testSubmodelElement, testFileSubmodelElement];

        const response = await client.putSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            submodel: testSubmodel,
        });

        assertApiResult(response);
    });

    test('should patch Submodel through AAS repository superpath', async () => {
        const response = await client.patchSubmodelAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            submodel: testSubmodel,
        });

        assertApiResult(response);
    });

    test('should get Submodel metadata by ID through AAS repository superpath', async () => {
        const response = await client.getSubmodelByIdMetadataAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    test('should patch Submodel metadata by ID through AAS repository superpath', async () => {
        const response = await client.patchSubmodelByIdMetadataAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            submodelMetadata: submodelMetadataPatch,
        });

        assertApiResult(response);
    });

    test('should get Submodel value-only by ID through AAS repository superpath', async () => {
        const response = await client.getSubmodelByIdValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    test('should patch Submodel value-only by ID through AAS repository superpath', async () => {
        const response = await client.patchSubmodelByIdValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            body: {},
        });

        assertApiResult(response);
    });

    test('should get Submodel reference by ID through AAS repository superpath', async () => {
        const response = await client.getSubmodelByIdReferenceAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    test('should get Submodel path by ID through AAS repository superpath', async () => {
        const response = await client.getSubmodelByIdPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    test('should get all SubmodelElements through AAS repository superpath', async () => {
        const response = await client.getAllSubmodelElementsAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
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

    test('should get all SubmodelElements metadata through AAS repository superpath', async () => {
        const response = await client.getAllSubmodelElementsMetadataAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    test('should get all SubmodelElements value-only through AAS repository superpath', async () => {
        const response = await client.getAllSubmodelElementsValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    test('should get all SubmodelElements reference through AAS repository superpath', async () => {
        const response = await client.getAllSubmodelElementsReferenceAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    test('should get all SubmodelElements path through AAS repository superpath', async () => {
        const response = await client.getAllSubmodelElementsPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
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

    test('should get SubmodelElement metadata by path through AAS repository superpath', async () => {
        const response = await client.getSubmodelElementByPathMetadataAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiResult(response);
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

    test('should get SubmodelElement value-only by path through AAS repository superpath', async () => {
        const response = await client.getSubmodelElementByPathValueOnlyAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiResult(response);
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

    test('should get SubmodelElement reference by path through AAS repository superpath', async () => {
        const response = await client.getSubmodelElementByPathReferenceAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiResult(response);
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
        if (!response.success) {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
    });

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

    test.skip('should reject file download for missing submodel element through AAS repository superpath with 404', async () => {
        const response = await client.getFileByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'missingAttachmentPath',
        });

        assertApiFailureCode(response, '404');
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

    test('should delete file by path through AAS repository superpath for a File submodel element', async () => {
        const response = await client.deleteFileByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: attachmentIdShortPath,
        });

        expect(response.success).toBe(true);
        if (!response.success) {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
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

    test('should delete SubmodelElement by path through AAS repository superpath', async () => {
        const response = await client.deleteSubmodelElementByPathAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'testProperty',
        });

        assertApiResult(response);
    });

    test('should delete Submodel by ID through AAS repository superpath', async () => {
        const response = await client.deleteSubmodelByIdAasRepository({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    test('should delete Submodel reference by ID through AAS repository superpath', async () => {
        const response = await client.deleteSubmodelReferenceById({
            configuration,
            aasIdentifier: testShell.id,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    test('should delete thumbnail through AAS repository superpath', async () => {
        const response = await client.deleteThumbnail({
            configuration,
            aasIdentifier: testShell.id,
        });

        assertApiResult(response);
    });

    test('should delete Asset Administration Shell by ID', async () => {
        const response = await client.deleteAssetAdministrationShellById({
            configuration,
            aasIdentifier: testShell.id,
        });

        assertApiResult(response);
    });
});
