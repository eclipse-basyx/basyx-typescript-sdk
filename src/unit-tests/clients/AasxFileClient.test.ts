// Import necessary types
import {
    AssetAdministrationShell as CoreAssetAdministrationShell,
    AssetInformation as CoreAssetInformation,
    AssetKind,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { AasxFileClient } from '../../clients/AasxFileClient';
import { AasxFileService } from '../../generated';
import { base64Encode } from '../../lib/base64Url';
import { handleApiError } from '../../lib/errorHandler';

// Mock the dependencies
jest.mock('../../generated');
jest.mock('../../lib/base64Url');
jest.mock('../../lib/errorHandler');

// Define mock constants
const CORE_AAS1: CoreAssetAdministrationShell = new CoreAssetAdministrationShell(
    'https://example.com/ids/aas/7600_5912_3951_6917',
    new CoreAssetInformation(AssetKind.Instance)
);
const MOCK_BLOB = new Blob(['test data'], { type: 'application/asset-administration-shell-package+xml' });
const PACKAGE_ID = 'aasx-package-01';
const fileName = 'sample.aasx';
const API_PACKAGEDESCRIPTION1: AasxFileService.PackageDescription = {
    aasIds: ['https://example.com/ids/aas/7600_5912_3951_6917', 'https://example.com/ids/aas/7600_5912_3951_6918'],
    packageId: 'aasx-package-01',
};
const API_PACKAGEDESCRIPTION2: AasxFileService.PackageDescription = {
    aasIds: ['https://example.com/ids/aas/7600_5912_3951_6919', 'https://example.com/ids/aas/7600_5912_3951_6916'],
    packageId: 'aasx-package-02',
};
const TEST_CONFIGURATION = new AasxFileService.Configuration({
    basePath: 'http://localhost:8087',
    fetchApi: globalThis.fetch,
});

describe('AasxFileClient', () => {
    // Create mock for AASXFileServerAPIApi
    const mockApiInstance = {
        getAllAASXPackageIds: jest.fn(),
        postAASXPackage: jest.fn(),
        getAASXByPackageId: jest.fn(),
        putAASXByPackageId: jest.fn(),
        deleteAASXByPackageId: jest.fn(),
    };

    // Mock constructor
    const MockAasxFile = jest.fn(() => mockApiInstance);

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup mock for base64Encode
        (base64Encode as jest.Mock).mockImplementation((input) => `encoded_${input}`);
        // Setup mock for constructor
        (jest.requireMock('../../generated').AasxFileService.AASXFileServerAPIApi as jest.Mock).mockImplementation(
            MockAasxFile
        );

        // Mock the error handler to return a standardized Result
        (handleApiError as jest.Mock).mockImplementation(async (err) => {
            // If the error already has messages, return it as is
            if (err?.messages) return err;

            // Create a standard Result with messages
            const timestamp = (1744752054.63186).toString();
            const message: AasxFileService.Message = {
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

    it('should return a list of available AASX packages on successful response', async () => {
        // Arrange
        mockApiInstance.getAllAASXPackageIds.mockResolvedValue([API_PACKAGEDESCRIPTION1, API_PACKAGEDESCRIPTION2]);

        const client = new AasxFileClient();

        // Act
        const response = await client.getAllAASXPackageIds({
            configuration: TEST_CONFIGURATION,
            aasId: CORE_AAS1.id,
        });

        // Assert
        expect(MockAasxFile).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(mockApiInstance.getAllAASXPackageIds).toHaveBeenCalledWith({
            aasId: CORE_AAS1.id,
        });
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.result).toEqual([API_PACKAGEDESCRIPTION1, API_PACKAGEDESCRIPTION2]);
        }
    });

    it('should handle errors when fetching list of available AASX packages', async () => {
        // Arrange
        const errorResult: AasxFileService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllAASXPackageIds.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasxFileClient();

        // Act
        const response = await client.getAllAASXPackageIds({
            configuration: TEST_CONFIGURATION,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should store the AASX package at the server', async () => {
        // Arrange
        mockApiInstance.postAASXPackage.mockResolvedValue(API_PACKAGEDESCRIPTION1);

        const client = new AasxFileClient();

        // Act
        const response = await client.postAASXPackage({
            configuration: TEST_CONFIGURATION,
            aasIds: [CORE_AAS1.id],
            file: MOCK_BLOB,
            fileName: fileName,
        });

        // Assert
        expect(MockAasxFile).toHaveBeenCalledWith(TEST_CONFIGURATION);
        //expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        //expect(base64Encode).toHaveBeenCalledWith(fileName);
        expect(mockApiInstance.postAASXPackage).toHaveBeenCalledWith({
            aasIds: [CORE_AAS1.id],
            file: MOCK_BLOB,
            fileName: fileName,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(API_PACKAGEDESCRIPTION1);
        }
    });

    it('should handle errors when storing the AASX package at the server', async () => {
        // Arrange
        const errorResult: AasxFileService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.postAASXPackage.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasxFileClient();

        // Act
        const response = await client.postAASXPackage({
            configuration: TEST_CONFIGURATION,
            file: MOCK_BLOB,
            fileName: fileName,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get a specific AASX package from the server by ID', async () => {
        // Arrange
        mockApiInstance.getAASXByPackageId.mockResolvedValue(MOCK_BLOB);

        const client = new AasxFileClient();

        // Act
        const response = await client.getAASXByPackageId({
            configuration: TEST_CONFIGURATION,
            packageId: PACKAGE_ID,
        });

        // Assert
        expect(MockAasxFile).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(PACKAGE_ID);
        expect(mockApiInstance.getAASXByPackageId).toHaveBeenCalledWith({
            packageId: `encoded_${PACKAGE_ID}`,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(MOCK_BLOB);
        }
    });

    it('should handle errors when getting a specific AASX package by ID', async () => {
        // Arrange
        const errorResult: AasxFileService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAASXByPackageId.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasxFileClient();

        // Act
        const response = await client.getAASXByPackageId({
            configuration: TEST_CONFIGURATION,
            packageId: PACKAGE_ID,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should delete a specific AASX package from the server', async () => {
        // Arrange
        mockApiInstance.deleteAASXByPackageId.mockResolvedValue(undefined);

        const client = new AasxFileClient();

        // Act
        const response = await client.deleteAASXByPackageId({
            configuration: TEST_CONFIGURATION,
            packageId: PACKAGE_ID,
        });

        // Assert
        expect(MockAasxFile).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(PACKAGE_ID);
        expect(mockApiInstance.deleteAASXByPackageId).toHaveBeenCalledWith({
            packageId: `encoded_${PACKAGE_ID}`,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when deleting specific AASX package', async () => {
        // Arrange
        const errorResult: AasxFileService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.deleteAASXByPackageId.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasxFileClient();

        // Act
        const response = await client.deleteAASXByPackageId({
            configuration: TEST_CONFIGURATION,
            packageId: PACKAGE_ID,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update the AASX package', async () => {
        // Arrange
        mockApiInstance.putAASXByPackageId.mockResolvedValue(undefined);

        const client = new AasxFileClient();

        // Act
        const response = await client.putAASXByPackageId({
            configuration: TEST_CONFIGURATION,
            packageId: PACKAGE_ID,
            aasIds: [CORE_AAS1.id],
            file: MOCK_BLOB,
            fileName: fileName,
        });

        // Assert
        expect(MockAasxFile).toHaveBeenCalledWith(TEST_CONFIGURATION);
        // expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        // expect(base64Encode).toHaveBeenCalledWith(fileName);
        expect(base64Encode).toHaveBeenCalledWith(PACKAGE_ID);
        expect(mockApiInstance.putAASXByPackageId).toHaveBeenCalledWith({
            packageId: `encoded_${PACKAGE_ID}`,
            aasIds: [CORE_AAS1.id],
            file: MOCK_BLOB,
            fileName: fileName,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when updating the AASX package', async () => {
        // Arrange
        const errorResult: AasxFileService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.putAASXByPackageId.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new AasxFileClient();

        // Act
        const response = await client.putAASXByPackageId({
            configuration: TEST_CONFIGURATION,
            packageId: PACKAGE_ID,
            file: MOCK_BLOB,
            fileName: fileName,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });
});
