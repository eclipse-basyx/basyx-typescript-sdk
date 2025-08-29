import { KeyTypes } from '@aas-core-works/aas-core3.0-typescript/types';
/**
 * @constant {Array<Object>} keyTypes
 * @description Enumeration of Key Types as specified in IDTA 01001-3-0-1, page 82.
 * Each key type has a name and an abbreviation according to different IDTA SMT specifications (see appendix).
 *
 * @property {KeyTypes} type - The enum value of the key type.
 * @property {string} abbreviation - The abbreviation of the key type.
 *
 * @example
 * // Example of a key type
 * const aasKeyType = keyTypes[1]; // { type: KeyTypes.AssetAdministrationShell, abbreviation: 'AAS' }
 */
export const keyTypes = [
    { type: KeyTypes.AnnotatedRelationshipElement, abbreviation: 'RelA' },
    { type: KeyTypes.AssetAdministrationShell, abbreviation: 'AAS' },
    { type: KeyTypes.BasicEventElement, abbreviation: '' },
    { type: KeyTypes.Blob, abbreviation: 'Blob' },
    { type: KeyTypes.Capability, abbreviation: 'Cap' },
    { type: KeyTypes.ConceptDescription, abbreviation: 'CD' },
    { type: KeyTypes.DataElement, abbreviation: '' },
    { type: KeyTypes.Entity, abbreviation: 'Ent' },
    { type: KeyTypes.EventElement, abbreviation: 'Evt' },
    { type: KeyTypes.File, abbreviation: 'File' },
    { type: KeyTypes.FragmentReference, abbreviation: '' },
    { type: KeyTypes.GlobalReference, abbreviation: 'GlobalRef' },
    { type: KeyTypes.Identifiable, abbreviation: '' },
    { type: KeyTypes.MultiLanguageProperty, abbreviation: 'MLP' },
    { type: KeyTypes.Operation, abbreviation: 'Opr' },
    { type: KeyTypes.Property, abbreviation: 'Prop' },
    { type: KeyTypes.Range, abbreviation: 'Range' },
    { type: KeyTypes.Referable, abbreviation: '' },
    { type: KeyTypes.ReferenceElement, abbreviation: 'Ref' },
    { type: KeyTypes.RelationshipElement, abbreviation: 'Rel' },
    { type: KeyTypes.Submodel, abbreviation: 'SM' },
    { type: KeyTypes.SubmodelElement, abbreviation: 'SME' },
    { type: KeyTypes.SubmodelElementCollection, abbreviation: 'SMC' },
    { type: KeyTypes.SubmodelElementList, abbreviation: 'SML' },
];

/**
 * Retrieves the abbreviation for a given Key Type.
 *
 * @param {KeyTypes} keyType - The KeyTypes enum value to look up.
 * @returns {string} The abbreviation for the specified key type, or an empty string if not found or if the input is invalid.
 */
export function getKeyTypeAbbreviation(keyType: KeyTypes): string {
    const failResponse = '';

    //if (!keyTypeName || keyTypeName.trim() === '') return failResponse;
    if (keyType == null || typeof keyType !== 'number') return failResponse;

    const foundKeyType = keyTypes.find((kt) => kt.type === keyType);

    if (foundKeyType && foundKeyType?.abbreviation && foundKeyType.abbreviation.trim() !== '')
        return foundKeyType.abbreviation;

    return failResponse;
}
