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
import type { ModellingKind } from './ModellingKind';
import {
    ModellingKindFromJSON,
    ModellingKindFromJSONTyped,
    ModellingKindToJSON,
    ModellingKindToJSONTyped,
} from './ModellingKind';

/**
 * 
 * @export
 * @interface HasKind
 */
export interface HasKind {
    /**
     * 
     * @type {ModellingKind}
     * @memberof HasKind
     */
    kind?: ModellingKind;
}



/**
 * Check if a given object implements the HasKind interface.
 */
export function instanceOfHasKind(value: object): value is HasKind {
    return true;
}

export function HasKindFromJSON(json: any): HasKind {
    return HasKindFromJSONTyped(json, false);
}

export function HasKindFromJSONTyped(json: any, ignoreDiscriminator: boolean): HasKind {
    if (json == null) {
        return json;
    }
    return {
        
        'kind': json['kind'] == null ? undefined : ModellingKindFromJSON(json['kind']),
    };
}

export function HasKindToJSON(json: any): HasKind {
    return HasKindToJSONTyped(json, false);
}

export function HasKindToJSONTyped(value?: HasKind | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'kind': ModellingKindToJSON(value['kind']),
    };
}

