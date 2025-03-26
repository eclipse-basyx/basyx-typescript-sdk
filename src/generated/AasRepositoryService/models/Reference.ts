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
import type { ReferenceTypes } from './ReferenceTypes';
import {
    ReferenceTypesFromJSON,
    ReferenceTypesFromJSONTyped,
    ReferenceTypesToJSON,
    ReferenceTypesToJSONTyped,
} from './ReferenceTypes';
import type { ReferenceParent } from './ReferenceParent';
import {
    ReferenceParentFromJSON,
    ReferenceParentFromJSONTyped,
    ReferenceParentToJSON,
    ReferenceParentToJSONTyped,
} from './ReferenceParent';
import type { Key } from './Key';
import {
    KeyFromJSON,
    KeyFromJSONTyped,
    KeyToJSON,
    KeyToJSONTyped,
} from './Key';

/**
 * 
 * @export
 * @interface Reference
 */
export interface Reference {
    /**
     * 
     * @type {ReferenceTypes}
     * @memberof Reference
     */
    type: ReferenceTypes;
    /**
     * 
     * @type {Array<Key>}
     * @memberof Reference
     */
    keys: Array<Key>;
    /**
     * 
     * @type {ReferenceParent}
     * @memberof Reference
     */
    referredSemanticId?: ReferenceParent;
}



/**
 * Check if a given object implements the Reference interface.
 */
export function instanceOfReference(value: object): value is Reference {
    if (!('type' in value) || value['type'] === undefined) return false;
    if (!('keys' in value) || value['keys'] === undefined) return false;
    return true;
}

export function ReferenceFromJSON(json: any): Reference {
    return ReferenceFromJSONTyped(json, false);
}

export function ReferenceFromJSONTyped(json: any, ignoreDiscriminator: boolean): Reference {
    if (json == null) {
        return json;
    }
    return {
        
        'type': ReferenceTypesFromJSON(json['type']),
        'keys': ((json['keys'] as Array<any>).map(KeyFromJSON)),
        'referredSemanticId': json['referredSemanticId'] == null ? undefined : ReferenceParentFromJSON(json['referredSemanticId']),
    };
}

export function ReferenceToJSON(json: any): Reference {
    return ReferenceToJSONTyped(json, false);
}

export function ReferenceToJSONTyped(value?: Reference | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'type': ReferenceTypesToJSON(value['type']),
        'keys': ((value['keys'] as Array<any>).map(KeyToJSON)),
        'referredSemanticId': ReferenceParentToJSON(value['referredSemanticId']),
    };
}

