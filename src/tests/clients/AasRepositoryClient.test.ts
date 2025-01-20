import { AasRepositoryClient } from '../../clients/AasRepositoryClient';
import * as AasRepository from '../../generated/aas-repository';
import { createCustomClient } from '../../lib/createAasRepoClient';

jest.mock('@/generated/aas-repository'); // mock the entire module
jest.mock('@/lib/createAasRepoClient'); // mock the client creation

describe('AasRepositoryClient', () => {
    beforeEach(() => {
        // Reset mocks before each test so they don't leak calls between tests
        jest.resetAllMocks();
    });

    describe('getAllAssetAdministrationShells', () => {
        it('should fetch all AAS and convert them properly', async () => {
            // 1) Setup mock
            const mockShells = {
                result: [
                    {
                        id: 'https://example.com/ids/aas/7600_5912_3951_6917',
                        modelType: 'AssetAdministrationShell',
                        assetInformation: { assetKind: 'Instance' },
                    },
                    {
                        id: 'https://example.com/ids/aas/7600_5912_3951_6918',
                        modelType: 'AssetAdministrationShell',
                        assetInformation: { assetKind: 'Instance' },
                    },
                ],
                paging_metadata: { total: 2, cursor: null },
            };
            // The generated function returns { data, error }
            (AasRepository.getAllAssetAdministrationShells as jest.Mock).mockResolvedValue({
                data: mockShells,
                error: undefined,
            });

            // Mock the custom client
            (createCustomClient as jest.Mock).mockReturnValue('MOCK_CLIENT');

            // 2) Execute
            const client = new AasRepositoryClient();
            const result = await client.getAllAssetAdministrationShells(
                'https://example.com', // baseURL
                undefined // headers
            );

            // 3) Assert
            // Check that createCustomClient was called with the correct args
            expect(createCustomClient).toHaveBeenCalledWith('https://example.com', undefined);

            // Check that the generated function was called with the expected structure
            expect(AasRepository.getAllAssetAdministrationShells).toHaveBeenCalledWith({
                client: 'MOCK_CLIENT',
                query: { assetIds: undefined, idShort: undefined, limit: undefined, cursor: undefined },
            });

            // Now check the final result
            expect(result.pagedResult).toEqual({ total: 2, cursor: null });
            // You might also check that your type conversion logic worked
            expect(result.result).toHaveLength(2);
            // e.g. if your `convertApiAasToCoreAas(...)` changes shape,
            // you can test those final objects here.
        });

        it('should throw an error if the API returns an error', async () => {
            (createCustomClient as jest.Mock).mockReturnValue('MOCK_CLIENT');
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

    // Similar test blocks for:
    //   postAssetAdministrationShell(...)
    //   getAssetAdministrationShellById(...)
});
