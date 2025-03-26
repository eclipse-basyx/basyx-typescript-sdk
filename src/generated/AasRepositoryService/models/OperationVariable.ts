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
import type { SubmodelElementChoice } from './SubmodelElementChoice';
import {
    SubmodelElementChoiceFromJSON,
    SubmodelElementChoiceFromJSONTyped,
    SubmodelElementChoiceToJSON,
    SubmodelElementChoiceToJSONTyped,
} from './SubmodelElementChoice';

/**
 * 
 * @export
 * @interface OperationVariable
 */
export interface OperationVariable {
    /**
     * 
     * @type {SubmodelElementChoice}
     * @memberof OperationVariable
     */
    value: SubmodelElementChoice;
}

/**
 * Check if a given object implements the OperationVariable interface.
 */
export function instanceOfOperationVariable(value: object): value is OperationVariable {
    if (!('value' in value) || value['value'] === undefined) return false;
    return true;
}

export function OperationVariableFromJSON(json: any): OperationVariable {
    return OperationVariableFromJSONTyped(json, false);
}

export function OperationVariableFromJSONTyped(json: any, ignoreDiscriminator: boolean): OperationVariable {
    if (json == null) {
        return json;
    }
    return {
        
        'value': SubmodelElementChoiceFromJSON(json['value']),
    };
}

export function OperationVariableToJSON(json: any): OperationVariable {
    return OperationVariableToJSONTyped(json, false);
}

export function OperationVariableToJSONTyped(value?: OperationVariable | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'value': SubmodelElementChoiceToJSON(value['value']),
    };
}

