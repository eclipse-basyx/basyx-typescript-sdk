// Import necessary types
//import type { PagedResultPagingMetadata, Result } from '../../generated';
import {
    AssetAdministrationShell as CoreAssetAdministrationShell,
    AssetInformation as CoreAssetInformation,
    AssetKind,
    ISubmodelElement as CoreSubmodelElement,
    Submodel as CoreSubmodel,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { SubmodelRepositoryClient } from '../../clients/SubmodelRepositoryClient';
import { SubmodelRepositoryService } from '../../generated';
import { Configuration } from '../../generated/runtime';
import { ModelType } from '../../generated/SubmodelRepositoryService';
import { base64Encode } from '../../lib/base64Url';
import {
    convertApiSubmodelElementToCoreSubmodelElement,
    convertApiSubmodelToCoreSubmodel,
    convertCoreSubmodelElementToApiSubmodelElement,
    convertCoreSubmodelToApiSubmodel,
} from '../../lib/convertSubmodelTypes';
import { handleApiError } from '../../lib/errorHandler';

// Mock the dependencies
//jest.mock('../../generated');
jest.mock('../../generated');
jest.mock('../../lib/convertSubmodelTypes');
jest.mock('../../lib/base64Url');
jest.mock('../../lib/errorHandler');

// Define mock constants

const SEMANTIC_ID = JSON.stringify({
    type: 'ExternalReference',
    keys: [
        {
            type: 'GlobalReference',
            value: 'https://example.com/ids/sm/123',
        },
    ],
});
const ID_SHORT = 'testProperty';
const ID_SHORT_PATH = 'temperature';
const LIMIT = 10;
const CURSOR = 'cursor123';
const LEVEL_SE_BY_PATH = SubmodelRepositoryService.PutSubmodelElementByPathSubmodelRepoLevelEnum.Deep;
const LEVEL_SUBMODELS = SubmodelRepositoryService.GetAllSubmodelsLevelEnum.Deep;
const EXTENT_SUBMODELS = SubmodelRepositoryService.GetAllSubmodelsExtentEnum.WithBlobValue;
const API_SUBMODEL1: SubmodelRepositoryService.Submodel = {
    id: 'https://example.com/ids/sm/123',
    modelType: 'Submodel',
};
const API_SUBMODEL2: SubmodelRepositoryService.Submodel = {
    id: 'https://example.com/ids/sm/234',
    modelType: 'Submodel',
};
const LEVEL_SUBMODEL = SubmodelRepositoryService.GetSubmodelByIdLevelEnum.Deep;
const EXTENT_SUBMODEL = SubmodelRepositoryService.GetSubmodelByIdExtentEnum.WithBlobValue;

const API_SUBMODELELEMENT_PROPERTY: SubmodelRepositoryService.SubmodelElement = {
    idShort: 'temperature',
    modelType: ModelType.Property,
    //value: '22.5',
};
const API_SUBMODELELEMENT_VALUE: SubmodelRepositoryService.PropertyValue = 22.5;
const CORE_SUBMODELELEMENT_PROPERTY: CoreSubmodelElement = {
    idShort: 'temperature',
    // Add other properties as needed
} as CoreSubmodelElement;

const API_SUBMODELELEMENT1: SubmodelRepositoryService.SubmodelElement = {
    //id: 'https://example.com/ids/submodel/123',
    modelType: ModelType.SubmodelElementList,
};
const API_SUBMODELELEMENT2: SubmodelRepositoryService.SubmodelElement = {
    //id: 'https://example.com/ids/submodel/123',
    modelType: ModelType.SubmodelElementCollection,
};
const CORE_SUBMODELELEMENT1: CoreSubmodelElement = {} as CoreSubmodelElement;
//const CORE_SUBMODELELEMENT1: CoreSubmodelElement = new CoreSubmodelElementList();
const CORE_SUBMODELELEMENT2: CoreSubmodelElement = {} as CoreSubmodelElement;

const LEVEL_SUBMODELELEMENT = SubmodelRepositoryService.GetAllSubmodelElementsLevelEnum.Deep;
const EXTENT_SUBMODELELEMENT = SubmodelRepositoryService.GetAllSubmodelElementsExtentEnum.WithBlobValue;

const API_SUBMODEL_METADATA: SubmodelRepositoryService.SubmodelMetadata = {
    id: 'https://example.com/ids/sm/123',
    modelType: ModelType.Submodel,
    // other metadata properties...,
};
const LEVEL_SUBMODEL_VALUE = SubmodelRepositoryService.GetSubmodelByIdValueOnlyLevelEnum.Deep;
const EXTENT_SUBMODEL_VALUE = SubmodelRepositoryService.GetSubmodelByIdValueOnlyExtentEnum.WithBlobValue;
const API_SUBMODEL_VALUE = {
    // Sample value-only representation of a submodel
    propertyA: 'value1',
    propertyB: 42,
    nestedProperty: {
        propertyC: true,
    },
};
const LEVEL_SUBMODEL_VALUE1 = SubmodelRepositoryService.PatchSubmodelByIdValueOnlyLevelEnum.Core;
const BODY = {
    propertyA: 'sample value',
    propertyB: 99,
    nestedProperty: {
        propertyC: false,
    },
};
const LEVEL_SUBMODELELEMENT_VALUE_BY_PATH =
    SubmodelRepositoryService.GetSubmodelElementByPathValueOnlySubmodelRepoLevelEnum.Deep;
const EXTENT_SUBMODELELEMENT_VALUE_BY_PATH =
    SubmodelRepositoryService.GetSubmodelElementByPathValueOnlySubmodelRepoExtentEnum.WithBlobValue;

const LEVEL_SUBMODELELEMENT_BY_PATH = SubmodelRepositoryService.GetSubmodelElementByPathSubmodelRepoLevelEnum.Deep;
const EXTENT_SUBMODELELEMENT_BY_PATH =
    SubmodelRepositoryService.GetSubmodelElementByPathSubmodelRepoExtentEnum.WithBlobValue;
const CORE_SUBMODEL1: CoreSubmodel = new CoreSubmodel('https://example.com/ids/sm/123');
const CORE_SUBMODEL2: CoreSubmodel = new CoreSubmodel('https://example.com/ids/sm/234');
const LEVEL_SE_VALUE_PATCH = SubmodelRepositoryService.PatchSubmodelElementByPathValueOnlySubmodelRepoLevelEnum.Core;
const OPERATION_REQUEST: SubmodelRepositoryService.OperationRequest = {
    inputArguments: [
        {
            value: {
                idShort: 'temperature',
                value: '25',
                modelType: 'Property',
            },
        },
    ],
};
const OPERATION_RESULT: SubmodelRepositoryService.OperationResult = {
    success: true,
    outputArguments: [
        {
            value: {
                idShort: 'status',
                value: 'ok',
                modelType: 'Property',
            },
        },
    ],
};
const CORE_AAS: CoreAssetAdministrationShell = new CoreAssetAdministrationShell(
    'https://example.com/ids/aas/7600_5912_3951_6917',
    new CoreAssetInformation(AssetKind.Instance)
);
const OPERATION_REQUEST_VALUEONLY: SubmodelRepositoryService.OperationRequestValueOnly = {
    inputArguments: {
        temperature: '25',
    },
    clientTimeoutDuration: '10S',
};
const OPERATION_RESULT_VALUEONLY: SubmodelRepositoryService.OperationResultValueOnly = {
    outputArguments: {
        status: 'ok',
    },
};
const TEST_CONFIGURATION = new Configuration({
    basePath: 'http://localhost:8082',
    fetchApi: globalThis.fetch,
});

describe('SubmodelRepositoryClient', () => {
    // Helper function to create expected configuration matcher
    const expectConfigurationCall = () =>
        expect.objectContaining({
            basePath: 'http://localhost:8082',
            fetchApi: globalThis.fetch,
        });

    // Create mock for SubmodelRepositoryAPIApi
    const mockApiInstance = {
        getAllSubmodels: jest.fn(),
        postSubmodel: jest.fn(),
        deleteSubmodelById: jest.fn(),
        getSubmodelById: jest.fn(),
        putSubmodelById: jest.fn(),
        getAllSubmodelElements: jest.fn(),
        postSubmodelElementSubmodelRepo: jest.fn(),
        getSubmodelElementByPathSubmodelRepo: jest.fn(),
        postSubmodelElementByPathSubmodelRepo: jest.fn(),
        deleteSubmodelElementByPathSubmodelRepo: jest.fn(),
        putSubmodelElementByPathSubmodelRepo: jest.fn(),
        getSubmodelByIdMetadata: jest.fn(),
        getSubmodelByIdValueOnly: jest.fn(),
        patchSubmodelByIdValueOnly: jest.fn(),
        getSubmodelElementByPathValueOnlySubmodelRepo: jest.fn(),
        patchSubmodelElementByPathValueOnlySubmodelRepo: jest.fn(),
        invokeOperationSubmodelRepo: jest.fn(),
        invokeOperationValueOnly: jest.fn(),
        invokeOperationAsync: jest.fn(),
        invokeOperationAsyncValueOnly: jest.fn(),
    };

    // Mock constructor
    const MockSubmodelRepository = jest.fn(() => mockApiInstance);

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup mock for base64Encode
        (base64Encode as jest.Mock).mockImplementation((input) => `encoded_${input}`);
        // Setup mock for constructor
        (
            jest.requireMock('../../generated').SubmodelRepositoryService.SubmodelRepositoryAPIApi as jest.Mock
        ).mockImplementation(MockSubmodelRepository);
        // Setup mocks for conversion functions
        (convertApiSubmodelToCoreSubmodel as jest.Mock).mockImplementation((submodel) => {
            if (submodel.id === API_SUBMODEL1.id) return CORE_SUBMODEL1;
            if (submodel.id === API_SUBMODEL2.id) return CORE_SUBMODEL2;
            return null;
        });
        (convertCoreSubmodelToApiSubmodel as jest.Mock).mockImplementation((submodel) => {
            if (submodel.id === CORE_SUBMODEL1.id) return API_SUBMODEL1;
            if (submodel.id === CORE_SUBMODEL2.id) return API_SUBMODEL2;
            return null;
        });
        (convertApiSubmodelElementToCoreSubmodelElement as jest.Mock).mockImplementation((submodelElement) => {
            if (submodelElement === API_SUBMODELELEMENT1) return CORE_SUBMODELELEMENT1;
            if (submodelElement === API_SUBMODELELEMENT2) return CORE_SUBMODELELEMENT2;
            if (submodelElement === API_SUBMODELELEMENT_PROPERTY) return CORE_SUBMODELELEMENT_PROPERTY;
            return null;
        });
        (convertCoreSubmodelElementToApiSubmodelElement as jest.Mock).mockImplementation((submodelElement) => {
            if (submodelElement === CORE_SUBMODELELEMENT1) return API_SUBMODELELEMENT1;
            if (submodelElement === CORE_SUBMODELELEMENT2) return API_SUBMODELELEMENT2;
            if (submodelElement === CORE_SUBMODELELEMENT_PROPERTY) return API_SUBMODELELEMENT_PROPERTY;
            return null;
        });

        // Mock the error handler to return a standardized Result
        (handleApiError as jest.Mock).mockImplementation(async (err) => {
            // If the error already has messages, return it as is
            if (err?.messages) return err;

            // Create a standard Result with messages
            const timestamp = (1744752054.63186).toString();
            const message: SubmodelRepositoryService.Message = {
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

    it('should return Submodels on successful response', async () => {
        // Arrange
        const pagedResult: SubmodelRepositoryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllSubmodels.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: [API_SUBMODEL1, API_SUBMODEL2],
        });

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getAllSubmodels({
            configuration: TEST_CONFIGURATION,
            semanticId: SEMANTIC_ID,
            idShort: ID_SHORT,
            limit: LIMIT,
            cursor: CURSOR,
            level: LEVEL_SUBMODELS,
            extent: EXTENT_SUBMODELS,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(mockApiInstance.getAllSubmodels).toHaveBeenCalledWith({
            semanticId: `encoded_${JSON.stringify(SEMANTIC_ID)}`,
            idShort: ID_SHORT,
            limit: LIMIT,
            cursor: CURSOR,
            level: LEVEL_SUBMODELS,
            extent: EXTENT_SUBMODELS,
        });
        expect(convertApiSubmodelToCoreSubmodel).toHaveBeenCalledTimes(2);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual([CORE_SUBMODEL1, CORE_SUBMODEL2]);
        }
    });

    it('should handle errors when fetching Submodels', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllSubmodels.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getAllSubmodels({
            configuration: TEST_CONFIGURATION,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should create a new Submodel', async () => {
        // Arrange
        mockApiInstance.postSubmodel.mockResolvedValue(API_SUBMODEL1);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postSubmodel({
            configuration: TEST_CONFIGURATION,
            submodel: CORE_SUBMODEL1,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(mockApiInstance.postSubmodel).toHaveBeenCalledWith({
            submodel: API_SUBMODEL1,
        });
        expect(convertCoreSubmodelToApiSubmodel).toHaveBeenCalledWith(CORE_SUBMODEL1);
        expect(convertApiSubmodelToCoreSubmodel).toHaveBeenCalledWith(API_SUBMODEL1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODEL1);
        }
    });

    it('should handle errors when creating a Submodel', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.postSubmodel.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postSubmodel({
            configuration: TEST_CONFIGURATION,
            submodel: CORE_SUBMODEL1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should delete a submodel', async () => {
        // Arrange
        mockApiInstance.deleteSubmodelById.mockResolvedValue(undefined);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.deleteSubmodelById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.deleteSubmodelById).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when deleting a submodel', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.deleteSubmodelById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.deleteSubmodelById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get a Submodel by ID', async () => {
        // Arrange
        mockApiInstance.getSubmodelById.mockResolvedValue(API_SUBMODEL1);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getSubmodelById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            level: LEVEL_SUBMODEL,
            extent: EXTENT_SUBMODEL,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelById).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            level: LEVEL_SUBMODEL,
            extent: EXTENT_SUBMODEL,
        });
        expect(convertApiSubmodelToCoreSubmodel).toHaveBeenCalledWith(API_SUBMODEL1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODEL1);
        }
    });

    it('should handle errors when getting a Submodel by ID', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getSubmodelById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update a Submodel', async () => {
        // Arrange
        mockApiInstance.putSubmodelById.mockResolvedValue(undefined);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.putSubmodelById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodel: CORE_SUBMODEL1,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.putSubmodelById).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            submodel: API_SUBMODEL1,
        });
        expect(convertCoreSubmodelToApiSubmodel).toHaveBeenCalledWith(CORE_SUBMODEL1);
        expect(response.success).toBe(true);
    });

    it('should create a new Submodel during update', async () => {
        // Arrange
        mockApiInstance.putSubmodelById.mockResolvedValue(API_SUBMODEL1);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.putSubmodelById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodel: CORE_SUBMODEL1,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.putSubmodelById).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            submodel: API_SUBMODEL1,
        });
        expect(convertCoreSubmodelToApiSubmodel).toHaveBeenCalledWith(CORE_SUBMODEL1);
        expect(convertApiSubmodelToCoreSubmodel).toHaveBeenCalledWith(API_SUBMODEL1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODEL1); // After conversion
        }
    });

    it('should handle errors when updating a Submodel', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.putSubmodelById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.putSubmodelById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodel: CORE_SUBMODEL1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get a Submodel metadata by ID', async () => {
        // Arrange
        mockApiInstance.getSubmodelByIdMetadata.mockResolvedValue(API_SUBMODEL_METADATA);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getSubmodelByIdMetadata({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelByIdMetadata).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
        });
        //expect(convertApiSubmodelToCoreSubmodel).toHaveBeenCalledWith(API_SUBMODEL1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(API_SUBMODEL_METADATA);
            //expect(response.data).toEqual(CORE_SUBMODEL1);
        }
    });

    it('should handle errors when getting a Submodel metadata by ID', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelByIdMetadata.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getSubmodelByIdMetadata({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get a Submodel value by ID', async () => {
        // Arrange
        mockApiInstance.getSubmodelByIdValueOnly.mockResolvedValue(API_SUBMODEL_VALUE);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getSubmodelByIdValueOnly({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            level: LEVEL_SUBMODEL_VALUE,
            extent: EXTENT_SUBMODEL_VALUE,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelByIdValueOnly).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            level: LEVEL_SUBMODEL_VALUE,
            extent: EXTENT_SUBMODEL_VALUE,
        });
        //expect(convertApiSubmodelToCoreSubmodel).toHaveBeenCalledWith(API_SUBMODEL1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(API_SUBMODEL_VALUE);
            //expect(response.data).toEqual(CORE_SUBMODEL1);
        }
    });

    it('should handle errors when getting a Submodel value-only representation by ID', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelByIdValueOnly.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getSubmodelByIdValueOnly({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update the value-only representation by ID', async () => {
        // Arrange
        mockApiInstance.patchSubmodelByIdValueOnly.mockResolvedValue(undefined);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.patchSubmodelByIdValueOnly({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            body: BODY,
            level: LEVEL_SUBMODEL_VALUE1,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.patchSubmodelByIdValueOnly).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            body: BODY,
            level: LEVEL_SUBMODEL_VALUE1,
        });
        //expect(convertCoreSubmodelToApiSubmodel).toHaveBeenCalledWith(CORE_SUBMODEL1);
        expect(response.success).toBe(true);
    });

    it('should handle errors when updating a Submodel value-only representation by ID', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.patchSubmodelByIdValueOnly.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.patchSubmodelByIdValueOnly({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            body: BODY,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get a specific submodel element from the Submodel at a specified path in the ValueOnly representation', async () => {
        // Arrange
        mockApiInstance.getSubmodelElementByPathValueOnlySubmodelRepo.mockResolvedValue(API_SUBMODELELEMENT_VALUE);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getSubmodelElementByPathValueOnly({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            level: LEVEL_SUBMODELELEMENT_VALUE_BY_PATH,
            extent: EXTENT_SUBMODELELEMENT_VALUE_BY_PATH,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelElementByPathValueOnlySubmodelRepo).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            level: LEVEL_SUBMODELELEMENT_VALUE_BY_PATH,
            extent: EXTENT_SUBMODELELEMENT_VALUE_BY_PATH,
        });
        //expect(convertApiSubmodelToCoreSubmodel).toHaveBeenCalledWith(API_SUBMODEL1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(API_SUBMODELELEMENT_VALUE);
            //expect(response.data).toEqual(CORE_SUBMODEL1);
        }
    });

    it('should handle errors when getting a submodel element from the Submodel at a specified path in the ValueOnly representation', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelElementByPathValueOnlySubmodelRepo.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getSubmodelElementByPathValueOnly({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update the value of an existing SubmodelElement', async () => {
        // Arrange
        mockApiInstance.patchSubmodelElementByPathValueOnlySubmodelRepo.mockResolvedValue(undefined);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.patchSubmodelElementByPathValueOnly({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElementValue: API_SUBMODELELEMENT_VALUE,
            level: LEVEL_SE_VALUE_PATCH,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.patchSubmodelElementByPathValueOnlySubmodelRepo).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            submodelElementValue: API_SUBMODELELEMENT_VALUE,
            level: LEVEL_SE_VALUE_PATCH,
        });
        //expect(convertCoreSubmodelToApiSubmodel).toHaveBeenCalledWith(CORE_SUBMODEL1);
        expect(response.success).toBe(true);
    });

    it('should handle errors when updating value-only representation of SubmodelElement', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.patchSubmodelElementByPathValueOnlySubmodelRepo.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.patchSubmodelElementByPathValueOnly({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElementValue: API_SUBMODELELEMENT_VALUE,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should return SubmodelElements on successful response', async () => {
        // Arrange
        const pagedResult: SubmodelRepositoryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllSubmodelElements.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: [API_SUBMODELELEMENT1, API_SUBMODELELEMENT2],
        });

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getAllSubmodelElements({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            limit: LIMIT,
            cursor: CURSOR,
            level: LEVEL_SUBMODELELEMENT,
            extent: EXTENT_SUBMODELELEMENT,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getAllSubmodelElements).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            limit: LIMIT,
            cursor: CURSOR,
            level: LEVEL_SUBMODELELEMENT,
            extent: EXTENT_SUBMODELELEMENT,
        });
        expect(convertApiSubmodelElementToCoreSubmodelElement).toHaveBeenCalledTimes(2);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual([CORE_SUBMODELELEMENT1, CORE_SUBMODELELEMENT2]);
        }
    });

    it('should handle errors when fetching SubmodelElements', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllSubmodelElements.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getAllSubmodelElements({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should create a new SubmodelElement', async () => {
        // Arrange
        mockApiInstance.postSubmodelElementSubmodelRepo.mockResolvedValue(API_SUBMODELELEMENT1);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postSubmodelElement({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodelElement: CORE_SUBMODELELEMENT1,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.postSubmodelElementSubmodelRepo).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            submodelElement: API_SUBMODELELEMENT1,
        });
        expect(convertCoreSubmodelElementToApiSubmodelElement).toHaveBeenCalledWith(CORE_SUBMODELELEMENT1);
        expect(convertApiSubmodelElementToCoreSubmodelElement).toHaveBeenCalledWith(API_SUBMODELELEMENT1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODELELEMENT1);
        }
    });

    it('should handle errors when creating a SubmodelElement', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.postSubmodelElementSubmodelRepo.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postSubmodelElement({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodelElement: CORE_SUBMODELELEMENT1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should return a submodel element from the Submodel at a specified path on successful response', async () => {
        // Arrange
        mockApiInstance.getSubmodelElementByPathSubmodelRepo.mockResolvedValue(API_SUBMODELELEMENT_PROPERTY);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getSubmodelElementByPath({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            level: LEVEL_SUBMODELELEMENT_BY_PATH,
            extent: EXTENT_SUBMODELELEMENT_BY_PATH,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelElementByPathSubmodelRepo).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            level: LEVEL_SUBMODELELEMENT_BY_PATH,
            extent: EXTENT_SUBMODELELEMENT_BY_PATH,
        });
        expect(convertApiSubmodelElementToCoreSubmodelElement).toHaveBeenCalledWith(API_SUBMODELELEMENT_PROPERTY);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODELELEMENT_PROPERTY);
        }
    });

    it('should handle errors when fetching the SubmodelElement from specified path', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelElementByPathSubmodelRepo.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getSubmodelElementByPath({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should create a new SubmodelElement at a specified path within submodel elements hierarchy', async () => {
        // Arrange
        mockApiInstance.postSubmodelElementByPathSubmodelRepo.mockResolvedValue(API_SUBMODELELEMENT_PROPERTY);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postSubmodelElementByPath({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElement: CORE_SUBMODELELEMENT_PROPERTY,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.postSubmodelElementByPathSubmodelRepo).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            submodelElement: API_SUBMODELELEMENT_PROPERTY,
        });
        expect(convertCoreSubmodelElementToApiSubmodelElement).toHaveBeenCalledWith(CORE_SUBMODELELEMENT_PROPERTY);
        expect(convertApiSubmodelElementToCoreSubmodelElement).toHaveBeenCalledWith(API_SUBMODELELEMENT_PROPERTY);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODELELEMENT_PROPERTY);
        }
    });

    it('should handle errors when creating a SubmodelElement', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.postSubmodelElementByPathSubmodelRepo.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postSubmodelElementByPath({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElement: CORE_SUBMODELELEMENT_PROPERTY,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should delete a submodel element at a specified path within the submodel elements hierarchy', async () => {
        // Arrange
        mockApiInstance.deleteSubmodelElementByPathSubmodelRepo.mockResolvedValue(undefined);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.deleteSubmodelElementByPath({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.deleteSubmodelElementByPathSubmodelRepo).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when deleting a submodel element at a specified path', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.deleteSubmodelElementByPathSubmodelRepo.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.deleteSubmodelElementByPath({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update a Submodel element at a specified path', async () => {
        // Arrange
        mockApiInstance.putSubmodelElementByPathSubmodelRepo.mockResolvedValue(undefined);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.putSubmodelElementByPath({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElement: CORE_SUBMODELELEMENT_PROPERTY,
            level: LEVEL_SE_BY_PATH,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.putSubmodelElementByPathSubmodelRepo).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            submodelElement: API_SUBMODELELEMENT_PROPERTY,
            level: LEVEL_SE_BY_PATH,
        });
        expect(convertCoreSubmodelElementToApiSubmodelElement).toHaveBeenCalledWith(CORE_SUBMODELELEMENT_PROPERTY);
        expect(response.success).toBe(true);
    });

    it('should create a new Submodel element at a specified path during update', async () => {
        // Arrange
        mockApiInstance.putSubmodelElementByPathSubmodelRepo.mockResolvedValue(API_SUBMODELELEMENT_PROPERTY);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.putSubmodelElementByPath({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElement: CORE_SUBMODELELEMENT_PROPERTY,
            level: LEVEL_SE_BY_PATH,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.putSubmodelElementByPathSubmodelRepo).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            submodelElement: API_SUBMODELELEMENT_PROPERTY,
            level: LEVEL_SE_BY_PATH,
        });
        expect(convertCoreSubmodelElementToApiSubmodelElement).toHaveBeenCalledWith(CORE_SUBMODELELEMENT_PROPERTY);
        expect(convertApiSubmodelElementToCoreSubmodelElement).toHaveBeenCalledWith(API_SUBMODELELEMENT_PROPERTY);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODELELEMENT_PROPERTY); // After conversion
        }
    });

    it('should handle errors when updating a Submodel element at a specified path', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.putSubmodelElementByPathSubmodelRepo.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.putSubmodelElementByPath({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElement: CORE_SUBMODELELEMENT_PROPERTY,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should invoke an Operation at a specified path synchronously', async () => {
        // Arrange
        mockApiInstance.invokeOperationSubmodelRepo.mockResolvedValue(OPERATION_RESULT);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postInvokeOperationSubmodelRepo({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            operationRequest: OPERATION_REQUEST,
            //async: true,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.invokeOperationSubmodelRepo).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            operationRequest: OPERATION_REQUEST,
            //async: true,
        });
        //expect(convertCoreSubmodelElementToApiSubmodelElement).toHaveBeenCalledWith(CORE_SUBMODELELEMENT1);
        //expect(convertApiSubmodelElementToCoreSubmodelElement).toHaveBeenCalledWith(API_SUBMODELELEMENT1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(OPERATION_RESULT);
        }
    });

    it('should handle errors when invoking an Operation at a specified path synchronously', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.invokeOperationSubmodelRepo.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postInvokeOperationSubmodelRepo({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            operationRequest: OPERATION_REQUEST,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should invoke an Operation at a specified path in value-only representation synchronously', async () => {
        // Arrange
        mockApiInstance.invokeOperationValueOnly.mockResolvedValue(OPERATION_RESULT_VALUEONLY);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postInvokeOperationValueOnly({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            operationRequestValueOnly: OPERATION_REQUEST_VALUEONLY,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.invokeOperationValueOnly).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            operationRequestValueOnly: OPERATION_REQUEST_VALUEONLY,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(OPERATION_RESULT_VALUEONLY);
        }
    });

    it('should handle errors when invoking an Operation at a specified path in value-only representation synchronously', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.invokeOperationValueOnly.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postInvokeOperationValueOnly({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            operationRequestValueOnly: OPERATION_REQUEST_VALUEONLY,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should invoke an Operation at a specified path asynchronously', async () => {
        // Arrange
        mockApiInstance.invokeOperationAsync.mockResolvedValue(undefined);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postInvokeOperationAsync({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            operationRequest: OPERATION_REQUEST,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.invokeOperationAsync).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            operationRequest: OPERATION_REQUEST,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when invoking an Operation at a specified path asynchronously', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.invokeOperationAsync.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postInvokeOperationAsync({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            operationRequest: OPERATION_REQUEST,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should invoke an Operation at a specified path in value-only representation asynchronously', async () => {
        // Arrange
        mockApiInstance.invokeOperationAsyncValueOnly.mockResolvedValue(undefined);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postInvokeOperationAsyncValueOnly({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            operationRequestValueOnly: OPERATION_REQUEST_VALUEONLY,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.invokeOperationAsyncValueOnly).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            operationRequestValueOnly: OPERATION_REQUEST_VALUEONLY,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when invoking an Operation at a specified path in value-only representation asynchronously', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.invokeOperationAsyncValueOnly.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postInvokeOperationAsyncValueOnly({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            operationRequestValueOnly: OPERATION_REQUEST_VALUEONLY,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });
});
