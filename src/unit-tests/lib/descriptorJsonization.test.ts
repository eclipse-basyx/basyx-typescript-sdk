import {
    assetAdministrationShellDescriptorFromJsonable,
    toJsonableAssetAdministrationShellDescriptor,
} from '../../lib/descriptorJsonization';
import {
    AssetAdministrationShellDescriptor as CoreAssetAdministrationShellDescriptor,
    //SubmodelDescriptor as CoreSubmodelDescriptor,
} from '../../models/Descriptors';

//mock any methods as needed

// Define mock constants

const CORE_AAS_DESCRIPTOR: CoreAssetAdministrationShellDescriptor = new CoreAssetAdministrationShellDescriptor(
    'https://example.com/ids/aas-desc/1234'
);
const JSONABLE_AAS_DESCRIPTOR = {
    id: 'https://example.com/ids/aas-desc/1234',
    // assetInformation: { assetKind: 'Instance' },
};

describe('descriptorJsonization', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('assetAdministrationShellDescriptorFromJsonable', () => {
        it('should convert valid json to AssetAdministrationShellDescriptor successfully', () => {
            // const input = {
            //   id: 'aas-desc-id',
            //   assetKind: 'Instance'
            // };

            const result = assetAdministrationShellDescriptorFromJsonable(JSONABLE_AAS_DESCRIPTOR);

            //expect(result.mustValue()).toEqual(CORE_AAS_DESCRIPTOR);
            expect(result.error).toBeNull();
            expect(result.mustValue()).toBeInstanceOf(CoreAssetAdministrationShellDescriptor);
            //expect(result).toBe(CORE_AAS_DESCRIPTOR);
        });

        it('should throw an error if assetAdministrationShellDescriptorFromJsonable returns an error', () => {
            //const error = new Error('Conversion failed');
            const result = assetAdministrationShellDescriptorFromJsonable([]);
            expect(result.error).not.toBeNull();
            //expect(() => assetAdministrationShellDescriptorFromJsonable(JSONABLE_AAS_DESCRIPTOR)).toThrow(error);
            //expect(result.mustValue()).toBeNull();
        });
    });

    describe('toJsonableAssetAdministrationShellDescriptor', () => {
        it('should serialize AssetAdministrationShellDescriptor in JSON format correctly', () => {
            //const core = new CoreAssetAdministrationShellDescriptor('aas-desc-id', null, null, null, null, null, 'Instance', null, null, null, null, null);
            const jsonable = toJsonableAssetAdministrationShellDescriptor(CORE_AAS_DESCRIPTOR);
            //expect(jsonable.id).toEqual('aas-desc-id');
            //expect(jsonable.assetKind).toEqual('Instance');
            expect(jsonable).toEqual(JSONABLE_AAS_DESCRIPTOR);
        });
    });
});
