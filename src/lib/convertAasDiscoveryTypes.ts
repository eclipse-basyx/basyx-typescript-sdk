import { jsonization } from '@aas-core-works/aas-core3.0-typescript';
import { SpecificAssetId as CoreSpecificAssetId } from '@aas-core-works/aas-core3.0-typescript/types';
import { AasDiscoveryService } from '../generated';

/**
 * Convert an API SpecificAssetId to a Core Works SpecificAssetId
 *
 * @function convertApiAssetIdToCoreAssetId
 * @param {ApiSpecificAssetId} assetId - The API SpecificAssetId to convert
 * @returns {CoreSpecificAssetId} The Core Works SpecificAssetId
 */
export function convertApiAssetIdToCoreAssetId(assetId: AasDiscoveryService.SpecificAssetId): CoreSpecificAssetId {
    // first stringify
    let assetIdStr = JSON.stringify(assetId);
    // then parse
    assetIdStr = JSON.parse(assetIdStr);
    // then jsonize
    const instanceOrError = jsonization.specificAssetIdFromJsonable(assetIdStr);
    if (instanceOrError.error !== null) {
        throw instanceOrError.error;
    }
    const instance = instanceOrError.mustValue();
    // set the prototype
    Object.setPrototypeOf(instance, CoreSpecificAssetId.prototype);
    return instance;
}

/**
 * Convert a Core Works SpecificAssetId to an API SpecificAssetId
 *
 * @function convertCoreAssetIdToApiAssetId
 * @param {CoreSpecificAssetId} assetId - The Core Works SpecificAssetId to convert
 * @returns {ApiSpecificAssetId} The API SpecificAssetId
 */
export function convertCoreAssetIdToApiAssetId(assetId: CoreSpecificAssetId): AasDiscoveryService.SpecificAssetId {
    // first jsonize
    const jsonableAssetId = jsonization.toJsonable(assetId);
    // then stringify
    const assetIdStr = JSON.stringify(jsonableAssetId);
    // then parse
    return JSON.parse(assetIdStr) as AasDiscoveryService.SpecificAssetId;
}
