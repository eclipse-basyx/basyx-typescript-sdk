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
/**
 * 
 * @export
 * @interface LevelType
 */
export interface LevelType {
    /**
     * 
     * @type {boolean}
     * @memberof LevelType
     */
    min: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof LevelType
     */
    nom: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof LevelType
     */
    typ: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof LevelType
     */
    max: boolean;
}

/**
 * Check if a given object implements the LevelType interface.
 */
export function instanceOfLevelType(value: object): value is LevelType {
    if (!('min' in value) || value['min'] === undefined) return false;
    if (!('nom' in value) || value['nom'] === undefined) return false;
    if (!('typ' in value) || value['typ'] === undefined) return false;
    if (!('max' in value) || value['max'] === undefined) return false;
    return true;
}

export function LevelTypeFromJSON(json: any): LevelType {
    return LevelTypeFromJSONTyped(json, false);
}

export function LevelTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): LevelType {
    if (json == null) {
        return json;
    }
    return {
        
        'min': json['min'],
        'nom': json['nom'],
        'typ': json['typ'],
        'max': json['max'],
    };
}

export function LevelTypeToJSON(json: any): LevelType {
    return LevelTypeToJSONTyped(json, false);
}

export function LevelTypeToJSONTyped(value?: LevelType | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'min': value['min'],
        'nom': value['nom'],
        'typ': value['typ'],
        'max': value['max'],
    };
}

