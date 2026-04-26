// Import necessary types
import {
    AssetAdministrationShell as CoreAssetAdministrationShell,
    AssetInformation as CoreAssetInformation,
    AssetKind,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { type Mock, vi } from 'vitest';
import { AasxFileClient } from '../../clients/AasxFileClient';
import { AasxFileService } from '../../generated';
import { Configuration } from '../../generated/runtime';
import { base64Encode } from '../../lib/base64Url';
import { handleApiError } from '../../lib/errorHandler';

// Mock the dependencies
vi.mock('../../generated');
vi.mock('../../lib/base64Url');
vi.mock('../../lib/errorHandler');

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
const TEST_CONFIGURATION = new Configuration({
    basePath: 'http://localhost:8087',
    fetchApi: globalThis.fetch,
});

const apiResponse = <T>(value: T, status: number) => ({
    raw: { status },
    value: vi.fn().mockResolvedValue(value),
});

describe('AasxFileClient', () => {
    // Helper function to create expected configuration matcher
    const expectConfigurationCall = () =>
        expect.objectContaining({
            basePath: 'http://localhost:8087',
            fetchApi: globalThis.fetch,
        });

    // Create mock for AASXFileServerAPIApi
    const mockApiInstance = {
        getAllAASXPackageIdsRaw: vi.fn(),
        postAASXPackageRaw: vi.fn(),
        getAASXByPackageIdRaw: vi.fn(),
        putAASXByPackageIdRaw: vi.fn(),
        deleteAASXByPackageIdRaw: vi.fn(),
    };
    const mockDescriptionApiInstance = {
        getSelfDescriptionRaw: vi.fn(),
    };

    // Mock constructor
    const MockAasxFile = vi.fn(function () {
        return mockApiInstance;
    });
    const MockDescriptionApi = vi.fn(function () {
        return mockDescriptionApiInstance;
    });

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup mock for base64Encode
        (base64Encode as Mock).mockImplementation((input) => `encoded_${input}`);
        // Setup mock for constructor
        (AasxFileService.AASXFileServerAPIApi as unknown as Mock).mockImplementation(MockAasxFile);
        (AasxFileService.DescriptionAPIApi as unknown as Mock).mockImplementation(MockDescriptionApi);

        // Mock the error handler to return a standardized Result
        (handleApiError as Mock).mockImplementation(async (err) => {
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
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        (console.error as Mock).mockRestore();
    });

    it('should return a list of available AASX packages on successful response', async () => {
        // Arrange
        mockApiInstance.getAllAASXPackageIdsRaw.mockResolvedValue(
            apiResponse(
                {
                    result: [API_PACKAGEDESCRIPTION1, API_PACKAGEDESCRIPTION2],
                    pagingMetadata: { cursor: 'next-cursor' },
                },
                200
            )
        );

        const client = new AasxFileClient();

        // Act
        const response = await client.getAllAASXPackageIds({
            configuration: TEST_CONFIGURATION,
            aasId: CORE_AAS1.id,
            limit: 10,
            cursor: 'cursor-1',
        });

        // Assert
        expect(MockAasxFile).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(CORE_AAS1.id);
        expect(mockApiInstance.getAllAASXPackageIdsRaw).toHaveBeenCalledWith({
            aasId: `encoded_${CORE_AAS1.id}`,
            limit: 10,
            cursor: 'cursor-1',
        });
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data.pagedResult).toEqual({ cursor: 'next-cursor' });
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
        mockApiInstance.getAllAASXPackageIdsRaw.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as Mock).mockResolvedValue(errorResult);

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
        mockApiInstance.postAASXPackageRaw.mockResolvedValue(apiResponse(API_PACKAGEDESCRIPTION1, 201));

        const client = new AasxFileClient();

        // Act
        const response = await client.postAASXPackage({
            configuration: TEST_CONFIGURATION,
            aasIds: [CORE_AAS1.id],
            file: MOCK_BLOB,
            fileName: fileName,
        });

        // Assert
        expect(MockAasxFile).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).not.toHaveBeenCalled();
        expect(mockApiInstance.postAASXPackageRaw).toHaveBeenCalledWith({
            aasIds: [CORE_AAS1.id],
            file: MOCK_BLOB,
            fileName: fileName,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(201);
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
        mockApiInstance.postAASXPackageRaw.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as Mock).mockResolvedValue(errorResult);

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
        mockApiInstance.getAASXByPackageIdRaw.mockResolvedValue(apiResponse(MOCK_BLOB, 200));

        const client = new AasxFileClient();

        // Act
        const response = await client.getAASXByPackageId({
            configuration: TEST_CONFIGURATION,
            packageId: PACKAGE_ID,
        });

        // Assert
        expect(MockAasxFile).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(PACKAGE_ID);
        expect(mockApiInstance.getAASXByPackageIdRaw).toHaveBeenCalledWith({
            packageId: `encoded_${PACKAGE_ID}`,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
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
        mockApiInstance.getAASXByPackageIdRaw.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as Mock).mockResolvedValue(errorResult);

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
        mockApiInstance.deleteAASXByPackageIdRaw.mockResolvedValue(apiResponse(undefined, 204));

        const client = new AasxFileClient();

        // Act
        const response = await client.deleteAASXByPackageId({
            configuration: TEST_CONFIGURATION,
            packageId: PACKAGE_ID,
        });

        // Assert
        expect(MockAasxFile).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(PACKAGE_ID);
        expect(mockApiInstance.deleteAASXByPackageIdRaw).toHaveBeenCalledWith({
            packageId: `encoded_${PACKAGE_ID}`,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
            expect(response.data).toBeUndefined();
        }
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
        mockApiInstance.deleteAASXByPackageIdRaw.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as Mock).mockResolvedValue(errorResult);

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
        mockApiInstance.putAASXByPackageIdRaw.mockResolvedValue(apiResponse(undefined, 204));

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
        expect(MockAasxFile).toHaveBeenCalledWith(expectConfigurationCall());
        expect(base64Encode).toHaveBeenCalledWith(PACKAGE_ID);
        expect(base64Encode).toHaveBeenCalledTimes(1);
        expect(mockApiInstance.putAASXByPackageIdRaw).toHaveBeenCalledWith({
            packageId: `encoded_${PACKAGE_ID}`,
            aasIds: [CORE_AAS1.id],
            file: MOCK_BLOB,
            fileName: fileName,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(204);
            expect(response.data).toBeUndefined();
        }
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
        mockApiInstance.putAASXByPackageIdRaw.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as Mock).mockResolvedValue(errorResult);

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

    it('should fetch the AASX file server self description', async () => {
        const serviceDescription = {
            profiles: ['https://admin-shell.io/aas/API/3/0/AasxFileServerServiceSpecification/SSP-002'],
        };
        mockDescriptionApiInstance.getSelfDescriptionRaw.mockResolvedValue(apiResponse(serviceDescription, 200));
        const client = new AasxFileClient();

        const response = await client.getSelfDescription({
            configuration: TEST_CONFIGURATION,
        });

        expect(MockDescriptionApi).toHaveBeenCalledWith(expectConfigurationCall());
        expect(mockDescriptionApiInstance.getSelfDescriptionRaw).toHaveBeenCalledWith();
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.statusCode).toBe(200);
            expect(response.data).toEqual(serviceDescription);
        }
    });
});
