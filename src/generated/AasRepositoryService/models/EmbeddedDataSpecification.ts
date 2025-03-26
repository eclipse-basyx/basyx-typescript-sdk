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
import type { DataSpecificationContentChoice } from './DataSpecificationContentChoice';
import {
    DataSpecificationContentChoiceFromJSON,
    DataSpecificationContentChoiceFromJSONTyped,
    DataSpecificationContentChoiceToJSON,
    DataSpecificationContentChoiceToJSONTyped,
} from './DataSpecificationContentChoice';

/**
 * 
 * @export
 * @interface EmbeddedDataSpecification
 */
export interface EmbeddedDataSpecification {
    /**
     * 
     * @type {DataSpecificationContentChoice}
     * @memberof EmbeddedDataSpecification
     */
    dataSpecificationContent: DataSpecificationContentChoice;
    /**
     * 
     * @type {Reference}
     * @memberof EmbeddedDataSpecification
     */
    dataSpecification: Reference;
}

/**
 * Check if a given object implements the EmbeddedDataSpecification interface.
 */
export function instanceOfEmbeddedDataSpecification(value: object): value is EmbeddedDataSpecification {
    if (!('dataSpecificationContent' in value) || value['dataSpecificationContent'] === undefined) return false;
    if (!('dataSpecification' in value) || value['dataSpecification'] === undefined) return false;
    return true;
}

export function EmbeddedDataSpecificationFromJSON(json: any): EmbeddedDataSpecification {
    return EmbeddedDataSpecificationFromJSONTyped(json, false);
}

export function EmbeddedDataSpecificationFromJSONTyped(json: any, ignoreDiscriminator: boolean): EmbeddedDataSpecification {
    if (json == null) {
        return json;
    }
    return {
        
        'dataSpecificationContent': DataSpecificationContentChoiceFromJSON(json['dataSpecificationContent']),
        'dataSpecification': ReferenceFromJSON(json['dataSpecification']),
    };
}

export function EmbeddedDataSpecificationToJSON(json: any): EmbeddedDataSpecification {
    return EmbeddedDataSpecificationToJSONTyped(json, false);
}

export function EmbeddedDataSpecificationToJSONTyped(value?: EmbeddedDataSpecification | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'dataSpecificationContent': DataSpecificationContentChoiceToJSON(value['dataSpecificationContent']),
        'dataSpecification': ReferenceToJSON(value['dataSpecification']),
    };
}

