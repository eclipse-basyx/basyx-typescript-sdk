import { AssetKind } from '@aas-core-works/aas-core3.1-typescript/types';
import { AasRegistryClient } from '../clients/AasRegistryClient';
import { Configuration } from '../generated';
import { base64Encode } from '../lib/base64Url';
import {
    createDescription,
    createDisplayName,
    createTestShellDescriptor,
    createTestSubmodelDescriptor,
} from './fixtures/aasregistryFixtures';

describe('AAS Registry Integration Tests', () => {
    const client = new AasRegistryClient();
    const configuration = new Configuration({
        basePath: 'http://localhost:8084',
    });

    const uniqueSuffix = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const unavailableCursor = (): string =>
        base64Encode(`https://example.com/ids/non-existing-cursor-${uniqueSuffix()}`);

    const createUniqueShellDescriptor = () => {
        const descriptor = createTestShellDescriptor();
        descriptor.id = `${descriptor.id}-${uniqueSuffix()}`;
        return descriptor;
    };

    const createInvalidShellDescriptorWithEmptyId = () => {
        const descriptor = createUniqueShellDescriptor();
        descriptor.id = '';
        descriptor.assetKind = AssetKind.Type;
        descriptor.assetType = 'Type';
        descriptor.globalAssetId = `https://example.com/ids/assets/${uniqueSuffix()}`;
        descriptor.idShort = 'InvalidConnectorDescriptor';
        descriptor.specificAssetIds = [];
        descriptor.endpoints = [
            {
                _interface: 'AAS-3.0',
                protocolInformation: {
                    href: 'https://example.com/shells/invalid',
                    endpointProtocol: 'http',
                    endpointProtocolVersion: null,
                    subprotocol: null,
                    subprotocolBody: null,
                    subprotocolBodyEncoding: null,
                    securityAttributes: null,
                },
            },
        ];
        return descriptor;
    };

    const createUniqueSubmodelDescriptor = () => {
        const descriptor = createTestSubmodelDescriptor();
        descriptor.id = `${descriptor.id}-${uniqueSuffix()}`;
        return descriptor;
    };

    /**
     * @operation PostAssetAdministrationShellDescriptor
     * @status 201
     */
    test('should create a new Asset Administration Shell Descriptor', async () => {
        const shellDescriptor = createUniqueShellDescriptor();

        const response = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data).toEqual(shellDescriptor);
        }
    });

    /**
     * @operation PostAssetAdministrationShellDescriptor
     * @status 400
     */
    test('should reject invalid Asset Administration Shell Descriptor payload with bad request', async () => {
        const response = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: createInvalidShellDescriptorWithEmptyId(),
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation PostAssetAdministrationShellDescriptor
     * @status 409 [non-blocking]
     */
    test('should surface conflict status for duplicate AAS descriptor creation when backend enforces it', async () => {
        const shellDescriptor = createUniqueShellDescriptor();

        const initialResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(initialResponse.success).toBe(true);

        const duplicateResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });

        if (duplicateResponse.success) {
            expect([201, 204]).toContain(duplicateResponse.statusCode);
        } else {
            expect(duplicateResponse.statusCode).toBe(409);
            expect(duplicateResponse.error.messages?.[0]?.code).toBe('409');
        }
    });

    /**
     * @operation GetAssetAdministrationShellDescriptorById
     * @status 200
     */
    test('should fetch an Asset Administration Shell Descriptor by ID', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const createResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getAssetAdministrationShellDescriptorById({
            configuration,
            aasIdentifier: shellDescriptor.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toEqual(shellDescriptor);
        }
    });

    /**
     * @operation GetAssetAdministrationShellDescriptorById
     * @status 400
     */
    test('should reject missing AAS identifier with bad request', async () => {
        const response = await client.getAssetAdministrationShellDescriptorById({
            configuration,
            aasIdentifier: undefined as unknown as string,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation GetAssetAdministrationShellDescriptorById
     * @status 404
     */
    test('should return not found for a non-existing Asset Administration Shell Descriptor', async () => {
        const response = await client.getAssetAdministrationShellDescriptorById({
            configuration,
            aasIdentifier: `https://example.com/ids/aas-desc/non-existing-${uniqueSuffix()}`,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation GetAllAssetAdministrationShellDescriptors
     * @status 200
     */
    test('should fetch all Asset Administration Shell Descriptors', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const createResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.getAllAssetAdministrationShellDescriptors({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(shellDescriptor);
        }
    });

    /**
     * @operation GetAllAssetAdministrationShellDescriptors
     * @status 400
     */
    test('should reject invalid AAS descriptor paging parameters with bad request', async () => {
        const response = await client.getAllAssetAdministrationShellDescriptors({
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
     * @operation GetAllAssetAdministrationShellDescriptors
     * @status 200
     */
    test('should return an empty AAS descriptor page for an unavailable cursor', async () => {
        const response = await client.getAllAssetAdministrationShellDescriptors({
            configuration,
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
     * @operation PutAssetAdministrationShellDescriptorById
     * @status 201
     */
    test('should create an Asset Administration Shell Descriptor through put by ID', async () => {
        const shellDescriptor = createUniqueShellDescriptor();

        const response = await client.putAssetAdministrationShellDescriptorById({
            configuration,
            aasIdentifier: shellDescriptor.id,
            assetAdministrationShellDescriptor: shellDescriptor,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data).toEqual(shellDescriptor);
        }
    });

    /**
     * @operation PutAssetAdministrationShellDescriptorById
     * @status 204
     */
    test('should update an Asset Administration Shell Descriptor through put by ID', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const createResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createResponse.success).toBe(true);

        const updatedShellDescriptor = createUniqueShellDescriptor();
        updatedShellDescriptor.id = shellDescriptor.id;
        updatedShellDescriptor.description = [createDescription()];

        const response = await client.putAssetAdministrationShellDescriptorById({
            configuration,
            aasIdentifier: shellDescriptor.id,
            assetAdministrationShellDescriptor: updatedShellDescriptor,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
            expect(response.data).toBeUndefined();
        }
    });

    /**
     * @operation PutAssetAdministrationShellDescriptorById
     * @status 400
     */
    test('should reject missing put AAS identifier with bad request', async () => {
        const shellDescriptor = createUniqueShellDescriptor();

        const response = await client.putAssetAdministrationShellDescriptorById({
            configuration,
            aasIdentifier: undefined as unknown as string,
            assetAdministrationShellDescriptor: shellDescriptor,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation DeleteAssetAdministrationShellDescriptorById
     * @status 204
     */
    test('should delete an Asset Administration Shell Descriptor by ID', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const createResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createResponse.success).toBe(true);

        const response = await client.deleteAssetAdministrationShellDescriptorById({
            configuration,
            aasIdentifier: shellDescriptor.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
            expect(response.data).toBeUndefined();
        }
    });

    /**
     * @operation DeleteAssetAdministrationShellDescriptorById
     * @status 400
     */
    test('should reject missing delete AAS identifier with bad request', async () => {
        const response = await client.deleteAssetAdministrationShellDescriptorById({
            configuration,
            aasIdentifier: undefined as unknown as string,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation DeleteAssetAdministrationShellDescriptorById
     * @status 404
     */
    test('should return not found when deleting a non-existing Asset Administration Shell Descriptor', async () => {
        const response = await client.deleteAssetAdministrationShellDescriptorById({
            configuration,
            aasIdentifier: `https://example.com/ids/aas-desc/non-existing-${uniqueSuffix()}`,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation PostSubmodelDescriptor-ThroughSuperpath
     * @status 201
     */
    test('should create a new Submodel Descriptor through superpath', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const submodelDescriptor = createUniqueSubmodelDescriptor();
        const createShellResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createShellResponse.success).toBe(true);

        const response = await client.postSubmodelDescriptorThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
            submodelDescriptor,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
            expect(response.data).toEqual(submodelDescriptor);
        }
    });

    /**
     * @operation PostSubmodelDescriptor-ThroughSuperpath
     * @status 400
     */
    test('should reject missing superpath AAS identifier for submodel creation with bad request', async () => {
        const submodelDescriptor = createUniqueSubmodelDescriptor();

        const response = await client.postSubmodelDescriptorThroughSuperpath({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelDescriptor,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation PostSubmodelDescriptor-ThroughSuperpath
     * @status 404
     */
    test('should return not found when creating a Submodel Descriptor below a non-existing AAS', async () => {
        const response = await client.postSubmodelDescriptorThroughSuperpath({
            configuration,
            aasIdentifier: `https://example.com/ids/aas-desc/non-existing-${uniqueSuffix()}`,
            submodelDescriptor: createUniqueSubmodelDescriptor(),
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation PostSubmodelDescriptor-ThroughSuperpath
     * @status 409 [non-blocking]
     */
    test('should surface conflict status for duplicate submodel descriptor creation when backend enforces it', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const submodelDescriptor = createUniqueSubmodelDescriptor();
        const createShellResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createShellResponse.success).toBe(true);

        const initialResponse = await client.postSubmodelDescriptorThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
            submodelDescriptor,
        });
        expect(initialResponse.success).toBe(true);

        const duplicateResponse = await client.postSubmodelDescriptorThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
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
     * @operation GetSubmodelDescriptorByIdThroughSuperpath
     * @status 200
     */
    test('should fetch a Submodel Descriptor by ID through superpath', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const submodelDescriptor = createUniqueSubmodelDescriptor();
        const createShellResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createShellResponse.success).toBe(true);
        const createSubmodelResponse = await client.postSubmodelDescriptorThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
            submodelDescriptor,
        });
        expect(createSubmodelResponse.success).toBe(true);

        const response = await client.getSubmodelDescriptorByIdThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
            submodelIdentifier: submodelDescriptor.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toEqual(submodelDescriptor);
        }
    });

    /**
     * @operation GetSubmodelDescriptorByIdThroughSuperpath
     * @status 400
     */
    test('should reject missing submodel superpath identifier with bad request', async () => {
        const response = await client.getSubmodelDescriptorByIdThroughSuperpath({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: createUniqueSubmodelDescriptor().id,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation GetSubmodelDescriptorByIdThroughSuperpath
     * @status 404
     */
    test('should return not found for a non-existing Submodel Descriptor through superpath', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const createShellResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createShellResponse.success).toBe(true);

        const response = await client.getSubmodelDescriptorByIdThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
            submodelIdentifier: `https://example.com/ids/sm-desc/non-existing-${uniqueSuffix()}`,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation GetAllSubmodelDescriptorsThroughSuperpath
     * @status 200
     */
    test('should fetch all Submodel Descriptors through superpath', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const submodelDescriptor = createUniqueSubmodelDescriptor();
        const createShellResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createShellResponse.success).toBe(true);
        const createSubmodelResponse = await client.postSubmodelDescriptorThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
            submodelDescriptor,
        });
        expect(createSubmodelResponse.success).toBe(true);

        const response = await client.getAllSubmodelDescriptorsThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(submodelDescriptor);
        }
    });

    /**
     * @operation GetAllSubmodelDescriptorsThroughSuperpath
     * @status 400
     */
    test('should reject invalid submodel descriptor paging parameters through superpath with bad request', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const createShellResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createShellResponse.success).toBe(true);

        const response = await client.getAllSubmodelDescriptorsThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
            limit: -1,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation GetAllSubmodelDescriptorsThroughSuperpath
     * @status 200
     */
    test('should return an empty submodel descriptor page through superpath for an unavailable cursor', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const createShellResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createShellResponse.success).toBe(true);

        const response = await client.getAllSubmodelDescriptorsThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
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
     * @operation GetAllSubmodelDescriptorsThroughSuperpath
     * @status 404
     */
    test('should return not found when listing Submodel Descriptors below a non-existing AAS', async () => {
        const response = await client.getAllSubmodelDescriptorsThroughSuperpath({
            configuration,
            aasIdentifier: `https://example.com/ids/aas-desc/non-existing-${uniqueSuffix()}`,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation PutSubmodelDescriptorByIdThroughSuperpath
     * @status 201
     */
    test('should create a Submodel Descriptor through superpath put by ID', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const submodelDescriptor = createUniqueSubmodelDescriptor();
        const createShellResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createShellResponse.success).toBe(true);

        const response = await client.putSubmodelDescriptorByIdThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
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
     * @operation PutSubmodelDescriptorByIdThroughSuperpath
     * @status 204
     */
    test('should update a Submodel Descriptor through superpath put by ID', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const submodelDescriptor = createUniqueSubmodelDescriptor();
        const createShellResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createShellResponse.success).toBe(true);
        const createSubmodelResponse = await client.postSubmodelDescriptorThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
            submodelDescriptor,
        });
        expect(createSubmodelResponse.success).toBe(true);

        const updatedSubmodelDescriptor = createUniqueSubmodelDescriptor();
        updatedSubmodelDescriptor.id = submodelDescriptor.id;
        updatedSubmodelDescriptor.displayName = [createDisplayName()];

        const response = await client.putSubmodelDescriptorByIdThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
            submodelIdentifier: submodelDescriptor.id,
            submodelDescriptor: updatedSubmodelDescriptor,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
            expect(response.data).toBeUndefined();
        }
    });

    /**
     * @operation PutSubmodelDescriptorByIdThroughSuperpath
     * @status 400
     */
    test('should reject missing superpath put AAS identifier with bad request', async () => {
        const submodelDescriptor = createUniqueSubmodelDescriptor();

        const response = await client.putSubmodelDescriptorByIdThroughSuperpath({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: submodelDescriptor.id,
            submodelDescriptor,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation PutSubmodelDescriptorByIdThroughSuperpath
     * @status 404
     */
    test('should return not found when putting a Submodel Descriptor below a non-existing AAS', async () => {
        const submodelDescriptor = createUniqueSubmodelDescriptor();

        const response = await client.putSubmodelDescriptorByIdThroughSuperpath({
            configuration,
            aasIdentifier: `https://example.com/ids/aas-desc/non-existing-${uniqueSuffix()}`,
            submodelIdentifier: submodelDescriptor.id,
            submodelDescriptor,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation DeleteSubmodelDescriptorByIdThroughSuperpath
     * @status 204
     */
    test('should delete a Submodel Descriptor through superpath by ID', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const submodelDescriptor = createUniqueSubmodelDescriptor();
        const createShellResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createShellResponse.success).toBe(true);
        const createSubmodelResponse = await client.postSubmodelDescriptorThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
            submodelDescriptor,
        });
        expect(createSubmodelResponse.success).toBe(true);

        const response = await client.deleteSubmodelDescriptorByIdThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
            submodelIdentifier: submodelDescriptor.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
            expect(response.data).toBeUndefined();
        }
    });

    /**
     * @operation DeleteSubmodelDescriptorByIdThroughSuperpath
     * @status 400
     */
    test('should reject missing superpath delete AAS identifier with bad request', async () => {
        const response = await client.deleteSubmodelDescriptorByIdThroughSuperpath({
            configuration,
            aasIdentifier: undefined as unknown as string,
            submodelIdentifier: createUniqueSubmodelDescriptor().id,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(400);
            expect(response.error.messages?.[0]?.code).toBe('400');
        }
    });

    /**
     * @operation DeleteSubmodelDescriptorByIdThroughSuperpath
     * @status 404
     */
    test('should return not found when deleting a non-existing Submodel Descriptor through superpath', async () => {
        const shellDescriptor = createUniqueShellDescriptor();
        const createShellResponse = await client.postAssetAdministrationShellDescriptor({
            configuration,
            assetAdministrationShellDescriptor: shellDescriptor,
        });
        expect(createShellResponse.success).toBe(true);

        const response = await client.deleteSubmodelDescriptorByIdThroughSuperpath({
            configuration,
            aasIdentifier: shellDescriptor.id,
            submodelIdentifier: `https://example.com/ids/sm-desc/non-existing-${uniqueSuffix()}`,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.statusCode).toBe(404);
            expect(response.error.messages?.[0]?.code).toBe('404');
        }
    });

    /**
     * @operation GetSelfDescription
     * @status 200
     */
    test('should fetch AAS registry service description', async () => {
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
