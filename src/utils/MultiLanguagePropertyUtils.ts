import { isMultiLanguageProperty, MultiLanguageProperty } from '@aas-core-works/aas-core3.1-typescript/types';

/**
 * Checks whether the given multi-language property object has a non-empty value.
 *
 * @param {MultiLanguageProperty} multiLanguageProperty - The multi-language property object to check.
 * @returns {boolean} True if the multiLanguageProperty has a non-empty value, otherwise false.
 */
export function hasValue(multiLanguageProperty: MultiLanguageProperty): boolean {
    if (!isMultiLanguageProperty(multiLanguageProperty) || !multiLanguageProperty?.value?.length) {
        return false;
    }

    return multiLanguageProperty.value.some((langStringSet) => langStringSet?.text?.trim() !== '');
}

/**
 * Retrieves the display value from a multi-language property, defaulting to the specified language.
 *
 * @param {MultiLanguageProperty} multiLanguageProperty - The multi-language property object.
 * @param {string} [language='en'] - The language code to look for in the multi-language property values (default is 'en').
 * @param {string} [defaultValueToDisplay=''] - The default value to return if no appropriate value is found.
 * @returns {string} The text value in the specified language, or the default value if not found.
 */
export function valueToDisplay(
    multiLanguageProperty: MultiLanguageProperty,
    language: string = 'en',
    defaultValueToDisplay: string = ''
): string {
    if (isMultiLanguageProperty(multiLanguageProperty) && hasValue(multiLanguageProperty)) {
        const langStringSet = multiLanguageProperty.value?.find((value) => value?.language === language);
        if (langStringSet && langStringSet?.text && langStringSet.text.trim() !== '') {
            return langStringSet.text;
        }
    }
    return defaultValueToDisplay;
}

/**
 * Retrieves the first non-empty text string from a multi-language property.
 *
 * @param {MultiLanguageProperty} multiLanguageProperty - The multi-language property object.
 * @returns {string} The first non-empty text string or an empty string if none found.
 */
export function firstLangStringSetText(multiLanguageProperty: MultiLanguageProperty): string {
    if (isMultiLanguageProperty(multiLanguageProperty) && hasValue(multiLanguageProperty)) {
        for (const langString of multiLanguageProperty.value || []) {
            if (langString?.text?.trim()) {
                return langString.text.trim();
            }
        }
    }
    return '';
}
