//import { AssetKind as CoreAssetKind } from '@aas-core-works/aas-core3.0-typescript/types';
import { AasRegistryService } from '../../generated';
import {
    convertApiAasDescriptorToCoreAasDescriptor,
    convertApiSubmodelDescriptorToCoreSubmodelDescriptor,
    convertCoreAasDescriptorToApiAasDescriptor,
    convertCoreSubmodelDescriptorToApiSubmodelDescriptor,
} from '../../lib/convertAasDescriptorTypes';
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
};

const API_SUBMODEL_DESCRIPTOR: AasRegistryService.SubmodelDescriptor = {
    id: 'https://example.com/ids/sm-desc/1234',
    endpoints: [
        {
            _interface: 'SUBMODEL-3.X',
            protocolInformation: {
                href: 'http://localhost:8085/submodels/xyz',
            },
        },
    ],
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
            _interface: 'SUBMODEL-3.X',
            protocolInformation: {
                href: 'http://localhost:8085/submodels/xyz',
            },
        },
    ],
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

    describe('convertApiSubmodelDescriptorToCoreSubmodelDescriptor', () => {
        it('should convert ApiSubmodelDescriptor to CoreSubmodelDescriptor successfully', () => {
            (submodelDescriptorFromJsonable as jest.Mock).mockReturnValue({
                error: null,
                mustValue: () => CORE_SUBMODEL_DESCRIPTOR,
            });

            const result = convertApiSubmodelDescriptorToCoreSubmodelDescriptor(API_SUBMODEL_DESCRIPTOR);

            expect(submodelDescriptorFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(API_SUBMODEL_DESCRIPTOR))
            );
            expect(result).toBe(CORE_SUBMODEL_DESCRIPTOR);
        });

        it('should throw an error if submodelDescriptorFromJsonable returns an error', () => {
            const error = new Error('Conversion failed');

            (submodelDescriptorFromJsonable as jest.Mock).mockReturnValue({
                error: error,
            });

            expect(() => convertApiSubmodelDescriptorToCoreSubmodelDescriptor(API_SUBMODEL_DESCRIPTOR)).toThrow(error);
            expect(submodelDescriptorFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(API_SUBMODEL_DESCRIPTOR))
            );
        });
    });

    describe('convertCoreSubmodelDescriptorToApiSubmodelDescriptor', () => {
        it('should convert CoreSubmodelDescriptor to ApiSubmodelDescriptor successfully', () => {
            (toJsonableSubmodelDescriptor as jest.Mock).mockReturnValue(JSONABLE_SUBMODEL_DESCRIPTOR);

            const result = convertCoreSubmodelDescriptorToApiSubmodelDescriptor(CORE_SUBMODEL_DESCRIPTOR);

            expect(toJsonableSubmodelDescriptor).toHaveBeenCalledWith(CORE_SUBMODEL_DESCRIPTOR);
            expect(result).toEqual(API_SUBMODEL_DESCRIPTOR);
        });
    });
});
