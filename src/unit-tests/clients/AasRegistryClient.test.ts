// Import necessary types
//import { AssetKind } from '@aas-core-works/aas-core3.1-typescript/types';
import { AasRegistryClient } from '../../clients/AasRegistryClient';
import { AasRegistryService } from '../../generated';
import { Configuration } from '../../generated/runtime';
import { base64Encode } from '../../lib/base64Url';
import {
    convertApiAasDescriptorToCoreAasDescriptor,
    convertApiSubmodelDescriptorToCoreSubmodelDescriptor,
    convertCoreAasDescriptorToApiAasDescriptor,
    convertCoreSubmodelDescriptorToApiSubmodelDescriptor,
} from '../../lib/convertAasDescriptorTypes';
import { handleApiError } from '../../lib/errorHandler';
import {
    AssetAdministrationShellDescriptor as CoreAssetAdministrationShellDescriptor,
    SubmodelDescriptor as CoreSubmodelDescriptor,
} from '../../models/Descriptors';

// Mock the dependencies
jest.mock('../../generated');
jest.mock('../../lib/convertAasDescriptorTypes');
jest.mock('../../lib/base64Url');
jest.mock('../../lib/errorHandler');
// Define mock constants
//const ID_SHORT = 'shellDescriptorIdShort';
const LIMIT = 10;
const CURSOR = 'cursor123';
const ASSET_TYPE = 'https://example.com/asset-types/sample';
const ASSET_KIND = AasRegistryService.AssetKind.Instance;
const API_AAS_DESCRIPTOR1: AasRegistryService.AssetAdministrationShellDescriptor = {
    id: 'https://example.com/ids/aas-desc/1234',
    //assetInformation: { assetKind: 'Instance' },
};
const API_AAS_DESCRIPTOR2: AasRegistryService.AssetAdministrationShellDescriptor = {
    id: 'https://example.com/ids/aas-desc/5678',
    //assetInformation: { assetKind: 'Instance' },
};
const CORE_AAS_DESCRIPTOR1: CoreAssetAdministrationShellDescriptor = new CoreAssetAdministrationShellDescriptor(
    'https://example.com/ids/aas-desc/1234'
    // new CoreAssetInformation(AssetKind.Instance)
);
const CORE_AAS_DESCRIPTOR2: CoreAssetAdministrationShellDescriptor = new CoreAssetAdministrationShellDescriptor(
    'https://example.com/ids/aas-desc/5678'
    //new CoreAssetInformation(AssetKind.Instance)
);
const API_SUBMODEL_DESCRIPTOR1: AasRegistryService.SubmodelDescriptor = {
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
const API_SUBMODEL_DESCRIPTOR2: AasRegistryService.SubmodelDescriptor = {
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
    // new CoreAssetInformation(AssetKind.Instance)
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
    basePath: 'http://localhost:8084',
    fetchApi: globalThis.fetch,
});

describe('AasRegistryClient', () => {
    // Helper function to create expected configuration matcher
    const expectConfigurationCall = () =>
        expect.objectContaining({
            basePath: 'http://localhost:8084',
            fetchApi: globalThis.fetch,
        });

    // Create mock for AssetAdministrationShellRegistryAPIApi
    const mockApiInstance = {
        getAllAssetAdministrationShellDescriptors: jest.fn(),
        postAssetAdministrationShellDescriptor: jest.fn(),
        deleteAssetAdministrationShellDescriptorById: jest.fn(),
        getAssetAdministrationShellDescriptorById: jest.fn(),
        putAssetAdministrationShellDescriptorById: jest.fn(),
        getAllSubmodelDescriptorsThroughSuperpath: jest.fn(),
        postSubmodelDescriptorThroughSuperpath: jest.fn(),
        getSubmodelDescriptorByIdThroughSuperpath: jest.fn(),
        deleteSubmodelDescriptorByIdThroughSuperpath: jest.fn(),
        putSubmodelDescriptorByIdThroughSuperpath: jest.fn(),
    };

    // Mock constructor
    const MockAasRegistry = jest.fn(() => mockApiInstance);

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup mock for base64Encode
        (base64Encode as jest.Mock).mockImplementation((input) => `encoded_${input}`);
        // Setup mock for constructor
        (
            jest.requireMock('../../generated').AasRegistryService.AssetAdministrationShellRegistryAPIApi as jest.Mock
        ).mockImplementation(MockAasRegistry);
        // Setup mocks for conversion functions
        (convertApiAasDescriptorToCoreAasDescriptor as jest.Mock).mockImplementation((aasDescriptor) => {
            if (aasDescriptor.id === API_AAS_DESCRIPTOR1.id) return CORE_AAS_DESCRIPTOR1;
            if (aasDescriptor.id === API_AAS_DESCRIPTOR2.id) return CORE_AAS_DESCRIPTOR2;
            return null;
        });
        (convertCoreAasDescriptorToApiAasDescriptor as jest.Mock).mockImplementation((aasDescriptor) => {
            if (aasDescriptor.id === CORE_AAS_DESCRIPTOR1.id) return API_AAS_DESCRIPTOR1;
            if (aasDescriptor.id === CORE_AAS_DESCRIPTOR2.id) return API_AAS_DESCRIPTOR2;
            return null;
        });
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
            const message: AasRegistryService.Message = {
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

    it('should return Asset Administration Shell Descriptors on successful response', async () => {
        // Arrange
        const pagedResult: AasRegistryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllAssetAdministrationShellDescriptors.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: [API_AAS_DESCRIPTOR1, API_AAS_DESCRIPTOR2],
        });

        const client = new AasRegistryClient();

        // Act
        const response = await client.getAllAssetAdministrationShellDescriptors({
            configuration: TEST_CONFIGURATION,
            limit: LIMIT,
            cursor: CURSOR,
            assetKind: ASSET_KIND,
            assetType: ASSET_TYPE,
        });

        // Assert
        expect(MockAasRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(mockApiInstance.getAllAssetAdministrationShellDescriptors).toHaveBeenCalledWith({
            limit: LIMIT,
            cursor: CURSOR,
            assetKind: ASSET_KIND,
            assetType: `encoded_${ASSET_TYPE}`,
        });
        expect(convertApiAasDescriptorToCoreAasDescriptor).toHaveBeenCalledTimes(2);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual([CORE_AAS_DESCRIPTOR1, CORE_AAS_DESCRIPTOR2]);
        }
    });

    it('should handle errors when fetching Asset Administration Shell Descriptors', async () => {
        // Arrange
        const errorResult: AasRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllAssetAdministrationShellDescriptors.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRegistryClient();

        // Act
        const response = await client.getAllAssetAdministrationShellDescriptors({
            configuration: TEST_CONFIGURATION,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should create a new Asset Administration Shell Descriptor', async () => {
        // Arrange
        mockApiInstance.postAssetAdministrationShellDescriptor.mockResolvedValue(API_AAS_DESCRIPTOR1);

        const client = new AasRegistryClient();

        // Act
        const response = await client.postAssetAdministrationShellDescriptor({
            configuration: TEST_CONFIGURATION,
            assetAdministrationShellDescriptor: CORE_AAS_DESCRIPTOR1,
        });

        // Assert
        expect(MockAasRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(mockApiInstance.postAssetAdministrationShellDescriptor).toHaveBeenCalledWith({
            assetAdministrationShellDescriptor: API_AAS_DESCRIPTOR1,
        });
        expect(convertCoreAasDescriptorToApiAasDescriptor).toHaveBeenCalledWith(CORE_AAS_DESCRIPTOR1);
        expect(convertApiAasDescriptorToCoreAasDescriptor).toHaveBeenCalledWith(API_AAS_DESCRIPTOR1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_AAS_DESCRIPTOR1);
        }
    });

    it('should handle errors when creating an Asset Administration Shell Descriptor', async () => {
        // Arrange
        const errorResult: AasRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.postAssetAdministrationShellDescriptor.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRegistryClient();

        // Act
        const response = await client.postAssetAdministrationShellDescriptor({
            configuration: TEST_CONFIGURATION,
            assetAdministrationShellDescriptor: CORE_AAS_DESCRIPTOR1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should delete an Asset Administration Shell Descriptor', async () => {
        // Arrange
        mockApiInstance.deleteAssetAdministrationShellDescriptorById.mockResolvedValue(undefined);

        const client = new AasRegistryClient();

        // Act
        const response = await client.deleteAssetAdministrationShellDescriptorById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
        });

        // Assert
        expect(MockAasRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS_DESCRIPTOR1.id);
        expect(mockApiInstance.deleteAssetAdministrationShellDescriptorById).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS_DESCRIPTOR1.id}`,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when deleting an Asset Administration Shell Descrriptor', async () => {
        // Arrange
        const errorResult: AasRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.deleteAssetAdministrationShellDescriptorById.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRegistryClient();

        // Act
        const response = await client.deleteAssetAdministrationShellDescriptorById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get an Asset Administration Shell Descriptor by ID', async () => {
        // Arrange
        mockApiInstance.getAssetAdministrationShellDescriptorById.mockResolvedValue(API_AAS_DESCRIPTOR1);

        const client = new AasRegistryClient();

        // Act
        const response = await client.getAssetAdministrationShellDescriptorById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
        });

        // Assert
        expect(MockAasRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS_DESCRIPTOR1.id);
        expect(mockApiInstance.getAssetAdministrationShellDescriptorById).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS_DESCRIPTOR1.id}`,
        });
        expect(convertApiAasDescriptorToCoreAasDescriptor).toHaveBeenCalledWith(API_AAS_DESCRIPTOR1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_AAS_DESCRIPTOR1);
        }
    });

    it('should handle errors when getting an Asset Administration Shell Descriptor by ID', async () => {
        // Arrange
        const errorResult: AasRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAssetAdministrationShellDescriptorById.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRegistryClient();

        // Act
        const response = await client.getAssetAdministrationShellDescriptorById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update an Asset Administration Shell Descriptor', async () => {
        // Arrange
        mockApiInstance.putAssetAdministrationShellDescriptorById.mockResolvedValue(undefined);

        const client = new AasRegistryClient();

        // Act
        const response = await client.putAssetAdministrationShellDescriptorById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
            assetAdministrationShellDescriptor: CORE_AAS_DESCRIPTOR1,
        });

        // Assert
        expect(MockAasRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS_DESCRIPTOR1.id);
        expect(mockApiInstance.putAssetAdministrationShellDescriptorById).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS_DESCRIPTOR1.id}`,
            assetAdministrationShellDescriptor: API_AAS_DESCRIPTOR1,
        });
        expect(convertCoreAasDescriptorToApiAasDescriptor).toHaveBeenCalledWith(CORE_AAS_DESCRIPTOR1);
        expect(response.success).toBe(true);
    });

    it('should create a new Asset Administration Shell Descriptor', async () => {
        // Arrange
        mockApiInstance.putAssetAdministrationShellDescriptorById.mockResolvedValue(API_AAS_DESCRIPTOR1);

        const client = new AasRegistryClient();

        // Act
        const response = await client.putAssetAdministrationShellDescriptorById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
            assetAdministrationShellDescriptor: CORE_AAS_DESCRIPTOR1,
        });

        // Assert
        expect(MockAasRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS_DESCRIPTOR1.id);
        expect(mockApiInstance.putAssetAdministrationShellDescriptorById).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS_DESCRIPTOR1.id}`,
            assetAdministrationShellDescriptor: API_AAS_DESCRIPTOR1,
        });
        expect(convertCoreAasDescriptorToApiAasDescriptor).toHaveBeenCalledWith(CORE_AAS_DESCRIPTOR1);
        expect(convertApiAasDescriptorToCoreAasDescriptor).toHaveBeenCalledWith(API_AAS_DESCRIPTOR1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_AAS_DESCRIPTOR1); // After conversion
        }
    });
    it('should handle errors when updating an Asset Administration Shell Descriptor', async () => {
        // Arrange
        const errorResult: AasRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.putAssetAdministrationShellDescriptorById.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRegistryClient();

        // Act
        const response = await client.putAssetAdministrationShellDescriptorById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
            assetAdministrationShellDescriptor: CORE_AAS_DESCRIPTOR1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should return Submodel Descriptors on successful response', async () => {
        // Arrange
        const pagedResult: AasRegistryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllSubmodelDescriptorsThroughSuperpath.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: [API_SUBMODEL_DESCRIPTOR1, API_SUBMODEL_DESCRIPTOR2],
        });

        const client = new AasRegistryClient();

        // Act
        const response = await client.getAllSubmodelDescriptorsThroughSuperpath({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
            limit: LIMIT,
            cursor: CURSOR,
        });

        // Assert
        expect(MockAasRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS_DESCRIPTOR1.id);
        expect(mockApiInstance.getAllSubmodelDescriptorsThroughSuperpath).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS_DESCRIPTOR1.id}`,
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
        const errorResult: AasRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllSubmodelDescriptorsThroughSuperpath.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRegistryClient();

        // Act
        const response = await client.getAllSubmodelDescriptorsThroughSuperpath({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should create a new Submodel Descriptor', async () => {
        // Arrange
        mockApiInstance.postSubmodelDescriptorThroughSuperpath.mockResolvedValue(API_SUBMODEL_DESCRIPTOR1);

        const client = new AasRegistryClient();

        // Act
        const response = await client.postSubmodelDescriptorThroughSuperpath({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
            submodelDescriptor: CORE_SUBMODEL_DESCRIPTOR1,
        });

        // Assert
        expect(MockAasRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS_DESCRIPTOR1.id);
        expect(mockApiInstance.postSubmodelDescriptorThroughSuperpath).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS_DESCRIPTOR1.id}`,
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
        const errorResult: AasRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.postSubmodelDescriptorThroughSuperpath.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRegistryClient();

        // Act
        const response = await client.postSubmodelDescriptorThroughSuperpath({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
            submodelDescriptor: CORE_SUBMODEL_DESCRIPTOR1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get a Submodel Descriptor by ID', async () => {
        // Arrange
        mockApiInstance.getSubmodelDescriptorByIdThroughSuperpath.mockResolvedValue(API_SUBMODEL_DESCRIPTOR1);

        const client = new AasRegistryClient();

        // Act
        const response = await client.getSubmodelDescriptorByIdThroughSuperpath({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
        });

        // Assert
        expect(MockAasRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS_DESCRIPTOR1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1.id);
        expect(mockApiInstance.getSubmodelDescriptorByIdThroughSuperpath).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS_DESCRIPTOR1.id}`,
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
        const errorResult: AasRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelDescriptorByIdThroughSuperpath.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRegistryClient();

        // Act
        const response = await client.getSubmodelDescriptorByIdThroughSuperpath({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should delete a Submodel Descriptor', async () => {
        // Arrange
        mockApiInstance.deleteSubmodelDescriptorByIdThroughSuperpath.mockResolvedValue(undefined);

        const client = new AasRegistryClient();

        // Act
        const response = await client.deleteSubmodelDescriptorByIdThroughSuperpath({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
        });

        // Assert
        expect(MockAasRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS_DESCRIPTOR1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1.id);
        expect(mockApiInstance.deleteSubmodelDescriptorByIdThroughSuperpath).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS_DESCRIPTOR1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL_DESCRIPTOR1.id}`,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when deleting a Submodel Descrriptor', async () => {
        // Arrange
        const errorResult: AasRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.deleteSubmodelDescriptorByIdThroughSuperpath.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRegistryClient();

        // Act
        const response = await client.deleteSubmodelDescriptorByIdThroughSuperpath({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
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
        mockApiInstance.putSubmodelDescriptorByIdThroughSuperpath.mockResolvedValue(undefined);

        const client = new AasRegistryClient();

        // Act
        const response = await client.putSubmodelDescriptorByIdThroughSuperpath({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
            submodelDescriptor: CORE_SUBMODEL_DESCRIPTOR1,
        });

        // Assert
        expect(MockAasRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS_DESCRIPTOR1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1.id);
        expect(mockApiInstance.putSubmodelDescriptorByIdThroughSuperpath).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS_DESCRIPTOR1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL_DESCRIPTOR1.id}`,
            submodelDescriptor: API_SUBMODEL_DESCRIPTOR1,
        });
        expect(convertCoreSubmodelDescriptorToApiSubmodelDescriptor).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1);
        expect(response.success).toBe(true);
    });

    it('should create a new Submodel Descriptor during update', async () => {
        // Arrange
        mockApiInstance.putSubmodelDescriptorByIdThroughSuperpath.mockResolvedValue(API_SUBMODEL_DESCRIPTOR1);

        const client = new AasRegistryClient();

        // Act
        const response = await client.putSubmodelDescriptorByIdThroughSuperpath({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
            submodelIdentifier: CORE_SUBMODEL_DESCRIPTOR1.id,
            submodelDescriptor: CORE_SUBMODEL_DESCRIPTOR1,
        });

        // Assert
        expect(MockAasRegistry).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS_DESCRIPTOR1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR1.id);
        expect(mockApiInstance.putSubmodelDescriptorByIdThroughSuperpath).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS_DESCRIPTOR1.id}`,
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
        const errorResult: AasRegistryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.putSubmodelDescriptorByIdThroughSuperpath.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRegistryClient();

        // Act
        const response = await client.putSubmodelDescriptorByIdThroughSuperpath({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS_DESCRIPTOR1.id,
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
