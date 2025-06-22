import {
    assetAdministrationShellDescriptorFromJsonable,
    submodelDescriptorFromJsonable,
    toJsonableAssetAdministrationShellDescriptor,
    toJsonableSubmodelDescriptor,
} from '../../lib/descriptorJsonization';
import {
    AssetAdministrationShellDescriptor as CoreAssetAdministrationShellDescriptor,
    SubmodelDescriptor as CoreSubmodelDescriptor,
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

const CORE_SUBMODEL_DESCRIPTOR: CoreSubmodelDescriptor = new CoreSubmodelDescriptor(
    'https://example.com/ids/sm-desc/1234',
    [
        {
            _interface: 'SUBMODEL-3.X',
            protocolInformation: {
                href: 'http://localhost:8085/submodels/xyz',
                endpointProtocol: null,
                endpointProtocolVersion: null,
                subprotocol: null,
                subprotocolBody: null,
                subprotocolBodyEncoding: null,
                securityAttributes: null,
            },
        },
    ]
);
const JSONABLE_SUBMODEL_DESCRIPTOR = {
    id: 'https://example.com/ids/sm-desc/1234',
    endpoints: [
        {
            interface: 'SUBMODEL-3.X',
            protocolInformation: {
                href: 'http://localhost:8085/submodels/xyz',
            },
        },
    ],
};

describe('descriptorJsonization', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('assetAdministrationShellDescriptorFromJsonable', () => {
        it('should convert valid json to AssetAdministrationShellDescriptor successfully', () => {
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
            const jsonable = toJsonableAssetAdministrationShellDescriptor(CORE_AAS_DESCRIPTOR);

            expect(jsonable).toHaveProperty('id');
            expect(jsonable).toEqual(JSONABLE_AAS_DESCRIPTOR);
        });
    });

    describe('submodelDescriptorFromJsonable', () => {
        it('should convert valid json to SubmodelDescriptor successfully', () => {
            const result = submodelDescriptorFromJsonable(JSONABLE_SUBMODEL_DESCRIPTOR);

            //expect(result.mustValue()).toEqual(CORE_AAS_DESCRIPTOR);
            expect(result.error).toBeNull();
            expect(result.mustValue()).toBeInstanceOf(CoreSubmodelDescriptor);
            //expect(result).toBe(CORE_AAS_DESCRIPTOR);
        });

        it('should throw an error if submodelDescriptorFromJsonable returns an error', () => {
            //const error = new Error('Conversion failed');
            const result = submodelDescriptorFromJsonable([]);
            expect(result.error).not.toBeNull();
            //expect(result.mustValue()).toBeNull();
        });
    });

    describe('toJsonableSubmodelDescriptor', () => {
        it('should serialize SubmodelDescriptor in JSON format correctly', () => {
            const jsonable = toJsonableSubmodelDescriptor(CORE_SUBMODEL_DESCRIPTOR);

            expect(jsonable).toHaveProperty('id');
            expect(jsonable).toHaveProperty('endpoints');
            expect(jsonable).toEqual(JSONABLE_SUBMODEL_DESCRIPTOR);
        });
    });
});
