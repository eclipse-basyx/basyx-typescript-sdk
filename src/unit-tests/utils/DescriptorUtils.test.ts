import {
    AssetAdministrationShellDescriptor as CoreAssetAdministrationShellDescriptor,
    SubmodelDescriptor as CoreSubmodelDescriptor,
} from '../../models/Descriptors';
import { extractEndpointHref } from '../../utils/DescriptorUtils';

const interfaceShortName1 = 'AAS-REGISTRY-3.X';
const interfaceShortName2 = 'SUBMODEL-3.X';

const CORE_AAS_DESCRIPTOR1: CoreAssetAdministrationShellDescriptor = new CoreAssetAdministrationShellDescriptor(
    'https://example.com/ids/aas-desc/1234'
);
const CORE_SUBMODEL_DESCRIPTOR1: CoreSubmodelDescriptor = new CoreSubmodelDescriptor(
    'https://example.com/ids/sm-desc/1234',
    [
        {
            _interface: 'SUBMODEL-3.X',
            protocolInformation: {
                href: 'http://localhost:8085/submodels/pqrs',
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

describe('DescriptorUtils', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('extractEndpointHref', () => {
        it('should extract endpoint from a Submodel descriptor based on the given interface short name successfully', () => {
            const result = extractEndpointHref(CORE_SUBMODEL_DESCRIPTOR1, interfaceShortName2);
            expect(result).toBe('http://localhost:8085/submodels/pqrs');
        });

        it('should return empty string for descriptor with no endpoints', () => {
            const result = extractEndpointHref(CORE_AAS_DESCRIPTOR1, interfaceShortName1);
            expect(result).toBe('');
        });

        it('should return empty string for non-matching interface name', () => {
            const result = extractEndpointHref(CORE_SUBMODEL_DESCRIPTOR1, 'NON-EXISTENT-3.0');
            expect(result).toBe('');
        });
    });
});
