// import {
//     IReferable,
//     ISubmodelElement,
//     Submodel,
//     SubmodelElementCollection,
//     SubmodelElementList,
//     ModelType
// } from '@aas-core-works/aas-core3.0-typescript/types';
// import {
//     useReferableUtils,
// } from '../../utils/ReferableUtils';

import {
    ModelType,
    Submodel,
    SubmodelElementCollection,
    SubmodelElementList,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { useReferableUtils } from '../../utils/ReferableUtils';

describe('useReferableUtils', () => {
    const {
        nameToDisplay,
        descriptionToDisplay,
        checkIdShort,
        getSubmodelElementByIdShort,
        getSubmodelElementsByIdShort,
    } = useReferableUtils();

    const referableWithDisplayName = {
        displayName: [
            { language: 'en', text: 'Display Name EN' },
            { language: 'de', text: 'Anzeigename DE' },
        ],
        idShort: 'shortId',
        id: '1234-id',
    };

    const referableWithOnlyIdShort = {
        idShort: 'onlyIdShort',
    };

    const referableWithUUIDId = {
        id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
        parent: { modelType: 'SubmodelElementList' },
    };

    const referableWithDescription = {
        description: [
            { language: 'en', text: 'Description in English' },
            { language: 'fr', text: 'Description FR' },
        ],
    };

    describe('nameToDisplay', () => {
        it('returns displayName in specified language', () => {
            expect(nameToDisplay(referableWithDisplayName, 'de')).toBe('Anzeigename DE');
        });

        it('returns idShort if displayName not present', () => {
            expect(nameToDisplay(referableWithOnlyIdShort)).toBe('onlyIdShort');
        });

        it('returns empty string for UUID-based id from SubmodelElementList child', () => {
            expect(nameToDisplay(referableWithUUIDId)).toBe('');
        });
    });

    describe('descriptionToDisplay', () => {
        it('returns description in specified language', () => {
            expect(descriptionToDisplay(referableWithDescription, 'en')).toBe('Description in English');
        });

        it('returns default value if language not found', () => {
            expect(descriptionToDisplay(referableWithDescription, 'de', 'No Description')).toBe('No Description');
        });
    });

    describe('checkIdShort', () => {
        it('should return true for exact match', () => {
            expect(checkIdShort({ idShort: 'abc' }, 'abc')).toBe(true);
        });

        it('should return true for case-insensitive match', () => {
            expect(checkIdShort({ idShort: 'abc' }, 'ABC')).toBe(true);
        });

        it('should support startsWith with __ or { pattern', () => {
            expect(checkIdShort({ idShort: 'abc{01}' }, 'abc', true)).toBe(true);
            expect(checkIdShort({ idShort: 'abc__01__' }, 'abc', true)).toBe(true);
        });
    });

    describe('getSubmodelElementByIdShort', () => {
        it('should return matching SME from Submodel', () => {
            const sme = { idShort: 'target' };
            const sm = new Submodel();
            sm.submodelElements = [{ idShort: 'other' }, sme];
            sm.modelType = () => ModelType.Submodel;

            const result = getSubmodelElementByIdShort('target', sm);
            expect(result).toBe(sme);
        });
    });

    describe('getSubmodelElementsByIdShort', () => {
        it('should return all matching SMEs from SubmodelElementList', () => {
            const list = new SubmodelElementList();
            const sme1 = { idShort: 'match' };
            const sme2 = { idShort: 'match' };
            list.value = [sme1, sme2];
            list.modelType = () => ModelType.SubmodelElementList;

            const result = getSubmodelElementsByIdShort('match', list);
            expect(result).toEqual([sme1, sme2]);
        });
    });
});
