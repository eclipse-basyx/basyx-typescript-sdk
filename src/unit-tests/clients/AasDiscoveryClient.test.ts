// Import necessary types
import {
    AssetAdministrationShell as CoreAssetAdministrationShell,
    AssetInformation as CoreAssetInformation,
    AssetKind,
    SpecificAssetId as CoreSpecificAssetId,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { type Mock, vi } from 'vitest';
import { AasDiscoveryClient } from '../../clients/AasDiscoveryClient';
import { AasDiscoveryService } from '../../generated';
import { Configuration } from '../../generated/runtime';
import { base64Encode } from '../../lib/base64Url';
import { convertApiAssetIdToCoreAssetId, convertCoreAssetIdToApiAssetId } from '../../lib/convertAasDiscoveryTypes';
import { handleApiError } from '../../lib/errorHandler';

// Mock the dependencies
//vi.mock('../../generated');
vi.mock('../../generated');
vi.mock('../../lib/convertAasDiscoveryTypes');
vi.mock('../../lib/base64Url');
vi.mock('../../lib/errorHandler');

// Define mock constants
const LIMIT = 10;
const CURSOR = 'cursor123';
const ASSET_IDS = [
    { name: 'globalAssetId', value: 'https://example.com/ids/asset/7600_5912_3951_6917' },
    { name: 'globalAssetId', value: 'https://example.com/ids/asset/7600_5912_3951_6918' },
];
const SHELL_IDS = [
    'https://example.com/ids/aas/7600_5912_3951_6917',
    'https://example.com/ids/aas/7600_5912_3951_6918',
];
const API_SPECIFIC_ASSET_ID1: AasDiscoveryService.SpecificAssetId = {
    name: 'globalAssetId',
    value: 'https://example.com/ids/asset/7600_5912_3951_6917',
};
const API_SPECIFIC_ASSET_ID2: AasDiscoveryService.SpecificAssetId = {
    name: 'globalAssetId',
    value: 'https://example.com/ids/asset/7600_5912_3951_6918',
};
const API_SPECIFIC_ASSET_IDS = [API_SPECIFIC_ASSET_ID1, API_SPECIFIC_ASSET_ID2];
const CORE_SPECIFIC_ASSET_ID1: CoreSpecificAssetId = new CoreSpecificAssetId(
    'globalAssetId',
    'https://example.com/ids/asset/7600_5912_3951_6917'
);
const CORE_SPECIFIC_ASSET_ID2: CoreSpecificAssetId = new CoreSpecificAssetId(
    'globalAssetId',
    'https://example.com/ids/asset/7600_5912_3951_6918'
);
const CORE_SPECIFIC_ASSET_IDS = [CORE_SPECIFIC_ASSET_ID1, CORE_SPECIFIC_ASSET_ID2];
const CORE_AAS: CoreAssetAdministrationShell = new CoreAssetAdministrationShell(
    'https://example.com/ids/aas/7600_5912_3951_6917',
    new CoreAssetInformation(AssetKind.Instance)
);
const TEST_CONFIGURATION = new Configuration({
    basePath: 'http://localhost:8086',
    fetchApi: globalThis.fetch,
});
const SERVICE_DESCRIPTION: AasDiscoveryService.ServiceDescription = {
    profiles: ['discovery-service-profile'],
};

describe('AasDiscoveryClient', () => {
    // Helper function to create expected configuration matcher
    const expectConfigurationCall = () =>
        expect.objectContaining({
            basePath: 'http://localhost:8086',
            fetchApi: globalThis.fetch,
        });

    // Create mock for AssetAdministrationShellBasicDiscoveryAPIApi
    const mockApiInstance = {
        getAllAssetAdministrationShellIdsByAssetLink: vi.fn(),
        searchAllAssetAdministrationShellIdsByAssetLink: vi.fn(),
        postAllAssetLinksById: vi.fn(),
        deleteAllAssetLinksById: vi.fn(),
        getAllAssetLinksById: vi.fn(),
        getSelfDescription: vi.fn(),
    };

    // Mock constructor
    const MockAasDiscovery = vi.fn(function () {
        return mockApiInstance;
    });

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup mock for base64Encode
        (base64Encode as Mock).mockImplementation((input) => `encoded_${input}`);
        // Setup mock for constructor
        (AasDiscoveryService.AssetAdministrationShellBasicDiscoveryAPIApi as unknown as Mock).mockImplementation(
            MockAasDiscovery
        );
        (AasDiscoveryService.DescriptionAPIApi as unknown as Mock).mockImplementation(MockAasDiscovery);
        // Setup mocks for conversion functions
        (convertApiAssetIdToCoreAssetId as Mock).mockImplementation((assetId) => {
            if (assetId.value === API_SPECIFIC_ASSET_ID1.value) return CORE_SPECIFIC_ASSET_ID1;
            if (assetId.value === API_SPECIFIC_ASSET_ID2.value) return CORE_SPECIFIC_ASSET_ID2;
            return null;
        });
        (convertCoreAssetIdToApiAssetId as Mock).mockImplementation((assetId) => {
            if (assetId.value === CORE_SPECIFIC_ASSET_ID1.value) return API_SPECIFIC_ASSET_ID1;
            if (assetId.value === CORE_SPECIFIC_ASSET_ID2.value) return API_SPECIFIC_ASSET_ID2;
            return null;
        });

        // Mock the error handler to return a standardized Result
        (handleApiError as Mock).mockImplementation(async (err) => {
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
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        (console.error as Mock).mockRestore();
    });

    it('should return list of Asset Administration Shell IDs on successful response', async () => {
        // Arrange
        const pagedResult: AasDiscoveryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllAssetAdministrationShellIdsByAssetLink.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: SHELL_IDS,
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
        expect(MockAasDiscovery).toHaveBeenCalledWith(expectConfigurationCall());
        expect(mockApiInstance.getAllAssetAdministrationShellIdsByAssetLink).toHaveBeenCalledWith({
            assetIds: ASSET_IDS.map((id) => base64Encode(JSON.stringify(id))),
            limit: LIMIT,
            cursor: CURSOR,
        });
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual(SHELL_IDS);
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
        mockApiInstance.getAllAssetAdministrationShellIdsByAssetLink.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as Mock).mockResolvedValue(errorResult);

        const client = new AasDiscoveryClient();

        // Act
        const response = await client.getAllAssetAdministrationShellIdsByAssetLink({
            configuration: TEST_CONFIGURATION,
            //assetIds: ASSET_IDS,
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
        expect(MockAasDiscovery).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS.id);
        expect(mockApiInstance.postAllAssetLinksById).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS.id}`,
            specificAssetId: API_SPECIFIC_ASSET_IDS,
        });
        expect(convertCoreAssetIdToApiAssetId).toHaveBeenCalledTimes(2);
        expect(convertApiAssetIdToCoreAssetId).toHaveBeenCalledTimes(2);
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
        (handleApiError as Mock).mockResolvedValue(errorResult);

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
        expect(MockAasDiscovery).toHaveBeenCalledWith(expectConfigurationCall());
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
        (handleApiError as Mock).mockResolvedValue(errorResult);

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
        expect(MockAasDiscovery).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS.id);
        expect(mockApiInstance.getAllAssetLinksById).toHaveBeenCalledWith({
            aasIdentifier: `encoded_${CORE_AAS.id}`,
        });
        expect(convertApiAssetIdToCoreAssetId).toHaveBeenCalledTimes(2);
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
        (handleApiError as Mock).mockResolvedValue(errorResult);

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

    it('should return list of Asset Administration Shell IDs using search endpoint', async () => {
        // Arrange
        const pagedResult: AasDiscoveryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.searchAllAssetAdministrationShellIdsByAssetLink.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: SHELL_IDS,
        });

        const client = new AasDiscoveryClient();

        // Act
        const response = await client.searchAllAssetAdministrationShellIdsByAssetLink({
            configuration: TEST_CONFIGURATION,
            assetLink: ASSET_IDS,
            limit: LIMIT,
            cursor: CURSOR,
        });

        // Assert
        expect(MockAasDiscovery).toHaveBeenCalledWith(expectConfigurationCall());
        expect(mockApiInstance.searchAllAssetAdministrationShellIdsByAssetLink).toHaveBeenCalledWith({
            assetLink: ASSET_IDS,
            limit: LIMIT,
            cursor: CURSOR,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual(SHELL_IDS);
        }
    });

    it('should handle errors when searching Asset Administration Shell IDs', async () => {
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
        mockApiInstance.searchAllAssetAdministrationShellIdsByAssetLink.mockRejectedValue(
            new Error('Required parameter missing')
        );
        (handleApiError as Mock).mockResolvedValue(errorResult);

        const client = new AasDiscoveryClient();

        // Act
        const response = await client.searchAllAssetAdministrationShellIdsByAssetLink({
            configuration: TEST_CONFIGURATION,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should return service description', async () => {
        // Arrange
        mockApiInstance.getSelfDescription.mockResolvedValue(SERVICE_DESCRIPTION);

        const client = new AasDiscoveryClient();

        // Act
        const response = await client.getSelfDescription({
            configuration: TEST_CONFIGURATION,
        });

        // Assert
        expect(MockAasDiscovery).toHaveBeenCalledWith(expectConfigurationCall());
        expect(mockApiInstance.getSelfDescription).toHaveBeenCalledWith();
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(SERVICE_DESCRIPTION);
        }
    });

    it('should handle errors when getting service description', async () => {
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
        mockApiInstance.getSelfDescription.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as Mock).mockResolvedValue(errorResult);

        const client = new AasDiscoveryClient();

        // Act
        const response = await client.getSelfDescription({
            configuration: TEST_CONFIGURATION,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });
});
