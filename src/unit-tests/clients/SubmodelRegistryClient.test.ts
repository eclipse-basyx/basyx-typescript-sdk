// Import necessary types
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

// Mock the dependencies
jest.mock('../../generated');
jest.mock('../../lib/convertAasDescriptorTypes');
jest.mock('../../lib/base64Url');
jest.mock('../../lib/errorHandler');

// Define mock constants
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

describe('SubmodelRegistryClient', () => {
    // Create mock for SubmodelRegistryAPIApi
    const mockApiInstance = {
        getAllSubmodelDescriptors: jest.fn(),
        postSubmodelDescriptor: jest.fn(),
        deleteSubmodelDescriptorById: jest.fn(),
        getSubmodelDescriptorById: jest.fn(),
        putSubmodelDescriptorById: jest.fn(),
    };

    // Mock constructor
    const MockSubmodelRegistry = jest.fn(() => mockApiInstance);

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup mock for base64Encode
        (base64Encode as jest.Mock).mockImplementation((input) => `encoded_${input}`);
        // Setup mock for constructor
        (
            jest.requireMock('../../generated').SubmodelRegistryService.SubmodelRegistryAPIApi as jest.Mock
        ).mockImplementation(MockSubmodelRegistry);
        // Setup mocks for conversion functions
        (convertApiSubmodelDescriptorToCoreSubmodelDescriptor as jest.Mock).mockImplementation((submodelDescriptor) => {
            if (submodelDescriptor.id === API_SUBMODEL_DESCRIPTOR1.id) return CORE_SUBMODEL_DESCRIPTOR1;
            if (submodelDescriptor.id === API_SUBMODEL_DESCRIPTOR2.id) return CORE_SUBMODEL_DESCRIPTOR2;
            return null;
        });
        (convertCoreSubmodelDescriptorToApiSubmodelDescriptor as jest.Mock).mockImplementation((submodelDescriptor) => {
            if (submodelDescriptor.id === CORE_SUBMODEL_DESCRIPTOR1.id) return API_SUBMODEL_DESCRIPTOR1;
            if (submodelDescriptor.id === CORE_SUBMODEL_DESCRIPTOR2.id) return API_SUBMODEL_DESCRIPTOR2;
            return null;
        });

        // Mock the error handler to return a standardized Result
        (handleApiError as jest.Mock).mockImplementation(async (err) => {
            // If the error already has messages, return it as is
            if (err?.messages) return err;

            // Create a standard Result with messages
            const timestamp = (1744752054.63186).toString();
            const message: SubmodelRegistryService.Message = {
                code: '400',
                messageType: 'Exception',
                text: err.message || 'Error occurred',
                timestamp: timestamp,
            };

            return { messages: [message] };
        });
    });

    // Mock console.error to prevent logging during tests
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        (console.error as jest.Mock).mockRestore();
    });

    it('should return Submodel Descriptors on successful response', async () => {
        // Arrange
        const pagedResult: SubmodelRegistryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllSubmodelDescriptors.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: [API_SUBMODEL_DESCRIPTOR1, API_SUBMODEL_DESCRIPTOR2],
        });

        const client = new SubmodelRegistryClient();

        // Act
        const response = await client.getAllSubmodelDescriptors({
            configuration: TEST_CONFIGURATION,
            limit: LIMIT,
            cursor: CURSOR,
        });

        // Assert
        expect(MockSubmodelRegistry).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(mockApiInstance.getAllSubmodelDescriptors).toHaveBeenCalledWith({
            limit: LIMIT,
            cursor: CURSOR,
        });
        expect(convertApiSubmodelDescriptorToCoreSubmodelDescriptor).toHaveBeenCalledTimes(2);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual([CORE_SUBMODEL_DESCRIPTOR1, CORE_SUBMODEL_DESCRIPTOR2]);
        }
    });

    it('should handle errors when fetching Submodel Descriptors', async () => {
        // Arrange
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
        mockApiInstance.getAllSubmodelDescriptors.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRegistryClient();

        // Act
        const response = await client.getAllSubmodelDescriptors({
            configuration: TEST_CONFIGURATION,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should create a new Submodel Descriptor', async () => {
        // Arrange
        mockApiInstance.postSubmodelDescriptor.mockResolvedValue(API_SUBMODEL_DESCRIPTOR1);

        const client = new SubmodelRegistryClient();

        // Act
        const response = await client.postSubmodelDescriptor({
            configuration: TEST_CONFIGURATION,
            submodelDescriptor: CORE_SUBMODEL_DESCRIPTOR1,
        });

        // Assert
        expect(MockSubmodelRegistry).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(mockApiInstance.postSubmodelDescriptor).toHaveBeenCalledWith({
            submodelDescriptor: API_SUBMODEL_DESCRIPTOR1,
        });
        expect(convertCoreSubmodelDescriptorToApiSubmodelDescriptor).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1);
        expect(convertApiSubmodelDescriptorToCoreSubmodelDescriptor).toHaveBeenCalledWith(API_SUBMODEL_DESCRIPTOR1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODEL_DESCRIPTOR1);
        }
    });

    it('should handle errors when creating a Submodel Descriptor', async () => {
        // Arrange
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
        mockApiInstance.postSubmodelDescriptor.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRegistryClient();

        // Act
        const response = await client.postSubmodelDescriptor({
            configuration: TEST_CONFIGURATION,
            submodelDescriptor: CORE_SUBMODEL_DESCRIPTOR1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should delete a Submodel Descriptor', async () => {
        // Arrange
        mockApiInstance.deleteSubmodelDescriptorById.mockResolvedValue(undefined);

        const client = new SubmodelRegistryClient();

        // Act
        const response = await client.deleteSubmodelDescriptorById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
        });

        // Assert
        expect(MockSubmodelRegistry).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1.id);
        expect(mockApiInstance.deleteSubmodelDescriptorById).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL_DESCRIPTOR1.id}`,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when deleting a Submodel Descrriptor', async () => {
        // Arrange
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
        mockApiInstance.deleteSubmodelDescriptorById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRegistryClient();

        // Act
        const response = await client.deleteSubmodelDescriptorById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get a Submodel Descriptor by ID', async () => {
        // Arrange
        mockApiInstance.getSubmodelDescriptorById.mockResolvedValue(API_SUBMODEL_DESCRIPTOR1);

        const client = new SubmodelRegistryClient();

        // Act
        const response = await client.getSubmodelDescriptorById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
        });

        // Assert
        expect(MockSubmodelRegistry).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1.id);
        expect(mockApiInstance.getSubmodelDescriptorById).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL_DESCRIPTOR1.id}`,
        });
        expect(convertApiSubmodelDescriptorToCoreSubmodelDescriptor).toHaveBeenCalledWith(API_SUBMODEL_DESCRIPTOR1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODEL_DESCRIPTOR1);
        }
    });

    it('should handle errors when getting a Submodel Descriptor by ID', async () => {
        // Arrange
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
        mockApiInstance.getSubmodelDescriptorById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRegistryClient();

        // Act
        const response = await client.getSubmodelDescriptorById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update a Submodel Descriptor', async () => {
        // Arrange
        mockApiInstance.putSubmodelDescriptorById.mockResolvedValue(undefined);

        const client = new SubmodelRegistryClient();

        // Act
        const response = await client.putSubmodelDescriptorById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
            submodelDescriptor: CORE_SUBMODEL_DESCRIPTOR1,
        });

        // Assert
        expect(MockSubmodelRegistry).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1.id);
        expect(mockApiInstance.putSubmodelDescriptorById).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL_DESCRIPTOR1.id}`,
            submodelDescriptor: API_SUBMODEL_DESCRIPTOR1,
        });
        expect(convertCoreSubmodelDescriptorToApiSubmodelDescriptor).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1);
        expect(response.success).toBe(true);
    });

    it('should create a new Submodel Descriptor during update', async () => {
        // Arrange
        mockApiInstance.putSubmodelDescriptorById.mockResolvedValue(API_SUBMODEL_DESCRIPTOR1);

        const client = new SubmodelRegistryClient();

        // Act
        const response = await client.putSubmodelDescriptorById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
            submodelDescriptor: CORE_SUBMODEL_DESCRIPTOR1,
        });

        // Assert
        expect(MockSubmodelRegistry).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1.id);
        expect(mockApiInstance.putSubmodelDescriptorById).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL_DESCRIPTOR1.id}`,
            submodelDescriptor: API_SUBMODEL_DESCRIPTOR1,
        });
        expect(convertCoreSubmodelDescriptorToApiSubmodelDescriptor).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1);
        expect(convertApiSubmodelDescriptorToCoreSubmodelDescriptor).toHaveBeenCalledWith(API_SUBMODEL_DESCRIPTOR1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODEL_DESCRIPTOR1); // After conversion
        }
    });

    it('should handle errors when updating a Submodel Descriptor', async () => {
        // Arrange
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
        mockApiInstance.putSubmodelDescriptorById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRegistryClient();

        // Act
        const response = await client.putSubmodelDescriptorById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
            submodelDescriptor: CORE_SUBMODEL_DESCRIPTOR1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });
});
