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
import type { Extension } from './Extension';
import {
    ExtensionFromJSON,
    ExtensionFromJSONTyped,
    ExtensionToJSON,
    ExtensionToJSONTyped,
} from './Extension';
import type { EmbeddedDataSpecification } from './EmbeddedDataSpecification';
import {
    EmbeddedDataSpecificationFromJSON,
    EmbeddedDataSpecificationFromJSONTyped,
    EmbeddedDataSpecificationToJSON,
    EmbeddedDataSpecificationToJSONTyped,
} from './EmbeddedDataSpecification';
import type { Reference } from './Reference';
import {
    ReferenceFromJSON,
    ReferenceFromJSONTyped,
    ReferenceToJSON,
    ReferenceToJSONTyped,
} from './Reference';
import type { LangStringTextType } from './LangStringTextType';
import {
    LangStringTextTypeFromJSON,
    LangStringTextTypeFromJSONTyped,
    LangStringTextTypeToJSON,
    LangStringTextTypeToJSONTyped,
} from './LangStringTextType';
import type { ModelType } from './ModelType';
import {
    ModelTypeFromJSON,
    ModelTypeFromJSONTyped,
    ModelTypeToJSON,
    ModelTypeToJSONTyped,
} from './ModelType';
import type { ReferableAllOfIdShort } from './ReferableAllOfIdShort';
import {
    ReferableAllOfIdShortFromJSON,
    ReferableAllOfIdShortFromJSONTyped,
    ReferableAllOfIdShortToJSON,
    ReferableAllOfIdShortToJSONTyped,
} from './ReferableAllOfIdShort';
import type { Qualifier } from './Qualifier';
import {
    QualifierFromJSON,
    QualifierFromJSONTyped,
    QualifierToJSON,
    QualifierToJSONTyped,
} from './Qualifier';
import type { LangStringNameType } from './LangStringNameType';
import {
    LangStringNameTypeFromJSON,
    LangStringNameTypeFromJSONTyped,
    LangStringNameTypeToJSON,
    LangStringNameTypeToJSONTyped,
} from './LangStringNameType';

/**
 * 
 * @export
 * @interface RelationshipElementAbstract
 */
export interface RelationshipElementAbstract {
    /**
     * 
     * @type {Array<Extension>}
     * @memberof RelationshipElementAbstract
     */
    extensions?: Array<Extension>;
    /**
     * 
     * @type {string}
     * @memberof RelationshipElementAbstract
     */
    category?: string;
    /**
     * 
     * @type {ReferableAllOfIdShort}
     * @memberof RelationshipElementAbstract
     */
    idShort?: ReferableAllOfIdShort;
    /**
     * 
     * @type {Array<LangStringNameType>}
     * @memberof RelationshipElementAbstract
     */
    displayName?: Array<LangStringNameType>;
    /**
     * 
     * @type {Array<LangStringTextType>}
     * @memberof RelationshipElementAbstract
     */
    description?: Array<LangStringTextType>;
    /**
     * 
     * @type {ModelType}
     * @memberof RelationshipElementAbstract
     */
    modelType: ModelType;
    /**
     * 
     * @type {Reference}
     * @memberof RelationshipElementAbstract
     */
    semanticId?: Reference;
    /**
     * 
     * @type {Array<Reference>}
     * @memberof RelationshipElementAbstract
     */
    supplementalSemanticIds?: Array<Reference>;
    /**
     * 
     * @type {Array<Qualifier>}
     * @memberof RelationshipElementAbstract
     */
    qualifiers?: Array<Qualifier>;
    /**
     * 
     * @type {Array<EmbeddedDataSpecification>}
     * @memberof RelationshipElementAbstract
     */
    embeddedDataSpecifications?: Array<EmbeddedDataSpecification>;
    /**
     * 
     * @type {Reference}
     * @memberof RelationshipElementAbstract
     */
    first: Reference;
    /**
     * 
     * @type {Reference}
     * @memberof RelationshipElementAbstract
     */
    second: Reference;
}



/**
 * Check if a given object implements the RelationshipElementAbstract interface.
 */
export function instanceOfRelationshipElementAbstract(value: object): value is RelationshipElementAbstract {
    if (!('modelType' in value) || value['modelType'] === undefined) return false;
    if (!('first' in value) || value['first'] === undefined) return false;
    if (!('second' in value) || value['second'] === undefined) return false;
    return true;
}

export function RelationshipElementAbstractFromJSON(json: any): RelationshipElementAbstract {
    return RelationshipElementAbstractFromJSONTyped(json, false);
}

export function RelationshipElementAbstractFromJSONTyped(json: any, ignoreDiscriminator: boolean): RelationshipElementAbstract {
    if (json == null) {
        return json;
    }
    return {
        
        'extensions': json['extensions'] == null ? undefined : ((json['extensions'] as Array<any>).map(ExtensionFromJSON)),
        'category': json['category'] == null ? undefined : json['category'],
        'idShort': json['idShort'] == null ? undefined : ReferableAllOfIdShortFromJSON(json['idShort']),
        'displayName': json['displayName'] == null ? undefined : ((json['displayName'] as Array<any>).map(LangStringNameTypeFromJSON)),
        'description': json['description'] == null ? undefined : ((json['description'] as Array<any>).map(LangStringTextTypeFromJSON)),
        'modelType': ModelTypeFromJSON(json['modelType']),
        'semanticId': json['semanticId'] == null ? undefined : ReferenceFromJSON(json['semanticId']),
        'supplementalSemanticIds': json['supplementalSemanticIds'] == null ? undefined : ((json['supplementalSemanticIds'] as Array<any>).map(ReferenceFromJSON)),
        'qualifiers': json['qualifiers'] == null ? undefined : ((json['qualifiers'] as Array<any>).map(QualifierFromJSON)),
        'embeddedDataSpecifications': json['embeddedDataSpecifications'] == null ? undefined : ((json['embeddedDataSpecifications'] as Array<any>).map(EmbeddedDataSpecificationFromJSON)),
        'first': ReferenceFromJSON(json['first']),
        'second': ReferenceFromJSON(json['second']),
    };
}

export function RelationshipElementAbstractToJSON(json: any): RelationshipElementAbstract {
    return RelationshipElementAbstractToJSONTyped(json, false);
}

export function RelationshipElementAbstractToJSONTyped(value?: RelationshipElementAbstract | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'extensions': value['extensions'] == null ? undefined : ((value['extensions'] as Array<any>).map(ExtensionToJSON)),
        'category': value['category'],
        'idShort': ReferableAllOfIdShortToJSON(value['idShort']),
        'displayName': value['displayName'] == null ? undefined : ((value['displayName'] as Array<any>).map(LangStringNameTypeToJSON)),
        'description': value['description'] == null ? undefined : ((value['description'] as Array<any>).map(LangStringTextTypeToJSON)),
        'modelType': ModelTypeToJSON(value['modelType']),
        'semanticId': ReferenceToJSON(value['semanticId']),
        'supplementalSemanticIds': value['supplementalSemanticIds'] == null ? undefined : ((value['supplementalSemanticIds'] as Array<any>).map(ReferenceToJSON)),
        'qualifiers': value['qualifiers'] == null ? undefined : ((value['qualifiers'] as Array<any>).map(QualifierToJSON)),
        'embeddedDataSpecifications': value['embeddedDataSpecifications'] == null ? undefined : ((value['embeddedDataSpecifications'] as Array<any>).map(EmbeddedDataSpecificationToJSON)),
        'first': ReferenceToJSON(value['first']),
        'second': ReferenceToJSON(value['second']),
    };
}

