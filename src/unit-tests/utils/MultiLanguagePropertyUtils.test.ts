//import { types } from '@aas-core-works/aas-core3.1-typescript';
import {
    LangStringTextType as CoreLangStringTextType,
    MultiLanguageProperty as CoreMultiLanguageProperty,
    //isMultiLanguageProperty,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { vi } from 'vitest';
import { firstLangStringSetText, hasValue, valueToDisplay } from '../../utils/MultiLanguagePropertyUtils';

/**
 * Mock the isMultiLanguageProperty method used in MultiLanguagePropertyUtils.ts
 */
// vi.mock('@aas-core-works/aas-core3.1-typescript', () => ({
//     types: {
//         isMultiLanguageProperty: vi.fn(),
//     },
// }));
// vi.mock('../../utils/MultiLanguagePropertyUtils', () => ({
//     hasValue: vi.fn(),
// }));

// Define mock constants
const CORE_MULTILANGUAGEPROPERTY1: CoreMultiLanguageProperty = new CoreMultiLanguageProperty();
CORE_MULTILANGUAGEPROPERTY1.value = [
    new CoreLangStringTextType('en', 'Hello'),
    new CoreLangStringTextType('de', 'Hallo'),
];
const CORE_MULTILANGUAGEPROPERTY2: CoreMultiLanguageProperty = new CoreMultiLanguageProperty();
CORE_MULTILANGUAGEPROPERTY2.value = [];
describe('MultiLanguagePropertyUtils', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('hasValue', () => {
        it('should successfully check whether the given multi-language property object has a non-empty value.', () => {
            //(types.isMultiLanguageProperty as Mock).mockReturnValue(true);
            //vi.spyOn(types, 'isMultiLanguageProperty').mockReturnValue(true);
            //mockedIsMultiLanguageProperty.mockReturnValue(true);
            const result = hasValue(CORE_MULTILANGUAGEPROPERTY1);
            //expect(mockedIsMultiLanguageProperty).toHaveBeenCalledWith(CORE_MULTILANGUAGEPROPERTY1); //types.isMultiLanguageProperty
            expect(result).toBe(true);
        });

        it('should return false if value array is empty', () => {
            //mockedIsMultiLanguageProperty.mockReturnValue(true);
            const result = hasValue(CORE_MULTILANGUAGEPROPERTY2);
            //expect(mockedIsMultiLanguageProperty).toHaveBeenCalledWith(CORE_MULTILANGUAGEPROPERTY2);
            expect(result).toBe(false);
        });
    });
    describe('valueToDisplay', () => {
        it('should return the text in the specified language if found', () => {
            const result = valueToDisplay(CORE_MULTILANGUAGEPROPERTY1, 'de');
            //expect(types.isMultiLanguageProperty).toHaveBeenCalledWith(CORE_MULTILANGUAGEPROPERTY1);
            //expect(hasValue).toHaveBeenCalledWith(CORE_MULTILANGUAGEPROPERTY1);
            //expect(hasValueSpy).toHaveBeenCalledWith(CORE_MULTILANGUAGEPROPERTY1);
            expect(result).toBe('Hallo');
        });

        it('should return the text in the default language if no language is specified', () => {
            const result = valueToDisplay(CORE_MULTILANGUAGEPROPERTY1);
            expect(result).toBe('Hello');
        });

        it('should return default value if no appropriate value is found', () => {
            const result = valueToDisplay(CORE_MULTILANGUAGEPROPERTY1, 'fr', 'Default Text');
            expect(result).toBe('Default Text');
        });
    });

    describe('firstLangStringSetText', () => {
        it('should return the first non-empty text value', () => {
            const result = firstLangStringSetText(CORE_MULTILANGUAGEPROPERTY1);
            expect(result).toBe('Hello');
        });

        it('should return empty string if value array is empty', () => {
            const result = firstLangStringSetText(CORE_MULTILANGUAGEPROPERTY2);
            expect(result).toBe('');
        });
    });
});
