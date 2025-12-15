// Descriptor Serialization/Deserialization
export {
    assetAdministrationShellDescriptorFromJsonable,
    endpointFromJsonable,
    protocolInformationFromJsonable,
    submodelDescriptorFromJsonable,
    toJsonableAssetAdministrationShellDescriptor,
    toJsonableEndpoint,
    toJsonableProtocolInformation,
    toJsonableSecurityAttribute,
    toJsonableSubmodelDescriptor,
} from './descriptorJsonization';

// Type Converters
export {
    convertApiAasDescriptorToCoreAasDescriptor,
    convertApiSubmodelDescriptorToCoreSubmodelDescriptor,
    convertCoreAasDescriptorToApiAasDescriptor,
    convertCoreSubmodelDescriptorToApiSubmodelDescriptor,
} from './convertAasDescriptorTypes';
export { convertApiAssetIdToCoreAssetId, convertCoreAssetIdToApiAssetId } from './convertAasDiscoveryTypes';
export {
    convertApiAasToCoreAas,
    convertApiAssetInformationToCoreAssetInformation,
    convertApiReferenceToCoreReference,
    convertCoreAasToApiAas,
    convertCoreAssetInformationToApiAssetInformation,
    convertCoreReferenceToApiReference,
} from './convertAasTypes';
export { convertApiCDToCoreCD, convertCoreCDToApiCD } from './convertConceptDescriptionTypes';
export {
    convertApiSubmodelElementToCoreSubmodelElement,
    convertApiSubmodelToCoreSubmodel,
    convertCoreSubmodelElementToApiSubmodelElement,
    convertCoreSubmodelToApiSubmodel,
} from './convertSubmodelTypes';

// Utilities
export { applyDefaults } from './apiConfig';
export { base64Decode, base64Encode } from './base64Url';
export { handleApiError } from './errorHandler';
