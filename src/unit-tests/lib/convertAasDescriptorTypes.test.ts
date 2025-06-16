//import { AssetKind as CoreAssetKind } from '@aas-core-works/aas-core3.0-typescript/types';
import { AasRegistryService } from '../../generated';
import {
    convertApiAasDescriptorToCoreAasDescriptor,
    // convertApiSubmodelDescriptorToCoreSubmodelDescriptor,
    convertCoreAasDescriptorToApiAasDescriptor,
} from '../../lib/convertAasDescriptorTypes';
import {
    assetAdministrationShellDescriptorFromJsonable,
    // submodelDescriptorFromJsonable,
    toJsonableAssetAdministrationShellDescriptor,
    // toJsonableSubmodelDescriptor,
} from '../../lib/descriptorJsonization';
import {
    AssetAdministrationShellDescriptor as CoreAssetAdministrationShellDescriptor,
    //SubmodelDescriptor as CoreSubmodelDescriptor,
} from '../../models/Descriptors';

/**
 * Mock the jsonization methods used in convertAasDescriptorTypes.ts
 */
jest.mock('../../lib/descriptorJsonization', () => ({
    assetAdministrationShellDescriptorFromJsonable: jest.fn(),
    toJsonableAssetAdministrationShellDescriptor: jest.fn(),
    submodelDescriptorFromJsonable: jest.fn(),
    toJsonableSubmodelDescriptor: jest.fn(),
}));

// Define mock constants
const API_AAS_DESCRIPTOR: AasRegistryService.AssetAdministrationShellDescriptor = {
    id: 'https://example.com/ids/aas-desc/1234',
};
const CORE_AAS_DESCRIPTOR: CoreAssetAdministrationShellDescriptor = new CoreAssetAdministrationShellDescriptor(
    'https://example.com/ids/aas-desc/1234'
);
const JSONABLE_AAS_DESCRIPTOR = {
    id: 'https://example.com/ids/aas-desc/1234',
    // assetInformation: { assetKind: 'Instance' },
};

describe('convertAasDescriptorTypes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('convertApiAasDescriptorToCoreAasDescriptor', () => {
        it('should convert ApiAssetAdministrationShellDescriptor to CoreAssetAdministrationShellDescriptor successfully', () => {
            (assetAdministrationShellDescriptorFromJsonable as jest.Mock).mockReturnValue({
                error: null,
                mustValue: () => CORE_AAS_DESCRIPTOR,
            });

            const result = convertApiAasDescriptorToCoreAasDescriptor(API_AAS_DESCRIPTOR);

            expect(assetAdministrationShellDescriptorFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(API_AAS_DESCRIPTOR))
            );
            expect(result).toBe(CORE_AAS_DESCRIPTOR);
        });

        it('should throw an error if assetAdministrationShellDescriptorFromJsonable returns an error', () => {
            const error = new Error('Conversion failed');

            (assetAdministrationShellDescriptorFromJsonable as jest.Mock).mockReturnValue({
                error: error,
            });

            expect(() => convertApiAasDescriptorToCoreAasDescriptor(API_AAS_DESCRIPTOR)).toThrow(error);
            expect(assetAdministrationShellDescriptorFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(API_AAS_DESCRIPTOR))
            );
        });
    });

    describe('convertCoreAasDescriptorToApiAasDescriptor', () => {
        it('should convert CoreAssetAdministrationShellDescriptor to ApiAssetAdministrationShellDescriptor successfully', () => {
            (toJsonableAssetAdministrationShellDescriptor as jest.Mock).mockReturnValue(JSONABLE_AAS_DESCRIPTOR);

            const result = convertCoreAasDescriptorToApiAasDescriptor(CORE_AAS_DESCRIPTOR);

            expect(toJsonableAssetAdministrationShellDescriptor).toHaveBeenCalledWith(CORE_AAS_DESCRIPTOR);
            expect(result).toEqual(API_AAS_DESCRIPTOR);
        });
    });
});
