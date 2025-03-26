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
import type { LevelType } from './LevelType';
import {
    LevelTypeFromJSON,
    LevelTypeFromJSONTyped,
    LevelTypeToJSON,
    LevelTypeToJSONTyped,
} from './LevelType';
import type { ValueList } from './ValueList';
import {
    ValueListFromJSON,
    ValueListFromJSONTyped,
    ValueListToJSON,
    ValueListToJSONTyped,
} from './ValueList';
import type { Reference } from './Reference';
import {
    ReferenceFromJSON,
    ReferenceFromJSONTyped,
    ReferenceToJSON,
    ReferenceToJSONTyped,
} from './Reference';
import type { LangStringPreferredNameTypeIec61360 } from './LangStringPreferredNameTypeIec61360';
import {
    LangStringPreferredNameTypeIec61360FromJSON,
    LangStringPreferredNameTypeIec61360FromJSONTyped,
    LangStringPreferredNameTypeIec61360ToJSON,
    LangStringPreferredNameTypeIec61360ToJSONTyped,
} from './LangStringPreferredNameTypeIec61360';
import type { DataTypeIec61360 } from './DataTypeIec61360';
import {
    DataTypeIec61360FromJSON,
    DataTypeIec61360FromJSONTyped,
    DataTypeIec61360ToJSON,
    DataTypeIec61360ToJSONTyped,
} from './DataTypeIec61360';
import type { LangStringShortNameTypeIec61360 } from './LangStringShortNameTypeIec61360';
import {
    LangStringShortNameTypeIec61360FromJSON,
    LangStringShortNameTypeIec61360FromJSONTyped,
    LangStringShortNameTypeIec61360ToJSON,
    LangStringShortNameTypeIec61360ToJSONTyped,
} from './LangStringShortNameTypeIec61360';
import type { LangStringDefinitionTypeIec61360 } from './LangStringDefinitionTypeIec61360';
import {
    LangStringDefinitionTypeIec61360FromJSON,
    LangStringDefinitionTypeIec61360FromJSONTyped,
    LangStringDefinitionTypeIec61360ToJSON,
    LangStringDefinitionTypeIec61360ToJSONTyped,
} from './LangStringDefinitionTypeIec61360';

/**
 * 
 * @export
 * @interface DataSpecificationIec61360
 */
export interface DataSpecificationIec61360 {
    /**
     * 
     * @type {string}
     * @memberof DataSpecificationIec61360
     */
    modelType: string;
    /**
     * 
     * @type {Array<LangStringPreferredNameTypeIec61360>}
     * @memberof DataSpecificationIec61360
     */
    preferredName: Array<LangStringPreferredNameTypeIec61360>;
    /**
     * 
     * @type {Array<LangStringShortNameTypeIec61360>}
     * @memberof DataSpecificationIec61360
     */
    shortName?: Array<LangStringShortNameTypeIec61360>;
    /**
     * 
     * @type {string}
     * @memberof DataSpecificationIec61360
     */
    unit?: string;
    /**
     * 
     * @type {Reference}
     * @memberof DataSpecificationIec61360
     */
    unitId?: Reference;
    /**
     * 
     * @type {string}
     * @memberof DataSpecificationIec61360
     */
    sourceOfDefinition?: string;
    /**
     * 
     * @type {string}
     * @memberof DataSpecificationIec61360
     */
    symbol?: string;
    /**
     * 
     * @type {DataTypeIec61360}
     * @memberof DataSpecificationIec61360
     */
    dataType?: DataTypeIec61360;
    /**
     * 
     * @type {Array<LangStringDefinitionTypeIec61360>}
     * @memberof DataSpecificationIec61360
     */
    definition?: Array<LangStringDefinitionTypeIec61360>;
    /**
     * 
     * @type {string}
     * @memberof DataSpecificationIec61360
     */
    valueFormat?: string;
    /**
     * 
     * @type {ValueList}
     * @memberof DataSpecificationIec61360
     */
    valueList?: ValueList;
    /**
     * 
     * @type {string}
     * @memberof DataSpecificationIec61360
     */
    value?: string;
    /**
     * 
     * @type {LevelType}
     * @memberof DataSpecificationIec61360
     */
    levelType?: LevelType;
}



/**
 * Check if a given object implements the DataSpecificationIec61360 interface.
 */
export function instanceOfDataSpecificationIec61360(value: object): value is DataSpecificationIec61360 {
    if (!('modelType' in value) || value['modelType'] === undefined) return false;
    if (!('preferredName' in value) || value['preferredName'] === undefined) return false;
    return true;
}

export function DataSpecificationIec61360FromJSON(json: any): DataSpecificationIec61360 {
    return DataSpecificationIec61360FromJSONTyped(json, false);
}

export function DataSpecificationIec61360FromJSONTyped(json: any, ignoreDiscriminator: boolean): DataSpecificationIec61360 {
    if (json == null) {
        return json;
    }
    return {
        
        'modelType': json['modelType'],
        'preferredName': ((json['preferredName'] as Array<any>).map(LangStringPreferredNameTypeIec61360FromJSON)),
        'shortName': json['shortName'] == null ? undefined : ((json['shortName'] as Array<any>).map(LangStringShortNameTypeIec61360FromJSON)),
        'unit': json['unit'] == null ? undefined : json['unit'],
        'unitId': json['unitId'] == null ? undefined : ReferenceFromJSON(json['unitId']),
        'sourceOfDefinition': json['sourceOfDefinition'] == null ? undefined : json['sourceOfDefinition'],
        'symbol': json['symbol'] == null ? undefined : json['symbol'],
        'dataType': json['dataType'] == null ? undefined : DataTypeIec61360FromJSON(json['dataType']),
        'definition': json['definition'] == null ? undefined : ((json['definition'] as Array<any>).map(LangStringDefinitionTypeIec61360FromJSON)),
        'valueFormat': json['valueFormat'] == null ? undefined : json['valueFormat'],
        'valueList': json['valueList'] == null ? undefined : ValueListFromJSON(json['valueList']),
        'value': json['value'] == null ? undefined : json['value'],
        'levelType': json['levelType'] == null ? undefined : LevelTypeFromJSON(json['levelType']),
    };
}

export function DataSpecificationIec61360ToJSON(json: any): DataSpecificationIec61360 {
    return DataSpecificationIec61360ToJSONTyped(json, false);
}

export function DataSpecificationIec61360ToJSONTyped(value?: DataSpecificationIec61360 | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'modelType': value['modelType'],
        'preferredName': ((value['preferredName'] as Array<any>).map(LangStringPreferredNameTypeIec61360ToJSON)),
        'shortName': value['shortName'] == null ? undefined : ((value['shortName'] as Array<any>).map(LangStringShortNameTypeIec61360ToJSON)),
        'unit': value['unit'],
        'unitId': ReferenceToJSON(value['unitId']),
        'sourceOfDefinition': value['sourceOfDefinition'],
        'symbol': value['symbol'],
        'dataType': DataTypeIec61360ToJSON(value['dataType']),
        'definition': value['definition'] == null ? undefined : ((value['definition'] as Array<any>).map(LangStringDefinitionTypeIec61360ToJSON)),
        'valueFormat': value['valueFormat'],
        'valueList': ValueListToJSON(value['valueList']),
        'value': value['value'],
        'levelType': LevelTypeToJSON(value['levelType']),
    };
}

