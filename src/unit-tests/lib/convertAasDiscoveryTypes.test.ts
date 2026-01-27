import { jsonization } from '@aas-core-works/aas-core3.1-typescript';
import { SpecificAssetId as CoreSpecificAssetId } from '@aas-core-works/aas-core3.1-typescript/types';
import { AasDiscoveryService } from '../../generated';
import { convertApiAssetIdToCoreAssetId, convertCoreAssetIdToApiAssetId } from '../../lib/convertAasDiscoveryTypes';

/**
 * Mock the jsonization methods used in convertAasDiscoveryTypes.ts
 */
jest.mock('@aas-core-works/aas-core3.1-typescript', () => ({
    jsonization: {
        specificAssetIdFromJsonable: jest.fn(),
        toJsonable: jest.fn(),
    },
}));

// Define mock constants
const API_SPECIFIC_ASSET_ID: AasDiscoveryService.SpecificAssetId = {
    name: 'globalAssetId',
    value: 'https://example.com/ids/asset/7600_5912_3951_6917',
};
const CORE_SPECIFIC_ASSET_ID: CoreSpecificAssetId = new CoreSpecificAssetId(
    'globalAssetId',
    'https://example.com/ids/asset/7600_5912_3951_6917'
);
const JSONABLE_SPECIFIC_ASSET_ID: jsonization.JsonObject = {
    name: 'globalAssetId',
    value: 'https://example.com/ids/asset/7600_5912_3951_6917',
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
