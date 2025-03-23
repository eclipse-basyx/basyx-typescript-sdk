// Import necessary types
import type { GetAssetAdministrationShellsResult } from '../../generated/types.gen';
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
import {
    AssetAdministrationShell as ApiAssetAdministrationShell,
    AssetInformation as ApiAssetInformation,
    AssetinformationThumbnailBody,
    Reference as ApiReference,
} from '../../generated';
import * as AasRepository from '../../generated';
import { base64Encode } from '../../lib/base64Url';
import {
    convertApiAasToCoreAas,
    convertApiAssetInformationToCoreAssetInformation,
    convertApiReferenceToCoreReference,
    convertCoreAasToApiAas,
    convertCoreAssetInformationToApiAssetInformation,
    convertCoreReferenceToApiReference,
} from '../../lib/convertAasTypes';
import { createCustomClient } from '../../lib/createAasRepoClient';

// Mock the dependencies
jest.mock('../../lib/createAasRepoClient');
jest.mock('../../generated');
jest.mock('../../lib/convertAasTypes');
jest.mock('../../lib/base64Url');

// Define mock constants
const BASE_URL = 'https://api.example.com';
const HEADERS = new Headers({ Authorization: 'Bearer token' });
const ASSET_IDS = [
    { name: 'globalAssetId', value: 'https://example.com/ids/asset/7600_5912_3951_6917' },
    { name: 'globalAssetId', value: 'https://example.com/ids/asset/7600_5912_3951_6918' },
];
const ID_SHORT = 'shellIdShort';
const LIMIT = 10;
const CURSOR = 'cursor123';
const API_AAS1: ApiAssetAdministrationShell = {
    id: 'https://example.com/ids/aas/7600_5912_3951_6917',
    modelType: 'AssetAdministrationShell',
    assetInformation: { assetKind: 'Instance' },
};
const API_AAS2: ApiAssetAdministrationShell = {
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
const API_ASSET_INFO: ApiAssetInformation = {
    assetKind: 'Instance',
};
const CORE_ASSET_INFO: CoreAssetInformation = new CoreAssetInformation(AssetKind.Instance);
const MOCK_BLOB = new Blob();
const MOCK_THUMBNAIL_BODY: AssetinformationThumbnailBody = {
    fileName: 'thumbnail.png',
    file: MOCK_BLOB,
};
const API_REFERENCE1: ApiReference = {
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
const API_REFERENCE2: ApiReference = {
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

describe('AasRepositoryClient', () => {
    const client = {}; // Mock client object
    const mockCreateCustomClient = createCustomClient as jest.Mock;
    const mockGetAllAssetAdministrationShells = AasRepository.getAllAssetAdministrationShells as jest.Mock;
    const mockPostAssetAdministrationShell = AasRepository.postAssetAdministrationShell as jest.Mock;
    const mockDeleteAssetAdministrationShellById = AasRepository.deleteAssetAdministrationShellById as jest.Mock;
    const mockGetAssetAdministrationShellById = AasRepository.getAssetAdministrationShellById as jest.Mock;
    const mockPutAssetAdministrationShellById = AasRepository.putAssetAdministrationShellById as jest.Mock;
    const mockGetAssetInformation = AasRepository.getAssetInformationAasRepository as jest.Mock;
    const mockPutAssetInformation = AasRepository.putAssetInformationAasRepository as jest.Mock;
    const mockDeleteThumbnail = AasRepository.deleteThumbnailAasRepository as jest.Mock;
    const mockGetThumbnail = AasRepository.getThumbnailAasRepository as jest.Mock;
    const mockPutThumbnail = AasRepository.putThumbnailAasRepository as jest.Mock;
    const mockGetAllSubmodelReferences = AasRepository.getAllSubmodelReferencesAasRepository as jest.Mock;
    const mockPostSubmodelReference = AasRepository.postSubmodelReferenceAasRepository as jest.Mock;
    const mockDeleteSubmodelReferenceById = AasRepository.deleteSubmodelReferenceByIdAasRepository as jest.Mock;
    const mockConvertApiAasToCoreAas = convertApiAasToCoreAas as jest.Mock;
    const mockConvertCoreAasToApiAas = convertCoreAasToApiAas as jest.Mock;
    const mockConvertApiAssetInformationToCoreAssetInformation =
        convertApiAssetInformationToCoreAssetInformation as jest.Mock;
    const mockConvertCoreAssetInformationToApiAssetInformation =
        convertCoreAssetInformationToApiAssetInformation as jest.Mock;
    const mockConvertApiReferenceToCoreReference = convertApiReferenceToCoreReference as jest.Mock;
    const mockConvertCoreReferenceToApiReference = convertCoreReferenceToApiReference as jest.Mock;
    const mockBase64Encode = base64Encode as jest.Mock;

    // Mock console.error to prevent actual logging during tests
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        (console.error as jest.Mock).mockRestore();
    });

    beforeEach(() => {
        (mockBase64Encode as jest.Mock).mockImplementation((id: string) => id);
        jest.clearAllMocks(); // Clears call history without resetting implementations
        mockCreateCustomClient.mockReturnValue(client);
    });

    it('should return Asset Administration Shells on successful response', async () => {
        // Arrange
        const apiResponse: GetAssetAdministrationShellsResult = {
            paging_metadata: {
                cursor: 'cursor123',
            },
            result: [API_AAS1, API_AAS2],
        };
        mockGetAllAssetAdministrationShells.mockResolvedValue({ data: apiResponse, error: null });

        // Mock convert function to return core AAS
        mockConvertApiAasToCoreAas.mockImplementation((aas: ApiAssetAdministrationShell) => {
            if (aas.id === API_AAS1.id) return CORE_AAS1;
            if (aas.id === API_AAS2.id) return CORE_AAS2;
            throw new Error('Unknown AAS ID');
        });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getAllAssetAdministrationShells({
            baseUrl: BASE_URL,
            headers: HEADERS,
            assetIds: ASSET_IDS,
            idShort: ID_SHORT,
            limit: LIMIT,
            cursor: CURSOR,
        });

        // Assert
        expect(createCustomClient).toHaveBeenCalledWith(BASE_URL, HEADERS);
        expect(AasRepository.getAllAssetAdministrationShells).toHaveBeenCalledWith({
            client,
            query: {
                assetIds: ASSET_IDS.map((id) => JSON.stringify(id)),
                idShort: ID_SHORT,
                limit: LIMIT,
                cursor: CURSOR,
            },
        });
        expect(convertApiAasToCoreAas).toHaveBeenCalledTimes(apiResponse.result!.length);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual({
                pagedResult: apiResponse.paging_metadata,
                result: [CORE_AAS1, CORE_AAS2],
            });
        }
    });

    it('should return an error when server returns an error', async () => {
        // Arrange
        const mockError = { messages: ['Invalid request'] };
        mockGetAllAssetAdministrationShells.mockResolvedValue({ data: null, error: mockError });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getAllAssetAdministrationShells({ baseUrl: BASE_URL, headers: HEADERS });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBe(mockError);
        }
    });

    it('should handle empty result array gracefully', async () => {
        // Arrange
        const apiResponse: GetAssetAdministrationShellsResult = {
            paging_metadata: {
                cursor: undefined,
            },
            result: [],
        };
        mockGetAllAssetAdministrationShells.mockResolvedValue({ data: apiResponse, error: null });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getAllAssetAdministrationShells({ baseUrl: BASE_URL, headers: HEADERS });

        // Assert
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual({
                pagedResult: apiResponse.paging_metadata,
                result: [],
            });
        }
    });

    it('should create an Asset Administration Shell successfully', async () => {
        // Arrange
        mockPostAssetAdministrationShell.mockResolvedValue({ data: API_AAS1, error: null });

        // Mock convert function to return API AAS
        mockConvertCoreAasToApiAas.mockImplementation((aas: CoreAssetAdministrationShell) => {
            if (aas.id === CORE_AAS1.id) return API_AAS1;
            if (aas.id === CORE_AAS2.id) return API_AAS2;
            throw new Error('Unknown AAS ID');
        });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.postAssetAdministrationShell({
            baseUrl: BASE_URL,
            assetAdministrationShell: CORE_AAS1,
            headers: HEADERS,
        });

        // Assert
        expect(createCustomClient).toHaveBeenCalledWith(BASE_URL, HEADERS);
        expect(AasRepository.postAssetAdministrationShell).toHaveBeenCalledWith({
            client,
            body: API_AAS1,
        });
        expect(convertCoreAasToApiAas).toHaveBeenCalledWith(CORE_AAS1);
        expect(convertApiAasToCoreAas).toHaveBeenCalledWith(API_AAS1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(convertApiAasToCoreAas(API_AAS1));
        }
    });

    it('should return an error when server returns an error', async () => {
        // Arrange
        const mockError = { messages: ['Invalid request'] };
        mockPostAssetAdministrationShell.mockResolvedValue({ data: null, error: mockError });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.postAssetAdministrationShell({
            baseUrl: BASE_URL,
            assetAdministrationShell: CORE_AAS1,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBe(mockError);
        }
    });

    it('should return an error when AasRepository throws an exception', async () => {
        // Arrange
        const mockException = new Error('Network error');
        mockPostAssetAdministrationShell.mockRejectedValue(mockException);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.postAssetAdministrationShell({
            baseUrl: BASE_URL,
            assetAdministrationShell: CORE_AAS1,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeInstanceOf(Error);
            if (response.error instanceof Error) {
                expect(response.error.message).toBe('Network error');
            }
        }
    });

    it('should delete an Asset Administration Shell successfully', async () => {
        // Arrange
        mockDeleteAssetAdministrationShellById.mockResolvedValue({ data: {}, error: null });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.deleteAssetAdministrationShellById({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(createCustomClient).toHaveBeenCalledWith(BASE_URL, HEADERS);
        expect(AasRepository.deleteAssetAdministrationShellById).toHaveBeenCalledWith({
            client,
            path: { aasIdentifier: CORE_AAS1.id },
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual({});
        }
    });

    it('should return an error when server returns an error', async () => {
        // Arrange
        const mockError = { messages: ['Invalid request'] };
        mockDeleteAssetAdministrationShellById.mockResolvedValue({ data: null, error: mockError });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.deleteAssetAdministrationShellById({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBe(mockError);
        }
    });

    it('should return an error when AasRepository throws an exception', async () => {
        // Arrange
        const mockException = new Error('Network error');
        mockDeleteAssetAdministrationShellById.mockRejectedValue(mockException);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.deleteAssetAdministrationShellById({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeInstanceOf(Error);
            if (response.error instanceof Error) {
                expect(response.error.message).toBe('Network error');
            }
        }
    });

    it('should get an Asset Administration Shell successfully', async () => {
        // Arrange
        mockGetAssetAdministrationShellById.mockResolvedValue({ data: API_AAS1, error: null });

        // Mock convert function to return core AAS
        mockConvertApiAasToCoreAas.mockImplementation((aas: ApiAssetAdministrationShell) => {
            if (aas.id === API_AAS1.id) return CORE_AAS1;
            if (aas.id === API_AAS2.id) return CORE_AAS2;
            throw new Error('Unknown AAS ID');
        });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getAssetAdministrationShellById({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(createCustomClient).toHaveBeenCalledWith(BASE_URL, HEADERS);
        expect(AasRepository.getAssetAdministrationShellById).toHaveBeenCalledWith({
            client,
            path: { aasIdentifier: CORE_AAS1.id },
        });
        expect(convertApiAasToCoreAas).toHaveBeenCalledWith(API_AAS1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_AAS1);
        }
    });

    it('should return an error when server returns an error', async () => {
        // Arrange
        const mockError = { messages: ['Invalid request'] };
        mockGetAssetAdministrationShellById.mockResolvedValue({ data: null, error: mockError });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getAssetAdministrationShellById({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBe(mockError);
        }
    });

    it('should return an error when AasRepository throws an exception', async () => {
        // Arrange
        const mockException = new Error('Network error');
        mockGetAssetAdministrationShellById.mockRejectedValue(mockException);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getAssetAdministrationShellById({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeInstanceOf(Error);
            if (response.error instanceof Error) {
                expect(response.error.message).toBe('Network error');
            }
        }
    });

    it('should update an Asset Administration Shell successfully', async () => {
        // Arrange
        mockPutAssetAdministrationShellById.mockResolvedValue({ data: {}, error: null });

        // Mock convert function to return API AAS
        mockConvertCoreAasToApiAas.mockImplementation((aas: CoreAssetAdministrationShell) => {
            if (aas.id === CORE_AAS1.id) return API_AAS1;
            if (aas.id === CORE_AAS2.id) return API_AAS2;
            throw new Error('Unknown AAS ID');
        });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.putAssetAdministrationShellById({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            assetAdministrationShell: CORE_AAS1,
            headers: HEADERS,
        });

        // Assert
        expect(createCustomClient).toHaveBeenCalledWith(BASE_URL, HEADERS);
        expect(AasRepository.putAssetAdministrationShellById).toHaveBeenCalledWith({
            client,
            path: { aasIdentifier: CORE_AAS1.id },
            body: API_AAS1,
        });
        expect(convertCoreAasToApiAas).toHaveBeenCalledWith(CORE_AAS1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual({});
        }
    });

    it('should return an error when server returns an error', async () => {
        // Arrange
        const mockError = { messages: ['Invalid request'] };
        mockPutAssetAdministrationShellById.mockResolvedValue({ data: null, error: mockError });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.putAssetAdministrationShellById({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            assetAdministrationShell: CORE_AAS1,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBe(mockError);
        }
    });

    it('should return an error when AasRepository throws an exception', async () => {
        // Arrange
        const mockException = new Error('Network error');
        mockPutAssetAdministrationShellById.mockRejectedValue(mockException);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.putAssetAdministrationShellById({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            assetAdministrationShell: CORE_AAS1,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeInstanceOf(Error);
            if (response.error instanceof Error) {
                expect(response.error.message).toBe('Network error');
            }
        }
    });

    it('should get Asset Information successfully', async () => {
        // Arrange
        mockGetAssetInformation.mockResolvedValue({ data: API_ASSET_INFO, error: null });

        // Mock convert function to return core asset information
        mockConvertApiAssetInformationToCoreAssetInformation.mockReturnValue(CORE_ASSET_INFO);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getAssetInformation({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(createCustomClient).toHaveBeenCalledWith(BASE_URL, HEADERS);
        expect(AasRepository.getAssetInformationAasRepository).toHaveBeenCalledWith({
            client,
            path: { aasIdentifier: CORE_AAS1.id },
        });
        expect(convertApiAssetInformationToCoreAssetInformation).toHaveBeenCalledWith(API_ASSET_INFO);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_ASSET_INFO);
        }
    });

    it('should return an error when server returns an error', async () => {
        // Arrange
        const mockError = { messages: ['Invalid request'] };
        mockGetAssetInformation.mockResolvedValue({ data: null, error: mockError });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getAssetInformation({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBe(mockError);
        }
    });

    it('should return an error when AasRepository throws an exception', async () => {
        // Arrange
        const mockException = new Error('Network error');
        mockGetAssetInformation.mockRejectedValue(mockException);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getAssetInformation({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeInstanceOf(Error);
            if (response.error instanceof Error) {
                expect(response.error.message).toBe('Network error');
            }
        }
    });

    it('should update Asset Information successfully', async () => {
        // Arrange
        mockPutAssetInformation.mockResolvedValue({ data: {}, error: null });

        // Mock convert function to return API asset information
        mockConvertCoreAssetInformationToApiAssetInformation.mockReturnValue(API_ASSET_INFO);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.putAssetInformation({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            assetInformation: CORE_ASSET_INFO,
            headers: HEADERS,
        });

        // Assert
        expect(createCustomClient).toHaveBeenCalledWith(BASE_URL, HEADERS);
        expect(AasRepository.putAssetInformationAasRepository).toHaveBeenCalledWith({
            client,
            path: { aasIdentifier: CORE_AAS1.id },
            body: API_ASSET_INFO,
        });
        expect(convertCoreAssetInformationToApiAssetInformation).toHaveBeenCalledWith(CORE_ASSET_INFO);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual({});
        }
    });

    it('should return an error when server returns an error', async () => {
        // Arrange
        const mockError = { messages: ['Invalid request'] };
        mockPutAssetInformation.mockResolvedValue({ data: null, error: mockError });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.putAssetInformation({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            assetInformation: CORE_ASSET_INFO,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBe(mockError);
        }
    });

    it('should return an error when AasRepository throws an exception', async () => {
        // Arrange
        const mockException = new Error('Network error');
        mockPutAssetInformation.mockRejectedValue(mockException);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.putAssetInformation({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            assetInformation: CORE_ASSET_INFO,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeInstanceOf(Error);
            if (response.error instanceof Error) {
                expect(response.error.message).toBe('Network error');
            }
        }
    });

    it('should delete a thumbnail successfully', async () => {
        // Arrange
        mockDeleteThumbnail.mockResolvedValue({ data: {}, error: null });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.deleteThumbnail({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(createCustomClient).toHaveBeenCalledWith(BASE_URL, HEADERS);
        expect(AasRepository.deleteThumbnailAasRepository).toHaveBeenCalledWith({
            client,
            path: { aasIdentifier: CORE_AAS1.id },
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual({});
        }
    });

    it('should return an error when server returns an error', async () => {
        // Arrange
        const mockError = { messages: ['Invalid request'] };
        mockDeleteThumbnail.mockResolvedValue({ data: null, error: mockError });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.deleteThumbnail({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBe(mockError);
        }
    });

    it('should return an error when AasRepository throws an exception', async () => {
        // Arrange
        const mockException = new Error('Network error');
        mockDeleteThumbnail.mockRejectedValue(mockException);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.deleteThumbnail({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeInstanceOf(Error);
            if (response.error instanceof Error) {
                expect(response.error.message).toBe('Network error');
            }
        }
    });

    it('should get a thumbnail successfully', async () => {
        // Arrange
        mockGetThumbnail.mockResolvedValue({ data: MOCK_BLOB, error: null });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getThumbnail({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(createCustomClient).toHaveBeenCalledWith(BASE_URL, HEADERS);
        expect(AasRepository.getThumbnailAasRepository).toHaveBeenCalledWith({
            client,
            path: { aasIdentifier: CORE_AAS1.id },
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBe(MOCK_BLOB);
        }
    });

    it('should return an error when server returns an error', async () => {
        // Arrange
        const mockError = { messages: ['Invalid request'] };
        mockGetThumbnail.mockResolvedValue({ data: null, error: mockError });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getThumbnail({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBe(mockError);
        }
    });

    it('should return an error when AasRepository throws an exception', async () => {
        // Arrange
        const mockException = new Error('Network error');
        mockGetThumbnail.mockRejectedValue(mockException);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getThumbnail({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeInstanceOf(Error);
            if (response.error instanceof Error) {
                expect(response.error.message).toBe('Network error');
            }
        }
    });

    it('should put a thumbnail successfully', async () => {
        // Arrange
        mockPutThumbnail.mockResolvedValue({ data: {}, error: null });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.putThumbnail({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            thumbnail: MOCK_THUMBNAIL_BODY,
            headers: HEADERS,
        });

        // Assert
        expect(createCustomClient).toHaveBeenCalledWith(BASE_URL, HEADERS);
        expect(AasRepository.putThumbnailAasRepository).toHaveBeenCalledWith({
            client,
            path: { aasIdentifier: CORE_AAS1.id },
            body: MOCK_THUMBNAIL_BODY,
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual({});
        }
    });

    it('should return an error when server returns an error', async () => {
        // Arrange
        const mockError = { messages: ['Invalid request'] };
        mockPutThumbnail.mockResolvedValue({ data: null, error: mockError });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.putThumbnail({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            thumbnail: MOCK_THUMBNAIL_BODY,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBe(mockError);
        }
    });

    it('should return an error when AasRepository throws an exception', async () => {
        // Arrange
        const mockException = new Error('Network error');
        mockPutThumbnail.mockRejectedValue(mockException);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.putThumbnail({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            thumbnail: MOCK_THUMBNAIL_BODY,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeInstanceOf(Error);
            if (response.error instanceof Error) {
                expect(response.error.message).toBe('Network error');
            }
        }
    });

    it('should get all submodel references successfully', async () => {
        // Arrange
        const apiResponse = {
            paging_metadata: {
                cursor: 'cursor123',
            },
            result: [API_REFERENCE1, API_REFERENCE2],
        };
        mockGetAllSubmodelReferences.mockResolvedValue({ data: apiResponse, error: null });

        // Mock convert function to return core reference
        mockConvertApiReferenceToCoreReference.mockImplementation((apiReference: ApiReference) => {
            if (apiReference === API_REFERENCE1) return CORE_REFERENCE1;
            if (apiReference === API_REFERENCE2) return CORE_REFERENCE2;
            throw new Error('Unknown reference');
        });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getAllSubmodelReferences({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
            limit: LIMIT,
            cursor: CURSOR,
        });

        // Assert
        expect(createCustomClient).toHaveBeenCalledWith(BASE_URL, HEADERS);
        expect(AasRepository.getAllSubmodelReferencesAasRepository).toHaveBeenCalledWith({
            client,
            path: { aasIdentifier: CORE_AAS1.id },
            query: {
                limit: LIMIT,
                cursor: CURSOR,
            },
        });
        expect(convertApiReferenceToCoreReference).toHaveBeenCalledTimes(apiResponse.result.length);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual({
                pagedResult: apiResponse.paging_metadata,
                result: [CORE_REFERENCE1, CORE_REFERENCE2],
            });
        }
    });

    it('should return an error when server returns an error', async () => {
        // Arrange
        const mockError = { messages: ['Invalid request'] };
        mockGetAllSubmodelReferences.mockResolvedValue({ data: null, error: mockError });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getAllSubmodelReferences({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBe(mockError);
        }
    });

    it('should return an error when AasRepository throws an exception', async () => {
        // Arrange
        const mockException = new Error('Network error');
        mockGetAllSubmodelReferences.mockRejectedValue(mockException);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.getAllSubmodelReferences({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeInstanceOf(Error);
            if (response.error instanceof Error) {
                expect(response.error.message).toBe('Network error');
            }
        }
    });

    it('should post a submodel reference successfully', async () => {
        // Arrange
        mockPostSubmodelReference.mockResolvedValue({ data: API_REFERENCE1, error: null });

        // Mock convert function to return API reference
        mockConvertCoreReferenceToApiReference.mockReturnValue(API_REFERENCE1);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.postSubmodelReference({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            submodelReference: CORE_REFERENCE1,
            headers: HEADERS,
        });

        // Assert
        expect(createCustomClient).toHaveBeenCalledWith(BASE_URL, HEADERS);
        expect(AasRepository.postSubmodelReferenceAasRepository).toHaveBeenCalledWith({
            client,
            path: { aasIdentifier: CORE_AAS1.id },
            body: API_REFERENCE1,
        });
        expect(convertCoreReferenceToApiReference).toHaveBeenCalledWith(CORE_REFERENCE1);
        expect(convertApiReferenceToCoreReference).toHaveBeenCalledWith(API_REFERENCE1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_REFERENCE1);
        }
    });

    it('should return an error when server returns an error', async () => {
        // Arrange
        const mockError = { messages: ['Invalid request'] };
        mockPostSubmodelReference.mockResolvedValue({ data: null, error: mockError });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.postSubmodelReference({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            submodelReference: CORE_REFERENCE1,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBe(mockError);
        }
    });

    it('should return an error when AasRepository throws an exception', async () => {
        // Arrange
        const mockException = new Error('Network error');
        mockPostSubmodelReference.mockRejectedValue(mockException);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.postSubmodelReference({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            submodelReference: CORE_REFERENCE1,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeInstanceOf(Error);
            if (response.error instanceof Error) {
                expect(response.error.message).toBe('Network error');
            }
        }
    });

    it('should delete a submodel reference successfully', async () => {
        // Arrange
        mockDeleteSubmodelReferenceById.mockResolvedValue({ data: {}, error: null });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.deleteSubmodelReferenceById({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_REFERENCE1.keys[0].value,
            headers: HEADERS,
        });

        // Assert
        expect(createCustomClient).toHaveBeenCalledWith(BASE_URL, HEADERS);
        expect(AasRepository.deleteSubmodelReferenceByIdAasRepository).toHaveBeenCalledWith({
            client,
            path: { aasIdentifier: CORE_AAS1.id, submodelIdentifier: CORE_REFERENCE1.keys[0].value },
        });
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual({});
        }
    });

    it('should return an error when server returns an error', async () => {
        // Arrange
        const mockError = { messages: ['Invalid request'] };
        mockDeleteSubmodelReferenceById.mockResolvedValue({ data: null, error: mockError });

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.deleteSubmodelReferenceById({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_REFERENCE1.keys[0].value,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBe(mockError);
        }
    });

    it('should return an error when AasRepository throws an exception', async () => {
        // Arrange
        const mockException = new Error('Network error');
        mockDeleteSubmodelReferenceById.mockRejectedValue(mockException);

        const clientInstance = new AasRepositoryClient();

        // Act
        const response = await clientInstance.deleteSubmodelReferenceById({
            baseUrl: BASE_URL,
            aasIdentifier: CORE_AAS1.id,
            submodelIdentifier: CORE_REFERENCE1.keys[0].value,
            headers: HEADERS,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeInstanceOf(Error);
            if (response.error instanceof Error) {
                expect(response.error.message).toBe('Network error');
            }
        }
    });
});
