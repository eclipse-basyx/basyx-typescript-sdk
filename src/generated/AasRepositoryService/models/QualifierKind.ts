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
export const QualifierKind = {
    ConceptQualifier: 'ConceptQualifier',
    TemplateQualifier: 'TemplateQualifier',
    ValueQualifier: 'ValueQualifier'
} as const;
export type QualifierKind = typeof QualifierKind[keyof typeof QualifierKind];


export function instanceOfQualifierKind(value: any): boolean {
    for (const key in QualifierKind) {
        if (Object.prototype.hasOwnProperty.call(QualifierKind, key)) {
            if (QualifierKind[key as keyof typeof QualifierKind] === value) {
                return true;
            }
        }
    }
    return false;
}

export function QualifierKindFromJSON(json: any): QualifierKind {
    return QualifierKindFromJSONTyped(json, false);
}

export function QualifierKindFromJSONTyped(json: any, ignoreDiscriminator: boolean): QualifierKind {
    return json as QualifierKind;
}

export function QualifierKindToJSON(value?: QualifierKind | null): any {
    return value as any;
}

export function QualifierKindToJSONTyped(value: any, ignoreDiscriminator: boolean): QualifierKind {
    return value as QualifierKind;
}

