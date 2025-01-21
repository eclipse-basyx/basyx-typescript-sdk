import { AasRepositoryClient } from '../../clients/AasRepositoryClient';
import * as AasRepository from '../../generated/aas-repository';
import { AssetAdministrationShell as ApiAssetAdministrationShell } from '../../generated/aas-repository';

// Mock dependencies
jest.mock('../../lib/createAasRepoClient');
jest.mock('../../lib/convertAasTypes');
jest.mock('../../generated/aas-repository');

describe('AasRepositoryClient', () => {
    beforeEach(() => {
        // Reset mocks before each test so they don't leak calls between tests
        jest.resetAllMocks();
    });

    describe('getAllAssetAdministrationShells', () => {
        it('should fetch all AAS and convert them properly', async () => {
            // 1) Setup mock
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

            const apiMockShells = {
                paging_metadata: { total: 2, cursor: null },
                result: [apiAas1, apiAas2],
            };

            (AasRepository.getAllAssetAdministrationShells as jest.Mock).mockResolvedValue({
                data: apiMockShells,
                error: undefined,
            });

            // 2) Execute
            const client = new AasRepositoryClient();
            const result = await client.getAllAssetAdministrationShells(
                'https://example.com', // baseURL
                undefined, // headers
                undefined, // assetIds
                undefined, // idShort
                2 // limit
            );

            // 3) Assert
            expect(result.pagedResult).toEqual({ total: 2, cursor: null });

            expect(result.result).toHaveLength(2);
        });

        it('should throw an error if the API returns an error', async () => {
            // Return an "error" from the generated function
            (AasRepository.getAllAssetAdministrationShells as jest.Mock).mockResolvedValue({
                data: null,
                error: { messages: ['Something went wrong'] },
            });

            const client = new AasRepositoryClient();
            await expect(client.getAllAssetAdministrationShells('https://example.com')).rejects.toThrowError(
                '["Something went wrong"]'
            );
        });
    });
});
