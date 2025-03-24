import { jsonization } from '@aas-core-works/aas-core3.0-typescript';
import {
    AssetAdministrationShell as CoreAssetAdministrationShell,
    AssetInformation as CoreAssetInformation,
    Reference as CoreReference,
} from '@aas-core-works/aas-core3.0-typescript/types';
import {
    AssetAdministrationShell as ApiAssetAdministrationShell,
    AssetInformation as ApiAssetInformation,
    Reference as ApiReference,
} from '../generated/AasRepositoryService';

/**
 * Convert an API AssetAdministrationShell to a Core Works AssetAdministrationShell
 *
 * @function convertApiAasToCoreAas
 * @param {ApiAssetAdministrationShell} aas - The API AssetAdministrationShell to convert
 * @returns {CoreAssetAdministrationShell} The Core Works AssetAdministrationShell
 */
export function convertApiAasToCoreAas(aas: ApiAssetAdministrationShell): CoreAssetAdministrationShell {
    // first stringify
    let shell = JSON.stringify(aas);
    // then parse
    shell = JSON.parse(shell);
    // then jsonize
    const instanceOrError = jsonization.assetAdministrationShellFromJsonable(shell);
    if (instanceOrError.error !== null) {
        throw instanceOrError.error;
    }
    const instance = instanceOrError.mustValue();
    // set the prototype
    Object.setPrototypeOf(instance, CoreAssetAdministrationShell.prototype);
    return instance;
}

/**
 * Convert a Core Works AssetAdministrationShell to an API AssetAdministrationShell
 *
 * @function convertCoreAasToApiAas
 * @param {CoreAssetAdministrationShell} aas - The Core Works AssetAdministrationShell to convert
 * @returns {ApiAssetAdministrationShell} The API AssetAdministrationShell
 */
export function convertCoreAasToApiAas(aas: CoreAssetAdministrationShell): ApiAssetAdministrationShell {
    // first jsonize
    const jsonableAas = jsonization.toJsonable(aas);
    // then stringify
    const shell = JSON.stringify(jsonableAas);
    // then parse
    return JSON.parse(shell) as ApiAssetAdministrationShell;
}

/**
 * Convert an API AssetInformation to a Core Works AssetInformation
 *
 * @function convertApiAssetInformationToCoreAssetInformation
 * @param {ApiAssetInformation} assetInformation - The API AssetInformation to convert
 * @returns {CoreAssetInformation} The Core Works AssetInformation
 */
export function convertApiAssetInformationToCoreAssetInformation(
    assetInformation: ApiAssetInformation
): CoreAssetInformation {
    // first stringify
    let asset = JSON.stringify(assetInformation);
    // then parse
    asset = JSON.parse(asset);
    // then jsonize
    const instanceOrError = jsonization.assetInformationFromJsonable(asset);
    if (instanceOrError.error !== null) {
        throw instanceOrError.error;
    }
    const instance = instanceOrError.mustValue();
    // set the prototype
    Object.setPrototypeOf(instance, CoreAssetInformation.prototype);
    return instance;
}

/**
 * Convert a Core Works AssetInformation to an API AssetInformation
 *
 * @function convertCoreAssetInformationToApiAssetInformation
 * @param {CoreAssetInformation} assetInformation - The Core Works AssetInformation to convert
 * @returns {ApiAssetInformation} The API AssetInformation
 */
export function convertCoreAssetInformationToApiAssetInformation(
    assetInformation: CoreAssetInformation
): ApiAssetInformation {
    // first jsonize
    const jsonableAsset = jsonization.toJsonable(assetInformation);
    // then stringify
    const asset = JSON.stringify(jsonableAsset);
    // then parse
    return JSON.parse(asset) as ApiAssetInformation;
}

/**
 * Convert an API Reference to a Core Works Reference
 *
 * @function convertApiReferenceToCoreReference
 * @param {ApiReference} reference - The API Reference to convert
 * @returns {CoreReference} The Core Works Reference
 */
export function convertApiReferenceToCoreReference(reference: ApiReference): CoreReference {
    // first stringify
    let ref = JSON.stringify(reference);
    // then parse
    ref = JSON.parse(ref);
    // then jsonize
    const instanceOrError = jsonization.referenceFromJsonable(ref);
    if (instanceOrError.error !== null) {
        throw instanceOrError.error;
    }
    const instance = instanceOrError.mustValue();
    // set the prototype
    Object.setPrototypeOf(instance, CoreReference.prototype);
    return instance;
}

/**
 * Convert a Core Works Reference to an API Reference
 *
 * @function convertCoreReferenceToApiReference
 * @param {CoreReference} reference - The Core Works Reference to convert
 * @returns {ApiReference} The API Reference
 */
export function convertCoreReferenceToApiReference(reference: CoreReference): ApiReference {
    // first jsonize
    const jsonableRef = jsonization.toJsonable(reference);
    // then stringify
    const ref = JSON.stringify(jsonableRef);
    // then parse
    return JSON.parse(ref) as ApiReference;
}
