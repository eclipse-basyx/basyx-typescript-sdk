import { jsonization } from '@aas-core-works/aas-core3.0-typescript';
import {
    AssetAdministrationShell as CoreAssetAdministrationShell,
    AssetInformation as CoreAssetInformation,
    AssetKind as CoreAssetKind,
    Key as CoreKey,
    KeyTypes as CoreKeyTypes,
    Reference as CoreReference,
    ReferenceTypes as CoreReferenceTypes,
} from '@aas-core-works/aas-core3.0-typescript/types';
import {
    AssetAdministrationShell as ApiAssetAdministrationShell,
    AssetInformation as ApiAssetInformation,
    AssetKind as ApiAssetKind,
    KeyTypes as ApiKeyTypes,
    ModelType,
    Reference as ApiReference,
    ReferenceTypes as ApiReferenceTypes,
} from '../../generated';
import {
    convertApiAasToCoreAas,
    convertApiAssetInformationToCoreAssetInformation,
    convertApiReferenceToCoreReference,
    convertCoreAasToApiAas,
    convertCoreAssetInformationToApiAssetInformation,
    convertCoreReferenceToApiReference,
} from '../../lib/convertAasTypes';

/**
 * Mock the jsonization methods used in convertAasTypes.ts
 */
jest.mock('@aas-core-works/aas-core3.0-typescript', () => ({
    jsonization: {
        assetAdministrationShellFromJsonable: jest.fn(),
        toJsonable: jest.fn(),
        assetInformationFromJsonable: jest.fn(),
        referenceFromJsonable: jest.fn(),
    },
}));

// Define mock constants
const API_AAS: ApiAssetAdministrationShell = {
    id: 'https://example.com/ids/aas/7600_5912_3951_6917',
    modelType: ModelType.AssetAdministrationShell,
    assetInformation: { assetKind: ApiAssetKind.Instance },
};
const CORE_AAS: CoreAssetAdministrationShell = new CoreAssetAdministrationShell(
    'https://example.com/ids/aas/7600_5912_3951_6917',
    new CoreAssetInformation(CoreAssetKind.Instance)
);
const JSONABLE_AAS: jsonization.JsonObject = {
    id: 'https://example.com/ids/aas/7600_5912_3951_6917',
    modelType: 'AssetAdministrationShell',
    assetInformation: { assetKind: 'Instance' },
};
const API_ASSET_INFO: ApiAssetInformation = {
    assetKind: ApiAssetKind.Instance,
};
const CORE_ASSET_INFO: CoreAssetInformation = new CoreAssetInformation(CoreAssetKind.Instance);
const JSONABLE_ASSET_INFO: jsonization.JsonObject = {
    assetKind: 'Instance',
};
const API_REFERENCE: ApiReference = {
    type: ApiReferenceTypes.ExternalReference,
    keys: [
        {
            type: ApiKeyTypes.GlobalReference,
            value: 'https://example.com/ids/submodel/7600_5912_3951_6917',
        },
    ],
};
const CORE_REFERENCE: CoreReference = new CoreReference(CoreReferenceTypes.ExternalReference, [
    new CoreKey(CoreKeyTypes.GlobalReference, 'https://example.com/ids/submodel/7600_5912_3951_6917'),
]);
const JSONABLE_REFERENCE: jsonization.JsonObject = {
    type: 'ExternalReference',
    keys: [
        {
            type: 'GlobalReference',
            value: 'https://example.com/ids/submodel/7600_5912_3951_6917',
        },
    ],
};

describe('convertAasTypes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('convertApiAasToCoreAas', () => {
        it('should convert ApiAssetAdministrationShell to CoreAssetAdministrationShell successfully', () => {
            (jsonization.assetAdministrationShellFromJsonable as jest.Mock).mockReturnValue({
                error: null,
                mustValue: () => CORE_AAS,
            });

            const result = convertApiAasToCoreAas(API_AAS);

            expect(jsonization.assetAdministrationShellFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(API_AAS))
            );
            expect(result).toBe(CORE_AAS);
        });

        it('should throw an error if jsonization.assetAdministrationShellFromJsonable returns an error', () => {
            const error = new Error('Conversion failed');

            (jsonization.assetAdministrationShellFromJsonable as jest.Mock).mockReturnValue({
                error: error,
            });

            expect(() => convertApiAasToCoreAas(API_AAS)).toThrow(error);
            expect(jsonization.assetAdministrationShellFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(API_AAS))
            );
        });
    });

    describe('convertCoreAasToApiAas', () => {
        it('should convert CoreAssetAdministrationShell to ApiAssetAdministrationShell successfully', () => {
            (jsonization.toJsonable as jest.Mock).mockReturnValue(JSONABLE_AAS);

            const result = convertCoreAasToApiAas(CORE_AAS);

            expect(jsonization.toJsonable).toHaveBeenCalledWith(CORE_AAS);
            expect(result).toEqual(API_AAS);
        });
    });

    describe('convertApiAssetInformationToCoreAssetInformation', () => {
        it('should convert ApiAssetInformation to CoreAssetInformation successfully', () => {
            (jsonization.assetInformationFromJsonable as jest.Mock).mockReturnValue({
                error: null,
                mustValue: () => CORE_ASSET_INFO,
            });

            const result = convertApiAssetInformationToCoreAssetInformation(API_ASSET_INFO);

            expect(jsonization.assetInformationFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(API_ASSET_INFO))
            );
            expect(result).toBe(CORE_ASSET_INFO);
        });

        it('should throw an error if jsonization.assetInformationFromJsonable returns an error', () => {
            const error = new Error('Conversion failed');

            (jsonization.assetInformationFromJsonable as jest.Mock).mockReturnValue({
                error: error,
            });

            expect(() => convertApiAssetInformationToCoreAssetInformation(API_ASSET_INFO)).toThrow(error);
            expect(jsonization.assetInformationFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(API_ASSET_INFO))
            );
        });
    });

    describe('convertCoreAssetInformationToApiAssetInformation', () => {
        it('should convert CoreAssetInformation to ApiAssetInformation successfully', () => {
            (jsonization.toJsonable as jest.Mock).mockReturnValue(JSONABLE_ASSET_INFO);

            const result = convertCoreAssetInformationToApiAssetInformation(CORE_ASSET_INFO);

            expect(jsonization.toJsonable).toHaveBeenCalledWith(CORE_ASSET_INFO);
            expect(result).toEqual(API_ASSET_INFO);
        });
    });

    describe('convertApiReferenceToCoreReference', () => {
        it('should convert ApiReference to CoreReference successfully', () => {
            (jsonization.referenceFromJsonable as jest.Mock).mockReturnValue({
                error: null,
                mustValue: () => CORE_REFERENCE,
            });

            const result = convertApiReferenceToCoreReference(API_REFERENCE);

            expect(jsonization.referenceFromJsonable).toHaveBeenCalledWith(JSON.parse(JSON.stringify(API_REFERENCE)));
            expect(result).toBe(CORE_REFERENCE);
        });

        it('should throw an error if jsonization.referenceFromJsonable returns an error', () => {
            const error = new Error('Conversion failed');

            (jsonization.referenceFromJsonable as jest.Mock).mockReturnValue({
                error: error,
            });

            expect(() => convertApiReferenceToCoreReference(API_REFERENCE)).toThrow(error);
            expect(jsonization.referenceFromJsonable).toHaveBeenCalledWith(JSON.parse(JSON.stringify(API_REFERENCE)));
        });
    });

    describe('convertCoreReferenceToApiReference', () => {
        it('should convert CoreReference to ApiReference successfully', () => {
            (jsonization.toJsonable as jest.Mock).mockReturnValue(JSONABLE_REFERENCE);

            const result = convertCoreReferenceToApiReference(CORE_REFERENCE);

            expect(jsonization.toJsonable).toHaveBeenCalledWith(CORE_REFERENCE);
            expect(result).toEqual(API_REFERENCE);
        });
    });
});
