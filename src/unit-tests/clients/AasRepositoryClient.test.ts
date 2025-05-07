// Import necessary types
//import type { PagedResultPagingMetadata, Result } from '../../generated';
import {
    AssetAdministrationShell as CoreAssetAdministrationShell,
    AssetInformation as CoreAssetInformation,
    AssetKind,
    Key as CoreKey,
    KeyTypes,
    Reference as CoreReference,
    ReferenceTypes,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { AasRepositoryClient } from '../../clients/AasRepositoryClient';
import { AasRepositoryService } from '../../generated';
// import {
//     AssetAdministrationShell as ApiAssetAdministrationShell,
//     AssetInformation as ApiAssetInformation,
//     Configuration,
//     Message,
//     Reference as ApiReference,
// } from '../../generated';
import { base64Encode } from '../../lib/base64Url';
import {
    convertApiAasToCoreAas,
    convertApiAssetInformationToCoreAssetInformation,
    convertApiReferenceToCoreReference,
    convertCoreAasToApiAas,
    convertCoreAssetInformationToApiAssetInformation,
    convertCoreReferenceToApiReference,
} from '../../lib/convertAasTypes';
import { handleApiError } from '../../lib/errorHandler';

// Mock the dependencies
//jest.mock('../../generated');
jest.mock('../../generated');
jest.mock('../../lib/convertAasTypes');
jest.mock('../../lib/base64Url');
jest.mock('../../lib/errorHandler');

// Define mock constants
const ASSET_IDS = [
    { name: 'globalAssetId', value: 'https://example.com/ids/asset/7600_5912_3951_6917' },
    { name: 'globalAssetId', value: 'https://example.com/ids/asset/7600_5912_3951_6918' },
];
const ID_SHORT = 'shellIdShort';
const LIMIT = 10;
const CURSOR = 'cursor123';
const API_AAS1: AasRepositoryService.AssetAdministrationShell = {
    id: 'https://example.com/ids/aas/7600_5912_3951_6917',
    modelType: 'AssetAdministrationShell',
    assetInformation: { assetKind: 'Instance' },
};
const API_AAS2: AasRepositoryService.AssetAdministrationShell = {
    id: 'https://example.com/ids/aas/7600_5912_3951_6918',
    modelType: 'AssetAdministrationShell',
    assetInformation: { assetKind: 'Instance' },
};
const CORE_AAS1: CoreAssetAdministrationShell = new CoreAssetAdministrationShell(
    'https://example.com/ids/aas/7600_5912_3951_6917',
    new CoreAssetInformation(AssetKind.Instance)
);
const CORE_AAS2: CoreAssetAdministrationShell = new CoreAssetAdministrationShell(
    'https://example.com/ids/aas/7600_5912_3951_6918',
    new CoreAssetInformation(AssetKind.Instance)
);
const API_ASSET_INFO: AasRepositoryService.AssetInformation = {
    assetKind: 'Instance',
};
const CORE_ASSET_INFO: CoreAssetInformation = new CoreAssetInformation(AssetKind.Instance);
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
const TEST_CONFIGURATION = new AasRepositoryService.Configuration({
    basePath: 'http://localhost:8081',
    fetchApi: globalThis.fetch,
});

describe('AasRepositoryClient', () => {
    // Create mock for AssetAdministrationShellRepositoryAPIApi
    const mockApiInstance = {
        getAllAssetAdministrationShells: jest.fn(),
        postAssetAdministrationShell: jest.fn(),
        deleteAssetAdministrationShellById: jest.fn(),
        getAssetAdministrationShellById: jest.fn(),
        putAssetAdministrationShellById: jest.fn(),
        getAssetInformationAasRepository: jest.fn(),
        putAssetInformationAasRepository: jest.fn(),
        deleteThumbnailAasRepository: jest.fn(),
        getThumbnailAasRepository: jest.fn(),
        putThumbnailAasRepository: jest.fn(),
        getAllSubmodelReferencesAasRepository: jest.fn(),
        postSubmodelReferenceAasRepository: jest.fn(),
        deleteSubmodelReferenceByIdAasRepository: jest.fn(),
    };

    // Mock constructor
    const MockAasRepository = jest.fn(() => mockApiInstance);

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup mock for base64Encode
        (base64Encode as jest.Mock).mockImplementation((input) => `encoded_${input}`);
        // Setup mock for constructor
        (
            jest.requireMock('../../generated').AasRepositoryService.AssetAdministrationShellRepositoryAPIApi as jest.Mock
        ).mockImplementation(MockAasRepository);
        // Setup mocks for conversion functions
        (convertApiAasToCoreAas as jest.Mock).mockImplementation((aas) => {
            if (aas.id === API_AAS1.id) return CORE_AAS1;
            if (aas.id === API_AAS2.id) return CORE_AAS2;
            return null;
        });
        (convertCoreAasToApiAas as jest.Mock).mockImplementation((aas) => {
            if (aas.id === CORE_AAS1.id) return API_AAS1;
            if (aas.id === CORE_AAS2.id) return API_AAS2;
            return null;
        });
        (convertApiAssetInformationToCoreAssetInformation as jest.Mock).mockReturnValue(CORE_ASSET_INFO);
        (convertCoreAssetInformationToApiAssetInformation as jest.Mock).mockReturnValue(API_ASSET_INFO);
        (convertApiReferenceToCoreReference as jest.Mock).mockImplementation((ref) => {
            if (ref === API_REFERENCE1) return CORE_REFERENCE1;
            if (ref === API_REFERENCE2) return CORE_REFERENCE2;
            return null;
        });
        (convertCoreReferenceToApiReference as jest.Mock).mockImplementation((ref) => {
            if (ref === CORE_REFERENCE1) return API_REFERENCE1;
            if (ref === CORE_REFERENCE2) return API_REFERENCE2;
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

    it('should return Asset Administration Shells on successful response', async () => {
        // Arrange
        const pagedResult: AasRepositoryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllAssetAdministrationShells.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: [API_AAS1, API_AAS2],
        });

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAllAssetAdministrationShells({
            configuration: TEST_CONFIGURATION,
            assetIds: ASSET_IDS,
            idShort: ID_SHORT,
            limit: LIMIT,
            cursor: CURSOR,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(mockApiInstance.getAllAssetAdministrationShells).toHaveBeenCalledWith({
            assetIds: ASSET_IDS.map((id) => base64Encode(JSON.stringify(id))),
            idShort: ID_SHORT,
            limit: LIMIT,
            cursor: CURSOR,
        });
        expect(convertApiAasToCoreAas).toHaveBeenCalledTimes(2);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual([CORE_AAS1, CORE_AAS2]);
        }
    });

    it('should handle errors when fetching Asset Administration Shells', async () => {
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
        mockApiInstance.getAllAssetAdministrationShells.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAllAssetAdministrationShells({
            configuration: TEST_CONFIGURATION,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should create a new Asset Administration Shell', async () => {
        // Arrange
        mockApiInstance.postAssetAdministrationShell.mockResolvedValue(API_AAS1);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.postAssetAdministrationShell({
            configuration: TEST_CONFIGURATION,
            assetAdministrationShell: CORE_AAS1,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(mockApiInstance.postAssetAdministrationShell).toHaveBeenCalledWith({
            assetAdministrationShell: API_AAS1,
        });
        expect(convertCoreAasToApiAas).toHaveBeenCalledWith(CORE_AAS1);
        expect(convertApiAasToCoreAas).toHaveBeenCalledWith(API_AAS1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_AAS1);
        }
    });

    it('should handle errors when creating an Asset Administration Shell', async () => {
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
        mockApiInstance.postAssetAdministrationShell.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.postAssetAdministrationShell({
            configuration: TEST_CONFIGURATION,
            assetAdministrationShell: CORE_AAS1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should delete an Asset Administration Shell', async () => {
        // Arrange
        mockApiInstance.deleteAssetAdministrationShellById.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.deleteAssetAdministrationShellById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(mockApiInstance.deleteAssetAdministrationShellById).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when deleting an Asset Administration Shell', async () => {
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
        mockApiInstance.deleteAssetAdministrationShellById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.deleteAssetAdministrationShellById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get an Asset Administration Shell by ID', async () => {
        // Arrange
        mockApiInstance.getAssetAdministrationShellById.mockResolvedValue(API_AAS1);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAssetAdministrationShellById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(mockApiInstance.getAssetAdministrationShellById).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
        });
        expect(convertApiAasToCoreAas).toHaveBeenCalledWith(API_AAS1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_AAS1);
        }
    });

    it('should handle errors when getting an Asset Administration Shell by ID', async () => {
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
        mockApiInstance.getAssetAdministrationShellById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAssetAdministrationShellById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update an Asset Administration Shell', async () => {
        // Arrange
        mockApiInstance.putAssetAdministrationShellById.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.putAssetAdministrationShellById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            assetAdministrationShell: CORE_AAS1,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(mockApiInstance.putAssetAdministrationShellById).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            assetAdministrationShell: API_AAS1,
        });
        expect(convertCoreAasToApiAas).toHaveBeenCalledWith(CORE_AAS1);
        expect(response.success).toBe(true);
    });

    it('should handle errors when updating an Asset Administration Shell', async () => {
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
        mockApiInstance.putAssetAdministrationShellById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.putAssetAdministrationShellById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            assetAdministrationShell: CORE_AAS1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get Asset Information', async () => {
        // Arrange
        mockApiInstance.getAssetInformationAasRepository.mockResolvedValue(API_ASSET_INFO);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAssetInformation({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(mockApiInstance.getAssetInformationAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
        });
        expect(convertApiAssetInformationToCoreAssetInformation).toHaveBeenCalledWith(API_ASSET_INFO);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_ASSET_INFO);
        }
    });

    it('should handle errors when getting Asset Information', async () => {
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
        mockApiInstance.getAssetInformationAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAssetInformation({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update Asset Information', async () => {
        // Arrange
        mockApiInstance.putAssetInformationAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.putAssetInformation({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            assetInformation: CORE_ASSET_INFO,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(mockApiInstance.putAssetInformationAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            assetInformation: API_ASSET_INFO,
        });
        expect(convertCoreAssetInformationToApiAssetInformation).toHaveBeenCalledWith(CORE_ASSET_INFO);
        expect(response.success).toBe(true);
    });

    it('should handle errors when updating Asset Information', async () => {
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
        mockApiInstance.putAssetInformationAasRepository.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.putAssetInformation({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            assetInformation: CORE_ASSET_INFO,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should delete a thumbnail', async () => {
        // Arrange
        mockApiInstance.deleteThumbnailAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.deleteThumbnail({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(mockApiInstance.deleteThumbnailAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
        });
        expect(response.success).toBe(true);
    });

    it('should get a thumbnail', async () => {
        // Arrange
        mockApiInstance.getThumbnailAasRepository.mockResolvedValue(MOCK_BLOB);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getThumbnail({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(mockApiInstance.getThumbnailAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(MOCK_BLOB);
        }
    });

    it('should update a thumbnail', async () => {
        // Arrange
        const fileName = 'thumbnail.png';
        mockApiInstance.putThumbnailAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.putThumbnail({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            fileName: fileName,
            file: MOCK_BLOB,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(mockApiInstance.putThumbnailAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            fileName: fileName,
            file: MOCK_BLOB,
        });
        expect(response.success).toBe(true);
    });

    it('should get all submodel references', async () => {
        // Arrange
        const pagedResult: AasRepositoryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllSubmodelReferencesAasRepository.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: [API_REFERENCE1, API_REFERENCE2],
        });

        const client = new AasRepositoryClient();

        // Act
        const response = await client.getAllSubmodelReferences({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            limit: LIMIT,
            cursor: CURSOR,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(mockApiInstance.getAllSubmodelReferencesAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            limit: LIMIT,
            cursor: CURSOR,
        });
        expect(convertApiReferenceToCoreReference).toHaveBeenCalledTimes(2);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual([CORE_REFERENCE1, CORE_REFERENCE2]);
        }
    });

    it('should post a submodel reference', async () => {
        // Arrange
        mockApiInstance.postSubmodelReferenceAasRepository.mockResolvedValue(API_REFERENCE1);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.postSubmodelReference({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelReference: CORE_REFERENCE1,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(mockApiInstance.postSubmodelReferenceAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            reference: API_REFERENCE1,
        });
        expect(convertCoreReferenceToApiReference).toHaveBeenCalledWith(CORE_REFERENCE1);
        expect(convertApiReferenceToCoreReference).toHaveBeenCalledWith(API_REFERENCE1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_REFERENCE1);
        }
    });

    it('should delete a submodel reference', async () => {
        // Arrange
        const submodelId = 'https://example.com/ids/submodel/7600_5912_3951_6917';
        mockApiInstance.deleteSubmodelReferenceByIdAasRepository.mockResolvedValue(undefined);

        const client = new AasRepositoryClient();

        // Act
        const response = await client.deleteSubmodelReferenceById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: submodelId,
        });

        // Assert
        expect(MockAasRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(base64Encode).toHaveBeenCalledWith(submodelId);
        expect(mockApiInstance.deleteSubmodelReferenceByIdAasRepository).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS1.id}`,
            submodelIdentifier: `encoded_${submodelId}`,
        });
        expect(response.success).toBe(true);
    });
});
