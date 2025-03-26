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


/**
 * 
 * @export
 */
export const AasSubmodelElements = {
    AnnotatedRelationshipElement: 'AnnotatedRelationshipElement',
    BasicEventElement: 'BasicEventElement',
    Blob: 'Blob',
    Capability: 'Capability',
    DataElement: 'DataElement',
    Entity: 'Entity',
    EventElement: 'EventElement',
    File: 'File',
    MultiLanguageProperty: 'MultiLanguageProperty',
    Operation: 'Operation',
    Property: 'Property',
    Range: 'Range',
    ReferenceElement: 'ReferenceElement',
    RelationshipElement: 'RelationshipElement',
    SubmodelElement: 'SubmodelElement',
    SubmodelElementCollection: 'SubmodelElementCollection',
    SubmodelElementList: 'SubmodelElementList'
} as const;
export type AasSubmodelElements = typeof AasSubmodelElements[keyof typeof AasSubmodelElements];


export function instanceOfAasSubmodelElements(value: any): boolean {
    for (const key in AasSubmodelElements) {
        if (Object.prototype.hasOwnProperty.call(AasSubmodelElements, key)) {
            if (AasSubmodelElements[key as keyof typeof AasSubmodelElements] === value) {
                return true;
            }
        }
    }
    return false;
}

export function AasSubmodelElementsFromJSON(json: any): AasSubmodelElements {
    return AasSubmodelElementsFromJSONTyped(json, false);
}

export function AasSubmodelElementsFromJSONTyped(json: any, ignoreDiscriminator: boolean): AasSubmodelElements {
    return json as AasSubmodelElements;
}

export function AasSubmodelElementsToJSON(value?: AasSubmodelElements | null): any {
    return value as any;
}

export function AasSubmodelElementsToJSONTyped(value: any, ignoreDiscriminator: boolean): AasSubmodelElements {
    return value as AasSubmodelElements;
}

