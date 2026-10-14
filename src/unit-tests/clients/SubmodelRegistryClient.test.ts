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
import {
    AndExpression,
    BooleanLiteral,
    EqualComparison,
    FieldOperand,
    Query,
    QuerySelect,
    StringLiteral,
} from '../../models/Query';

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
        querySubmodelDescriptorsRaw: vi.fn(),
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
                timestamp: '2025-04-15T21:20:54.631Z',
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
                paging_metadata: pagedResult,
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
                    timestamp: '2025-04-15T21:20:54.631Z',
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
                    timestamp: '2025-04-15T21:20:54.631Z',
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
                    timestamp: '2025-04-15T21:20:54.631Z',
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
        mockApiInstance.getSubmodelDescriptorByIdRaw.mockResolvedValue(
            createRawResponse(200, API_SUBMODEL_DESCRIPTOR1)
        );

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
                    timestamp: '2025-04-15T21:20:54.631Z',
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
        mockApiInstance.putSubmodelDescriptorByIdRaw.mockResolvedValue(
            createRawResponse(201, API_SUBMODEL_DESCRIPTOR1)
        );

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
                    timestamp: '2025-04-15T21:20:54.631Z',
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
                    timestamp: '2025-04-15T21:20:54.631Z',
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

    describe('querySubmodelDescriptors', () => {
        const QUERY = new Query(
            new EqualComparison([new FieldOperand('$smdesc#idShort'), new StringLiteral('Nameplate')])
        );
        const QUERY_JSON = { $condition: { $eq: [{ $field: '$smdesc#idShort' }, { $strVal: 'Nameplate' }] } };
        const queryRaw = () => (mockApiInstance as unknown as Record<string, Mock>).querySubmodelDescriptorsRaw;
        const queryResponse = (value: unknown, status = 200) => ({
            raw: { status },
            value: vi.fn().mockResolvedValue(value),
        });

        it('should return Submodel Descriptors that conform to the query', async () => {
            // Arrange
            const pagedResult = { cursor: 'next-cursor' };
            queryRaw().mockResolvedValue(
                queryResponse({
                    paging_metadata: pagedResult,
                    result: [API_SUBMODEL_DESCRIPTOR1, API_SUBMODEL_DESCRIPTOR2],
                })
            );

            const client = new SubmodelRegistryClient();

            // Act
            const response = await client.querySubmodelDescriptors({
                configuration: TEST_CONFIGURATION,
                query: QUERY,
                limit: 2,
                cursor: 'current-cursor',
            });

            // Assert
            expect(MockSubmodelRegistry).toHaveBeenCalledWith(expectConfigurationCall());
            expect(queryRaw()).toHaveBeenCalledWith({ query: QUERY_JSON, limit: 2, cursor: 'current-cursor' });
            expect(convertApiSubmodelDescriptorToCoreSubmodelDescriptor).toHaveBeenCalledTimes(2);
            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.statusCode).toBe(200);
                expect(response.data.pagedResult).toBe(pagedResult);
                expect(response.data.resultType).toBe('SubmodelDescriptor');
                expect(response.data.result).toEqual([CORE_SUBMODEL_DESCRIPTOR1, CORE_SUBMODEL_DESCRIPTOR2]);
            }
        });

        it('should return identifiers if the query selects them', async () => {
            // Arrange
            queryRaw().mockResolvedValue(
                queryResponse({
                    paging_metadata: { resultType: 'Identifier' },
                    result: [API_SUBMODEL_DESCRIPTOR1.id, API_SUBMODEL_DESCRIPTOR2.id],
                })
            );

            const client = new SubmodelRegistryClient();

            // Act
            const response = await client.querySubmodelDescriptors({
                configuration: TEST_CONFIGURATION,
                query: new Query(QUERY.condition, QuerySelect.Id),
            });

            // Assert
            expect(queryRaw()).toHaveBeenCalledWith({
                query: { $select: 'id', ...QUERY_JSON },
                limit: undefined,
                cursor: undefined,
            });
            expect(convertApiSubmodelDescriptorToCoreSubmodelDescriptor).not.toHaveBeenCalled();
            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.data.resultType).toBe('Identifier');
                expect(response.data.result).toEqual([API_SUBMODEL_DESCRIPTOR1.id, API_SUBMODEL_DESCRIPTOR2.id]);
            }
        });

        it('should handle errors when querying Submodel Descriptors', async () => {
            // Arrange
            const errorResult = {
                messages: [
                    {
                        code: '400',
                        messageType: 'Error' as const,
                        text: 'field $and length: must be >= 2',
                        timestamp: '2025-04-15T21:20:54.631Z',
                    },
                ],
            };
            queryRaw().mockRejectedValue({ response: { status: 400 } });
            (handleApiError as Mock).mockResolvedValue(errorResult);

            const client = new SubmodelRegistryClient();

            // Act
            const response = await client.querySubmodelDescriptors({
                configuration: TEST_CONFIGURATION,
                query: new Query(new AndExpression([new BooleanLiteral(true)])),
            });

            // Assert
            expect(queryRaw()).toHaveBeenCalledWith({
                query: { $condition: { $and: [{ $boolean: true }] } },
                limit: undefined,
                cursor: undefined,
            });
            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.statusCode).toBe(400);
                expect(response.error).toEqual(errorResult);
            }
        });

        it('should fail with bad request without a query', async () => {
            // Arrange
            const client = new SubmodelRegistryClient();

            // Act
            const response = await client.querySubmodelDescriptors({
                configuration: TEST_CONFIGURATION,
                query: undefined as unknown as Query,
            });

            // Assert
            expect(queryRaw()).not.toHaveBeenCalled();
            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.statusCode).toBe(400);
            }
        });
    });
});
