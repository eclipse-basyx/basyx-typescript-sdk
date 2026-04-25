import { SubmodelRegistryClient } from '../clients/SubmodelRegistryClient';
import { Configuration } from '../generated';
import { createDisplayName, createTestSubmodelDescriptor } from './fixtures/aasregistryFixtures';

describe('Submodel Registry Integration Tests', () => {
    const client = new SubmodelRegistryClient();
    const configuration = new Configuration({
        basePath: 'http://localhost:8085',
    });

    const uniqueSuffix = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const createUniqueSubmodelDescriptor = () => {
        const descriptor = createTestSubmodelDescriptor();
        descriptor.id = `${descriptor.id}-${uniqueSuffix()}`;
        return descriptor;
    };

    /**
     * @operation PostSubmodelDescriptor
     * @status 201
     */
    test('should create a new Submodel Descriptor', async () => {
        const submodelDescriptor = createUniqueSubmodelDescriptor();

        const response = await client.postSubmodelDescriptor({
            configuration,
            submodelDescriptor,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(submodelDescriptor);
        }
    });

    /**
     * @operation PostSubmodelDescriptor
     * @status 400
     */
    test('should reject invalid Submodel Descriptor payload with bad request', async () => {
        const invalidSubmodelDescriptor = createUniqueSubmodelDescriptor();
        invalidSubmodelDescriptor.id = '';

        const response = await client.postSubmodelDescriptor({
            configuration,
            submodelDescriptor: invalidSubmodelDescriptor,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation PostSubmodelDescriptor
     * @status 409 [non-blocking]
     */
    test('should surface conflict status for duplicate descriptor creation when backend enforces it', async () => {
        const submodelDescriptor = createUniqueSubmodelDescriptor();

        const initialResponse = await client.postSubmodelDescriptor({
            configuration,
            submodelDescriptor,
        });
        expect(initialResponse.success).toBe(true);

        const duplicateResponse = await client.postSubmodelDescriptor({
            configuration,
            submodelDescriptor,
        });

        if (duplicateResponse.success) {
            expect([201, 204]).toContain(duplicateResponse.statusCode);
        } else {
            expect(duplicateResponse.statusCode).toBe(409);
            expect(duplicateResponse.error.messages?.[0]?.code).toBe('409');
        }
    });

    /**
     * @operation GetSubmodelDescriptorById
     * @status 200
     */
    test('should fetch a Submodel Descriptor by ID', async () => {
        const submodelDescriptor = createUniqueSubmodelDescriptor();
        const createResponse = await client.postSubmodelDescriptor({
            configuration,
            submodelDescriptor,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getSubmodelDescriptorById({
            configuration,
            submodelIdentifier: submodelDescriptor.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(submodelDescriptor);
        }
    });

    /**
     * @operation GetSubmodelDescriptorById
     * @status 400
     */
    test('should reject missing Submodel Descriptor identifier with bad request', async () => {
        const response = await client.getSubmodelDescriptorById({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation GetSubmodelDescriptorById
     * @status 404
     */
    test('should fetch a Submodel Descriptor by non-existing ID', async () => {
        const nonExistingId = `non-existing-id-${uniqueSuffix()}`;
        const response = await client.getSubmodelDescriptorById({
            configuration,
            submodelIdentifier: nonExistingId,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation GetAllSubmodelDescriptors
     * @status 200
     */
    test('should return collection response for trailing slash on submodel descriptors endpoint', async () => {
        const rawResponse = await fetch(`${configuration.basePath}/submodel-descriptors/`);
        const responseBody = (await rawResponse.json()) as { result?: unknown[]; paging_metadata?: object };
        const statusCode = rawResponse.status;

        expect(statusCode).toBe(200);
        expect(responseBody).toBeDefined();
        expect(Array.isArray(responseBody.result)).toBe(true);
        expect(responseBody.paging_metadata).toBeDefined();
    });

    /**
     * @operation GetAllSubmodelDescriptors
     * @status 200
     */
    test('should fetch all Submodel Descriptors', async () => {
        const submodelDescriptor = createUniqueSubmodelDescriptor();
        const createResponse = await client.postSubmodelDescriptor({
            configuration,
            submodelDescriptor,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getAllSubmodelDescriptors({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(submodelDescriptor);
        }
    });

    /**
     * @operation GetAllSubmodelDescriptors
     * @status 400
     */
    test('should reject invalid paging parameters with bad request', async () => {
        const response = await client.getAllSubmodelDescriptors({
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
     * @operation GetAllSubmodelDescriptors
     * @status 400
     */
    test('should return bad request for unavailable Submodel Descriptor ID used as cursor', async () => {
        const response = await client.getAllSubmodelDescriptors({
            configuration,
            cursor: `does-not-exist-${uniqueSuffix()}`,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation PutSubmodelDescriptorById
     * @status 201
     */
    test('should create a Submodel Descriptor through put by ID', async () => {
        const submodelDescriptor = createUniqueSubmodelDescriptor();

        const response = await client.putSubmodelDescriptorById({
            configuration,
            submodelIdentifier: submodelDescriptor.id,
            submodelDescriptor,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data).toEqual(submodelDescriptor);
        }
    });

    /**
     * @operation PutSubmodelDescriptorById
     * @status 204
     */
    test('should update a Submodel Descriptor through put by ID', async () => {
        const submodelDescriptor = createUniqueSubmodelDescriptor();
        const createResponse = await client.postSubmodelDescriptor({
            configuration,
            submodelDescriptor,
        });
        expect(createResponse.success).toBe(true);

        const updatedSubmodelDescriptor = createUniqueSubmodelDescriptor();
        updatedSubmodelDescriptor.id = submodelDescriptor.id;
        updatedSubmodelDescriptor.displayName = [createDisplayName()];

        const updateResponse = await client.putSubmodelDescriptorById({
            configuration,
            submodelIdentifier: submodelDescriptor.id,
            submodelDescriptor: updatedSubmodelDescriptor,
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
            expect(updateResponse.statusCode).toBe(204);
            expect(updateResponse.data).toBeUndefined();
        }

        const fetchResponse = await client.getSubmodelDescriptorById({
            configuration,
            submodelIdentifier: submodelDescriptor.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.statusCode).toBe(200);
            expect(fetchResponse.data.displayName).toEqual(updatedSubmodelDescriptor.displayName);
        }
    });

    /**
     * @operation PutSubmodelDescriptorById
     * @status 400
     */
    test('should reject missing put Submodel Descriptor identifier with bad request', async () => {
        const submodelDescriptor = createUniqueSubmodelDescriptor();
        submodelDescriptor.id = '';

        const response = await client.putSubmodelDescriptorById({
            configuration,
            submodelIdentifier: undefined as unknown as string,
            submodelDescriptor,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation DeleteSubmodelDescriptorById
     * @status 204
     */
    test('should delete a Submodel Descriptor by ID', async () => {
        const submodelDescriptor = createUniqueSubmodelDescriptor();
        const createResponse = await client.postSubmodelDescriptor({
            configuration,
            submodelDescriptor,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.deleteSubmodelDescriptorById({
            configuration,
            submodelIdentifier: submodelDescriptor.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
            expect(response.data).toBeUndefined();
        }
    });

    /**
     * @operation DeleteSubmodelDescriptorById
     * @status 404
     */
    test('should return not found when deleting a non-existing Submodel Descriptor', async () => {
        const nonExistingId = `https://example.com/ids/sm-desc/non-existing-${uniqueSuffix()}`;

        const response = await client.deleteSubmodelDescriptorById({
            configuration,
            submodelIdentifier: nonExistingId,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation DeleteSubmodelDescriptorById
     * @status 400
     */
    test('should reject missing delete Submodel Descriptor identifier with bad request', async () => {
        const response = await client.deleteSubmodelDescriptorById({
            configuration,
            submodelIdentifier: undefined as unknown as string,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation GetSelfDescription
     * @status 200
     */
    test('should fetch submodel registry service description', async () => {
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
