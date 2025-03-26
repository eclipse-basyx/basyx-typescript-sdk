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
import type { Reference } from './Reference';
import {
    ReferenceFromJSON,
    ReferenceFromJSONTyped,
    ReferenceToJSON,
    ReferenceToJSONTyped,
} from './Reference';

/**
 * 
 * @export
 * @interface HasSemantics
 */
export interface HasSemantics {
    /**
     * 
     * @type {Reference}
     * @memberof HasSemantics
     */
    semanticId?: Reference;
    /**
     * 
     * @type {Array<Reference>}
     * @memberof HasSemantics
     */
    supplementalSemanticIds?: Array<Reference>;
}

/**
 * Check if a given object implements the HasSemantics interface.
 */
export function instanceOfHasSemantics(value: object): value is HasSemantics {
    return true;
}

export function HasSemanticsFromJSON(json: any): HasSemantics {
    return HasSemanticsFromJSONTyped(json, false);
}

export function HasSemanticsFromJSONTyped(json: any, ignoreDiscriminator: boolean): HasSemantics {
    if (json == null) {
        return json;
    }
    return {
        
        'semanticId': json['semanticId'] == null ? undefined : ReferenceFromJSON(json['semanticId']),
        'supplementalSemanticIds': json['supplementalSemanticIds'] == null ? undefined : ((json['supplementalSemanticIds'] as Array<any>).map(ReferenceFromJSON)),
    };
}

export function HasSemanticsToJSON(json: any): HasSemantics {
    return HasSemanticsToJSONTyped(json, false);
}

export function HasSemanticsToJSONTyped(value?: HasSemantics | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'semanticId': ReferenceToJSON(value['semanticId']),
        'supplementalSemanticIds': value['supplementalSemanticIds'] == null ? undefined : ((value['supplementalSemanticIds'] as Array<any>).map(ReferenceToJSON)),
    };
}

