import { jsonization } from '@aas-core-works/aas-core3.0-typescript';
import {
    SpecificAssetId as CoreSpecificAssetId,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { AasDiscoveryService } from '../../generated';
import {
    convertApiAssetIdToCoreAssetId,
    convertCoreAssetIdToApiAssetId,
} from '../../lib/convertAasDiscoveryTypes';

/**
 * Mock the jsonization methods used in convertAasDiscoveryTypes.ts
 */
jest.mock('@aas-core-works/aas-core3.0-typescript', () => ({
    jsonization: {
        specificAssetIdFromJsonable: jest.fn(),
        toJsonable: jest.fn(),
    },
}));

// Define mock constants
const API_SPECIFIC_ASSET_ID: AasDiscoveryService.SpecificAssetId = {
    // id: 'https://example.com/ids/aas/7600_5912_3951_6917',
    // modelType: AasRepositoryService.ModelType.AssetAdministrationShell,
    // assetInformation: { assetKind: AasRepositoryService.AssetKind.Instance },
};
const CORE_SPECIFIC_ASSET_ID: CoreSpecificAssetId = new CoreSpecificAssetId(
    // 'https://example.com/ids/aas/7600_5912_3951_6917',
    // new CoreAssetInformation(CoreAssetKind.Instance)
);
const JSONABLE_SPECIFIC_ASSET_ID: jsonization.JsonObject = {
    // id: 'https://example.com/ids/aas/7600_5912_3951_6917',
    // modelType: 'AssetAdministrationShell',
    // assetInformation: { assetKind: 'Instance' },
};

describe('convertAasDiscoveryTypes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('convertApiAssetIdToCoreAssetId', () => {
        it('should convert ApiSpecificAssetId to CoreSpecificAssetId successfully', () => {
            (jsonization.specificAssetIdFromJsonable as jest.Mock).mockReturnValue({
                error: null,
                mustValue: () => CORE_SPECIFIC_ASSET_ID,
            });

            const result = convertApiAssetIdToCoreAssetId(API_SPECIFIC_ASSET_ID);

            expect(jsonization.specificAssetIdFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(API_SPECIFIC_ASSET_ID))
            );
            expect(result).toBe(CORE_SPECIFIC_ASSET_ID);
        });

        it('should throw an error if jsonization.specificAssetIdFromJsonable returns an error', () => {
            const error = new Error('Conversion failed');

            (jsonization.specificAssetIdFromJsonable as jest.Mock).mockReturnValue({
                error: error,
            });

            expect(() => convertApiAssetIdToCoreAssetId(API_SPECIFIC_ASSET_ID)).toThrow(error);
            expect(jsonization.specificAssetIdFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(API_SPECIFIC_ASSET_ID))
            );
        });
    });

    describe('convertCoreAssetIdToApiAssetId', () => {
        it('should convert CoreSpecificAssetId to ApiSpecificAssetId successfully', () => {
            (jsonization.toJsonable as jest.Mock).mockReturnValue(JSONABLE_SPECIFIC_ASSET_ID);

            const result = convertCoreAssetIdToApiAssetId(CORE_SPECIFIC_ASSET_ID);

            expect(jsonization.toJsonable).toHaveBeenCalledWith(CORE_SPECIFIC_ASSET_ID);
            expect(result).toEqual(API_SPECIFIC_ASSET_ID);
        });
    });
});    