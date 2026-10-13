import {
    AssetAdministrationShellDescriptor as CoreAssetAdministrationShellDescriptor,
    SubmodelDescriptor as CoreSubmodelDescriptor,
} from '../../models/Descriptors';
import { extractEndpointHref, findEndpoint, isRepositoryEndpoint } from '../../utils/DescriptorUtils';

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
        vi.clearAllMocks();
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

    describe('findEndpoint', () => {
        const endpoint = (_interface: string) => ({
            _interface,
            protocolInformation: {
                href: `http://localhost/${_interface}`,
                endpointProtocol: null,
                endpointProtocolVersion: null,
                subprotocol: null,
                subprotocolBody: null,
                subprotocolBodyEncoding: null,
                securityAttributes: null,
            },
        });
        const descriptorWith = (...interfaces: string[]) =>
            new CoreSubmodelDescriptor('https://example.com/ids/sm/1', interfaces.map(endpoint));

        it.each([
            ['an exact match', ['AAS-3.2', 'AAS-3.0'], 'AAS-3.0'],
            ['any AAS-3.x version', ['DESCRIPTION-3.0', 'AAS-3.1'], 'AAS-3.1'],
            ['AAS-3.2', ['AAS-REPOSITORY-3.0', 'AAS-3.2'], 'AAS-3.2'],
            [
                'the repository interface of the same version',
                ['AAS-REPOSITORY-3.2', 'AAS-REPOSITORY-3.0'],
                'AAS-REPOSITORY-3.0',
            ],
            ['any AAS-REPOSITORY-3.x version', ['AAS-REGISTRY-3.0', 'AAS-REPOSITORY-3.2'], 'AAS-REPOSITORY-3.2'],
        ])('should prefer %s', (_, interfaces, expected) => {
            expect(findEndpoint(descriptorWith(...interfaces), 'AAS-3.0')?._interface).toBe(expected);
        });

        it('should apply the same order to Submodel endpoints', () => {
            expect(
                findEndpoint(descriptorWith('SUBMODEL-REPOSITORY-3.0', 'SUBMODEL-3.2'), 'SUBMODEL-3.0')?._interface
            ).toBe('SUBMODEL-3.2');
            expect(
                findEndpoint(descriptorWith('DESCRIPTION-3.0', 'SUBMODEL-REPOSITORY-3.1'), 'SUBMODEL-3.0')?._interface
            ).toBe('SUBMODEL-REPOSITORY-3.1');
        });

        it('should not match other interface families or major versions', () => {
            expect(
                findEndpoint(descriptorWith('SUBMODEL-3.0', 'AAS-4.0', 'AAS-REGISTRY-3.0'), 'AAS-3.0')
            ).toBeUndefined();
        });

        it('should only fall back to other versions for AAS and SUBMODEL interfaces', () => {
            expect(findEndpoint(descriptorWith('AAS-REGISTRY-3.1'), 'AAS-REGISTRY-3.0')).toBeUndefined();
        });

        it('should skip endpoints without href', () => {
            const descriptor = descriptorWith('AAS-3.0', 'AAS-3.2');
            descriptor.endpoints[0].protocolInformation.href = '';
            expect(findEndpoint(descriptor, 'AAS-3.0')?._interface).toBe('AAS-3.2');
        });

        it('should detect repository endpoints', () => {
            expect(isRepositoryEndpoint(endpoint('AAS-REPOSITORY-3.0'))).toBe(true);
            expect(isRepositoryEndpoint(endpoint('SUBMODEL-REPOSITORY-3.2'))).toBe(true);
            expect(isRepositoryEndpoint(endpoint('AAS-3.0'))).toBe(false);
        });
    });
});
