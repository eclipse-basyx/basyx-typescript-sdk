import {
    IReferable,
    ISubmodelElement,
    ModelType,
    Submodel,
    SubmodelElementCollection,
    SubmodelElementList,
} from '@aas-core-works/aas-core3.1-typescript/types';

//export function useReferableUtils() {
//const { uuidV4Regex } = useIDUtils();
const uuidV4Regex = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/;
/**
 * Extracts the display name from a Referable object based on the specified language.
 *
 * The function follows these steps to determine the display name:
 *  1. If a `displayName` entry with the specified language is found, it returns its text.
 *  2. If `defaultNameToDisplay` is provided and not an empty string, it returns this value.
 *  3. If `idShort` is available and not an empty string, it returns `idShort`.
 *  4. If `id` is available and not an empty string, it returns `id`.
 *  5. If none of the above conditions are met, it returns an empty string.
 *
 * @param {IReferable} referable - The Referable object to extract the display name from.
 * @param {string} [language='en'] - The language code for the desired display name text. Defaults to 'en'.
 * @param {string} [defaultNameToDisplay=''] - The default name to return if no display name is found. Defaults to an empty string.
 * @returns {string} The determined display name or an appropriate fallback value.
 */
export function nameToDisplay(
    referable: IReferable,
    language: string = 'en',
    defaultNameToDisplay: string = ''
): string {
    if (referable && Object.keys(referable).length > 0) {
        // 1.) Check if displayName is available, if so, return displayName
        if (Array.isArray(referable.displayName) && referable.displayName.length > 0) {
            const displayNameEn = referable.displayName.find((d) => d.language === language && d.text?.trim() !== '');
            if (displayNameEn) return displayNameEn.text;
        }

        // 2.) Otherwise return defaultNameToDisplay (if specified)
        if (defaultNameToDisplay.trim() !== '') return defaultNameToDisplay;

        // 3.) Otherwise return idShort (if available and not empty string)
        if (referable?.idShort && referable?.idShort.trim() !== '') return referable.idShort;

        // 4.) If referable is also an identifiable at the same time return id (if available and not empty string)
        if (hasId(referable) && referable.id?.trim()) {
            const isSubmodelElementListChild =
                hasParent(referable) && referable.parent.modelType === 'SubmodelElementList';
            // Note: Constraint AASd-120: idShort of submodel elements being a direct child of a SubmodelElementList shall not be specified.
            // This condition avoids the output of an UUID v4
            if (isSubmodelElementListChild || uuidV4Regex.test(referable.id)) {
                return defaultNameToDisplay.trim() || '';
            }

            return referable.id;
        }
    }

    // 4.) Return defaultNameToDisplay if specified, otherwise return an empty string
    return defaultNameToDisplay.trim() || '';
}

function hasId(referable: any): referable is { id: string } {
    return typeof referable?.id === 'string';
}

function hasParent(obj: any): obj is { parent: { modelType: string } } {
    return typeof obj?.parent?.modelType === 'string';
}

/**
 * Extracts the description from a Referable object based on the specified language.
 * If no suitable description is found, it returns a default description.
 *
 * The function checks if the Referable object has a non-empty `description` array,
 * and then it attempts to find a description in the specified language (default is English).
 *
 * @param {IReferable} referable - The Referable object containing descriptions.
 * @param {string} [language='en'] - The language code indicating the desired description language.
 * @param {string} [defaultDescriptionToDisplay=''] - The default description to return if no matching description is found.
 * @returns {string} The text of the found description in the specified language or the default description if not found.
 */
export function descriptionToDisplay(referable: IReferable, language = 'en', defaultDescriptionToDisplay = '') {
    if (
        referable &&
        Object.keys(referable).length > 0 &&
        Array.isArray(referable?.description) &&
        referable?.description.length > 0
    ) {
        const descriptionEn = referable.description.find(
            (description: any) => description && description.language === language && description.text !== ''
        );
        if (descriptionEn && descriptionEn.text) return descriptionEn.text;
    }
    return defaultDescriptionToDisplay;
}

/**
 * Checks if the `idShort` of a Referable object matches the given `idShort`.
 * The comparison can be performed in two modes:
 * - **startsWith**: checks if the `idShort` of the Referable object starts with the given `idShort`.
 * - **strict**: indicates whether the comparison should consider case sensitivity.
 *
 * @param {IReferable} referable - The Referable object containing the `idShort` to check.
 * @param {string} idShort - The `idShort` string to compare against the Referable's `idShort`.
 * @param {boolean} [startsWith=false] - If true, checks if the Referable's `idShort` starts with the given `idShort`.
 * @param {boolean} [strict=false] - If true, the check will be case-sensitive.
 * @returns {boolean} Returns true if a matching `idShort` is found, false otherwise.
 */
export function checkIdShort(
    referable: IReferable,
    idShort: string,
    startsWith: boolean = false,
    strict: boolean = false
): boolean {
    if (idShort.trim() === '') return false;

    if (!referable || Object.keys(referable).length === 0 || !referable?.idShort || referable?.idShort.trim() === '')
        return false;

    if (startsWith) {
        // For matching e.g. ProductImage{00} with idShort ProductImage
        // For matching e.g. Markings__00__
        if (strict) {
            return (
                referable.idShort === idShort ||
                referable.idShort.startsWith(idShort + '{') ||
                referable.idShort.startsWith(idShort + '__')
            );
        } else {
            return (
                referable.idShort.toLowerCase() === idShort.toLowerCase() ||
                referable.idShort.toLowerCase().startsWith(idShort.toLowerCase() + '{') ||
                referable.idShort.toLowerCase().startsWith(idShort.toLowerCase() + '__')
            );
        }
    } else {
        if (strict) {
            return referable.idShort === idShort;
        } else {
            return referable.idShort.toLowerCase() === idShort.toLowerCase();
        }
    }
}

/**
 * Retrieves a SubmodelElement (SME) by its `idShort` from a given Submodel (SM) or SubmodelElement (SME).
 * If the `idShort` is not found or if the input is invalid, an empty object is returned.
 *
 * The function supports the following types of elements:
 * - **Submodel (SM)**: Searches through `submodelElements`.
 * - **SubmodelElementCollection (SMC)** and **SubmodelElementList (SML)**: Searches through their `value` arrays.
 *
 * @param {string} idShort - The `idShort` of the SME to search for.
 * @param {Submodel | ISubmodelElement} submodelElement - The parent SM/SME to search within.
 * @returns {ISubmodelElement | undefined} The found SME or an empty object if not found or input is invalid.
 */
export function getSubmodelElementByIdShort(
    idShort: string,
    submodelElement: Submodel | ISubmodelElement
): ISubmodelElement | undefined {
    if (idShort.trim() == '') return undefined;

    if (!submodelElement?.modelType) return undefined;

    switch (submodelElement.modelType()) {
        case ModelType.Submodel: {
            const submodel = submodelElement as Submodel;
            if (submodel.submodelElements && submodel.submodelElements.length > 0) {
                return submodel.submodelElements.find((sme: ISubmodelElement) => {
                    return checkIdShort(sme, idShort);
                });
            }
            break;
        }
        case ModelType.SubmodelElementCollection: {
            const collection = submodelElement as SubmodelElementCollection;
            if (collection.value && collection.value.length > 0) {
                return collection.value.find((sme: ISubmodelElement) => {
                    return checkIdShort(sme, idShort);
                });
            }
            break;
        }
        case ModelType.SubmodelElementList: {
            const list = submodelElement as SubmodelElementList;
            if (list.value && list.value.length > 0) {
                return list.value.find((sme: ISubmodelElement) => {
                    return checkIdShort(sme, idShort);
                });
            }
            break;
        }
    }

    return undefined;
}
/**
 * Retrieves an array of SubmodelElements (SMEs) by their `idShort` from a given Submodel (SM) or SubmodelElement (SME).
 * If the `idShort` is not found or if the input is invalid, an empty array is returned.
 *
 * The function supports the following types of elements:
 * - **Submodel (SM)**: Filters through `submodelElements`.
 * - **SubmodelElementCollection (SMC)** and **SubmodelElementList (SML)**: Filters through their `value` arrays.
 *
 * @param {string} idShort - The `idShort` of the SMEs to search for.
 * @param {Submodel | ISubmodelElement} submodelElement - The parent SM/SME to search within.
 * @returns {ISubmodelElement[]} An array of found SMEs matching the `idShort`, or an empty array if not found or input is invalid.
 */
export function getSubmodelElementsByIdShort(
    idShort: string,
    submodelElement: Submodel | ISubmodelElement
): ISubmodelElement[] {
    if (idShort.trim() == '') return [];

    if (!submodelElement?.modelType) return [];

    switch (submodelElement.modelType()) {
        case ModelType.Submodel: {
            const submodel = submodelElement as Submodel;
            if (submodel.submodelElements && submodel.submodelElements.length > 0) {
                return submodel.submodelElements.filter((sme: ISubmodelElement) => {
                    return checkIdShort(sme, idShort);
                });
            }
            break;
        }
        case ModelType.SubmodelElementCollection: {
            const collection = submodelElement as SubmodelElementCollection;
            if (collection.value && collection.value.length > 0) {
                return collection.value.filter((sme: ISubmodelElement) => {
                    return checkIdShort(sme, idShort);
                });
            }
            break;
        }
        case ModelType.SubmodelElementList: {
            const list = submodelElement as SubmodelElementList;
            if (list.value && list.value.length > 0) {
                return list.value.filter((sme: ISubmodelElement) => {
                    return checkIdShort(sme, idShort);
                });
            }
            break;
        }
    }

    return [];
}

// return {
//     nameToDisplay,
//     descriptionToDisplay,
//     checkIdShort,
//     getSubmodelElementByIdShort,
//     getSubmodelElementsByIdShort,
// };
//}
