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
import type { DataTypeDefXsd } from './DataTypeDefXsd';
import {
    DataTypeDefXsdFromJSON,
    DataTypeDefXsdFromJSONTyped,
    DataTypeDefXsdToJSON,
    DataTypeDefXsdToJSONTyped,
} from './DataTypeDefXsd';
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
import type { Qualifier1 } from './Qualifier1';
import {
    Qualifier1FromJSON,
    Qualifier1FromJSONTyped,
    Qualifier1ToJSON,
    Qualifier1ToJSONTyped,
} from './Qualifier1';
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
import type { Referable1AllOfIdShort } from './Referable1AllOfIdShort';
import {
    Referable1AllOfIdShortFromJSON,
    Referable1AllOfIdShortFromJSONTyped,
    Referable1AllOfIdShortToJSON,
    Referable1AllOfIdShortToJSONTyped,
} from './Referable1AllOfIdShort';
import type { LangStringNameType } from './LangStringNameType';
import {
    LangStringNameTypeFromJSON,
    LangStringNameTypeFromJSONTyped,
    LangStringNameTypeToJSON,
    LangStringNameTypeToJSONTyped,
} from './LangStringNameType';
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
 * @interface RangeMetadata
 */
export interface RangeMetadata {
    /**
     * 
     * @type {DataTypeDefXsd}
     * @memberof RangeMetadata
     */
    valueType?: DataTypeDefXsd;
    /**
     * 
     * @type {Array<Extension>}
     * @memberof RangeMetadata
     */
    extensions?: Array<Extension>;
    /**
     * 
     * @type {string}
     * @memberof RangeMetadata
     */
    category?: string;
    /**
     * 
     * @type {Referable1AllOfIdShort}
     * @memberof RangeMetadata
     */
    idShort?: Referable1AllOfIdShort;
    /**
     * 
     * @type {Array<LangStringNameType>}
     * @memberof RangeMetadata
     */
    displayName?: Array<LangStringNameType>;
    /**
     * 
     * @type {Array<LangStringTextType>}
     * @memberof RangeMetadata
     */
    description?: Array<LangStringTextType>;
    /**
     * 
     * @type {ModelType}
     * @memberof RangeMetadata
     */
    modelType: ModelType;
    /**
     * 
     * @type {Array<EmbeddedDataSpecification>}
     * @memberof RangeMetadata
     */
    embeddedDataSpecifications?: Array<EmbeddedDataSpecification>;
    /**
     * 
     * @type {Reference}
     * @memberof RangeMetadata
     */
    semanticId?: Reference;
    /**
     * 
     * @type {Array<Reference>}
     * @memberof RangeMetadata
     */
    supplementalSemanticIds?: Array<Reference>;
    /**
     * 
     * @type {Array<Qualifier1>}
     * @memberof RangeMetadata
     */
    qualifiers?: Array<Qualifier1>;
    /**
     * 
     * @type {ModellingKind}
     * @memberof RangeMetadata
     */
    kind?: ModellingKind;
}



/**
 * Check if a given object implements the RangeMetadata interface.
 */
export function instanceOfRangeMetadata(value: object): value is RangeMetadata {
    if (!('modelType' in value) || value['modelType'] === undefined) return false;
    return true;
}

export function RangeMetadataFromJSON(json: any): RangeMetadata {
    return RangeMetadataFromJSONTyped(json, false);
}

export function RangeMetadataFromJSONTyped(json: any, ignoreDiscriminator: boolean): RangeMetadata {
    if (json == null) {
        return json;
    }
    return {
        
        'valueType': json['valueType'] == null ? undefined : DataTypeDefXsdFromJSON(json['valueType']),
        'extensions': json['extensions'] == null ? undefined : ((json['extensions'] as Array<any>).map(ExtensionFromJSON)),
        'category': json['category'] == null ? undefined : json['category'],
        'idShort': json['idShort'] == null ? undefined : Referable1AllOfIdShortFromJSON(json['idShort']),
        'displayName': json['displayName'] == null ? undefined : ((json['displayName'] as Array<any>).map(LangStringNameTypeFromJSON)),
        'description': json['description'] == null ? undefined : ((json['description'] as Array<any>).map(LangStringTextTypeFromJSON)),
        'modelType': ModelTypeFromJSON(json['modelType']),
        'embeddedDataSpecifications': json['embeddedDataSpecifications'] == null ? undefined : ((json['embeddedDataSpecifications'] as Array<any>).map(EmbeddedDataSpecificationFromJSON)),
        'semanticId': json['semanticId'] == null ? undefined : ReferenceFromJSON(json['semanticId']),
        'supplementalSemanticIds': json['supplementalSemanticIds'] == null ? undefined : ((json['supplementalSemanticIds'] as Array<any>).map(ReferenceFromJSON)),
        'qualifiers': json['qualifiers'] == null ? undefined : ((json['qualifiers'] as Array<any>).map(Qualifier1FromJSON)),
        'kind': json['kind'] == null ? undefined : ModellingKindFromJSON(json['kind']),
    };
}

export function RangeMetadataToJSON(json: any): RangeMetadata {
    return RangeMetadataToJSONTyped(json, false);
}

export function RangeMetadataToJSONTyped(value?: RangeMetadata | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'valueType': DataTypeDefXsdToJSON(value['valueType']),
        'extensions': value['extensions'] == null ? undefined : ((value['extensions'] as Array<any>).map(ExtensionToJSON)),
        'category': value['category'],
        'idShort': Referable1AllOfIdShortToJSON(value['idShort']),
        'displayName': value['displayName'] == null ? undefined : ((value['displayName'] as Array<any>).map(LangStringNameTypeToJSON)),
        'description': value['description'] == null ? undefined : ((value['description'] as Array<any>).map(LangStringTextTypeToJSON)),
        'modelType': ModelTypeToJSON(value['modelType']),
        'embeddedDataSpecifications': value['embeddedDataSpecifications'] == null ? undefined : ((value['embeddedDataSpecifications'] as Array<any>).map(EmbeddedDataSpecificationToJSON)),
        'semanticId': ReferenceToJSON(value['semanticId']),
        'supplementalSemanticIds': value['supplementalSemanticIds'] == null ? undefined : ((value['supplementalSemanticIds'] as Array<any>).map(ReferenceToJSON)),
        'qualifiers': value['qualifiers'] == null ? undefined : ((value['qualifiers'] as Array<any>).map(Qualifier1ToJSON)),
        'kind': ModellingKindToJSON(value['kind']),
    };
}

