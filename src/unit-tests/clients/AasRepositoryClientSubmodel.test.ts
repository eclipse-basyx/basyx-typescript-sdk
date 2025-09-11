// Import necessary types
//import type { PagedResultPagingMetadata, Result } from '../../generated';
import {
    AssetAdministrationShell as CoreAssetAdministrationShell,
    AssetInformation as CoreAssetInformation,
    AssetKind,
    ISubmodelElement as CoreSubmodelElement,
    Key as CoreKey,
    KeyTypes,
    Reference as CoreReference,
    ReferenceTypes,
    Submodel as CoreSubmodel,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { AasRepositoryClient } from '../../clients/AasRepositoryClient';
import { AasRepositoryService } from '../../generated';
import { ModelType } from '../../generated/AasRepositoryService';
import { Configuration } from '../../generated/runtime';
import { base64Encode } from '../../lib/base64Url';
import { convertApiReferenceToCoreReference, convertCoreReferenceToApiReference } from '../../lib/convertAasTypes';
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
jest.mock('../../lib/convertAasTypes');
jest.mock('../../lib/convertSubmodelTypes');
jest.mock('../../lib/base64Url');
jest.mock('../../lib/errorHandler');

// Define mock constants
const ID_SHORT_PATH = 'temperature';
const LIMIT = 10;
const CURSOR = 'cursor123';
const CORE_AAS1: CoreAssetAdministrationShell = new CoreAssetAdministrationShell(
    'https://example.com/ids/aas/7600_5912_3951_6917',
    new CoreAssetInformation(AssetKind.Instance)
);
const MOCK_BLOB = new Blob(['test data'], { type: 'application/octet-stream' });
const API_REFERENCE1: AasRepositoryService.Reference = {
    type: 'ExternalReference',
    keys: [
        {
            type: 'GlobalReference',
            value: 'https://example.com/ids/submodel/7600_5912_3951_6917',
        },
    ],
};
const CORE_REFERENCE1: CoreReference = new CoreReference(ReferenceTypes.ExternalReference, [
    new CoreKey(KeyTypes.GlobalReference, 'https://example.com/ids/submodel/7600_5912_3951_6917'),
]);
const API_REFERENCE2: AasRepositoryService.Reference = {
    type: 'ExternalReference',
    keys: [
        {
            type: 'GlobalReference',
            value: 'https://example.com/ids/submodel/7600_5912_3951_6918',
        },
    ],
};
const CORE_REFERENCE2: CoreReference = new CoreReference(ReferenceTypes.ExternalReference, [
    new CoreKey(KeyTypes.GlobalReference, 'https://example.com/ids/submodel/7600_5912_3951_6918'),
]);
const API_SUBMODELELEMENT_REFERENCE1: AasRepositoryService.Reference = {
    type: 'ExternalReference',
    keys: [
        {
            type: 'GlobalReference',
            value: 'https://example.com/ids/submodelElement/1234',
        },
    ],
};
const API_SUBMODELELEMENT_REFERENCE2: AasRepositoryService.Reference = {
    type: 'ExternalReference',
    keys: [
        {
            type: 'GlobalReference',
            value: 'https://example.com/ids/submodelElement/1235',
        },
    ],
};
const CORE_SUBMODELELEMENT_REFERENCE1: CoreReference = new CoreReference(ReferenceTypes.ExternalReference, [
    new CoreKey(KeyTypes.GlobalReference, 'https://example.com/ids/submodelElement/1234'),
]);
const CORE_SUBMODELELEMENT_REFERENCE2: CoreReference = new CoreReference(ReferenceTypes.ExternalReference, [
    new CoreKey(KeyTypes.GlobalReference, 'https://example.com/ids/submodelElement/1235'),
]);
const API_SUBMODEL1: AasRepositoryService.Submodel = {
    id: 'https://example.com/ids/sm/123',
    modelType: 'Submodel',
};
const API_SUBMODEL2: AasRepositoryService.Submodel = {
    id: 'https://example.com/ids/sm/234',
    modelType: 'Submodel',
};
const CORE_SUBMODEL1: CoreSubmodel = new CoreSubmodel('https://example.com/ids/sm/123');
const CORE_SUBMODEL2: CoreSubmodel = new CoreSubmodel('https://example.com/ids/sm/234');
const API_SUBMODELELEMENT1: AasRepositoryService.SubmodelElement = {
    modelType: AasRepositoryService.ModelType.SubmodelElementList,
};
const API_SUBMODELELEMENT2: AasRepositoryService.SubmodelElement = {
    modelType: AasRepositoryService.ModelType.SubmodelElementCollection,
};
const CORE_SUBMODELELEMENT1: CoreSubmodelElement = {} as CoreSubmodelElement;
const CORE_SUBMODELELEMENT2: CoreSubmodelElement = {} as CoreSubmodelElement;
const OPERATION_REQUEST: AasRepositoryService.OperationRequest = {
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
const OPERATION_RESULT: AasRepositoryService.OperationResult = {
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
const OPERATION_REQUEST_VALUEONLY: AasRepositoryService.OperationRequestValueOnly = {
    inputArguments: {
        temperature: '25',
    },
    clientTimeoutDuration: '10S',
};
const OPERATION_RESULT_VALUEONLY: AasRepositoryService.OperationResultValueOnly = {
    outputArguments: {
        status: 'ok',
    },
};
const API_SUBMODEL_METADATA: AasRepositoryService.SubmodelMetadata = {
    id: 'https://example.com/ids/sm/123',
    modelType: AasRepositoryService.ModelType.Submodel,
    // other metadata properties...,
};
const API_SUBMODEL_VALUE = {
    // Sample value-only representation of a submodel
    propertyA: 'value1',
    propertyB: 42,
    nestedProperty: {
        propertyC: true,
    },
};
const BODY = {
    propertyA: 'sample value',
    propertyB: 99,
    nestedProperty: {
        propertyC: false,
    },
};
const API_SUBMODELELEMENT_VALUES = {
    temperature: 22.5,
    active: true,
};
const API_SUBMODELELEMENT_VALUE1: AasRepositoryService.PropertyValue = 22.5;
const API_SUBMODELELEMENT_PROPERTY: AasRepositoryService.SubmodelElement = {
    idShort: 'temperature',
    modelType: AasRepositoryService.ModelType.Property,
    //value: '22.5',
};
const CORE_SUBMODELELEMENT_PROPERTY: CoreSubmodelElement = {
    idShort: 'temperature',
} as CoreSubmodelElement;
const HANDLE_ID = 'sample-operation-handle-001';
const BASEOPERATION_RESULT: AasRepositoryService.BaseOperationResult = {
    executionState: 'Running',
    success: true,
};
const API_SUBMODEL_PATH_STR = ['submodel/submodelElements/0', 'submodel/submodelElements/1'];
const API_SUBMODELELEMENT_STR1 = 'temperature';
const API_SUBMODELELEMENT_STR2 = 'status';
const API_SUBMODELELEMENT_METADATA1: AasRepositoryService.SubmodelElementMetadata = {
    modelType: ModelType.Property,
};
const API_SUBMODELELEMENT_METADATA2: AasRepositoryService.SubmodelElementMetadata = {
    modelType: ModelType.SubmodelElementCollection,
};
const SUBMODELELEMENT_BY_PATH_PATH = ['Street', 'Zip', 'City'];
const fileName = 'samplefile.png';
const LEVEL_SUBMODEL = AasRepositoryService.GetSubmodelByIdAasRepositoryLevelEnum.Deep;
const EXTENT_SUBMODEL = AasRepositoryService.GetSubmodelByIdAasRepositoryExtentEnum.WithBlobValue;
const LEVEL_SUBMODEL_PATCH = AasRepositoryService.PatchSubmodelAasRepositoryLevelEnum.Core;
const LEVEL_SUBMODEL_VALUE = AasRepositoryService.GetSubmodelByIdValueOnlyAasRepositoryLevelEnum.Deep;
const EXTENT_SUBMODEL_VALUE = AasRepositoryService.GetSubmodelByIdValueOnlyAasRepositoryExtentEnum.WithBlobValue;
const LEVEL_SUBMODEL_VALUE_PATCH = AasRepositoryService.PatchSubmodelByIdValueOnlyAasRepositoryLevelEnum.Core;
const LEVEL_SUBMODEL_PATH = AasRepositoryService.GetSubmodelByIdPathAasRepositoryLevelEnum.Deep;
const LEVEL_SUBMODELELEMENT = AasRepositoryService.GetAllSubmodelElementsAasRepositoryLevelEnum.Deep;
const EXTENT_SUBMODELELEMENT = AasRepositoryService.GetAllSubmodelElementsAasRepositoryExtentEnum.WithBlobValue;
const LEVEL_SUBMODELELEMENT_VALUEONLY = AasRepositoryService.GetAllSubmodelElementsValueOnlyAasRepositoryLevelEnum.Deep;
const LEVEL_SUBMODELELEMENT_REFERENCE = AasRepositoryService.GetAllSubmodelElementsReferenceAasRepositoryLevelEnum.Core;
const LEVEL_SUBMODELELEMENT_PATH = AasRepositoryService.GetAllSubmodelElementsPathAasRepositoryLevelEnum.Core;
const EXTENT_SUBMODELELEMENT_PATH =
    AasRepositoryService.GetAllSubmodelElementsPathAasRepositoryExtentEnum.WithBlobValue;
const LEVEL_SUBMODELELEMENT_BY_PATH = AasRepositoryService.GetSubmodelElementByPathAasRepositoryLevelEnum.Core;
const EXTENT_SUBMODELELEMENT_BY_PATH =
    AasRepositoryService.GetSubmodelElementByPathAasRepositoryExtentEnum.WithBlobValue;
const LEVEL_SUBMODELELEMENT_BY_PATH_PATCH =
    AasRepositoryService.PatchSubmodelElementValueByPathAasRepositoryLevelEnum.Core;
const LEVEL_SUBMODELELEMENT_VALUE_BY_PATH =
    AasRepositoryService.GetSubmodelElementByPathValueOnlyAasRepositoryLevelEnum.Deep;
const EXTENT_SUBMODELELEMENT_VALUE_BY_PATH =
    AasRepositoryService.GetSubmodelElementByPathValueOnlyAasRepositoryExtentEnum.WithBlobValue;
const LEVEL_SUBMODELELEMENT_VALUE_BY_PATH_VALUEONLY =
    AasRepositoryService.PatchSubmodelElementValueByPathValueOnlyLevelEnum.Core;
const LEVEL_SUBMODELELEMENT_BY_PATH_REFERENCE =
    AasRepositoryService.GetSubmodelElementByPathReferenceAasRepositoryLevelEnum.Core;
const LEVEL_SUBMODELELEMENT_BY_PATH_PATH = AasRepositoryService.GetSubmodelElementByPathPathAasRepositoryLevelEnum.Core;
const TEST_CONFIGURATION = new Configuration({
    basePath: 'http://localhost:8081',
    fetchApi: globalThis.fetch,
});

describe('AasRepositoryClient', () => {
    // Helper function to create expected configuration matcher
    const expectConfigurationCall = () =>
        expect.objectContaining({
            basePath: 'http://localhost:8081',
            fetchApi: globalThis.fetch,
        });

    // Create mock for AssetAdministrationShellRepositoryAPIApi
    const mockApiInstance = {
        getSubmodelByIdAasRepository: jest.fn(),
        putSubmodelByIdAasRepository: jest.fn(),
        deleteSubmodelByIdAasRepository: jest.fn(),
        patchSubmodelAasRepository: jest.fn(),
        getSubmodelByIdMetadataAasRepository: jest.fn(),
        patchSubmodelByIdMetadataAasRepository: jest.fn(),
        getSubmodelByIdValueOnlyAasRepository: jest.fn(),
        patchSubmodelByIdValueOnlyAasRepository: jest.fn(),
        getSubmodelByIdReferenceAasRepository: jest.fn(),
        getSubmodelByIdPathAasRepository: jest.fn(),
        getAllSubmodelElementsAasRepository: jest.fn(),
        postSubmodelElementAasRepository: jest.fn(),
        getAllSubmodelElementsMetadataAasRepository: jest.fn(),
        getAllSubmodelElementsValueOnlyAasRepository: jest.fn(),
        getAllSubmodelElementsReferenceAasRepository: jest.fn(),
        getAllSubmodelElementsPathAasRepository: jest.fn(),
        getSubmodelElementByPathAasRepository: jest.fn(),
        postSubmodelElementByPathAasRepository: jest.fn(),
        deleteSubmodelElementByPathAasRepository: jest.fn(),
        putSubmodelElementByPathAasRepository: jest.fn(),
        patchSubmodelElementValueByPathAasRepository: jest.fn(),
        getSubmodelElementByPathMetadataAasRepository: jest.fn(),
        patchSubmodelElementValueByPathMetadata: jest.fn(),
        getSubmodelElementByPathValueOnlyAasRepository: jest.fn(),
        patchSubmodelElementValueByPathValueOnly: jest.fn(),
        getSubmodelElementByPathReferenceAasRepository: jest.fn(),
        getSubmodelElementByPathPathAasRepository: jest.fn(),
        getFileByPathAasRepository: jest.fn(),
        putFileByPathAasRepository: jest.fn(),
        deleteFileByPathAasRepository: jest.fn(),
        invokeOperationAasRepository: jest.fn(),
        invokeOperationValueOnlyAasRepository: jest.fn(),
        invokeOperationAsyncAasRepository: jest.fn(),
        invokeOperationAsyncValueOnlyAasRepository: jest.fn(),
        getOperationAsyncStatusAasRepository: jest.fn(),
        getOperationAsyncResultAasRepository: jest.fn(),
        getOperationAsyncResultValueOnlyAasRepository: jest.fn(),
    };

    // Mock constructor
    const MockAasRepository = jest.fn(() => mockApiInstance);

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup mock for base64Encode
        (base64Encode as jest.Mock).mockImplementation((input) => `encoded_${input}`);
        // Setup mock for constructor
        (
            jest.requireMock('../../generated').AasRepositoryService
                .AssetAdministrationShellRepositoryAPIApi as jest.Mock
        ).mockImplementation(MockAasRepository);
        // Setup mocks for conversion functions
        (convertApiReferenceToCoreReference as jest.Mock).mockImplementation((ref) => {
            if (ref === API_REFERENCE1) return CORE_REFERENCE1;
            if (ref === API_REFERENCE2) return CORE_REFERENCE2;
            if (ref === API_SUBMODELELEMENT_REFERENCE1) return CORE_SUBMODELELEMENT_REFERENCE1;
            if (ref === API_SUBMODELELEMENT_REFERENCE2) return CORE_SUBMODELELEMENT_REFERENCE2;
            return null;
        });
        (convertCoreReferenceToApiReference as jest.Mock).mockImplementation((ref) => {
            if (ref === CORE_REFERENCE1) return API_REFERENCE1;
            if (ref === CORE_REFERENCE2) return API_REFERENCE2;
            if (ref === CORE_SUBMODELELEMENT_REFERENCE1) return API_SUBMODELELEMENT_REFERENCE1;
            if (ref === CORE_SUBMODELELEMENT_REFERENCE2) return API_SUBMODELELEMENT_REFERENCE2;
            return null;
        });
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
            const message: AasRepositoryService.Message = {
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

    it('should get a Submodel by ID', async () => {
        // Arrange
        mockApiInstance.getSubmodelByIdAasRepository.mockResolvedValue(API_SUBMODEL1);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelByIdAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            level: LEVEL_SUBMODEL,
            extent: EXTENT_SUBMODEL,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelByIdAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
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
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelByIdAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelByIdAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
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
        mockApiInstance.putSubmodelByIdAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.putSubmodelByIdAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodel: CORE_SUBMODEL1,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.putSubmodelByIdAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            submodel: API_SUBMODEL1,
        });
        expect(convertCoreSubmodelToApiSubmodel).toHaveBeenCalledWith(CORE_SUBMODEL1);
        expect(response.success).toBe(true);
    });

    it('should create a new Submodel during update', async () => {
        // Arrange
        mockApiInstance.putSubmodelByIdAasRepository.mockResolvedValue(API_REFERENCE1);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.putSubmodelByIdAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodel: CORE_SUBMODEL1,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.putSubmodelByIdAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            submodel: API_SUBMODEL1,
        });
        expect(convertCoreSubmodelToApiSubmodel).toHaveBeenCalledWith(CORE_SUBMODEL1);
        expect(convertApiReferenceToCoreReference).toHaveBeenCalledWith(API_REFERENCE1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_REFERENCE1); // After conversion
        }
    });

    it('should handle errors when updating a Submodel', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.putSubmodelByIdAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.putSubmodelByIdAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
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
        mockApiInstance.deleteSubmodelByIdAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.deleteSubmodelByIdAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.deleteSubmodelByIdAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when deleting a submodel', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.deleteSubmodelByIdAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.deleteSubmodelByIdAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update the submodel', async () => {
        // Arrange
        mockApiInstance.patchSubmodelAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.patchSubmodelAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodel: CORE_SUBMODEL1,
            level: LEVEL_SUBMODEL_PATCH,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.patchSubmodelAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            submodel: API_SUBMODEL1,
            level: LEVEL_SUBMODEL_PATCH,
        });
        expect(convertCoreSubmodelToApiSubmodel).toHaveBeenCalledWith(CORE_SUBMODEL1);
        expect(response.success).toBe(true);
    });

    it('should handle errors when updating a Submodel', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.patchSubmodelAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.patchSubmodelAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodel: CORE_SUBMODEL1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get a Submodel metadata elements', async () => {
        // Arrange
        mockApiInstance.getSubmodelByIdMetadataAasRepository.mockResolvedValue(API_SUBMODEL_METADATA);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelByIdMetadataAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelByIdMetadataAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(API_SUBMODEL_METADATA);
        }
    });

    it('should handle errors when getting Submodel metadata elements', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelByIdMetadataAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelByIdMetadataAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update metadata attributes of the Submodel', async () => {
        // Arrange
        mockApiInstance.patchSubmodelByIdMetadataAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.patchSubmodelByIdMetadataAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodelMetadata: API_SUBMODEL_METADATA,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.patchSubmodelByIdMetadataAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            submodelMetadata: API_SUBMODEL_METADATA,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when updating metadata attributes of the Submodel', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.patchSubmodelByIdMetadataAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.patchSubmodelByIdMetadataAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodelMetadata: API_SUBMODEL_METADATA,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get a Submodel ValueOnly representation', async () => {
        // Arrange
        mockApiInstance.getSubmodelByIdValueOnlyAasRepository.mockResolvedValue(API_SUBMODEL_VALUE);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelByIdValueOnlyAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            level: LEVEL_SUBMODEL_VALUE,
            extent: EXTENT_SUBMODEL_VALUE,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelByIdValueOnlyAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            level: LEVEL_SUBMODEL_VALUE,
            extent: EXTENT_SUBMODEL_VALUE,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(API_SUBMODEL_VALUE);
        }
    });

    it('should handle errors when getting a Submodel value-only representation by ID', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelByIdValueOnlyAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelByIdValueOnlyAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
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
        mockApiInstance.patchSubmodelByIdValueOnlyAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.patchSubmodelByIdValueOnlyAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            body: BODY,
            level: LEVEL_SUBMODEL_VALUE_PATCH,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.patchSubmodelByIdValueOnlyAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            body: BODY,
            level: LEVEL_SUBMODEL_VALUE_PATCH,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when updating a Submodel value-only representation by ID', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.patchSubmodelByIdValueOnlyAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.patchSubmodelByIdValueOnlyAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            body: BODY,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get the Submodel as a Reference', async () => {
        // Arrange
        mockApiInstance.getSubmodelByIdReferenceAasRepository.mockResolvedValue(API_REFERENCE1);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelByIdReferenceAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelByIdReferenceAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
        });
        expect(convertApiReferenceToCoreReference).toHaveBeenCalledWith(API_REFERENCE1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_REFERENCE1);
        }
    });

    it('should handle errors when getting a Submodel as a Reference', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelByIdReferenceAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelByIdReferenceAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get elements of the submodel in path notation', async () => {
        // Arrange
        mockApiInstance.getSubmodelByIdPathAasRepository.mockResolvedValue(API_SUBMODEL_PATH_STR);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelByIdPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            level: LEVEL_SUBMODEL_PATH,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelByIdPathAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            level: LEVEL_SUBMODEL_PATH,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(API_SUBMODEL_PATH_STR);
        }
    });

    it('should handle errors when getting elements of the submodel in path notation', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelByIdPathAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelByIdPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should return SubmodelElements on successful response', async () => {
        // Arrange
        const pagedResult: AasRepositoryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllSubmodelElementsAasRepository.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: [API_SUBMODELELEMENT1, API_SUBMODELELEMENT2],
        });

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAllSubmodelElementsAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            limit: LIMIT,
            cursor: CURSOR,
            level: LEVEL_SUBMODELELEMENT,
            extent: EXTENT_SUBMODELELEMENT,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getAllSubmodelElementsAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
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
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllSubmodelElementsAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAllSubmodelElementsAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
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
        mockApiInstance.postSubmodelElementAasRepository.mockResolvedValue(API_SUBMODELELEMENT1);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.postSubmodelElementAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodelElement: CORE_SUBMODELELEMENT1,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.postSubmodelElementAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
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
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.postSubmodelElementAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.postSubmodelElementAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodelElement: CORE_SUBMODELELEMENT1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should return SubmodelElements including their hierarchy on successful response', async () => {
        // Arrange
        const pagedResult: AasRepositoryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllSubmodelElementsMetadataAasRepository.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: [API_SUBMODELELEMENT_METADATA1, API_SUBMODELELEMENT_METADATA2],
        });

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAllSubmodelElementsMetadataAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            limit: LIMIT,
            cursor: CURSOR,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getAllSubmodelElementsMetadataAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            limit: LIMIT,
            cursor: CURSOR,
        });
        //expect(convertApiSubmodelElementToCoreSubmodelElement).toHaveBeenCalledTimes(2);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual([API_SUBMODELELEMENT_METADATA1, API_SUBMODELELEMENT_METADATA2]);
        }
    });

    it('should handle errors when fetching SubmodelElements including their hierarchy', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllSubmodelElementsMetadataAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAllSubmodelElementsMetadataAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should return SubmodelElements in the ValueOnly representation on successful response', async () => {
        // Arrange
        const pagedResult: AasRepositoryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllSubmodelElementsValueOnlyAasRepository.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: API_SUBMODELELEMENT_VALUES,
        });

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAllSubmodelElementsValueOnlyAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            limit: LIMIT,
            cursor: CURSOR,
            level: LEVEL_SUBMODELELEMENT_VALUEONLY,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getAllSubmodelElementsValueOnlyAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            limit: LIMIT,
            cursor: CURSOR,
            level: LEVEL_SUBMODELELEMENT_VALUEONLY,
        });
        //expect(convertApiSubmodelElementToCoreSubmodelElement).toHaveBeenCalledTimes(2);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual(API_SUBMODELELEMENT_VALUES);
        }
    });

    it('should handle errors when fetching SubmodelElements in the ValueOnly representation', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllSubmodelElementsValueOnlyAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAllSubmodelElementsValueOnlyAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should return SubmodelElements as a list of References', async () => {
        // Arrange
        const pagedResult: AasRepositoryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllSubmodelElementsReferenceAasRepository.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: [API_SUBMODELELEMENT_REFERENCE1, API_SUBMODELELEMENT_REFERENCE2],
        });

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAllSubmodelElementsReferenceAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            limit: LIMIT,
            cursor: CURSOR,
            level: LEVEL_SUBMODELELEMENT_REFERENCE,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getAllSubmodelElementsReferenceAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            limit: LIMIT,
            cursor: CURSOR,
            level: LEVEL_SUBMODELELEMENT_REFERENCE,
        });
        expect(convertApiReferenceToCoreReference).toHaveBeenCalledTimes(2);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual([CORE_SUBMODELELEMENT_REFERENCE1, CORE_SUBMODELELEMENT_REFERENCE2]);
        }
    });

    it('should handle errors when fetching SubmodelElements as a list of References', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllSubmodelElementsReferenceAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAllSubmodelElementsReferenceAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should return SubmodelElements path on successful response', async () => {
        // Arrange
        const pagedResult: AasRepositoryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllSubmodelElementsPathAasRepository.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: [API_SUBMODELELEMENT_STR1, API_SUBMODELELEMENT_STR2],
        });

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAllSubmodelElementsPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            limit: LIMIT,
            cursor: CURSOR,
            level: LEVEL_SUBMODELELEMENT_PATH,
            extent: EXTENT_SUBMODELELEMENT_PATH,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getAllSubmodelElementsPathAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            limit: LIMIT,
            cursor: CURSOR,
            level: LEVEL_SUBMODELELEMENT_PATH,
            extent: EXTENT_SUBMODELELEMENT_PATH,
        });
        //expect(convertApiSubmodelElementToCoreSubmodelElement).toHaveBeenCalledTimes(2);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual([API_SUBMODELELEMENT_STR1, API_SUBMODELELEMENT_STR2]);
        }
    });

    it('should handle errors when fetching SubmodelElements path', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllSubmodelElementsPathAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAllSubmodelElementsPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should return a submodel element from the Submodel at a specified path on successful response', async () => {
        // Arrange
        mockApiInstance.getSubmodelElementByPathAasRepository.mockResolvedValue(API_SUBMODELELEMENT_PROPERTY);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelElementByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            level: LEVEL_SUBMODELELEMENT_BY_PATH,
            extent: EXTENT_SUBMODELELEMENT_BY_PATH,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelElementByPathAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
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
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelElementByPathAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelElementByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
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
        mockApiInstance.postSubmodelElementByPathAasRepository.mockResolvedValue(API_SUBMODELELEMENT_PROPERTY);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.postSubmodelElementByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElement: CORE_SUBMODELELEMENT_PROPERTY,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.postSubmodelElementByPathAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
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
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.postSubmodelElementByPathAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.postSubmodelElementByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
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
        mockApiInstance.deleteSubmodelElementByPathAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.deleteSubmodelElementByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.deleteSubmodelElementByPathAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when deleting a submodel element at a specified path', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.deleteSubmodelElementByPathAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.deleteSubmodelElementByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
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
        mockApiInstance.putSubmodelElementByPathAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.putSubmodelElementByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElement: CORE_SUBMODELELEMENT_PROPERTY,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.putSubmodelElementByPathAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            submodelElement: API_SUBMODELELEMENT_PROPERTY,
        });
        expect(convertCoreSubmodelElementToApiSubmodelElement).toHaveBeenCalledWith(CORE_SUBMODELELEMENT_PROPERTY);
        expect(response.success).toBe(true);
    });

    it('should create a new Submodel element at a specified path during update', async () => {
        // Arrange
        mockApiInstance.putSubmodelElementByPathAasRepository.mockResolvedValue(API_SUBMODELELEMENT_PROPERTY);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.putSubmodelElementByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElement: CORE_SUBMODELELEMENT_PROPERTY,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.putSubmodelElementByPathAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            submodelElement: API_SUBMODELELEMENT_PROPERTY,
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
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.putSubmodelElementByPathAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.putSubmodelElementByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
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

    it('should update existing Submodel element at a specified path within submodel elements hierarchy', async () => {
        // Arrange
        mockApiInstance.patchSubmodelElementValueByPathAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.patchSubmodelElementValueByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElement: CORE_SUBMODELELEMENT_PROPERTY,
            level: LEVEL_SUBMODELELEMENT_BY_PATH_PATCH,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.patchSubmodelElementValueByPathAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            submodelElement: API_SUBMODELELEMENT_PROPERTY,
            level: LEVEL_SUBMODELELEMENT_BY_PATH_PATCH,
        });
        expect(convertCoreSubmodelElementToApiSubmodelElement).toHaveBeenCalledWith(CORE_SUBMODELELEMENT_PROPERTY);
        expect(response.success).toBe(true);
    });

    it('should handle errors when updating Submodel element at a specified path within submodel elements hierarchy', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.patchSubmodelElementValueByPathAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.patchSubmodelElementValueByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
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

    it('should return the metadata attributes of submodel element from the Submodel at a specified path on successful response', async () => {
        // Arrange
        mockApiInstance.getSubmodelElementByPathMetadataAasRepository.mockResolvedValue(API_SUBMODELELEMENT_METADATA1);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelElementByPathMetadataAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelElementByPathMetadataAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
        });
        //expect(convertApiSubmodelElementToCoreSubmodelElement).toHaveBeenCalledWith(API_SUBMODELELEMENT_PROPERTY);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data).toEqual(API_SUBMODELELEMENT_METADATA1);
        }
    });

    it('should handle errors when fetching the metadata attributes of SubmodelElement from specified path', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelElementByPathMetadataAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelElementByPathMetadataAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update the metadata attributes of an existing submodel element value at a specified path', async () => {
        // Arrange
        mockApiInstance.patchSubmodelElementValueByPathMetadata.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.patchSubmodelElementValueByPathMetadata({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElementMetadata: API_SUBMODELELEMENT_METADATA1,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.patchSubmodelElementValueByPathMetadata).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            submodelElementMetadata: API_SUBMODELELEMENT_METADATA1,
        });
        //expect(convertCoreSubmodelElementToApiSubmodelElement).toHaveBeenCalledWith(CORE_SUBMODELELEMENT_PROPERTY);
        expect(response.success).toBe(true);
    });

    it('should handle errors when updating the metadata attributes of an existing submodel element value at a specified path', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.patchSubmodelElementValueByPathMetadata.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.patchSubmodelElementValueByPathMetadata({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElementMetadata: API_SUBMODELELEMENT_METADATA1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get a specific submodel element from the Submodel at a specified path in the ValueOnly representation', async () => {
        // Arrange
        mockApiInstance.getSubmodelElementByPathValueOnlyAasRepository.mockResolvedValue(API_SUBMODELELEMENT_VALUE1);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelElementByPathValueOnlyAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            level: LEVEL_SUBMODELELEMENT_VALUE_BY_PATH,
            extent: EXTENT_SUBMODELELEMENT_VALUE_BY_PATH,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelElementByPathValueOnlyAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            level: LEVEL_SUBMODELELEMENT_VALUE_BY_PATH,
            extent: EXTENT_SUBMODELELEMENT_VALUE_BY_PATH,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(API_SUBMODELELEMENT_VALUE1);
        }
    });

    it('should handle errors when getting a submodel element from the Submodel at a specified path in the ValueOnly representation', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelElementByPathValueOnlyAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelElementByPathValueOnlyAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update the value of an existing submodel element value at a specified path', async () => {
        // Arrange
        mockApiInstance.patchSubmodelElementValueByPathValueOnly.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.patchSubmodelElementValueByPathValueOnly({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElementValue: API_SUBMODELELEMENT_VALUE1,
            level: LEVEL_SUBMODELELEMENT_VALUE_BY_PATH_VALUEONLY,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.patchSubmodelElementValueByPathValueOnly).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            submodelElementValue: API_SUBMODELELEMENT_VALUE1,
            level: LEVEL_SUBMODELELEMENT_VALUE_BY_PATH_VALUEONLY,
        });
        //expect(convertCoreSubmodelElementToApiSubmodelElement).toHaveBeenCalledWith(CORE_SUBMODELELEMENT_PROPERTY);
        expect(response.success).toBe(true);
    });

    it('should handle errors when updating the value of an existing submodel element value at a specified path', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.patchSubmodelElementValueByPathValueOnly.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.patchSubmodelElementValueByPathValueOnly({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            submodelElementValue: API_SUBMODELELEMENT_VALUE1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should return Reference of a specific submodel element at a specified path on successful response', async () => {
        // Arrange
        mockApiInstance.getSubmodelElementByPathReferenceAasRepository.mockResolvedValue(
            API_SUBMODELELEMENT_REFERENCE1
        );

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelElementByPathReferenceAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            level: LEVEL_SUBMODELELEMENT_BY_PATH_REFERENCE,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelElementByPathReferenceAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            level: LEVEL_SUBMODELELEMENT_BY_PATH_REFERENCE,
        });
        expect(convertApiReferenceToCoreReference).toHaveBeenCalledWith(API_SUBMODELELEMENT_REFERENCE1);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODELELEMENT_REFERENCE1);
        }
    });

    it('should handle errors when fetching Reference of a specific submodel element at a specified path', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelElementByPathReferenceAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelElementByPathReferenceAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should return specific submodel element at a specified path in the Path notation on successful response', async () => {
        // Arrange
        mockApiInstance.getSubmodelElementByPathPathAasRepository.mockResolvedValue(SUBMODELELEMENT_BY_PATH_PATH);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelElementByPathPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            level: LEVEL_SUBMODELELEMENT_BY_PATH_PATH,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelElementByPathPathAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            level: LEVEL_SUBMODELELEMENT_BY_PATH_PATH,
        });
        //expect(convertApiReferenceToCoreReference).toHaveBeenCalledWith(API_REFERENCE1);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data).toEqual(SUBMODELELEMENT_BY_PATH_PATH);
        }
    });

    it('should handle errors when fetching submodel element at specified path in the Path notation', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelElementByPathPathAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getSubmodelElementByPathPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should download file content from a specific submodel element at a specified path on successful response', async () => {
        // Arrange
        mockApiInstance.getFileByPathAasRepository.mockResolvedValue(MOCK_BLOB);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getFileByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getFileByPathAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
        });
        //expect(convertApiReferenceToCoreReference).toHaveBeenCalledWith(API_REFERENCE1);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data).toEqual(MOCK_BLOB);
        }
    });

    it('should handle errors when downloading file content from a specific submodel element at a specified path', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getFileByPathAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getFileByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should upload file content to an existing submodel element at a specified path', async () => {
        // Arrange
        mockApiInstance.putFileByPathAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.putFileByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            fileName: fileName,
            file: MOCK_BLOB,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.putFileByPathAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            fileName: fileName,
            file: MOCK_BLOB,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when uploading file content to a specific submodel element at a specified path', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.putFileByPathAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.putFileByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            fileName: fileName,
            file: MOCK_BLOB,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should delete file content of an existing submodel element at a specified path', async () => {
        // Arrange
        mockApiInstance.deleteFileByPathAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.deleteFileByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.deleteFileByPathAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when deleting file content of an existing submodel element at a specified path', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.deleteFileByPathAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.deleteFileByPathAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should invoke an Operation at a specified path synchronously', async () => {
        // Arrange
        mockApiInstance.invokeOperationAasRepository.mockResolvedValue(OPERATION_RESULT);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.invokeOperationAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            operationRequest: OPERATION_REQUEST,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.invokeOperationAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            operationRequest: OPERATION_REQUEST,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(OPERATION_RESULT);
        }
    });

    it('should handle errors when invoking an Operation at a specified path synchronously', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.invokeOperationAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.invokeOperationAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
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
        mockApiInstance.invokeOperationValueOnlyAasRepository.mockResolvedValue(OPERATION_RESULT_VALUEONLY);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.invokeOperationValueOnlyAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            operationRequestValueOnly: OPERATION_REQUEST_VALUEONLY,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.invokeOperationValueOnlyAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
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
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.invokeOperationValueOnlyAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.invokeOperationValueOnlyAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
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
        mockApiInstance.invokeOperationAsyncAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.invokeOperationAsyncAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            operationRequest: OPERATION_REQUEST,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.invokeOperationAsyncAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            operationRequest: OPERATION_REQUEST,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when invoking an Operation at a specified path asynchronously', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.invokeOperationAsyncAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.invokeOperationAsyncAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
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
        mockApiInstance.invokeOperationAsyncValueOnlyAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.invokeOperationAsyncValueOnlyAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            operationRequestValueOnly: OPERATION_REQUEST_VALUEONLY,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.invokeOperationAsyncValueOnlyAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            operationRequestValueOnly: OPERATION_REQUEST_VALUEONLY,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when invoking an Operation at a specified path in value-only representation asynchronously', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.invokeOperationAsyncValueOnlyAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.invokeOperationAsyncValueOnlyAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
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

    it('should return Operation status of an asynchronous invoked Operation', async () => {
        // Arrange
        mockApiInstance.getOperationAsyncStatusAasRepository.mockResolvedValue(BASEOPERATION_RESULT);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getOperationAsyncStatusAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            handleId: HANDLE_ID,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(base64Encode).toHaveBeenCalledWith(HANDLE_ID);
        expect(mockApiInstance.getOperationAsyncStatusAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            handleId: `encoded_${HANDLE_ID}`,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(BASEOPERATION_RESULT);
        }
    });

    it('should handle errors when returning Operation status of an asynchronous invoked Operation', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getOperationAsyncStatusAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getOperationAsyncStatusAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            handleId: HANDLE_ID,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should return Operation result of an asynchronous invoked Operation', async () => {
        // Arrange
        mockApiInstance.getOperationAsyncResultAasRepository.mockResolvedValue(OPERATION_RESULT);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getOperationAsyncResultAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            handleId: HANDLE_ID,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(base64Encode).toHaveBeenCalledWith(HANDLE_ID);
        expect(mockApiInstance.getOperationAsyncResultAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            handleId: `encoded_${HANDLE_ID}`,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(OPERATION_RESULT);
        }
    });

    it('should handle errors when returning Operation result of an asynchronous invoked Operation', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getOperationAsyncResultAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getOperationAsyncResultAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            handleId: HANDLE_ID,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should return ValueOnly notation of Operation result of an asynchronous invoked Operation', async () => {
        // Arrange
        mockApiInstance.getOperationAsyncResultValueOnlyAasRepository.mockResolvedValue(OPERATION_RESULT_VALUEONLY);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getOperationAsyncResultValueOnlyAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            handleId: HANDLE_ID,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(base64Encode).toHaveBeenCalledWith(HANDLE_ID);
        expect(mockApiInstance.getOperationAsyncResultValueOnlyAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            idShortPath: ID_SHORT_PATH,
            handleId: `encoded_${HANDLE_ID}`,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(OPERATION_RESULT_VALUEONLY);
        }
    });

    it('should handle errors when returning ValueOnly notation of Operation result of an asynchronous invoked Operation', async () => {
        // Arrange
        const errorResult: AasRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getOperationAsyncResultValueOnlyAasRepository.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getOperationAsyncResultValueOnlyAasRepository({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_SUBMODEL1.id,
            idShortPath: ID_SHORT_PATH,
            handleId: HANDLE_ID,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });
});
