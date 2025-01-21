// Import necessary types
import type { GetAssetAdministrationShellsResult } from '../../generated/aas-repository/types.gen';
import {
    AssetAdministrationShell as CoreAssetAdministrationShell,
    AssetInformation,
    AssetKind,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { AasRepositoryClient } from '../../clients/AasRepositoryClient';
import { AssetAdministrationShell as ApiAssetAdministrationShell } from '../../generated/aas-repository';
import * as AasRepository from '../../generated/aas-repository';
import { convertApiAasToCoreAas } from '../../lib/convertAasTypes';
import { createCustomClient } from '../../lib/createAasRepoClient';

// Mock the dependencies
jest.mock('../../lib/createAasRepoClient');
jest.mock('../../generated/aas-repository');
jest.mock('../../lib/convertAasTypes');

describe('AasRepositoryClient', () => {
    const mockBaseURL = 'https://api.example.com';
    const mockHeaders = new Headers({ Authorization: 'Bearer token' });
    const mockAssetIds = ['asset1', 'asset2'];
    const mockIdShort = 'shellShortId';
    const mockLimit = 10;
    const mockCursor = 'cursor123';

    const client = {}; // Mock client object
    const mockCreateCustomClient = createCustomClient as jest.Mock;
    const mockGetAllAssetAdministrationShells = AasRepository.getAllAssetAdministrationShells as jest.Mock;
    const mockConvertApiAasToCoreAas = convertApiAasToCoreAas as jest.Mock;

    // Mock console.error to prevent actual logging during tests
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        (console.error as jest.Mock).mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks(); // Clears call history without resetting implementations
        mockCreateCustomClient.mockReturnValue(client);
    });

    it('should return Asset Administration Shells on successful response', async () => {
        const apiAas1 = {
            id: 'https://example.com/ids/aas/7600_5912_3951_6917',
            modelType: 'AssetAdministrationShell',
            assetInformation: { assetKind: 'Instance' },
        } as ApiAssetAdministrationShell;

        const apiAas2 = {
            id: 'https://example.com/ids/aas/7600_5912_3951_6918',
            modelType: 'AssetAdministrationShell',
            assetInformation: { assetKind: 'Type' },
        } as ApiAssetAdministrationShell;

        // Arrange
        const apiResponse: GetAssetAdministrationShellsResult = {
            paging_metadata: {
                cursor: 'cursor123',
            },
            result: [apiAas1, apiAas2],
        };
        mockGetAllAssetAdministrationShells.mockResolvedValue({ data: apiResponse, error: null });

        const coreAssetInfo = new AssetInformation(AssetKind.Instance);

        const coreAas1 = new CoreAssetAdministrationShell(
            'https://example.com/ids/aas/7600_5912_3951_6917',
            coreAssetInfo
        );

        const coreAas2 = new CoreAssetAdministrationShell(
            'https://example.com/ids/aas/7600_5912_3951_6918',
            new AssetInformation(AssetKind.Type)
        );

        // Mock convert function to return core AAS
        mockConvertApiAasToCoreAas.mockImplementation((aas: ApiAssetAdministrationShell) => {
            if (aas.id === apiAas1.id) return coreAas1;
            if (aas.id === apiAas2.id) return coreAas2;
            throw new Error('Unknown AAS ID');
        });

        const clientInstance = new AasRepositoryClient();

        // Act
        const result = await clientInstance.getAllAssetAdministrationShells(
            mockBaseURL,
            mockHeaders,
            mockAssetIds,
            mockIdShort,
            mockLimit,
            mockCursor
        );

        // Assert
        expect(createCustomClient).toHaveBeenCalledWith(mockBaseURL, mockHeaders);
        expect(AasRepository.getAllAssetAdministrationShells).toHaveBeenCalledWith({
            client,
            query: {
                assetIds: mockAssetIds,
                idShort: mockIdShort,
                limit: mockLimit,
                cursor: mockCursor,
            },
        });
        expect(convertApiAasToCoreAas).toHaveBeenCalledTimes(apiResponse.result!.length);
        expect(result).toEqual({
            pagedResult: apiResponse.paging_metadata,
            result: [coreAas1, coreAas2],
        });
    });

    it('should throw an error when server returns an error', async () => {
        // Arrange
        const mockError = { messages: ['Invalid request'] };
        mockGetAllAssetAdministrationShells.mockResolvedValue({ data: null, error: mockError });

        const clientInstance = new AasRepositoryClient();

        // Act & Assert
        await expect(clientInstance.getAllAssetAdministrationShells(mockBaseURL, mockHeaders)).rejects.toThrow(
            JSON.stringify(mockError.messages)
        );

        expect(console.error).toHaveBeenCalledWith('Error from server:', mockError);
    });

    it('should throw an error when AasRepository throws an exception', async () => {
        // Arrange
        const mockException = new Error('Network error');
        mockGetAllAssetAdministrationShells.mockRejectedValue(mockException);

        const clientInstance = new AasRepositoryClient();

        // Act & Assert
        await expect(clientInstance.getAllAssetAdministrationShells(mockBaseURL, mockHeaders)).rejects.toThrow(
            'Network error'
        );

        expect(console.error).toHaveBeenCalledWith('Error fetching Asset Administration Shells:', mockException);
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
        const result = await clientInstance.getAllAssetAdministrationShells(mockBaseURL, mockHeaders);

        // Assert
        expect(result).toEqual({
            pagedResult: apiResponse.paging_metadata,
            result: [],
        });
    });
});
