import { ConceptDescriptionRepositoryClient } from '../clients/ConceptDescriptionRepositoryClient';
import { Configuration } from '../generated';
import { base64Encode } from '../lib/base64Url';
import { assertApiFailure, assertApiResult } from './fixtures/assertionHelpers';
import { createDescription, createTestCD } from './fixtures/conceptDescriptionFixtures';
import { createPerTestCleanupRunner } from './fixtures/testCleanup';
import { getIntegrationBasePath } from './testEngineConfig';

describe('Concept Description Repository Integration Tests', () => {
    const client = new ConceptDescriptionRepositoryClient();
    const configuration = new Configuration({
        basePath: getIntegrationBasePath('conceptDescriptionRepository'),
    });
    const { track } = createPerTestCleanupRunner();

    const uniqueSuffix = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const unavailableCursor = (): string =>
        base64Encode(`https://example.com/ids/non-existing-cursor-${uniqueSuffix()}`);

    const createUniqueConceptDescription = (withCleanup = true) => {
        const conceptDescription = createTestCD();
        conceptDescription.id = `${conceptDescription.id}-${uniqueSuffix()}`;

        if (withCleanup) {
            track(async () => {
                const cleanupResponse = await client.deleteConceptDescriptionById({
                    configuration,
                    cdIdentifier: conceptDescription.id,
                });

                if (!cleanupResponse.success && cleanupResponse.statusCode !== 404) {
                    throw new Error(
                        `Failed to cleanup concept description ${conceptDescription.id} (status ${cleanupResponse.statusCode})`
                    );
                }
            });
        }

        return conceptDescription;
    };

    /**
     * @operation PostConceptDescription
     * @status 201
     */
    test('should create a new Concept Description', async () => {
        const conceptDescription = createUniqueConceptDescription();

        const response = await client.postConceptDescription({
            configuration,
            conceptDescription,
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data).toEqual(conceptDescription);
        }
    });

    /**
     * @operation PostConceptDescription
     * @status 400
     */
    test('should reject invalid Concept Description payload with bad request', async () => {
        const rawResponse = await fetch(`${configuration.basePath}/concept-descriptions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        const response = { statusCode: rawResponse.status };

        expect(response.statusCode).toBe(400);
    });

    /**
     * @operation PostConceptDescription
     * @status 409 [non-blocking]
     */
    test('should surface conflict status for duplicate Concept Description creation when backend enforces it', async () => {
        const conceptDescription = createUniqueConceptDescription();

        const initialResponse = await client.postConceptDescription({
            configuration,
            conceptDescription,
        });
        assertApiResult(initialResponse);

        const duplicateResponse = await client.postConceptDescription({
            configuration,
            conceptDescription,
        });

        if (duplicateResponse.success) {
            expect([201, 204]).toContain(duplicateResponse.statusCode);
        } else {
            expect(duplicateResponse.statusCode).toBe(409);
            expect(duplicateResponse.error.messages?.[0]?.code).toBe('409');
        }
    });

    /**
     * @operation GetConceptDescriptionById
     * @status 200
     */
    test('should fetch a Concept Description by ID', async () => {
        const conceptDescription = createUniqueConceptDescription();
        const createResponse = await client.postConceptDescription({
            configuration,
            conceptDescription,
        });
        assertApiResult(createResponse);

        const response = await client.getConceptDescriptionById({
            configuration,
            cdIdentifier: conceptDescription.id,
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toEqual(conceptDescription);
        }
    });

    /**
     * @operation GetConceptDescriptionById
     * @status 400
     */
    test('should reject missing Concept Description identifier with bad request', async () => {
        const response = await client.getConceptDescriptionById({
            configuration,
            cdIdentifier: undefined as unknown as string,
        });

        assertApiFailure(response);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation GetConceptDescriptionById
     * @status 404
     */
    test('should return not found for a non-existing Concept Description', async () => {
        const response = await client.getConceptDescriptionById({
            configuration,
            cdIdentifier: `https://example.com/ids/cd/non-existing-${uniqueSuffix()}`,
        });

        assertApiFailure(response);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation GetAllConceptDescriptions
     * @status 200
     */
    test('should fetch all Concept Descriptions', async () => {
        const conceptDescription = createUniqueConceptDescription();
        const createResponse = await client.postConceptDescription({
            configuration,
            conceptDescription,
        });
        assertApiResult(createResponse);

        const response = await client.getAllConceptDescriptions({
            configuration,
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(conceptDescription);
        }
    });

    /**
     * @operation GetAllConceptDescriptions
     * @status 400
     */
    test('should reject invalid Concept Description paging parameters with bad request', async () => {
        const response = await client.getAllConceptDescriptions({
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
     * @operation GetAllConceptDescriptions
     * @status 200
     */
    test('should return an empty Concept Description page for an unavailable cursor', async () => {
        const response = await client.getAllConceptDescriptions({
            configuration,
            cursor: unavailableCursor(),
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.pagedResult).toEqual({});
            expect(response.data.result).toEqual([]);
        }
    });

    /**
     * @operation PutConceptDescriptionById
     * @status 201
     */
    test('should create a Concept Description through put by ID with created status', async () => {
        const conceptDescription = createUniqueConceptDescription();

        const response = await client.putConceptDescriptionById({
            configuration,
            cdIdentifier: conceptDescription.id,
            conceptDescription,
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data).toEqual(conceptDescription);
        }
    });

    test('should create a Concept Description through put by ID with current backend status', async () => {
        const conceptDescription = createUniqueConceptDescription();

        const response = await client.putConceptDescriptionById({
            configuration,
            cdIdentifier: conceptDescription.id,
            conceptDescription,
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data).toEqual(conceptDescription);
        }
    });

    /**
     * @operation PutConceptDescriptionById
     * @status 204
     */
    test('should update a Concept Description through put by ID with no content status', async () => {
        const conceptDescription = createUniqueConceptDescription();
        const createResponse = await client.postConceptDescription({
            configuration,
            conceptDescription,
        });
        assertApiResult(createResponse);

        const updatedConceptDescription = createUniqueConceptDescription();
        updatedConceptDescription.id = conceptDescription.id;
        updatedConceptDescription.description = [createDescription()];

        const response = await client.putConceptDescriptionById({
            configuration,
            cdIdentifier: conceptDescription.id,
            conceptDescription: updatedConceptDescription,
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(204);
            expect(response.data).toBeUndefined();
        }
    });

    test('should update a Concept Description through put by ID with current backend status', async () => {
        const conceptDescription = createUniqueConceptDescription();
        const createResponse = await client.postConceptDescription({
            configuration,
            conceptDescription,
        });
        assertApiResult(createResponse);

        const updatedConceptDescription = createUniqueConceptDescription();
        updatedConceptDescription.id = conceptDescription.id;
        updatedConceptDescription.description = [createDescription()];

        const response = await client.putConceptDescriptionById({
            configuration,
            cdIdentifier: conceptDescription.id,
            conceptDescription: updatedConceptDescription,
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(204);
            expect(response.data).toBeUndefined();
        }
    });

    /**
     * @operation PutConceptDescriptionById
     * @status 400
     */
    test('should reject missing put Concept Description identifier with bad request', async () => {
        const response = await client.putConceptDescriptionById({
            configuration,
            cdIdentifier: undefined as unknown as string,
            conceptDescription: createUniqueConceptDescription(),
        });

        assertApiFailure(response);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation DeleteConceptDescriptionById
     * @status 204
     */
    test('should delete a Concept Description by ID', async () => {
        const conceptDescription = createUniqueConceptDescription();
        const createResponse = await client.postConceptDescription({
            configuration,
            conceptDescription,
        });
        assertApiResult(createResponse);

        const response = await client.deleteConceptDescriptionById({
            configuration,
            cdIdentifier: conceptDescription.id,
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(204);
            expect(response.data).toBeUndefined();
        }
    });

    /**
     * @operation DeleteConceptDescriptionById
     * @status 400
     */
    test('should reject missing delete Concept Description identifier with bad request', async () => {
        const response = await client.deleteConceptDescriptionById({
            configuration,
            cdIdentifier: undefined as unknown as string,
        });

        assertApiFailure(response);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation DeleteConceptDescriptionById
     * @status 404
     */
    test('should return not found when deleting a non-existing Concept Description', async () => {
        const response = await client.deleteConceptDescriptionById({
            configuration,
            cdIdentifier: `https://example.com/ids/cd/non-existing-${uniqueSuffix()}`,
        });

        assertApiFailure(response);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation GenerateSerializationByIds
     * @status 200 [known-backend-bug]
     *
     * Serialization is not implemented in the current Concept Description Repository backend.
     */
    test.skip('should generate serialization by IDs when backend support exists', async () => {
        const response = await client.generateSerializationByIds({
            configuration,
            includeConceptDescriptions: true,
        });

        assertApiResult(response);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.size).toBeGreaterThan(0);
        }
    });

    /**
     * @operation GenerateSerializationByIds
     * @status 400 [known-backend-bug]
     *
     * Serialization is not implemented in the current Concept Description Repository backend.
     */
    test.skip('should reject invalid serialization parameters with bad request when backend support exists', async () => {
        const response = await client.generateSerializationByIds({
            configuration,
            aasIds: [''],
        });

        assertApiFailure(response);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation GetSelfDescription
     * @status 200
     */
    test('should fetch concept description repository service description', async () => {
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
});
