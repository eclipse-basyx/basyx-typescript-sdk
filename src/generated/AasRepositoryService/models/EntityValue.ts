/* tslint:disable */
/* eslint-disable */
/**
 * DotAAS Part 2 | HTTP/REST | Asset Administration Shell Repository Service Specification
 * The Full Profile of the Asset Administration Shell Repository Service Specification as part of the [Specification of the Asset Administration Shell: Part 2](http://industrialdigitaltwin.org/en/content-hub).   Publisher: Industrial Digital Twin Association (IDTA) April 2023
 *
 * The version of the OpenAPI document: V3.0.3_SSP-001
 * Contact: info@idtwin.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { EntityType } from './EntityType';
import {
    EntityTypeFromJSON,
    EntityTypeFromJSONTyped,
    EntityTypeToJSON,
    EntityTypeToJSONTyped,
} from './EntityType';

/**
 * 
 * @export
 * @interface EntityValue
 */
export interface EntityValue {
    /**
     * 
     * @type {EntityType}
     * @memberof EntityValue
     */
    entityType: EntityType;
    /**
     * 
     * @type {string}
     * @memberof EntityValue
     */
    globalAssetId?: string;
    /**
     * 
     * @type {Array<object>}
     * @memberof EntityValue
     */
    specificAssetIds?: Array<object>;
    /**
     * 
     * @type {Array<object>}
     * @memberof EntityValue
     */
    statements?: Array<object>;
}



/**
 * Check if a given object implements the EntityValue interface.
 */
export function instanceOfEntityValue(value: object): value is EntityValue {
    if (!('entityType' in value) || value['entityType'] === undefined) return false;
    return true;
}

export function EntityValueFromJSON(json: any): EntityValue {
    return EntityValueFromJSONTyped(json, false);
}

export function EntityValueFromJSONTyped(json: any, ignoreDiscriminator: boolean): EntityValue {
    if (json == null) {
        return json;
    }
    return {
        
        'entityType': EntityTypeFromJSON(json['entityType']),
        'globalAssetId': json['globalAssetId'] == null ? undefined : json['globalAssetId'],
        'specificAssetIds': json['specificAssetIds'] == null ? undefined : json['specificAssetIds'],
        'statements': json['statements'] == null ? undefined : json['statements'],
    };
}

export function EntityValueToJSON(json: any): EntityValue {
    return EntityValueToJSONTyped(json, false);
}

export function EntityValueToJSONTyped(value?: EntityValue | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'entityType': EntityTypeToJSON(value['entityType']),
        'globalAssetId': value['globalAssetId'],
        'specificAssetIds': value['specificAssetIds'],
        'statements': value['statements'],
    };
}

