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
import { createPerTestCleanupRunner } from './fixtures/testCleanup';
import { getIntegrationBasePath } from './testEngineConfig';

describe('Submodel Repository Integration Tests', () => {
    const client = new SubmodelRepositoryClient();
    const testSubmodel = createTestSubmodel();
    const testSubmodelElement = createTestSubmodelElement();
    const testFileSubmodelElement = createTestFileSubmodelElement();
    const attachmentPayload = 'coverage-attachment-payload';
    //const OPERATION_REQUEST = createTestOperationRequest();
    //const OPERATION_RESULT = createTestOperationResult();
    //const testOperationSubmodelElement = createTestOperationElement();
    const configuration = new Configuration({
        basePath: getIntegrationBasePath('submodelRepository'),
    });
    const { submodelMetadataPatch, submodelElementMetadataPatch, operationRequestValueOnly } =
        createSubmodelRepositoryPayloadFixtures(testSubmodel.id);
    const uniqueSuffix = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { track } = createPerTestCleanupRunner();

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

    function createUniqueSubmodelFixture() {
        const submodel = createTestSubmodel();
        submodel.id = `${submodel.id}-fixture-${uniqueSuffix()}`;
        submodel.idShort = `${submodel.idShort ?? 'submodel'}Fixture${uniqueSuffix()}`;
        registerSubmodelCleanup(submodel.id);
        return submodel;
    }

    async function seedSubmodelElement(
        submodelIdentifier: string,
        submodelElement: ReturnType<typeof createTestSubmodelElement>
    ) {
        const response = await client.postSubmodelElement({
            configuration,
            submodelIdentifier,
            submodelElement,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
        }
    }

    async function seedSubmodelCollection(
        submodelIdentifier: string,
        collectionElement: ReturnType<typeof createTestSubmodelElementCollection>
    ) {
        const response = await client.postSubmodelElement({
            configuration,
            submodelIdentifier,
            submodelElement: collectionElement,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
        }
    }

    async function seedFileSubmodelElement(submodelIdentifier: string): Promise<string> {
        const fileSubmodelElement = createTestFileSubmodelElement();
        fileSubmodelElement.idShort = `fileElement-${uniqueSuffix()}`;

        const response = await client.postSubmodelElement({
            configuration,
            submodelIdentifier,
            submodelElement: fileSubmodelElement,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
        }

        return fileSubmodelElement.idShort ?? 'testFileElement';
    }

    function registerSubmodelCleanup(submodelIdentifier: string): void {
        track(async () => {
            const cleanupResponse = await client.deleteSubmodelById({
                configuration,
                submodelIdentifier,
            });

            if (!cleanupResponse.success && cleanupResponse.statusCode !== 404) {
                throw new Error(
                    `Failed to cleanup submodel ${submodelIdentifier} (status ${cleanupResponse.statusCode})`
                );
            }
        });
    }

    /**
     * @operation PostSubmodel
     * @status 201
     */
    test('should create a new Submodel', async () => {
        const createdSubmodel = createTestSubmodel();
        createdSubmodel.id = `${createdSubmodel.id}-create-${uniqueSuffix()}`;
        createdSubmodel.idShort = `${createdSubmodel.idShort ?? 'submodel'}Create${uniqueSuffix()}`;
        registerSubmodelCleanup(createdSubmodel.id);

        const response = await client.postSubmodel({
            configuration,
            submodel: createdSubmodel,
        });

        // Log the error details if the request failed
        if (!response.success && response.error) {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(createdSubmodel);
        }
    });

    /**
     * @operation PostSubmodel
     * @status 400
     */
    test('should reject invalid Submodel payload with bad request', async () => {
        const rawResponse = await fetch(`${configuration.basePath}/submodels`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });

        expect(rawResponse.status).toBe(400);
    });

    /**
     * @operation PostSubmodel
     * @status 409
     */
    test('should return conflict when creating a duplicate Submodel', async () => {
        const duplicateSubmodel = createTestSubmodel();
        duplicateSubmodel.id = `${duplicateSubmodel.id}-duplicate-${uniqueSuffix()}`;
        registerSubmodelCleanup(duplicateSubmodel.id);

        const createResponse = await client.postSubmodel({
            configuration,
            submodel: duplicateSubmodel,
        });

        expect(createResponse.success).toBe(true);
        if (createResponse.success) {
            expect(createResponse.statusCode).toBe(201);
        }

        const response = await client.postSubmodel({
            configuration,
            submodel: duplicateSubmodel,
        });

        assertApiFailureCode(response, '409');
        if (!response.success) {
            expect(response.statusCode).toBe(409);
        }
    });

    /**
     * @operation GetSubmodelById
     * @status 200
     */
    test('should fetch a Submodel by ID', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });

        expect(createResponse.success).toBe(true);

        const response = await client.getSubmodelById({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.id).toEqual(scopedSubmodel.id);
            expect(response.data.idShort).toEqual(scopedSubmodel.idShort);
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
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });

        expect(createResponse.success).toBe(true);

        const response = await client.getAllSubmodels({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
            expect((response.data.result ?? []).map((submodel) => submodel.id)).toContain(scopedSubmodel.id);
        }
    });

    /**
     * @operation GetAllSubmodels
     * @status 400
     */
    test('should reject invalid Submodel list query with bad request', async () => {
        const response = await client.getAllSubmodels({
            configuration,
            limit: -1,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    // Go backend returns a non-conforming payload/error for this endpoint in the current environment.
    /**
     * @operation PostSubmodelElement_SubmodelRepo
     * @status 201
     */
    test('should create a new SubmodelElement', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const createdSubmodelElement = createNewSubmodelElement();
        createdSubmodelElement.idShort = `testPropertyCreate-${uniqueSuffix()}`;

        const response = await client.postSubmodelElement({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            submodelElement: createdSubmodelElement,
        });

        // Log the error details if the request failed
        if (!response.success && response.error) {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(createdSubmodelElement);
        }
    });

    /**
     * @operation PostSubmodelElement_SubmodelRepo
     * @status 409
     */
    test('should return conflict when creating duplicate SubmodelElement', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const duplicateSubmodelElement = createNewSubmodelElement();
        duplicateSubmodelElement.idShort = `dup-${uniqueSuffix()}`;

        const createElementResponse = await client.postSubmodelElement({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            submodelElement: duplicateSubmodelElement,
        });

        expect(createElementResponse.success).toBe(true);
        if (createElementResponse.success) {
            expect(createElementResponse.statusCode).toBe(201);
        }

        const response = await client.postSubmodelElement({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            submodelElement: duplicateSubmodelElement,
        });

        assertApiFailureCode(response, '409');
        if (!response.success) {
            expect(response.statusCode).toBe(409);
        }
    });

    /**
     * @operation PostSubmodelElement_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier when creating a SubmodelElement', async () => {
        const response = await client.postSubmodelElement({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            submodelElement: testSubmodelElement,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PostSubmodelElement_SubmodelRepo
     * @status 404
     */
    test('should return not found when creating a SubmodelElement for a missing Submodel', async () => {
        const response = await client.postSubmodelElement({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            submodelElement: testSubmodelElement,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PutSubmodelById
     * @status 201
     */
    test('should create a Submodel through put by ID with created status', async () => {
        const putSubmodel = createTestSubmodel();
        putSubmodel.id = `${putSubmodel.id}-put-${uniqueSuffix()}`;
        registerSubmodelCleanup(putSubmodel.id);

        const response = await client.putSubmodelById({
            configuration,
            submodelIdentifier: putSubmodel.id,
            submodel: putSubmodel,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data).toBeDefined();
        }
    });

    /**
     * @operation PutSubmodelById
     * @status 204
     */
    test('should update a Submodel', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const updatedProperty = createTestSubmodelElement();
        updatedProperty.idShort = `updated-property-${uniqueSuffix()}`;
        const updatedCollection = createTestSubmodelElementCollection();
        updatedCollection.idShort = `updated-collection-${uniqueSuffix()}`;
        const updatedNewElement = createNewSubmodelElement();
        updatedNewElement.idShort = `updated-new-${uniqueSuffix()}`;
        const updatedFileElement = createTestFileSubmodelElement();
        updatedFileElement.idShort = `updated-file-${uniqueSuffix()}`;

        const updatedSubmodel = createTestSubmodel();
        updatedSubmodel.id = scopedSubmodel.id;
        updatedSubmodel.idShort = `${scopedSubmodel.idShort ?? 'submodel'}Updated${uniqueSuffix()}`;
        updatedSubmodel.submodelElements = [updatedProperty, updatedCollection, updatedNewElement, updatedFileElement];

        const updateResponse = await client.putSubmodelById({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            submodel: updatedSubmodel,
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
            expect(updateResponse.statusCode).toBe(204);
        }

        const fetchResponse = await client.getSubmodelById({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data.id).toEqual(updatedSubmodel.id);
            expect(fetchResponse.data.idShort).toEqual(updatedSubmodel.idShort);

            const idShorts = (fetchResponse.data.submodelElements ?? []).map((element) => element.idShort);
            expect(idShorts).toContain(updatedProperty.idShort);
            expect(idShorts).toContain(updatedCollection.idShort);
            expect(idShorts).toContain(updatedNewElement.idShort);
            expect(idShorts).toContain(updatedFileElement.idShort);
        }
    });

    /**
     * @operation PatchSubmodelById
     * @status 204
     */
    test('should patch a Submodel by ID', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const patchedSubmodel = createTestSubmodel();
        patchedSubmodel.id = scopedSubmodel.id;
        patchedSubmodel.description = [createDescription()];

        const response = await client.patchSubmodelById({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            submodel: patchedSubmodel,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation PatchSubmodelById
     * @status 400
     */
    test('should reject missing Submodel identifier when patching Submodel by ID', async () => {
        const response = await client.patchSubmodelById({
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
     * @operation PatchSubmodelById
     * @status 404
     */
    test('should return not found when patching missing Submodel by ID', async () => {
        const missingSubmodelId = randomMissingSubmodelIdentifier();
        const missingSubmodel = createTestSubmodel();
        missingSubmodel.id = missingSubmodelId;

        const response = await client.patchSubmodelById({
            configuration,
            submodelIdentifier: missingSubmodelId,
            submodel: missingSubmodel,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PatchSubmodelById-ValueOnly
     * @status 204
     */
    test('should patch a Submodel by ID in value-only representation', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const valueOnlyElement = createTestSubmodelElement();
        valueOnlyElement.idShort = `value-only-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, valueOnlyElement);

        const response = await client.patchSubmodelByIdValueOnly({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            body: {
                [valueOnlyElement.idShort ?? 'testProperty']: createValue(),
            },
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation PatchSubmodelById-ValueOnly
     * @status 400
     */
    test('should reject missing Submodel identifier when patching Submodel value-only by ID', async () => {
        const response = await client.patchSubmodelByIdValueOnly({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            body: {
                [`missing-id-${uniqueSuffix()}`]: createValue(),
            },
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation PatchSubmodelById-ValueOnly
     * @status 404
     */
    test('should return not found when patching value-only Submodel for missing ID', async () => {
        const response = await client.patchSubmodelByIdValueOnly({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            body: {
                [`missing-id-${uniqueSuffix()}`]: createValue(),
            },
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetAllSubmodelElements
     * @status 200
     */
    test('should fetch all SubmodelElements', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createTestSubmodelElement();
        seededElement.idShort = `seeded-property-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const response = await client.getAllSubmodelElements({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
            const matchingElement = (response.data.result ?? []).find(
                (element) => element.idShort === seededElement.idShort
            ) as { value?: unknown } | undefined;
            expect(matchingElement).toBeDefined();
            expect(typeof matchingElement?.value).toBe('string');
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
     * @operation GetSubmodelElementByPath_SubmodelRepo
     * @status 200
     */
    test('should fetch SubmodelElement by the path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createTestSubmodelElement();
        seededElement.idShort = `path-property-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const response = await client.getSubmodelElementByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: seededElement.idShort!,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            const propertyResponse = response.data as { idShort?: string; value?: unknown };
            expect(propertyResponse.idShort).toBe(seededElement.idShort);
            expect(typeof propertyResponse.value).toBe('string');
        }
    });

    /**
     * @operation GetSubmodelElementByPath_SubmodelRepo
     * @status 404
     */
    test('should return not found when fetching SubmodelElement by missing path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getSubmodelElementByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: `missing-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation GetSubmodelElementByPath_SubmodelRepo
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
     * @operation PostSubmodelElementByPath_SubmodelRepo
     * @status 201
     */
    test('should create a new SubmodelElement at a specified path within submodel elements hierarchy', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const parentCollection = createTestSubmodelElementCollection();
        parentCollection.idShort = `parentCollection-${uniqueSuffix()}`;
        await seedSubmodelCollection(scopedSubmodel.id, parentCollection);

        const nestedSubmodelElement = createNewSubmodelElement();
        nestedSubmodelElement.idShort = `nestedProperty-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: parentCollection.idShort!,
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
     * @operation PostSubmodelElementByPath_SubmodelRepo
     * @status 409
     */
    test('should return conflict when creating duplicate SubmodelElement by path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const parentCollection = createTestSubmodelElementCollection();
        parentCollection.idShort = `parentCollection-${uniqueSuffix()}`;
        await seedSubmodelCollection(scopedSubmodel.id, parentCollection);

        const nestedSubmodelElement = createNewSubmodelElement();
        nestedSubmodelElement.idShort = `conflict-${uniqueSuffix()}`;

        const createElementResponse = await client.postSubmodelElementByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: parentCollection.idShort!,
            submodelElement: nestedSubmodelElement,
        });

        expect(createElementResponse.success).toBe(true);
        if (createElementResponse.success) {
            expect(createElementResponse.statusCode).toBe(201);
        }

        const response = await client.postSubmodelElementByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: parentCollection.idShort!,
            submodelElement: nestedSubmodelElement,
        });

        assertApiFailureCode(response, '409');
        if (!response.success) {
            expect(response.statusCode).toBe(409);
        }
    });

    /**
     * @operation PostSubmodelElementByPath_SubmodelRepo
     * @status 404
     */
    test('should return not found when creating SubmodelElement for missing path parent', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const nestedSubmodelElement = createNewSubmodelElement();
        nestedSubmodelElement.idShort = `nested-${uniqueSuffix()}`;

        const response = await client.postSubmodelElementByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: `missing-collection-${uniqueSuffix()}`,
            submodelElement: nestedSubmodelElement,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PostSubmodelElementByPath_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier when creating SubmodelElement by path', async () => {
        const nestedSubmodelElement = createNewSubmodelElement();
        const response = await client.postSubmodelElementByPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: `missing-id-${uniqueSuffix()}`,
            submodelElement: nestedSubmodelElement,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PutSubmodelElementByPath_SubmodelRepo
     * @status 204
     */
    test('should update the submodel element at the specified path ', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createTestSubmodelElement();
        seededElement.idShort = `putByPath-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const updatedSubmodelElement = createTestSubmodelElement();
        updatedSubmodelElement.idShort = seededElement.idShort;
        const description = createDescription();
        updatedSubmodelElement.description = [description];

        const updateResponse = await client.putSubmodelElementByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: seededElement.idShort!,
            submodelElement: updatedSubmodelElement,
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
            expect(updateResponse.statusCode).toBe(204);
        }

        const fetchResponse = await client.getSubmodelElementByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: seededElement.idShort!,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedSubmodelElement);
        }
    });

    /**
     * @operation PutSubmodelElementByPath_SubmodelRepo
     * @status 201
     */
    test('should create a new SubmodelElement via put by path with created status', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const parentCollection = createTestSubmodelElementCollection();
        parentCollection.idShort = `putParent-${uniqueSuffix()}`;
        await seedSubmodelCollection(scopedSubmodel.id, parentCollection);

        const createdElement = createNewSubmodelElement();
        createdElement.idShort = `put-created-${uniqueSuffix()}`;

        const response = await client.putSubmodelElementByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: `${parentCollection.idShort}.${createdElement.idShort}`,
            submodelElement: createdElement,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
        }
    });

    /**
     * @operation PutSubmodelElementByPath_SubmodelRepo
     * @status 404
     */
    test('should return not found when updating SubmodelElement by path for a missing Submodel', async () => {
        const replacementElement = createNewSubmodelElement();
        replacementElement.idShort = `missing-submodel-path-${uniqueSuffix()}`;

        const response = await client.putSubmodelElementByPath({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            idShortPath: replacementElement.idShort!,
            submodelElement: replacementElement,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PutSubmodelElementByPath_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier when updating SubmodelElement by path', async () => {
        const replacementElement = createNewSubmodelElement();
        replacementElement.idShort = `missing-id-path-${uniqueSuffix()}`;

        const response = await client.putSubmodelElementByPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: replacementElement.idShort!,
            submodelElement: replacementElement,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PatchSubmodelElementByPath_SubmodelRepo
     * @status 204
     */
    test('should patch SubmodelElement by path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createTestSubmodelElement();
        seededElement.idShort = `patchByPath-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const patchedSubmodelElement = createNewSubmodelElement();
        patchedSubmodelElement.idShort = seededElement.idShort;

        const response = await client.patchSubmodelElementByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: seededElement.idShort!,
            submodelElement: patchedSubmodelElement,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation PatchSubmodelElementByPath_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier when patching SubmodelElement by path', async () => {
        const response = await client.patchSubmodelElementByPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: `missing-id-${uniqueSuffix()}`,
            submodelElement: testSubmodelElement,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation PatchSubmodelElementByPath_SubmodelRepo
     * @status 404
     */
    test('should return not found when patching missing SubmodelElement by path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.patchSubmodelElementByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: `missing-patch-se-${uniqueSuffix()}`,
            submodelElement: testSubmodelElement,
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    // Go backend currently responds with an error for metadata-by-id retrieval.
    /**
     * @operation GetSubmodelById-Metadata
     * @status 200
     */
    test('should fetch Submodel metadata by ID', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getSubmodelByIdMetadata({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.id).toEqual(scopedSubmodel.id);
            expect(response.data.idShort).toEqual(scopedSubmodel.idShort);
        }
    });

    /**
     * @operation GetSubmodelById-Metadata
     * @status 400
     */
    test('should reject missing Submodel identifier when fetching metadata by ID', async () => {
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
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createTestSubmodelElement();
        seededElement.idShort = `valueOnlySubmodel-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const response = await client.getSubmodelByIdValueOnly({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(typeof response.data).toBe('object');
            expect(Object.keys(response.data).length).toBeGreaterThan(0);
        }
    });

    /**
     * @operation GetSubmodelById-ValueOnly
     * @status 400
     */
    test('should reject missing Submodel identifier for ValueOnly Submodel retrieval', async () => {
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
     * @operation GetSubmodelElementByPath-ValueOnly_SubmodelRepo
     * @status 200
     */
    test('should fetch SubmodelElement by path in the ValueOnly representation', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createNewSubmodelElement();
        seededElement.idShort = `valueOnlyByPath-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const response = await client.getSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: seededElement.idShort!,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            const newPropertyElement = seededElement as { value?: unknown };

            expect(response.data).toBeDefined();
            expect(response.data).toEqual(newPropertyElement.value);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-ValueOnly_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier for ValueOnly SubmodelElement retrieval', async () => {
        const response = await client.getSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetSubmodelElementByPath-ValueOnly_SubmodelRepo
     * @status 404
     */
    test('should return not found for ValueOnly SubmodelElement retrieval with missing path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: `missing-value-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation PatchSubmodelElementByPath-ValueOnly_SubmodelRepo
     * @status 204
     */
    test('should update SubmodelElement in the ValueOnly representation', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createNewSubmodelElement();
        seededElement.idShort = `valueOnlyPatch-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const updatedPropertyValue = createValue();
        const updatedSubmodelElement = seededElement as { value?: unknown };
        updatedSubmodelElement.value = updatedPropertyValue;

        const updateResponse = await client.patchSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: seededElement.idShort!,
            submodelElementValue: updatedPropertyValue,
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
            expect(updateResponse.statusCode).toBe(204);
        }

        const fetchResponse = await client.getSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: seededElement.idShort!,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedPropertyValue);
        }
    });

    /**
     * @operation PatchSubmodelElementByPath-ValueOnly_SubmodelRepo
     * @status 404
     */
    test('should return not found when patching ValueOnly SubmodelElement for missing path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.patchSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: `missing-patch-path-${uniqueSuffix()}`,
            submodelElementValue: createValue(),
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation PatchSubmodelElementByPath-ValueOnly_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier when patching ValueOnly SubmodelElement', async () => {
        const response = await client.patchSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: `missing-id-${uniqueSuffix()}`,
            submodelElementValue: createValue(),
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetAllSubmodels-Metadata
     * @status 200
     */
    test('should fetch all Submodels in metadata representation', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getAllSubmodelsMetadata({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.result).toBeDefined();
            const resultIds = (response.data.result ?? []).map((submodel) => submodel.id);
            expect(resultIds).toContain(scopedSubmodel.id);
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
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getAllSubmodelsValueOnly({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.result).toBeDefined();
        }
    });

    /**
     * @operation GetAllSubmodels-ValueOnly
     * @status 400
     */
    test('should reject invalid value-only Submodel list query with bad request', async () => {
        const response = await client.getAllSubmodelsValueOnly({
            configuration,
            limit: -1,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetAllSubmodels-ValueOnly
     * @status 404 [known-specification-bug]
     */
    test.skip('should return not found for value-only Submodel list with unavailable cursor', async () => {
        const response = await client.getAllSubmodelsValueOnly({
            configuration,
            cursor: `missing-value-only-cursor-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetAllSubmodels-Reference
     * @status 200
     */
    test('should fetch references to all Submodels', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getAllSubmodelsReference({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.result).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
        }
    });

    /**
     * @operation GetAllSubmodels-Reference
     * @status 400
     */
    test('should reject invalid Submodel reference list query with bad request', async () => {
        const response = await client.getAllSubmodelsReference({
            configuration,
            limit: -1,
        });

        assertApiFailureCode(response, '400');
        if (!response.success) {
            expect(response.statusCode).toBe(400);
        }
    });

    /**
     * @operation GetAllSubmodels-Path
     * @status 200
     */
    test('should fetch paths of all Submodels', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getAllSubmodelsPath({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data.result).toBeDefined();
        }
    });

    /**
     * @operation GetAllSubmodels-Path
     * @status 400
     */
    test('should reject invalid Submodel path list query with bad request', async () => {
        const response = await client.getAllSubmodelsPath({
            configuration,
            limit: -1,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetSubmodelById-Reference
     * @status 200
     */
    test('should fetch Submodel by ID in reference representation', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getSubmodelByIdReference({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.keys).toBeDefined();
        }
    });

    /**
     * @operation GetSubmodelById-Reference
     * @status 400
     */
    test('should reject missing Submodel identifier in reference retrieval', async () => {
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
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createTestSubmodelElement();
        seededElement.idShort = `pathRepresentation-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const response = await client.getSubmodelByIdPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.length).toBeGreaterThan(0);
        }
    });

    /**
     * @operation GetSubmodelById-Path
     * @status 400
     */
    test('should reject missing Submodel identifier in path retrieval', async () => {
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
     * @operation GetAllSubmodelElements-Metadata_SubmodelRepo
     * @status 200
     */
    test('should fetch all SubmodelElements in metadata representation', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createNewSubmodelElement();
        seededElement.idShort = `metadataList-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const response = await client.getAllSubmodelElementsMetadata({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.result).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Metadata_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier for SubmodelElement metadata listing', async () => {
        const response = await client.getAllSubmodelElementsMetadata({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetAllSubmodelElements-Metadata_SubmodelRepo
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
     * @operation GetAllSubmodelElements-ValueOnly_SubmodelRepo
     * @status 200
     */
    test('should fetch all SubmodelElements in value-only representation', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createNewSubmodelElement();
        seededElement.idShort = `valueOnlyList-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const response = await client.getAllSubmodelElementsValueOnly({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.result).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
        }
    });

    /**
     * @operation GetAllSubmodelElements-ValueOnly_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier for SubmodelElement value-only listing', async () => {
        const response = await client.getAllSubmodelElementsValueOnly({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetAllSubmodelElements-ValueOnly_SubmodelRepo
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
     * @operation GetAllSubmodelElements-Reference_SubmodelRepo
     * @status 200
     */
    test('should fetch references to all SubmodelElements', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createNewSubmodelElement();
        seededElement.idShort = `referenceList-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const response = await client.getAllSubmodelElementsReference({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.result).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Reference_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier for SubmodelElement reference listing', async () => {
        const response = await client.getAllSubmodelElementsReference({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetAllSubmodelElements-Reference_SubmodelRepo
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
     * @operation GetAllSubmodelElements-Path_SubmodelRepo
     * @status 200
     */
    test('should fetch paths of all SubmodelElements', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createNewSubmodelElement();
        seededElement.idShort = `pathList-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const response = await client.getAllSubmodelElementsPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.result).toBeDefined();
            expect((response.data.result ?? []).length).toBeGreaterThan(0);
        }
    });

    /**
     * @operation GetAllSubmodelElements-Path_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier for SubmodelElement path listing', async () => {
        const response = await client.getAllSubmodelElementsPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetAllSubmodelElements-Path_SubmodelRepo
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
     * @operation GetSubmodelElementByPath-Metadata_SubmodelRepo
     * @status 200
     */
    test('should fetch SubmodelElement metadata by path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createNewSubmodelElement();
        seededElement.idShort = `metaByPath-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const response = await client.getSubmodelElementByPathMetadata({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: seededElement.idShort!,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.idShort).toEqual(seededElement.idShort);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Metadata_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier for SubmodelElement metadata by path', async () => {
        const response = await client.getSubmodelElementByPathMetadata({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetSubmodelElementByPath-Metadata_SubmodelRepo
     * @status 404
     */
    test('should return not found for SubmodelElement metadata by missing path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getSubmodelElementByPathMetadata({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: `missing-meta-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetSubmodelElementByPath-Reference_SubmodelRepo
     * @status 200
     */
    test('should fetch SubmodelElement reference by path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createNewSubmodelElement();
        seededElement.idShort = `referenceByPath-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const response = await client.getSubmodelElementByPathReference({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: seededElement.idShort!,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.keys).toBeDefined();
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Reference_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier for SubmodelElement reference by path', async () => {
        const response = await client.getSubmodelElementByPathReference({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetSubmodelElementByPath-Reference_SubmodelRepo
     * @status 404
     */
    test('should return not found for SubmodelElement reference by missing path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getSubmodelElementByPathReference({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: `missing-ref-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetSubmodelElementByPath-Path_SubmodelRepo
     * @status 200
     */
    test('should fetch SubmodelElement path by path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createNewSubmodelElement();
        seededElement.idShort = `pathByPath-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const response = await client.getSubmodelElementByPathPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: seededElement.idShort!,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.length).toBeGreaterThan(0);
        }
    });

    /**
     * @operation GetSubmodelElementByPath-Path_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier for SubmodelElement path by path', async () => {
        const response = await client.getSubmodelElementByPathPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation GetSubmodelElementByPath-Path_SubmodelRepo
     * @status 404
     */
    test('should return not found for SubmodelElement path by missing path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getSubmodelElementByPathPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
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
        const payloadSubmodel = createTestSubmodel();

        const response = await client.putSubmodelById({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            submodel: payloadSubmodel,
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
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const scopedMetadataPatch = {
            ...submodelMetadataPatch,
            id: scopedSubmodel.id,
            idShort: scopedSubmodel.idShort,
        };

        const response = await client.patchSubmodelByIdMetadata({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            submodelMetadata: scopedMetadataPatch,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation PatchSubmodelById-Metadata
     * @status 400
     */
    test('should reject missing Submodel identifier when patching Submodel metadata', async () => {
        const payloadMetadataPatch = {
            ...submodelMetadataPatch,
            id: `missing-id-${uniqueSuffix()}`,
        };

        const response = await client.patchSubmodelByIdMetadata({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            submodelMetadata: payloadMetadataPatch,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation PatchSubmodelById-Metadata
     * @status 404
     */
    test('should return not found when patching metadata on missing Submodel', async () => {
        const missingSubmodelIdentifier = randomMissingSubmodelIdentifier();
        const response = await client.patchSubmodelByIdMetadata({
            configuration,
            submodelIdentifier: missingSubmodelIdentifier,
            submodelMetadata: {
                ...submodelMetadataPatch,
                id: missingSubmodelIdentifier,
            },
        });

        assertApiFailureCode(response, '404');
        if (!response.success) {
            expect(response.statusCode).toBe(404);
        }
    });

    /**
     * @operation PatchSubmodelElementByPath-Metadata_SubmodelRepo
     * @status 204
     */
    test('should patch SubmodelElement metadata by path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createNewSubmodelElement();
        seededElement.idShort = `metadataPatch-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const response = await client.patchSubmodelElementByPathMetadata({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: seededElement.idShort ?? 'testProperty',
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation PatchSubmodelElementByPath-Metadata_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier when patching SubmodelElement metadata by path', async () => {
        const response = await client.patchSubmodelElementByPathMetadata({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: `missing-id-${uniqueSuffix()}`,
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation PatchSubmodelElementByPath-Metadata_SubmodelRepo
     * @status 404
     */
    test('should return not found when patching SubmodelElement metadata by missing path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.patchSubmodelElementByPathMetadata({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: `missing-meta-patch-${uniqueSuffix()}`,
            submodelElementMetadata: submodelElementMetadataPatch,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation PutFileByPath_SubmodelRepo
     * @status 204
     */
    test('should upload file by path to a File submodel element', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const attachmentIdShortPath = await seedFileSubmodelElement(scopedSubmodel.id);
        const attachmentBlob = createAttachmentBlob(attachmentPayload);

        const response = await client.putFileByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
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
     * @operation GetFileByPath_SubmodelRepo
     * @status 200
     */
    test('should download uploaded file by path from a File submodel element', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const attachmentIdShortPath = await seedFileSubmodelElement(scopedSubmodel.id);
        const attachmentBlob = createAttachmentBlob(attachmentPayload);
        const uploadResponse = await client.putFileByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: attachmentIdShortPath,
            fileName: 'coverage-file.txt',
            file: attachmentBlob,
        });
        expect(uploadResponse.success).toBe(true);

        const response = await client.getFileByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: attachmentIdShortPath,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.size).toBe(attachmentBlob.size);
            await expect(response.data.text()).resolves.toBe(attachmentPayload);
        }
    });

    /**
     * @operation GetFileByPath_SubmodelRepo
     * @status 405
     */
    test('should reject file download on non-File submodel element with 405', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const nonFileElement = createTestSubmodelElement();
        nonFileElement.idShort = `nonFileElement-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, nonFileElement);

        const response = await client.getFileByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: nonFileElement.idShort ?? 'testProperty',
        });

        assertApiFailureCode(response, '405');
    });

    /**
     * @operation GetFileByPath_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier when downloading file by path', async () => {
        const response = await client.getFileByPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation PutFileByPath_SubmodelRepo
     * @status 404
     */
    test('should reject file upload by path for missing submodel element with 404', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.putFileByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: 'missingAttachmentPath',
            fileName: 'missing-element-file.txt',
            file: createAttachmentBlob('missing-element-payload'),
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation PutFileByPath_SubmodelRepo
     * @status 400 [Currently not testable]
     */
    test.skip('should reject missing Submodel identifier when uploading file by path', async () => {
        const attachmentIdShortPath = testFileSubmodelElement.idShort ?? 'testFileElement';
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
     * @operation InvokeOperation_SubmodelRepo
     * @status 200 [Currently not testable]
     */
    test.skip('should invoke operation via SubmodelRepo endpoint', async () => {
        const response = await client.postInvokeOperationSubmodelRepo({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequest: createTestOperationRequest(),
        });

        assertApiResult(response);
    });

    /**
     * @operation InvokeOperation_SubmodelRepo
     * @status 400 [Currently not testable]
     */
    test.skip('should reject missing Submodel identifier on invoke operation via SubmodelRepo endpoint', async () => {
        const response = await client.postInvokeOperationSubmodelRepo({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequest: createTestOperationRequest(),
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation InvokeOperation_SubmodelRepo
     * @status 404 [Currently not testable]
     */
    test.skip('should return not found on invoke operation via SubmodelRepo endpoint for missing Submodel', async () => {
        const response = await client.postInvokeOperationSubmodelRepo({
            configuration,
            submodelIdentifier: randomMissingSubmodelIdentifier(),
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequest: createTestOperationRequest(),
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation InvokeOperation-ValueOnly
     * @status 200 [Currently not testable]
     */
    test.skip('should post invoke operation value-only', async () => {
        const response = await client.postInvokeOperationValueOnly({
            configuration,
            aasIdentifier: testSubmodel.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequestValueOnly,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation InvokeOperation-ValueOnly
     * @status 400 [Currently not testable]
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
     * @status 404 [Currently not testable]
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
     * @status 200 [Currently not testable]
     */
    test.skip('should post invoke operation async', async () => {
        const response = await client.postInvokeOperationAsync({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequest: createTestOperationRequest(),
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation InvokeOperationAsync
     * @status 400 [Currently not testable]
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
     * @status 404 [Currently not testable]
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
     * @status 200 [Currently not testable]
     */
    test.skip('should post invoke operation async value-only', async () => {
        const response = await client.postInvokeOperationAsyncValueOnly({
            configuration,
            aasIdentifier: testSubmodel.id,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            operationRequestValueOnly,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation InvokeOperationAsync-ValueOnly
     * @status 400 [Currently not testable]
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
     * @status 404 [Currently not testable]
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
     * @status 200 [Currently not testable]
     */
    test.skip('should get async operation status', async () => {
        const response = await client.getOperationAsyncStatus({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetOperationAsyncStatus
     * @status 400 [Currently not testable]
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
     * @status 404 [Currently not testable]
     */
    test.skip('should return not found when getting async operation status for missing Submodel', async () => {
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
     * @status 200 [Currently not testable]
     */
    test.skip('should get async operation result', async () => {
        const response = await client.getOperationAsyncResult({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetOperationAsyncResult
     * @status 400 [Currently not testable]
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
     * @status 404 [Currently not testable]
     */
    test.skip('should return not found when getting async operation result for missing Submodel', async () => {
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
     * @status 200 [Currently not testable]
     */
    test.skip('should get async operation result value-only', async () => {
        const response = await client.getOperationAsyncResultValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort ?? 'testProperty',
            handleId: 'coverage-handle-id',
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
        }
    });

    /**
     * @operation GetOperationAsyncResult-ValueOnly
     * @status 400 [Currently not testable]
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
     * @status 404 [Currently not testable]
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
     * @operation DeleteFileByPath_SubmodelRepo
     * @status 200
     */
    test('should delete file by path from a File submodel element', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const attachmentIdShortPath = await seedFileSubmodelElement(scopedSubmodel.id);
        const uploadResponse = await client.putFileByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: attachmentIdShortPath,
            fileName: 'coverage-file.txt',
            file: createAttachmentBlob(attachmentPayload),
        });
        expect(uploadResponse.success).toBe(true);

        const response = await client.deleteFileByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
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
     * @operation DeleteFileByPath_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier when deleting file by path', async () => {
        const response = await client.deleteFileByPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation DeleteFileByPath_SubmodelRepo
     * @status 404
     */
    test('should return not found when deleting missing file by path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.deleteFileByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: `missing-file-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation GetFileByPath_SubmodelRepo
     * @status 404
     */
    test('should return not found when downloading a deleted file by path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const attachmentIdShortPath = await seedFileSubmodelElement(scopedSubmodel.id);
        const uploadResponse = await client.putFileByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: attachmentIdShortPath,
            fileName: 'coverage-file.txt',
            file: createAttachmentBlob(attachmentPayload),
        });
        expect(uploadResponse.success).toBe(true);

        const deleteResponse = await client.deleteFileByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: attachmentIdShortPath,
        });
        expect(deleteResponse.success).toBe(true);

        const response = await client.getFileByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: attachmentIdShortPath,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation DeleteSubmodelElementByPath_SubmodelRepo
     * @status 204
     */
    test('should delete SubmodelElement by path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const seededElement = createTestSubmodelElement();
        seededElement.idShort = `deleteElement-${uniqueSuffix()}`;
        await seedSubmodelElement(scopedSubmodel.id, seededElement);

        const response = await client.deleteSubmodelElementByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: seededElement.idShort ?? 'testProperty',
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    /**
     * @operation DeleteSubmodelElementByPath_SubmodelRepo
     * @status 400
     */
    test('should reject missing Submodel identifier when deleting SubmodelElement by path', async () => {
        const response = await client.deleteSubmodelElementByPath({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            idShortPath: `missing-id-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '400');
    });

    /**
     * @operation DeleteSubmodelElementByPath_SubmodelRepo
     * @status 404
     */
    test('should return not found when deleting missing SubmodelElement by path', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.deleteSubmodelElementByPath({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
            idShortPath: `missing-delete-path-${uniqueSuffix()}`,
        });

        assertApiFailureCode(response, '404');
    });

    /**
     * @operation DeleteSubmodelById
     * @status 204
     */
    test('should delete Submodel by ID', async () => {
        const scopedSubmodel = createUniqueSubmodelFixture();
        const createResponse = await client.postSubmodel({
            configuration,
            submodel: scopedSubmodel,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.deleteSubmodelById({
            configuration,
            submodelIdentifier: scopedSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
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
