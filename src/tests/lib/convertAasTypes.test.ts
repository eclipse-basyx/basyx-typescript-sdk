import { jsonization } from '@aas-core-works/aas-core3.0-typescript';
import {
    AssetAdministrationShell as CoreAssetAdministrationShell,
    AssetInformation as CoreAssetInformation,
    AssetKind,
    Key as CoreKey,
    KeyTypes,
    Reference as CoreReference,
    ReferenceTypes,
} from '@aas-core-works/aas-core3.0-typescript/types';
import {
    AssetAdministrationShell as ApiAssetAdministrationShell,
    AssetInformation as ApiAssetInformation,
    Key as ApiKey,
    Reference as ApiReference,
} from '../../generated/aas-repository/types.gen';
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

describe('convertAasTypes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('convertApiAasToCoreAas', () => {
        it('should convert ApiAssetAdministrationShell to CoreAssetAdministrationShell successfully', () => {
            const apiAas = {
                id: 'https://example.com/ids/aas/7600_5912_3951_6917',
                modelType: 'AssetAdministrationShell',
                assetInformation: { assetKind: 'Instance' },
            } as ApiAssetAdministrationShell;

            const coreAssetInfo = new CoreAssetInformation(AssetKind.Instance);

            const coreAas = new CoreAssetAdministrationShell(
                'https://example.com/ids/aas/7600_5912_3951_6917',
                coreAssetInfo
            );

            (jsonization.assetAdministrationShellFromJsonable as jest.Mock).mockReturnValue({
                error: null,
                mustValue: () => coreAas,
            });

            const result = convertApiAasToCoreAas(apiAas);

            expect(jsonization.assetAdministrationShellFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(apiAas))
            );
            expect(result).toBe(coreAas);
        });

        it('should throw an error if jsonization.assetAdministrationShellFromJsonable returns an error', () => {
            const apiAas = {
                id: 'https://example.com/ids/aas/7600_5912_3951_6917',
                modelType: 'AssetAdministrationShell',
                assetInformation: { assetKind: 'Instance' },
            } as ApiAssetAdministrationShell;

            const error = new Error('Conversion failed');

            (jsonization.assetAdministrationShellFromJsonable as jest.Mock).mockReturnValue({
                error: error,
            });

            expect(() => convertApiAasToCoreAas(apiAas)).toThrow(error);
            expect(jsonization.assetAdministrationShellFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(apiAas))
            );
        });
    });

    describe('convertCoreAasToApiAas', () => {
        it('should convert CoreAssetAdministrationShell to ApiAssetAdministrationShell successfully', () => {
            const coreAssetInfo = new CoreAssetInformation(AssetKind.Instance);

            const coreAas = new CoreAssetAdministrationShell(
                'https://example.com/ids/aas/7600_5912_3951_6917',
                coreAssetInfo
            );

            const jsonableAas = {
                id: 'https://example.com/ids/aas/7600_5912_3951_6917',
                modelType: 'AssetAdministrationShell',
                assetInformation: { assetKind: 'Instance' },
            } as jsonization.JsonObject;

            const apiAas = {
                id: 'https://example.com/ids/aas/7600_5912_3951_6917',
                modelType: 'AssetAdministrationShell',
                assetInformation: { assetKind: 'Instance' },
            } as ApiAssetAdministrationShell;

            (jsonization.toJsonable as jest.Mock).mockReturnValue(jsonableAas);

            // Mock JSON.parse(JSON.stringify(jsonableAas)) to return apiAas
            const result = convertCoreAasToApiAas(coreAas);

            expect(jsonization.toJsonable).toHaveBeenCalledWith(coreAas);
            expect(result).toEqual(apiAas);
        });
    });

    describe('convertApiAssetInformationToCoreAssetInformation', () => {
        it('should convert ApiAssetInformation to CoreAssetInformation successfully', () => {
            const apiAssetInfo = {
                assetKind: 'Instance',
            } as ApiAssetInformation;

            const coreAssetInfo = new CoreAssetInformation(AssetKind.Instance);

            (jsonization.assetInformationFromJsonable as jest.Mock).mockReturnValue({
                error: null,
                mustValue: () => coreAssetInfo,
            });

            const result = convertApiAssetInformationToCoreAssetInformation(apiAssetInfo);

            expect(jsonization.assetInformationFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(apiAssetInfo))
            );
            expect(result).toBe(coreAssetInfo);
        });

        it('should throw an error if jsonization.assetInformationFromJsonable returns an error', () => {
            const apiAssetInfo = {
                assetKind: 'Instance',
            } as ApiAssetInformation;

            const error = new Error('Conversion failed');

            (jsonization.assetInformationFromJsonable as jest.Mock).mockReturnValue({
                error: error,
            });

            expect(() => convertApiAssetInformationToCoreAssetInformation(apiAssetInfo)).toThrow(error);
            expect(jsonization.assetInformationFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(apiAssetInfo))
            );
        });
    });

    describe('convertCoreAssetInformationToApiAssetInformation', () => {
        it('should convert CoreAssetInformation to ApiAssetInformation successfully', () => {
            const coreAssetInfo = new CoreAssetInformation(AssetKind.Instance);

            const jsonableAsset = {
                assetKind: 'Instance',
            } as jsonization.JsonObject;

            const apiAssetInfo = {
                assetKind: 'Instance',
            };

            (jsonization.toJsonable as jest.Mock).mockReturnValue(jsonableAsset);

            const result = convertCoreAssetInformationToApiAssetInformation(coreAssetInfo);

            expect(jsonization.toJsonable).toHaveBeenCalledWith(coreAssetInfo);
            expect(result).toEqual(apiAssetInfo);
        });
    });

    describe('convertApiReferenceToCoreReference', () => {
        it('should convert ApiReference to CoreReference successfully', () => {
            const apiReference = {
                type: 'ExternalReference',
                keys: [
                    {
                        type: 'GlobalReference',
                        value: 'https://example.com/ids/submodel/7600_5912_3951_6917',
                    },
                ] as ApiKey[],
            } as ApiReference;

            const coreReference = new CoreReference(ReferenceTypes.ExternalReference, [
                new CoreKey(KeyTypes.GlobalReference, 'https://example.com/ids/submodel/7600_5912_3951_6917'),
            ]);

            (jsonization.referenceFromJsonable as jest.Mock).mockReturnValue({
                error: null,
                mustValue: () => coreReference,
            });

            const result = convertApiReferenceToCoreReference(apiReference);

            expect(jsonization.referenceFromJsonable).toHaveBeenCalledWith(JSON.parse(JSON.stringify(apiReference)));
            expect(result).toBe(coreReference);
        });

        it('should throw an error if jsonization.referenceFromJsonable returns an error', () => {
            const apiReference = {
                type: 'ExternalReference',
                keys: [
                    {
                        type: 'GlobalReference',
                        value: 'https://example.com/ids/submodel/7600_5912_3951_6917',
                    },
                ] as ApiKey[],
            } as ApiReference;

            const error = new Error('Conversion failed');

            (jsonization.referenceFromJsonable as jest.Mock).mockReturnValue({
                error: error,
            });

            expect(() => convertApiReferenceToCoreReference(apiReference)).toThrow(error);
            expect(jsonization.referenceFromJsonable).toHaveBeenCalledWith(JSON.parse(JSON.stringify(apiReference)));
        });
    });

    describe('convertCoreReferenceToApiReference', () => {
        it('should convert CoreReference to ApiReference successfully', () => {
            const coreReference = new CoreReference(ReferenceTypes.ExternalReference, [
                new CoreKey(KeyTypes.GlobalReference, 'https://example.com/ids/submodel/7600_5912_3951_6917'),
            ]);

            const jsonableRef = {
                type: 'ExternalReference',
                keys: [
                    {
                        type: 'GlobalReference',
                        value: 'https://example.com/ids/submodel/7600_5912_3951_6917',
                    },
                ] as jsonization.JsonObject[],
            };

            const apiReference = {
                type: 'ExternalReference',
                keys: [
                    {
                        type: 'GlobalReference',
                        value: 'https://example.com/ids/submodel/7600_5912_3951_6917',
                    },
                ] as ApiKey[],
            } as ApiReference;

            (jsonization.toJsonable as jest.Mock).mockReturnValue(jsonableRef);

            const result = convertCoreReferenceToApiReference(coreReference);

            expect(jsonization.toJsonable).toHaveBeenCalledWith(coreReference);
            expect(result).toEqual(apiReference);
        });
    });
});
