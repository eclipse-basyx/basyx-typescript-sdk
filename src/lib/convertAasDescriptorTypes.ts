import { AasRegistryService } from '../generated';
import {
    assetAdministrationShellDescriptorFromJsonable,
    submodelDescriptorFromJsonable,
    toJsonableAssetAdministrationShellDescriptor,
    toJsonableSubmodelDescriptor,
} from '../lib/descriptorJsonization';
import {
    AssetAdministrationShellDescriptor as CoreAssetAdministrationShellDescriptor,
    SubmodelDescriptor as CoreSubmodelDescriptor,
} from '../models/Descriptors';
/**
 * Convert an API AssetAdministrationShellDescriptor to a Core Works equivalent AssetAdministrationShellDescriptor
 *
 * @function convertApiAasDescriptorToCoreAasDescriptor
 * @param {ApiAssetAdministrationShellDescriptor} aasDescriptor - The API AssetAdministrationShellDescriptor to convert
 * @returns {CoreAssetAdministrationShellDescriptor} The Core Works AssetAdministrationShellDescriptor
 */
export function convertApiAasDescriptorToCoreAasDescriptor(
    aasDescriptor: AasRegistryService.AssetAdministrationShellDescriptor
): CoreAssetAdministrationShellDescriptor {
    // first stringify
    let shellDescriptor = JSON.stringify(aasDescriptor);
    // then parse
    shellDescriptor = JSON.parse(shellDescriptor);
    // then jsonize
    const instanceOrError = assetAdministrationShellDescriptorFromJsonable(shellDescriptor);
    if (instanceOrError.error !== null) {
        throw instanceOrError.error;
    }
    const instance = instanceOrError.mustValue();
    // set the prototype
    Object.setPrototypeOf(instance, CoreAssetAdministrationShellDescriptor.prototype);
    return instance;
}

/**
 * Convert a Core Works equivalent AssetAdministrationShellDescriptor to an API AssetAdministrationShellDescriptor
 *
 * @function convertCoreAasDescriptorToApiAasDescriptor
 * @param {CoreAssetAdministrationShellDescriptor} aasDescriptor - The Core Works AssetAdministrationShellDescriptor to convert
 * @returns {ApiAssetAdministrationShellDescriptor} The API AssetAdministrationShellDescriptor
 */
export function convertCoreAasDescriptorToApiAasDescriptor(
    aasDescriptor: CoreAssetAdministrationShellDescriptor
): AasRegistryService.AssetAdministrationShellDescriptor {
    // first jsonize
    const jsonableAasDescriptor = toJsonableAssetAdministrationShellDescriptor(aasDescriptor);
    // then stringify
    const shellDescriptor = JSON.stringify(jsonableAasDescriptor);
    // then parse
    return JSON.parse(shellDescriptor) as AasRegistryService.AssetAdministrationShellDescriptor;
}

/**
 * Convert an API SubmodelDescriptor to a Core Works equivalent SubmodelDescriptor
 *
 * @function convertApiSubmodelDescriptorToCoreSubmodelDescriptor
 * @param {ApiSubmodelDescriptor} submodelDescriptor - The API SubmodelDescriptor to convert
 * @returns {CoreSubmodelDescriptor} The Core Works SubmodelDescriptor
 */
export function convertApiSubmodelDescriptorToCoreSubmodelDescriptor(
    submodelDescriptor: AasRegistryService.SubmodelDescriptor
): CoreSubmodelDescriptor {
    // first stringify
    let submodelDescriptorStr = JSON.stringify(submodelDescriptor);
    // then parse
    submodelDescriptorStr = JSON.parse(submodelDescriptorStr);
    // then jsonize
    const instanceOrError = submodelDescriptorFromJsonable(submodelDescriptorStr);
    if (instanceOrError.error !== null) {
        throw instanceOrError.error;
    }
    const instance = instanceOrError.mustValue();
    // set the prototype
    Object.setPrototypeOf(instance, CoreSubmodelDescriptor.prototype);
    return instance;
}

/**
 * Convert a Core Works equivalent SubmodelDescriptor to an API SubmodelDescriptor
 *
 * @function convertCoreSubmodelDescriptorToApiSubmodelDescriptor
 * @param {CoreSubmodelDescriptor} submodelDescriptor - The Core Works SubmodelDescriptor to convert
 * @returns {ApiSubmodelDescriptor} The API SubmodelDescriptor
 */
export function convertCoreSubmodelDescriptorToApiSubmodelDescriptor(
    submodelDescriptor: CoreSubmodelDescriptor
): AasRegistryService.SubmodelDescriptor {
    // first jsonize
    const jsonableSubmodelDescriptor = toJsonableSubmodelDescriptor(submodelDescriptor);
    // then stringify
    const submodelDescriptorStr = JSON.stringify(jsonableSubmodelDescriptor);
    // then parse
    return JSON.parse(submodelDescriptorStr) as AasRegistryService.SubmodelDescriptor;
}
