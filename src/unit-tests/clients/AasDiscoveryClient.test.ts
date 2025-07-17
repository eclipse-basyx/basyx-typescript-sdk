// Import necessary types
import {
    SpecificAssetId as CoreSpecificAssetId,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { AasDiscoveryClient } from '../../clients/AasDiscoveryClient';
import { AasDiscoveryService } from '../../generated';
import { base64Encode } from '../../lib/base64Url';
import {
    convertApiAssetIdToCoreAssetId,
    convertCoreAssetIdToApiAssetId,
} from '../../lib/convertAasDiscoveryTypes';
import { handleApiError } from '../../lib/errorHandler';

// Mock the dependencies
//jest.mock('../../generated');
jest.mock('../../generated');
jest.mock('../../lib/convertAasDiscoveryTypes');
jest.mock('../../lib/base64Url');
jest.mock('../../lib/errorHandler');

// Define mock constants
const LIMIT = 10;
const CURSOR = 'cursor123';
const ASSET_IDS = [
    { name: 'globalAssetId', value: 'https://example.com/ids/asset/7600_5912_3951_6917' },
    { name: 'globalAssetId', value: 'https://example.com/ids/asset/7600_5912_3951_6918' },
];
const API_SPECIFIC_ASSET_IDS = [];
const CORE_SPECIFIC_ASSET_IDS = [];
const API_AAS: AasDiscoveryService.AssetAdministrationShell = {
    id: 'https://example.com/ids/aas/7600_5912_3951_6917',
    modelType: 'AssetAdministrationShell',
    assetInformation: { assetKind: 'Instance' },
};
// const API_AAS2: AasDiscoveryService.AssetAdministrationShell = {
//     id: 'https://example.com/ids/aas/7600_5912_3951_6918',
//     modelType: 'AssetAdministrationShell',
//     assetInformation: { assetKind: 'Instance' },
// };
const CORE_AAS: CoreAssetAdministrationShell = new CoreAssetAdministrationShell(
    'https://example.com/ids/aas/7600_5912_3951_6917',
    new CoreAssetInformation(AssetKind.Instance)
);
const TEST_CONFIGURATION = new AasDiscoveryService.Configuration({
    basePath: 'http://localhost:8086',
    fetchApi: globalThis.fetch,
});

describe('AasDiscoveryClient', () => {
    // Create mock for AssetAdministrationShellBasicDiscoveryAPIApi
    const mockApiInstance = {
        getAllAssetAdministrationShellIdsByAssetLink: jest.fn(),
        postAllAssetLinksById: jest.fn(),
        deleteAllAssetLinksById: jest.fn(),
        getAllAssetLinksById: jest.fn(),
    };

    // Mock constructor
    const MockAasDiscovery = jest.fn(() => mockApiInstance);

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup mock for base64Encode
        (base64Encode as jest.Mock).mockImplementation((input) => `encoded_${input}`);
        // Setup mock for constructor
        (
            jest.requireMock('../../generated').AasDiscoveryService
                .AssetAdministrationShellBasicDiscoveryAPIApi as jest.Mock
        ).mockImplementation(MockAasDiscovery);
        // Setup mocks for conversion functions
        (convertApiAssetIdToCoreAssetId as jest.Mock).mockImplementation((assetId) => {
           // if (assetId.id === API_SPECIFIC_ASSET_IDS.id) return CORE_SPECIFIC_ASSET_IDS;
            //if (aas.id === API_AAS2.id) return CORE_AAS2;
            return null;
        });
        (convertCoreAssetIdToApiAssetId as jest.Mock).mockImplementation((assetId) => {
            //if (aas.id === CORE_AAS1.id) return API_AAS1;
            //if (aas.id === CORE_AAS2.id) return API_AAS2;
            return null;
        }); //mocking of these assetid fns more likely should be like below
        // (convertApiAssetInformationToCoreAssetInformation as jest.Mock).mockReturnValue(CORE_ASSET_INFO);
        // (convertCoreAssetInformationToApiAssetInformation as jest.Mock).mockReturnValue(API_ASSET_INFO);
        // (convertApiReferenceToCoreReference as jest.Mock).mockImplementation((ref) => {
        //     if (ref === API_REFERENCE1) return CORE_REFERENCE1;
        //     if (ref === API_REFERENCE2) return CORE_REFERENCE2;
        //     return null;
        // });
        // (convertCoreReferenceToApiReference as jest.Mock).mockImplementation((ref) => {
        //     if (ref === CORE_REFERENCE1) return API_REFERENCE1;
        //     if (ref === CORE_REFERENCE2) return API_REFERENCE2;
        //     return null;
        // });

        // Mock the error handler to return a standardized Result
        (handleApiError as jest.Mock).mockImplementation(async (err) => {
            // If the error already has messages, return it as is
            if (err?.messages) return err;

            // Create a standard Result with messages
            const timestamp = (1744752054.63186).toString();
            const message: AasDiscoveryService.Message = {
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

    it('should return list of Asset Administration Shell IDs on successful response', async () => {
        // Arrange
        const pagedResult: AasDiscoveryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllAssetAdministrationShellIdsByAssetLink.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: [API_SPECIFIC_ASSET_IDS, API_AAS2],
        });

        const client = new AasDiscoveryClient();

        // Act
        const response = await client.getAllAssetAdministrationShellIdsByAssetLink({
            configuration: TEST_CONFIGURATION,
            assetIds: ASSET_IDS,
            limit: LIMIT,
            cursor: CURSOR,
        });

        // Assert
        expect(MockAasDiscovery).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(mockApiInstance.getAllAssetAdministrationShellIdsByAssetLink).toHaveBeenCalledWith({
            assetIds: ASSET_IDS.map((id) => base64Encode(JSON.stringify(id))),
            limit: LIMIT,
            cursor: CURSOR,
        });
        expect(convertApiAssetIdToCoreAssetId).toHaveBeenCalledTimes(2);//check 2 or 1
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual([CORE_SPECIFIC_ASSET_IDS, CORE_AAS2]);
        }
    });
    
    it('should handle errors when fetching Asset Administration Shell IDs', async () => {
        // Arrange
        const errorResult: AasDiscoveryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllAssetAdministrationShellIdsByAssetLink.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasDiscoveryClient();

        // Act
        const response = await client.getAllAssetAdministrationShellIdsByAssetLink({
            configuration: TEST_CONFIGURATION,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should create specific asset identifiers linked to an Asset Administration Shell', async () => {
        // Arrange
        mockApiInstance.postAllAssetLinksById.mockResolvedValue(API_SPECIFIC_ASSET_IDS);

        const client = new AasDiscoveryClient();

        // Act
        const response = await client.postAllAssetLinksById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS.id,
            specificAssetId: CORE_SPECIFIC_ASSET_IDS,
        });

        // Assert
        expect(MockAasDiscovery).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS.id);
        expect(mockApiInstance.postAllAssetLinksById).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS.id}`,
            specificAssetId: API_SPECIFIC_ASSET_IDS,
        });
        expect(convertCoreAssetIdToApiAssetId).toHaveBeenCalledWith(CORE_SPECIFIC_ASSET_IDS);
        expect(convertApiAssetIdToCoreAssetId).toHaveBeenCalledWith(API_SPECIFIC_ASSET_IDS);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SPECIFIC_ASSET_IDS);
        }
    });

    it('should handle errors when creating specific asset identifiers', async () => {
        // Arrange
        const errorResult: AasDiscoveryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.postAllAssetLinksById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasDiscoveryClient();

        // Act
        const response = await client.postAllAssetLinksById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS.id,
            specificAssetId: CORE_SPECIFIC_ASSET_IDS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should delete specified specific asset identifiers linked to an Asset Administration Shell', async () => {
        // Arrange
        mockApiInstance.deleteAllAssetLinksById.mockResolvedValue(undefined);

        const client = new AasDiscoveryClient();

        // Act
        const response = await client.deleteAllAssetLinksById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS.id,
        });

        // Assert
        expect(MockAasDiscovery).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS.id);
        expect(mockApiInstance.deleteAllAssetLinksById).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS.id}`,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when deleting specified specific asset identifiers', async () => {
        // Arrange
        const errorResult: AasDiscoveryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.deleteAllAssetLinksById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasDiscoveryClient();

        // Act
        const response = await client.deleteAllAssetLinksById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });
    
    it('should get a list of specific asset identifiers based on an Asset Administration Shell ID', async () => {
        // Arrange
        mockApiInstance.getAllAssetLinksById.mockResolvedValue(API_SPECIFIC_ASSET_IDS);

        const client = new AasDiscoveryClient();

        // Act
        const response = await client.getAllAssetLinksById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS.id,
        });

        // Assert
        expect(MockAasDiscovery).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS.id);
        expect(mockApiInstance.getAllAssetLinksById).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS.id}`,
        });
        expect(convertApiAssetIdToCoreAssetId).toHaveBeenCalledWith(API_SPECIFIC_ASSET_IDS);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SPECIFIC_ASSET_IDS);
        }
    });

    it('should handle errors when getting list of specific asset identifiers', async () => {
        // Arrange
        const errorResult: AasDiscoveryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllAssetLinksById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasDiscoveryClient();

        // Act
        const response = await client.getAllAssetLinksById({
            configuration: TEST_CONFIGURATION,
            aasIdentifier: CORE_AAS.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });
    
});    