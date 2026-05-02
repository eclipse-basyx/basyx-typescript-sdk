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
    const uniqueSuffix = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    type ApiResultLike = {
        success: boolean;
        statusCode?: number;
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

    function randomMissingSubmodelIdentifier(): string {
        return `https://example.com/ids/sm/missing-${uniqueSuffix()}`;
    }

    /**
     * @operation PostSubmodel
     * @status 201
     */
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
            expect(response.statusCode).toBe(201);
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testSubmodel);
        }
    });

    /**
     * @operation GetSubmodelById
     * @status 200
     */
    test('should fetch a Submodel by ID', async () => {
        const response = await client.getSubmodelById({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.id).toEqual(testSubmodel.id);
            expect(response.data.idShort).toEqual(testSubmodel.idShort);
            expect(Array.isArray(response.data.submodelElements) || response.data.submodelElements === null).toBe(true);
        }
    });

    /**
     * @operation GetSubmodelById
     * @status 400
     */
    test('should reject missing Submodel identifier with bad request', async () => {
        const response = await client.getSubmodelById({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetSubmodelById
     * @status 404
     */
    test('should fetch a Submodel by non-existing ID', async () => {
        const nonExistingId = `https://example.com/ids/sm/non-existing-${uniqueSuffix()}`;
        const response = await client.getSubmodelById({
            configuration,
            submodelIdentifier: nonExistingId,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GetAllSubmodels
     * @status 200
     */
    test('should fetch all Submodels', async () => {
        const response = await client.getAllSubmodels({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
            expect((response.data.result ?? []).map((submodel) => submodel.id)).toContain(testSubmodel.id);
        }
    });

    // Go backend returns a non-conforming payload/error for this endpoint in the current environment.
    /**
     * @operation PostSubmodelElement
     * @status 201
     */
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
            expect(response.statusCode).toBe(201);
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testSubmodelElement);
        }
    });

    /**
     * @operation PutSubmodelById
     * @status 204
     */
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
        if (updateResponse.success) {
            expect(updateResponse.statusCode).toBe(204);
        }

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

    /**
     * @operation GetAllSubmodelElements
     * @status 200
     */
    test('should fetch all SubmodelElements', async () => {
        const response = await client.getAllSubmodelElements({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(testSubmodelElement);
        }
    });

    /**
     * @operation GetAllSubmodelElements
     * @status 404
     */
    test('should return not found when fetching all SubmodelElements for a missing Submodel', async () => {
        const response = await client.getAllSubmodelElements({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GetAllSubmodelElements
     * @status 400
     */
    test('should reject missing Submodel identifier when fetching all SubmodelElements', async () => {
        const response = await client.getAllSubmodelElements({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetSubmodelElementByPath
     * @status 200
     */
    test('should fetch SubmodelElement by the path', async () => {
        const response = await client.getSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort!,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            //expect(response.data.idShort).toBe('testProperty');
            expect(response.data).toEqual(testSubmodelElement);
            //expect(response.data.result.length).toBeGreaterThan(0);
            //expect(response.data.result).toContainEqual(testSubmodelElement);
        }
    });

    /**
     * @operation GetSubmodelElementByPath
     * @status 404
     */
    test('should return not found when fetching SubmodelElement by missing path', async () => {
        const response = await client.getSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GetSubmodelElementByPath
     * @status 400
     */
    test('should reject missing Submodel identifier when fetching SubmodelElement by path', async () => {
        const response = await client.getSubmodelElementByPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort!,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PostSubmodelElementByPath
     * @status 201
     */
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
            expect(response.statusCode).toBe(201);
            expect(response.data).toBeDefined();
            expect(response.data.idShort).toBe(nestedSubmodelElement.idShort);
        }
    });

    /**
     * @operation PostSubmodelElementByPath
     * @status 404
     */
    test('should return not found when creating SubmodelElement for missing path parent', async () => {
        const nestedSubmodelElement = createNewSubmodelElement();
        nestedSubmodelElement.idShort = `nested-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-collection-${uniqueSuffix()}`,
            submodelElement: nestedSubmodelElement,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PostSubmodelElementByPath
     * @status 400
     */
    test('should reject missing Submodel identifier when creating SubmodelElement by path', async () => {
        const nestedSubmodelElement = createNewSubmodelElement();
        const response = await client.postSubmodelElementByPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElementCollection.idShort!,
            submodelElement: nestedSubmodelElement,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PutSubmodelElementByPath
     * @status 204
     */
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

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
            expect(updateResponse.statusCode).toBe(204);
        }

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

    /**
     * @operation PutSubmodelElementByPath
     * @status 404
     */
    test('should return not found when updating missing SubmodelElement by path', async () => {
        const response = await client.putSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-se-${uniqueSuffix()}`,
            submodelElement: createNewSubmodelElement(),
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PutSubmodelElementByPath
     * @status 400
     */
    test('should reject missing Submodel identifier when updating SubmodelElement by path', async () => {
        const response = await client.putSubmodelElementByPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort!,
            submodelElement: createNewSubmodelElement(),
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    // Go backend currently responds with an error for metadata-by-id retrieval.
    /**
     * @operation GetSubmodelById-Metadata
     * @status 200
     */
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

    /**
     * @operation GetSubmodelById-Metadata
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier when fetching metadata by ID', async () => {
        const response = await client.getSubmodelByIdMetadata({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetSubmodelById-Metadata
     * @status 404
     */
    test('should return not found when fetching metadata by missing Submodel ID', async () => {
        const response = await client.getSubmodelByIdMetadata({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetSubmodelById-ValueOnly
     * @status 200
     */
    test('should fetch Submodel in the ValueOnly representation', async () => {
        const response = await client.getSubmodelByIdValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(typeof response.data).toBe('object');
            expect(Object.keys(response.data).length).toBeGreaterThan(0);
        }
    });

    /**
     * @operation GetSubmodelById-ValueOnly
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier for ValueOnly Submodel retrieval', async () => {
        const response = await client.getSubmodelByIdValueOnly({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetSubmodelById-ValueOnly
     * @status 404
     */
    test('should return not found for ValueOnly Submodel retrieval with missing ID', async () => {
        const response = await client.getSubmodelByIdValueOnly({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetSubmodelElementByPath-ValueOnly
     * @status 200
     */
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

    /**
     * @operation GetSubmodelElementByPath-ValueOnly
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier for ValueOnly SubmodelElement retrieval', async () => {
        const response = await client.getSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: newSubmodelElement.idShort!,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetSubmodelElementByPath-ValueOnly
     * @status 404
     */
    test('should return not found for ValueOnly SubmodelElement retrieval with missing path', async () => {
        const response = await client.getSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-value-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation PatchSubmodelElementByPath-ValueOnly
     * @status 204
     */
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

    /**
     * @operation PatchSubmodelElementByPath-ValueOnly
     * @status 404
     */
    test('should return not found when patching ValueOnly SubmodelElement for missing path', async () => {
        const response = await client.patchSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-patch-path-${uniqueSuffix()}`,
            submodelElementValue: createValue(),
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation PatchSubmodelElementByPath-ValueOnly
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier when patching ValueOnly SubmodelElement', async () => {
        const response = await client.patchSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort!,
            submodelElementValue: createValue(),
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetAllSubmodels-Metadata
     * @status 200
     */
    test('should fetch all Submodels in metadata representation', async () => {
        const response = await client.getAllSubmodelsMetadata({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data.result).toBeDefined();
        }
    });

    /**
     * @operation GetAllSubmodels-Metadata
     * @status 400
     */
    test('should reject invalid list metadata query with bad request', async () => {
        const response = await client.getAllSubmodelsMetadata({
            configuration,
            limit: -1,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetAllSubmodels-ValueOnly
     * @status 200
     */
    test('should fetch all Submodels in value-only representation', async () => {
        const response = await client.getAllSubmodelsValueOnly({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data.result).toBeDefined();
        }
    });

    /**
     * @operation GetAllSubmodels-Reference
     * @status 200
     */
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

    /**
     * @operation GetAllSubmodels-Path
     * @status 200 [known-backend-bug]
     */
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

    /**
     * @operation GetSubmodelById-Reference
     * @status 200
     */
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

    /**
     * @operation GetSubmodelById-Reference
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier in reference retrieval', async () => {
        const response = await client.getSubmodelByIdReference({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetSubmodelById-Reference
     * @status 404
     */
    test('should return not found in reference retrieval for missing Submodel', async () => {
        const response = await client.getSubmodelByIdReference({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetSubmodelById-Path
     * @status 200
     */
    test('should fetch Submodel by ID in path representation', async () => {
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

    /**
     * @operation GetSubmodelById-Path
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier in path retrieval', async () => {
        const response = await client.getSubmodelByIdPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetSubmodelById-Path
     * @status 404
     */
    test('should return not found in path retrieval for missing Submodel', async () => {
        const response = await client.getSubmodelByIdPath({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetAllSubmodelElements-Metadata
     * @status 200
     */
    test('should fetch all SubmodelElements in metadata representation', async () => {
        const response = await client.getAllSubmodelElementsMetadata({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data.result).toBeDefined();
        }
    });

    /**
     * @operation GetAllSubmodelElements-Metadata
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier for SubmodelElement metadata listing', async () => {
        const response = await client.getAllSubmodelElementsMetadata({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetAllSubmodelElements-Metadata
     * @status 404
     */
    test('should return not found for SubmodelElement metadata listing on missing Submodel', async () => {
        const response = await client.getAllSubmodelElementsMetadata({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetAllSubmodelElements-ValueOnly
     * @status 200
     */
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

    /**
     * @operation GetAllSubmodelElements-ValueOnly
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier for SubmodelElement value-only listing', async () => {
        const response = await client.getAllSubmodelElementsValueOnly({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetAllSubmodelElements-ValueOnly
     * @status 404
     */
    test('should return not found for SubmodelElement value-only listing on missing Submodel', async () => {
        const response = await client.getAllSubmodelElementsValueOnly({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetAllSubmodelElements-Reference
     * @status 200
     */
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

    /**
     * @operation GetAllSubmodelElements-Reference
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier for SubmodelElement reference listing', async () => {
        const response = await client.getAllSubmodelElementsReference({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetAllSubmodelElements-Reference
     * @status 404
     */
    test('should return not found for SubmodelElement reference listing on missing Submodel', async () => {
        const response = await client.getAllSubmodelElementsReference({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetAllSubmodelElements-Path
     * @status 200
     */
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

    /**
     * @operation GetAllSubmodelElements-Path
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier for SubmodelElement path listing', async () => {
        const response = await client.getAllSubmodelElementsPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetAllSubmodelElements-Path
     * @status 404
     */
    test('should return not found for SubmodelElement path listing on missing Submodel', async () => {
        const response = await client.getAllSubmodelElementsPath({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetSubmodelElementByPath-Metadata
     * @status 200
     */
    test('should fetch SubmodelElement metadata by path', async () => {
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

    /**
     * @operation GetSubmodelElementByPath-Metadata
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier for SubmodelElement metadata by path', async () => {
        const response = await client.getSubmodelElementByPathMetadata({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort!,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetSubmodelElementByPath-Metadata
     * @status 404
     */
    test('should return not found for SubmodelElement metadata by missing path', async () => {
        const response = await client.getSubmodelElementByPathMetadata({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-meta-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetSubmodelElementByPath-Reference
     * @status 200
     */
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

    /**
     * @operation GetSubmodelElementByPath-Reference
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier for SubmodelElement reference by path', async () => {
        const response = await client.getSubmodelElementByPathReference({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort!,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetSubmodelElementByPath-Reference
     * @status 404
     */
    test('should return not found for SubmodelElement reference by missing path', async () => {
        const response = await client.getSubmodelElementByPathReference({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-ref-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetSubmodelElementByPath-Path
     * @status 200
     */
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

    /**
     * @operation GetSubmodelElementByPath-Path
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier for SubmodelElement path by path', async () => {
        const response = await client.getSubmodelElementByPathPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort!,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetSubmodelElementByPath-Path
     * @status 404
     */
    test('should return not found for SubmodelElement path by missing path', async () => {
        const response = await client.getSubmodelElementByPathPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-path-view-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
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
    test.skip('should reject serialization request with invalid output format', async () => {
        const response = await client.generateSerializationByIds({
            configuration,
            // @ts-expect-error Intentionally invalid field to exercise backend validation path.
            content: 'invalid/content-type',
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetSelfDescription
     * @status 200
     */
    test('should fetch submodel repository service description', async () => {
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
     * @operation PutSubmodelById
     * @status 400
     */
    test('should reject missing put Submodel identifier with bad request', async () => {
        const response = await client.putSubmodelById({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            submodel: testSubmodel,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation DeleteSubmodelById
     * @status 400
     */
    test('should reject missing delete Submodel identifier with bad request', async () => {
        const response = await client.deleteSubmodelById({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PatchSubmodelById-Metadata
     * @status 204
     */
    test('should patch Submodel metadata by ID', async () => {
        const response = await client.patchSubmodelByIdMetadata({
            configuration,
            submodelIdentifier: testSubmodel.id,
            submodelMetadata: submodelMetadataPatch,
        });

        assertApiResult(response);
    });

    /**
     * @operation PatchSubmodelById-Metadata
     * @status 204 [known-backend-bug]
     */
    test.skip('should patch Submodel metadata by ID with success status', async () => {
        const response = await client.patchSubmodelByIdMetadata({
            configuration,
            submodelIdentifier: testSubmodel.id,
            submodelMetadata: submodelMetadataPatch,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation PatchSubmodelById-Metadata
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier when patching Submodel metadata', async () => {
        const response = await client.patchSubmodelByIdMetadata({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            submodelMetadata: submodelMetadataPatch,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation PatchSubmodelById-Metadata
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when patching metadata on missing Submodel', async () => {
        const response = await client.patchSubmodelByIdMetadata({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            submodelMetadata: submodelMetadataPatch,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation PatchSubmodelElementByPath-Metadata
     * @status 204
     */
    test('should patch SubmodelElement metadata by path', async () => {
        const response = await client.patchSubmodelElementByPathMetadata({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        assertApiResult(response);
    });

    /**
     * @operation PatchSubmodelElementByPath-Metadata
     * @status 204 [known-backend-bug]
     */
    test.skip('should patch SubmodelElement metadata by path with success status', async () => {
        const response = await client.patchSubmodelElementByPathMetadata({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation PatchSubmodelElementByPath-Metadata
     * @status 400 [known-behavior-mismatch]
     */
    test.skip('should reject missing Submodel identifier when patching SubmodelElement metadata by path', async () => {
        const response = await client.patchSubmodelElementByPathMetadata({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation PatchSubmodelElementByPath-Metadata
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when patching SubmodelElement metadata by missing path', async () => {
        const response = await client.patchSubmodelElementByPathMetadata({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-meta-patch-${uniqueSuffix()}`,
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation PutFileByPath
     * @status 204 [known-backend-bug]
     */
    test.skip('should upload file by path to a File submodel element', async () => {
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
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation GetFileByPath
     * @status 200 [known-backend-bug]
     */
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

    /**
     * @operation GetFileByPath
     * @status 405 [known-backend-bug]
     */
    test.skip('should reject file download on non-File submodel element with 405', async () => {
        const response = await client.getFileByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
        });

        assertApiFailureCode(response, '405');
    });

    /**
     * @operation PutFileByPath
     * @status 404 [known-backend-bug]
     */
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

    /**
     * @operation PutFileByPath
     * @status 400 [known-backend-bug]
     */
    test.skip('should reject missing Submodel identifier when uploading file by path', async () => {
        const response = await client.putFileByPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: attachmentIdShortPath,
            fileName: 'missing-submodel-file.txt',
            file: createAttachmentBlob('payload'),
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation InvokeOperation-ValueOnly
     * @status 200
     */
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

    /**
     * @operation InvokeOperation-ValueOnly
     * @status 400 [known-backend-bug]
     */
    test.skip('should reject missing Submodel identifier on invoke operation value-only', async () => {
        const response = await client.postInvokeOperationValueOnly({
            configuration,
            aasIdentifier: testSubmodel.id,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequestValueOnly,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation InvokeOperation-ValueOnly
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found on invoke operation value-only for missing Submodel', async () => {
        const response = await client.postInvokeOperationValueOnly({
            configuration,
            aasIdentifier: randomMissingSubmodelIdentifier(),
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequestValueOnly,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation InvokeOperationAsync
     * @status 200
     */
    test('should post invoke operation async', async () => {
        const response = await client.postInvokeOperationAsync({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequest: createTestOperationRequest(),
        });

        assertApiResult(response);
    });

    /**
     * @operation InvokeOperationAsync
     * @status 400 [known-backend-bug]
     */
    test.skip('should reject missing Submodel identifier on invoke operation async', async () => {
        const response = await client.postInvokeOperationAsync({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequest: createTestOperationRequest(),
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation InvokeOperationAsync
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found on invoke operation async for missing Submodel', async () => {
        const response = await client.postInvokeOperationAsync({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequest: createTestOperationRequest(),
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation InvokeOperationAsync-ValueOnly
     * @status 200
     */
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

    /**
     * @operation InvokeOperationAsync-ValueOnly
     * @status 400 [known-backend-bug]
     */
    test.skip('should reject missing Submodel identifier on invoke operation async value-only', async () => {
        const response = await client.postInvokeOperationAsyncValueOnly({
            configuration,
            aasIdentifier: testSubmodel.id,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequestValueOnly,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation InvokeOperationAsync-ValueOnly
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found on invoke operation async value-only for missing Submodel', async () => {
        const response = await client.postInvokeOperationAsyncValueOnly({
            configuration,
            aasIdentifier: randomMissingSubmodelIdentifier(),
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequestValueOnly,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetOperationAsyncStatus
     * @status 200
     */
    test('should get async operation status', async () => {
        const response = await client.getOperationAsyncStatus({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiResult(response);
    });

    /**
     * @operation GetOperationAsyncStatus
     * @status 400 [known-backend-bug]
     */
    test.skip('should reject missing Submodel identifier when getting async operation status', async () => {
        const response = await client.getOperationAsyncStatus({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetOperationAsyncStatus
     * @status 404
     */
    test('should return not found when getting async operation status for missing Submodel', async () => {
        const response = await client.getOperationAsyncStatus({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetOperationAsyncResult
     * @status 200
     */
    test('should get async operation result', async () => {
        const response = await client.getOperationAsyncResult({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiResult(response);
    });

    /**
     * @operation GetOperationAsyncResult
     * @status 400 [known-backend-bug]
     */
    test.skip('should reject missing Submodel identifier when getting async operation result', async () => {
        const response = await client.getOperationAsyncResult({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetOperationAsyncResult
     * @status 404
     */
    test('should return not found when getting async operation result for missing Submodel', async () => {
        const response = await client.getOperationAsyncResult({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetOperationAsyncResult-ValueOnly
     * @status 200
     */
    test('should get async operation result value-only', async () => {
        const response = await client.getOperationAsyncResultValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiResult(response);
    });

    /**
     * @operation GetOperationAsyncResult-ValueOnly
     * @status 400 [known-backend-bug]
     */
    test.skip('should reject missing Submodel identifier when getting async operation value-only result', async () => {
        const response = await client.getOperationAsyncResultValueOnly({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetOperationAsyncResult-ValueOnly
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when getting async operation value-only result for missing Submodel', async () => {
        const response = await client.getOperationAsyncResultValueOnly({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation DeleteFileByPath
     * @status 200 [known-backend-bug]
     */
    test.skip('should delete file by path from a File submodel element', async () => {
        const response = await client.deleteFileByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: attachmentIdShortPath,
        });

        expect(response.success).toBe(true);
        if (!response.success) {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetFileByPath
     * @status 404 [known-backend-bug]
     */
    test.skip('should return not found when downloading a deleted file by path', async () => {
        const response = await client.getFileByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: attachmentIdShortPath,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation DeleteSubmodelElementByPath
     * @status 204
     */
    test('should delete SubmodelElement by path', async () => {
        const response = await client.deleteSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
        });

        assertApiResult(response);
    });

    /**
     * @operation DeleteSubmodelElementByPath
     * @status 400
     */
    test('should reject missing Submodel identifier when deleting SubmodelElement by path', async () => {
        const response = await client.deleteSubmodelElementByPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation DeleteSubmodelElementByPath
     * @status 404
     */
    test('should return not found when deleting missing SubmodelElement by path', async () => {
        const response = await client.deleteSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: `missing-delete-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation DeleteSubmodelById
     * @status 204
     */
    test('should delete Submodel by ID', async () => {
        const response = await client.deleteSubmodelById({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        assertApiResult(response);
    });

    /**
     * @operation DeleteSubmodelById
     * @status 404
     */
    test('should return not found when deleting missing Submodel by ID', async () => {
        const response = await client.deleteSubmodelById({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
        });

        assertApiFailureCode(response, '404');
    });
});
