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
import type { Qualifier1 } from './Qualifier1';
import {
    Qualifier1FromJSON,
    Qualifier1FromJSONTyped,
    Qualifier1ToJSON,
    Qualifier1ToJSONTyped,
} from './Qualifier1';
import type { ModelType } from './ModelType';
import {
    ModelTypeFromJSON,
    ModelTypeFromJSONTyped,
    ModelTypeToJSON,
    ModelTypeToJSONTyped,
} from './ModelType';

/**
 * 
 * @export
 * @interface Qualifiable1
 */
export interface Qualifiable1 {
    /**
     * 
     * @type {Array<Qualifier1>}
     * @memberof Qualifiable1
     */
    qualifiers?: Array<Qualifier1>;
    /**
     * 
     * @type {ModelType}
     * @memberof Qualifiable1
     */
    modelType: ModelType;
}



/**
 * Check if a given object implements the Qualifiable1 interface.
 */
export function instanceOfQualifiable1(value: object): value is Qualifiable1 {
    if (!('modelType' in value) || value['modelType'] === undefined) return false;
    return true;
}

export function Qualifiable1FromJSON(json: any): Qualifiable1 {
    return Qualifiable1FromJSONTyped(json, false);
}

export function Qualifiable1FromJSONTyped(json: any, ignoreDiscriminator: boolean): Qualifiable1 {
    if (json == null) {
        return json;
    }
    return {
        
        'qualifiers': json['qualifiers'] == null ? undefined : ((json['qualifiers'] as Array<any>).map(Qualifier1FromJSON)),
        'modelType': ModelTypeFromJSON(json['modelType']),
    };
}

export function Qualifiable1ToJSON(json: any): Qualifiable1 {
    return Qualifiable1ToJSONTyped(json, false);
}

export function Qualifiable1ToJSONTyped(value?: Qualifiable1 | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'qualifiers': value['qualifiers'] == null ? undefined : ((value['qualifiers'] as Array<any>).map(Qualifier1ToJSON)),
        'modelType': ModelTypeToJSON(value['modelType']),
    };
}

