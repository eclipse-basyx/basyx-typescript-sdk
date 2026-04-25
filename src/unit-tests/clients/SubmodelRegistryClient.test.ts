import { type Mock, vi } from 'vitest';
import { SubmodelRegistryClient } from '../../clients/SubmodelRegistryClient';
import { SubmodelRegistryService } from '../../generated';
import { Configuration } from '../../generated/runtime';
import { base64Encode } from '../../lib/base64Url';
import {
    convertApiSubmodelDescriptorToCoreSubmodelDescriptor,
    convertCoreSubmodelDescriptorToApiSubmodelDescriptor,
} from '../../lib/convertAasDescriptorTypes';
import { handleApiError } from '../../lib/errorHandler';
import { SubmodelDescriptor as CoreSubmodelDescriptor } from '../../models/Descriptors';

vi.mock('../../generated');
vi.mock('../../lib/convertAasDescriptorTypes');
vi.mock('../../lib/base64Url');
vi.mock('../../lib/errorHandler');

const LIMIT = 10;
const CURSOR = 'cursor123';
const API_SUBMODEL_DESCRIPTOR1: SubmodelRegistryService.SubmodelDescriptor = {
    id: 'https://example.com/ids/sm-desc/1234',
    endpoints: [
        {
            _interface: 'SUBMODEL-3.X',
            protocolInformation: {
                href: 'http://localhost:8085/submodels/xyz',
            },
        },
    ],
};
const API_SUBMODEL_DESCRIPTOR2: SubmodelRegistryService.SubmodelDescriptor = {
    id: 'https://example.com/ids/sm-desc/5678',
    endpoints: [
        {
            _interface: 'SUBMODEL-3.X',
            protocolInformation: {
                href: 'http://localhost:8085/submodels/xyz',
            },
        },
    ],
};
const CORE_SUBMODEL_DESCRIPTOR1: CoreSubmodelDescriptor = new CoreSubmodelDescriptor(
    'https://example.com/ids/sm-desc/1234',
    [
        {
            _interface: 'SUBMODEL-3.X',
            protocolInformation: {
                href: 'http://localhost:8085/submodels/pqrs',
                endpointProtocol: null,
                endpointProtocolVersion: null,
                subprotocol: null,
                subprotocolBody: null,
                subprotocolBodyEncoding: null,
                securityAttributes: null,
            },
        },
    ]
);
const CORE_SUBMODEL_DESCRIPTOR2: CoreSubmodelDescriptor = new CoreSubmodelDescriptor(
    'https://example.com/ids/sm-desc/5678',
    [
        {
            _interface: 'SUBMODEL-3.X',
            protocolInformation: {
                href: 'http://localhost:8085/submodels/pqrs',
                endpointProtocol: null,
                endpointProtocolVersion: null,
                subprotocol: null,
                subprotocolBody: null,
                subprotocolBodyEncoding: null,
                securityAttributes: null,
            },
        },
    ]
);
const TEST_CONFIGURATION = new Configuration({
    basePath: 'http://localhost:8085',
    fetchApi: globalThis.fetch,
});
const SERVICE_DESCRIPTION: SubmodelRegistryService.ServiceDescription = {
    profiles: ['submodel-registry-service-profile'],
};

describe('SubmodelRegistryClient', () => {
    const createRawResponse = <T>(status: number, payload: T) => ({
        raw: { status },
        value: vi.fn().mockResolvedValue(payload),
    });

    const expectConfigurationCall = () =>
        expect.objectContaining({
            basePath: 'http://localhost:8085',
            fetchApi: globalThis.fetch,
        });

    const mockApiInstance = {
        getAllSubmodelDescriptorsRaw: vi.fn(),
        postSubmodelDescriptorRaw: vi.fn(),
        deleteSubmodelDescriptorByIdRaw: vi.fn(),
        getSubmodelDescriptorByIdRaw: vi.fn(),
        putSubmodelDescriptorByIdRaw: vi.fn(),
        getSelfDescriptionRaw: vi.fn(),
    };

    const MockSubmodelRegistry = vi.fn(function () {
        return mockApiInstance;
    });

    beforeEach(() => {
        vi.clearAllMocks();

        (base64Encode as Mock).mockImplementation((input) => `encoded_${input}`);
        (SubmodelRegistryService.SubmodelRegistryAPIApi as unknown as Mock).mockImplementation(MockSubmodelRegistry);
        (SubmodelRegistryService.DescriptionAPIApi as unknown as Mock).mockImplementation(MockSubmodelRegistry);

        (convertApiSubmodelDescriptorToCoreSubmodelDescriptor as Mock).mockImplementation((submodelDescriptor) => {
            if (submodelDescriptor.id === API_SUBMODEL_DESCRIPTOR1.id) return CORE_SUBMODEL_DESCRIPTOR1;
            if (submodelDescriptor.id === API_SUBMODEL_DESCRIPTOR2.id) return CORE_SUBMODEL_DESCRIPTOR2;
            return null;
        });
        (convertCoreSubmodelDescriptorToApiSubmodelDescriptor as Mock).mockImplementation((submodelDescriptor) => {
            if (submodelDescriptor.id === CORE_SUBMODEL_DESCRIPTOR1.id) return API_SUBMODEL_DESCRIPTOR1;
            if (submodelDescriptor.id === CORE_SUBMODEL_DESCRIPTOR2.id) return API_SUBMODEL_DESCRIPTOR2;
            return null;
        });

        (handleApiError as Mock).mockImplementation(async (err) => {
            if (err?.messages) return err;

            const message: SubmodelRegistryService.Message = {
                code: '400',
                messageType: 'Exception',
                text: err.message || 'Error occurred',
                timestamp: '1744752054.63186',
            };

            return { messages: [message] };
        });
    });

    beforeAll(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        (console.error as Mock).mockRestore();
    });

    it('should return Submodel Descriptors on successful response', async () => {
        const pagedResult: SubmodelRegistryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllSubmodelDescriptorsRaw.mockResolvedValue(
            createRawResponse(200, {
                pagingMetadata: pagedResult,
                result: [API_SUBMODEL_DESCRIPTOR1, API_SUBMODEL_DESCRIPTOR2],
            })
        );

        const client = new SubmodelRegistryClient();
        const response = await client.getAllSubmodelDescriptors({
            configuration: TEST_CONFIGURATION,
            limit: LIMIT,
            cursor: CURSOR,
        });

        expect(MockSubmodelRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(mockApiInstance.getAllSubmodelDescriptorsRaw).toHaveBeenCalledWith({
            limit: LIMIT,
            cursor: CURSOR,
        });
        expect(convertApiSubmodelDescriptorToCoreSubmodelDescriptor).toHaveBeenCalledTimes(2);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual([CORE_SUBMODEL_DESCRIPTOR1, CORE_SUBMODEL_DESCRIPTOR2]);
            expect(response.statusCode).toBe(200);
        }
    });

    it('should handle errors when fetching Submodel Descriptors', async () => {
        const errorResult: SubmodelRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllSubmodelDescriptorsRaw.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRegistryClient();
        const response = await client.getAllSubmodelDescriptors({
            configuration: TEST_CONFIGURATION,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
            expect(response.statusCode).toBe(400);
        }
    });

    it('should create a new Submodel Descriptor', async () => {
        mockApiInstance.postSubmodelDescriptorRaw.mockResolvedValue(createRawResponse(201, API_SUBMODEL_DESCRIPTOR1));

        const client = new SubmodelRegistryClient();
        const response = await client.postSubmodelDescriptor({
            configuration: TEST_CONFIGURATION,
            submodelDescriptor: CORE_SUBMODEL_DESCRIPTOR1,
        });

        expect(MockSubmodelRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(mockApiInstance.postSubmodelDescriptorRaw).toHaveBeenCalledWith({
            submodelDescriptor: API_SUBMODEL_DESCRIPTOR1,
        });
        expect(convertCoreSubmodelDescriptorToApiSubmodelDescriptor).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1);
        expect(convertApiSubmodelDescriptorToCoreSubmodelDescriptor).toHaveBeenCalledWith(API_SUBMODEL_DESCRIPTOR1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODEL_DESCRIPTOR1);
            expect(response.statusCode).toBe(201);
        }
    });

    it('should handle errors when creating a Submodel Descriptor', async () => {
        const errorResult: SubmodelRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.postSubmodelDescriptorRaw.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRegistryClient();
        const response = await client.postSubmodelDescriptor({
            configuration: TEST_CONFIGURATION,
            submodelDescriptor: CORE_SUBMODEL_DESCRIPTOR1,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
            expect(response.statusCode).toBe(400);
        }
    });

    it('should delete a Submodel Descriptor', async () => {
        mockApiInstance.deleteSubmodelDescriptorByIdRaw.mockResolvedValue(createRawResponse(204, undefined));

        const client = new SubmodelRegistryClient();
        const response = await client.deleteSubmodelDescriptorById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
        });

        expect(MockSubmodelRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1.id);
        expect(mockApiInstance.deleteSubmodelDescriptorByIdRaw).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL_DESCRIPTOR1.id}`,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
        }
    });

    it('should handle errors when deleting a Submodel Descriptor', async () => {
        const errorResult: SubmodelRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.deleteSubmodelDescriptorByIdRaw.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRegistryClient();
        const response = await client.deleteSubmodelDescriptorById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
            expect(response.statusCode).toBe(400);
        }
    });

    it('should get a Submodel Descriptor by ID', async () => {
        mockApiInstance.getSubmodelDescriptorByIdRaw.mockResolvedValue(createRawResponse(200, API_SUBMODEL_DESCRIPTOR1));

        const client = new SubmodelRegistryClient();
        const response = await client.getSubmodelDescriptorById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
        });

        expect(MockSubmodelRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1.id);
        expect(mockApiInstance.getSubmodelDescriptorByIdRaw).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL_DESCRIPTOR1.id}`,
        });
        expect(convertApiSubmodelDescriptorToCoreSubmodelDescriptor).toHaveBeenCalledWith(API_SUBMODEL_DESCRIPTOR1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODEL_DESCRIPTOR1);
            expect(response.statusCode).toBe(200);
        }
    });

    it('should handle errors when getting a Submodel Descriptor by ID', async () => {
        const errorResult: SubmodelRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelDescriptorByIdRaw.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRegistryClient();
        const response = await client.getSubmodelDescriptorById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
            expect(response.statusCode).toBe(400);
        }
    });

    it('should update a Submodel Descriptor', async () => {
        mockApiInstance.putSubmodelDescriptorByIdRaw.mockResolvedValue(createRawResponse(204, undefined));

        const client = new SubmodelRegistryClient();
        const response = await client.putSubmodelDescriptorById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
            submodelDescriptor: CORE_SUBMODEL_DESCRIPTOR1,
        });

        expect(MockSubmodelRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1.id);
        expect(mockApiInstance.putSubmodelDescriptorByIdRaw).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL_DESCRIPTOR1.id}`,
            submodelDescriptor: API_SUBMODEL_DESCRIPTOR1,
        });
        expect(convertCoreSubmodelDescriptorToApiSubmodelDescriptor).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeUndefined();
            expect(response.statusCode).toBe(204);
        }
    });

    it('should create a new Submodel Descriptor during update', async () => {
        mockApiInstance.putSubmodelDescriptorByIdRaw.mockResolvedValue(createRawResponse(201, API_SUBMODEL_DESCRIPTOR1));

        const client = new SubmodelRegistryClient();
        const response = await client.putSubmodelDescriptorById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
            submodelDescriptor: CORE_SUBMODEL_DESCRIPTOR1,
        });

        expect(MockSubmodelRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1.id);
        expect(mockApiInstance.putSubmodelDescriptorByIdRaw).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL_DESCRIPTOR1.id}`,
            submodelDescriptor: API_SUBMODEL_DESCRIPTOR1,
        });
        expect(convertCoreSubmodelDescriptorToApiSubmodelDescriptor).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1);
        expect(convertApiSubmodelDescriptorToCoreSubmodelDescriptor).toHaveBeenCalledWith(API_SUBMODEL_DESCRIPTOR1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODEL_DESCRIPTOR1);
            expect(response.statusCode).toBe(201);
        }
    });

    it('should handle errors when updating a Submodel Descriptor', async () => {
        const errorResult: SubmodelRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.putSubmodelDescriptorByIdRaw.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRegistryClient();
        const response = await client.putSubmodelDescriptorById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
            submodelDescriptor: CORE_SUBMODEL_DESCRIPTOR1,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
            expect(response.statusCode).toBe(400);
        }
    });

    it('should return service description', async () => {
        mockApiInstance.getSelfDescriptionRaw.mockResolvedValue(createRawResponse(200, SERVICE_DESCRIPTION));

        const client = new SubmodelRegistryClient();
        const response = await client.getSelfDescription({
            configuration: TEST_CONFIGURATION,
        });

        expect(MockSubmodelRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(mockApiInstance.getSelfDescriptionRaw).toHaveBeenCalledWith();
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(SERVICE_DESCRIPTION);
            expect(response.statusCode).toBe(200);
        }
    });

    it('should handle errors when getting service description', async () => {
        const errorResult: SubmodelRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSelfDescriptionRaw.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRegistryClient();
        const response = await client.getSelfDescription({
            configuration: TEST_CONFIGURATION,
        });

        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
            expect(response.statusCode).toBe(400);
        }
    });
});
