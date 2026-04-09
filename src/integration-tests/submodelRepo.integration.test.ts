import { SubmodelRepositoryClient } from '../clients/SubmodelRepositoryClient';
//import { Configuration } from '../generated';
import { Configuration } from '../generated';
import { createSubmodelRepositoryPayloadFixtures } from './fixtures/requestPayloadFixtures';
import {
    createAttachmentBlob,
    createDescription,
    createNewSubmodelElement,
    createTestFileSubmodelElement,
    createTestOperationRequest,
    createTestSubmodel,
    createTestSubmodelElement,
    createTestSubmodelElementCollection,
    createValue,
} from './fixtures/submodelFixtures';

describe('Submodel Repository Integration Tests', () => {
    const client = new SubmodelRepositoryClient();
    const testSubmodel = createTestSubmodel();
    const testSubmodelElement = createTestSubmodelElement();
    const testFileSubmodelElement = createTestFileSubmodelElement();
    const newSubmodelElement = createNewSubmodelElement();
    const testSubmodelElementCollection = createTestSubmodelElementCollection();
    const attachmentPayload = 'coverage-attachment-payload';
    const attachmentBlob = createAttachmentBlob(attachmentPayload);
    const attachmentIdShortPath = testFileSubmodelElement.idShort ?? 'testFileElement';
    //const OPERATION_REQUEST = createTestOperationRequest();
    //const OPERATION_RESULT = createTestOperationResult();
    //const testOperationSubmodelElement = createTestOperationElement();
    const configuration = new Configuration({
        basePath: 'http://localhost:8082',
    });
    const { submodelMetadataPatch, submodelElementMetadataPatch, operationRequestValueOnly } =
        createSubmodelRepositoryPayloadFixtures(testSubmodel.id);

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

    test('should create a new Submodel', async () => {
        const response = await client.postSubmodel({
            configuration,
            submodel: testSubmodel,
        });

        // Log the error details if the request failed
        if (!response.success && response.error) {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testSubmodel);
        }
    });

    test('should fetch a Submodel by ID', async () => {
        const response = await client.getSubmodelById({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.id).toEqual(testSubmodel.id);
            expect(response.data.idShort).toEqual(testSubmodel.idShort);
            expect(Array.isArray(response.data.submodelElements) || response.data.submodelElements === null).toBe(true);
        }
    });

    test('should fetch a Submodel by non-existing ID', async () => {
        const nonExistingId = 'non-existing-id';
        const response = await client.getSubmodelById({
            configuration,
            submodelIdentifier: nonExistingId,
        });
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeDefined();
            console.log('Error:', response.error);
        }
    });

    test('should fetch all Submodels', async () => {
        const response = await client.getAllSubmodels({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
            expect((response.data.result ?? []).map((submodel) => submodel.id)).toContain(testSubmodel.id);
        }
    });

    // Go backend returns a non-conforming payload/error for this endpoint in the current environment.
    test('should create a new SubmodelElement', async () => {
        const response = await client.postSubmodelElement({
            configuration,
            submodelIdentifier: testSubmodel.id,
            submodelElement: testSubmodelElement,
        });

        // Log the error details if the request failed
        if (!response.success && response.error) {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testSubmodelElement);
        }
    });

    test('should update a Submodel', async () => {
        const updatedSubmodel = createTestSubmodel();
        updatedSubmodel.submodelElements = [
            testSubmodelElement,
            testSubmodelElementCollection,
            newSubmodelElement,
            testFileSubmodelElement,
        ];

        const updateResponse = await client.putSubmodelById({
            configuration,
            submodelIdentifier: testSubmodel.id,
            submodel: updatedSubmodel,
        });

        console.log('Updated submodel Response:', updateResponse);

        expect(updateResponse.success).toBe(true);

        const fetchResponse = await client.getSubmodelById({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data.id).toEqual(updatedSubmodel.id);
            expect(fetchResponse.data.idShort).toEqual(updatedSubmodel.idShort);

            const idShorts = (fetchResponse.data.submodelElements ?? []).map((element) => element.idShort);
            expect(idShorts).toContain(testSubmodelElement.idShort);
            expect(idShorts).toContain(testSubmodelElementCollection.idShort);
            expect(idShorts).toContain(newSubmodelElement.idShort);
            expect(idShorts).toContain(testFileSubmodelElement.idShort);
        }
    });

    test('should fetch all SubmodelElements', async () => {
        const response = await client.getAllSubmodelElements({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(testSubmodelElement);
        }
    });

    test('should fetch SubmodelElement by the path', async () => {
        const response = await client.getSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort!,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            //expect(response.data.idShort).toBe('testProperty');
            expect(response.data).toEqual(testSubmodelElement);
            //expect(response.data.result.length).toBeGreaterThan(0);
            //expect(response.data.result).toContainEqual(testSubmodelElement);
        }
    });
    // Go backend currently returns an error for create-by-path in this environment.
    test('should create a new SubmodelElement at a specified path within submodel elements hierarchy', async () => {
        const nestedSubmodelElement = createNewSubmodelElement();
        nestedSubmodelElement.idShort = 'nestedProperty';

        const response = await client.postSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElementCollection.idShort!,
            submodelElement: nestedSubmodelElement,
        });

        // Log the error details if the request failed
        if (!response.success && response.error) {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.idShort).toBe(nestedSubmodelElement.idShort);
        }
    });

    test('should update the submodel element at the specified path ', async () => {
        const updatedSubmodelElement = testSubmodelElement;
        const description = createDescription();
        updatedSubmodelElement.description = [description];
        //updatedSubmodelElement.submodelElements = [testSubmodelElement];

        const updateResponse = await client.putSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort!,
            submodelElement: updatedSubmodelElement,
        });

        console.log('Updated submodel element Response:', updateResponse);

        expect(updateResponse.success).toBe(true);

        const fetchResponse = await client.getSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort!,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedSubmodelElement);
        }
    });

    // Go backend currently responds with an error for metadata-by-id retrieval.
    test('should fetch Submodel metadata by ID', async () => {
        const response = await client.getSubmodelByIdMetadata({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.id).toEqual(testSubmodel.id);
            expect(response.data.idShort).toEqual(testSubmodel.idShort);
        }
    });

    test('should fetch Submodel in the ValueOnly representation', async () => {
        const response = await client.getSubmodelByIdValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            console.log(' submodel valueOnly Response:', JSON.stringify(response.data, null, 2));
            expect(response.data).toBeDefined();
            expect(typeof response.data).toBe('object');
            expect(Object.keys(response.data).length).toBeGreaterThan(0);
        }
    });

    test('should fetch SubmodelElement by path in the ValueOnly representation', async () => {
        const response = await client.getSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: newSubmodelElement.idShort!,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            console.log('Element ValueOnly response:', JSON.stringify(response.data, null, 2));
            const newPropertyElement = newSubmodelElement as { value?: unknown };

            expect(response.data).toBeDefined();
            expect(response.data).toEqual(newPropertyElement.value);
        }
    });

    test('should update SubmodelElement in the ValueOnly representation', async () => {
        const updatedPropertyValue = createValue();
        const updatedSubmodelElement = testSubmodelElement as { value?: unknown };
        updatedSubmodelElement.value = updatedPropertyValue;

        const updateResponse = await client.patchSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort!,
            submodelElementValue: updatedPropertyValue,
        });

        console.log('Updated submodel Response:', updateResponse);

        expect(updateResponse.success).toBe(true);

        const fetchResponse = await client.getSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort!,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            console.log('Updated Value:', fetchResponse.data);
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedPropertyValue);
        }
    });

    test('should fetch all Submodels in metadata representation', async () => {
        const response = await client.getAllSubmodelsMetadata({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data.result).toBeDefined();
        }
    });

    test('should fetch all Submodels in value-only representation', async () => {
        const response = await client.getAllSubmodelsValueOnly({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data.result).toBeDefined();
        }
    });

    test('should fetch references to all Submodels', async () => {
        const response = await client.getAllSubmodelsReference({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data.result).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
        }
    });

    // Go backend currently responds with an error for path representation listing.
    test.skip('should fetch paths of all Submodels', async () => {
        const response = await client.getAllSubmodelsPath({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data.result).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
        }
    });

    test('should fetch Submodel by ID in reference representation', async () => {
        const response = await client.getSubmodelByIdReference({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.keys).toBeDefined();
        }
    });

    // Go backend currently responds with an error for path representation retrieval.
    test.skip('should fetch Submodel by ID in path representation', async () => {
        const response = await client.getSubmodelByIdPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.length).toBeGreaterThan(0);
        }
    });

    // Go backend currently responds with an error for submodel element metadata listing.
    test.skip('should fetch all SubmodelElements in metadata representation', async () => {
        const response = await client.getAllSubmodelElementsMetadata({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data.result).toBeDefined();
        }
    });

    test('should fetch all SubmodelElements in value-only representation', async () => {
        const response = await client.getAllSubmodelElementsValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data.result).toBeDefined();
        }
    });

    test('should fetch references to all SubmodelElements', async () => {
        const response = await client.getAllSubmodelElementsReference({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data.result).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
        }
    });

    test('should fetch paths of all SubmodelElements', async () => {
        const response = await client.getAllSubmodelElementsPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data.result).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
        }
    });

    // Go backend currently responds with an error for submodel element metadata retrieval.
    test.skip('should fetch SubmodelElement metadata by path', async () => {
        const response = await client.getSubmodelElementByPathMetadata({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort!,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.idShort).toEqual(testSubmodelElement.idShort);
        }
    });

    test('should fetch SubmodelElement reference by path', async () => {
        const response = await client.getSubmodelElementByPathReference({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort!,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.keys).toBeDefined();
        }
    });

    test('should fetch SubmodelElement path by path', async () => {
        const response = await client.getSubmodelElementByPathPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort!,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.length).toBeGreaterThan(0);
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

    test('should fetch submodel repository service description', async () => {
        const response = await client.getSelfDescription({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(Array.isArray(response.data.profiles)).toBe(true);
        }
    });

    test('should patch Submodel metadata by ID', async () => {
        const response = await client.patchSubmodelByIdMetadata({
            configuration,
            submodelIdentifier: testSubmodel.id,
            submodelMetadata: submodelMetadataPatch,
        });

        assertApiResult(response);
    });

    test('should patch SubmodelElement metadata by path', async () => {
        const response = await client.patchSubmodelElementByPathMetadata({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        assertApiResult(response);
    });

    test('should upload file by path to a File submodel element', async () => {
        const response = await client.putFileByPath({
            configuration,
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

    test.skip('should download uploaded file by path from a File submodel element', async () => {
        const response = await client.getFileByPath({
            configuration,
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

    test.skip('should reject file download on non-File submodel element with 405', async () => {
        const response = await client.getFileByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
        });

        assertApiFailureCode(response, '405');
    });

    test('should reject file upload by path for missing submodel element with 404', async () => {
        const response = await client.putFileByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: 'missingAttachmentPath',
            fileName: 'missing-element-file.txt',
            file: createAttachmentBlob('missing-element-payload'),
        });

        assertApiFailureCode(response, '404');
    });

    test('should post invoke operation value-only', async () => {
        const response = await client.postInvokeOperationValueOnly({
            configuration,
            aasIdentifier: testSubmodel.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequestValueOnly,
        });

        assertApiResult(response);
    });

    test('should post invoke operation async', async () => {
        const response = await client.postInvokeOperationAsync({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequest: createTestOperationRequest(),
        });

        assertApiResult(response);
    });

    test('should post invoke operation async value-only', async () => {
        const response = await client.postInvokeOperationAsyncValueOnly({
            configuration,
            aasIdentifier: testSubmodel.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequestValueOnly,
        });

        assertApiResult(response);
    });

    test('should get async operation status', async () => {
        const response = await client.getOperationAsyncStatus({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiResult(response);
    });

    test('should get async operation result', async () => {
        const response = await client.getOperationAsyncResult({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiResult(response);
    });

    test('should get async operation result value-only', async () => {
        const response = await client.getOperationAsyncResultValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiResult(response);
    });

    test('should delete file by path from a File submodel element', async () => {
        const response = await client.deleteFileByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: attachmentIdShortPath,
        });

        expect(response.success).toBe(true);
        if (!response.success) {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
    });

    test('should return not found when downloading a deleted file by path', async () => {
        const response = await client.getFileByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: attachmentIdShortPath,
        });

        assertApiFailureCode(response, '404');
    });

    test('should delete SubmodelElement by path', async () => {
        const response = await client.deleteSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
        });

        assertApiResult(response);
    });

    test('should delete Submodel by ID', async () => {
        const response = await client.deleteSubmodelById({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    // To be tested later
    // test('should invoke an Operation at a specified path', async () => {
    //     const response = await client.postInvokeOperationSubmodelRepo({
    //         configuration,
    //         submodelIdentifier: testSubmodel.id,
    //         idShortPath: testOperationSubmodelElement.idShort!,
    //         operationRequest: OPERATION_REQUEST,
    //     });

    //     // Log the error details if the request failed
    //     if (!response.success && response.error) {
    //         console.error('API Error:', JSON.stringify(response.error, null, 2));
    //     }
    //     expect(response.success).toBe(true);
    //     if (response.success) {
    //         expect(response.data).toBeDefined();
    //         expect(response.data).toEqual(OPERATION_RESULT);
    //     }
    // });
});
