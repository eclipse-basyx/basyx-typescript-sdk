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
 * @interface LangStringShortNameTypeIec61360
 */
export interface LangStringShortNameTypeIec61360 {
    /**
     * 
     * @type {string}
     * @memberof LangStringShortNameTypeIec61360
     */
    language: string;
    /**
     * 
     * @type {any}
     * @memberof LangStringShortNameTypeIec61360
     */
    text: any | null;
}

/**
 * Check if a given object implements the LangStringShortNameTypeIec61360 interface.
 */
export function instanceOfLangStringShortNameTypeIec61360(value: object): value is LangStringShortNameTypeIec61360 {
    if (!('language' in value) || value['language'] === undefined) return false;
    if (!('text' in value) || value['text'] === undefined) return false;
    return true;
}

export function LangStringShortNameTypeIec61360FromJSON(json: any): LangStringShortNameTypeIec61360 {
    return LangStringShortNameTypeIec61360FromJSONTyped(json, false);
}

export function LangStringShortNameTypeIec61360FromJSONTyped(json: any, ignoreDiscriminator: boolean): LangStringShortNameTypeIec61360 {
    if (json == null) {
        return json;
    }
    return {
        
        'language': json['language'],
        'text': json['text'],
    };
}

export function LangStringShortNameTypeIec61360ToJSON(json: any): LangStringShortNameTypeIec61360 {
    return LangStringShortNameTypeIec61360ToJSONTyped(json, false);
}

export function LangStringShortNameTypeIec61360ToJSONTyped(value?: LangStringShortNameTypeIec61360 | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'language': value['language'],
        'text': value['text'],
    };
}

