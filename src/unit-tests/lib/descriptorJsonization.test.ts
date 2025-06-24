import {
    assetAdministrationShellDescriptorFromJsonable,
    endpointFromJsonable,
    protocolInformationFromJsonable,
    submodelDescriptorFromJsonable,
    toJsonableAssetAdministrationShellDescriptor,
    toJsonableEndpoint,
    toJsonableProtocolInformation,
    toJsonableSecurityAttribute,
    toJsonableSubmodelDescriptor,
} from '../../lib/descriptorJsonization';
import {
    AssetAdministrationShellDescriptor as CoreAssetAdministrationShellDescriptor,
    Endpoint as CoreEndPoint,
    ProtocolInformation as CoreProtocolInformation,
    ProtocolInformationSecurityAttributes as CoreProtocolInformationSecurityAttributes,
    ProtocolInformationSecurityAttributesTypeEnum as CoreProtocolInformationSecurityAttributesTypeEnum,
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
//const CORE_ENDPOINT: CoreEndPoint = {} as CoreEndPoint;
const CORE_ENDPOINT: CoreEndPoint = {
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
};
const JSONABLE_ENDPOINT = {
    interface: 'SUBMODEL-3.X',
    protocolInformation: {
        href: 'http://localhost:8085/submodels/xyz',
    },
};
const CORE_PROTOCOL_INFO: CoreProtocolInformation = {
    href: 'http://localhost:8085/submodels/xyz',
    endpointProtocol: null,
    endpointProtocolVersion: null,
    subprotocol: null,
    subprotocolBody: null,
    subprotocolBodyEncoding: null,
    securityAttributes: null,
};
const JSONABLE_PROTOCOL_INFO = { href: 'http://localhost:8085/submodels/xyz' };
const CORE_SECURITY_ATTRIBUTES: CoreProtocolInformationSecurityAttributes = {
    type: CoreProtocolInformationSecurityAttributesTypeEnum.None,
    key: 'Authorization',
    value: 'Basic abc123',
};
const JSONABLE_SECURITY_ATTRIBUTES = {
    type: 0,
    key: 'Authorization',
    value: 'Basic abc123',
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
            const result = assetAdministrationShellDescriptorFromJsonable([]);
            expect(result.error).not.toBeNull();
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

            expect(result.error).toBeNull();
            expect(result.mustValue()).toBeInstanceOf(CoreSubmodelDescriptor);
        });

        it('should throw an error if submodelDescriptorFromJsonable returns an error', () => {
            const result = submodelDescriptorFromJsonable([]);
            expect(result.error).not.toBeNull();
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

    describe('endpointFromJsonable', () => {
        it('should convert valid json to Endpoint successfully', () => {
            const result = endpointFromJsonable(JSONABLE_ENDPOINT);

            expect(result).toEqual(CORE_ENDPOINT);
        });

        it('should throw an error if endpointFromJsonable returns an error', () => {
            expect(() => endpointFromJsonable(null)).toThrow();
        });
    });

    describe('toJsonableEndpoint', () => {
        it('should serialize Endpoint in JSON format correctly', () => {
            const jsonable = toJsonableEndpoint(CORE_ENDPOINT);

            expect(jsonable).toHaveProperty('interface');
            expect(jsonable).toHaveProperty('protocolInformation');
            expect(jsonable).toEqual(JSONABLE_ENDPOINT);
        });
    });

    describe('protocolInformationFromJsonable', () => {
        it('should convert valid json to ProtocolInformation successfully', () => {
            const result = protocolInformationFromJsonable(JSONABLE_PROTOCOL_INFO);

            expect(result).toEqual(CORE_PROTOCOL_INFO);
        });

        it('should throw an error if protocolInformationFromJsonable returns an error', () => {
            expect(() => protocolInformationFromJsonable(null)).toThrow();
        });
    });

    describe('toJsonableProtocolInformation', () => {
        it('should serialize ProtocolInformation in JSON format correctly', () => {
            const jsonable = toJsonableProtocolInformation(CORE_PROTOCOL_INFO);

            expect(jsonable).toHaveProperty('href');
            expect(jsonable).toEqual(JSONABLE_PROTOCOL_INFO);
        });
    });

    describe('toJsonableSecurityAttribute', () => {
        it('should serialize a security attribute correctly', () => {
            expect(toJsonableSecurityAttribute(CORE_SECURITY_ATTRIBUTES)).toEqual(JSONABLE_SECURITY_ATTRIBUTES);
        });
    });
});
