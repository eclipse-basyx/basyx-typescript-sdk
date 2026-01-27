import { jsonization } from '@aas-core-works/aas-core3.1-typescript';
import { ConceptDescription as CoreConceptDescription } from '@aas-core-works/aas-core3.1-typescript/types';
import { ConceptDescriptionRepositoryService } from '../generated';

/**
 * Convert an API ConceptDescription to a Core Works ConceptDescription
 *
 * @function convertApiCDToCoreCD
 * @param {ApiConceptDescription} aas - The API ConceptDescription to convert
 * @returns {CoreConceptDescription} The Core Works ConceptDescription
 */
export function convertApiCDToCoreCD(
    conceptDescription: ConceptDescriptionRepositoryService.ConceptDescription
): CoreConceptDescription {
    // first stringify
    let conceptDescriptionStr = JSON.stringify(conceptDescription);
    // then parse
    conceptDescriptionStr = JSON.parse(conceptDescriptionStr);
    // then jsonize
    const instanceOrError = jsonization.conceptDescriptionFromJsonable(conceptDescriptionStr);
    if (instanceOrError.error !== null) {
        throw instanceOrError.error;
    }
    const instance = instanceOrError.mustValue();
    // set the prototype
    Object.setPrototypeOf(instance, CoreConceptDescription.prototype);
    return instance;
}

/**
 * Convert a Core Works ConceptDescription to an API ConceptDescription
 *
 * @function convertCoreCDToApiCD
 * @param {CoreConceptDescription} aas - The Core Works ConceptDescription to convert
 * @returns {ApiConceptDescription} The API ConceptDescription
 */
export function convertCoreCDToApiCD(
    conceptDescription: CoreConceptDescription
): ConceptDescriptionRepositoryService.ConceptDescription {
    // first jsonize
    const jsonableConceptDescription = jsonization.toJsonable(conceptDescription);
    // then stringify
    const conceptDescriptionStr = JSON.stringify(jsonableConceptDescription);
    // then parse
    return JSON.parse(conceptDescriptionStr) as ConceptDescriptionRepositoryService.ConceptDescription;
}
