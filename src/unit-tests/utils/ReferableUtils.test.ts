import {
    IReferable,
    ISubmodelElement,
    ModelType,
    Submodel,
    SubmodelElementCollection,
    SubmodelElementList,
} from '@aas-core-works/aas-core3.1-typescript/types';
import {
    checkIdShort,
    descriptionToDisplay,
    getSubmodelElementByIdShort,
    getSubmodelElementsByIdShort,
    nameToDisplay,
} from '../../utils/ReferableUtils';

// Helper function to create a SubmodelElement
function createSubmodelElement(idShort: string, modelType: ModelType = ModelType.Property): ISubmodelElement {
    return {
        idShort,
        modelType: () => modelType,
    } as ISubmodelElement;
}

// Define mock constants
const REFERABLE_WITH_DISPLAY_NAME: IReferable = {
    displayName: [{ language: 'en', text: 'Test Name' }],
} as IReferable;

const REFERABLE_DEFAULT: IReferable = {} as IReferable;

const REFERABLE_WITH_IDSHORT: IReferable = { idShort: 'fooBarIdShort' } as IReferable;

const REFERABLE_WITH_ID = { id: 'fooBarId' } as unknown as IReferable;

const REFERABLE_WITH_UUID: any = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    parent: { modelType: 'SubmodelElementList' },
};

const REFERABLE_WITH_DESCRIPTION: IReferable = {
    description: [{ language: 'en', text: 'English description' }],
} as IReferable;

describe('ReferableUtils', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('nameToDisplay', () => {
        it('should return displayName in specified language', () => {
            const result = nameToDisplay(REFERABLE_WITH_DISPLAY_NAME, 'en');
            expect(result).toBe('Test Name');
        });

        it('should return defaultNameToDisplay when no displayName matches language', () => {
            const result = nameToDisplay(REFERABLE_DEFAULT, 'fr', 'Default Name');
            expect(result).toBe('Default Name');
        });

        it('should return idShort if displayName not present', () => {
            const result = nameToDisplay(REFERABLE_WITH_IDSHORT);
            expect(result).toBe('fooBarIdShort');
        });

        it('should return empty string for UUID-based id from SubmodelElementList child', () => {
            const result = nameToDisplay(REFERABLE_WITH_UUID);
            expect(result).toBe('');
        });

        it('should return id when no displayName and no idShort', () => {
            const result = nameToDisplay(REFERABLE_WITH_ID);
            expect(result).toBe('fooBarId');
        });
    });

    describe('descriptionToDisplay', () => {
        it('should return description in specified language', () => {
            const result = descriptionToDisplay(REFERABLE_WITH_DESCRIPTION, 'en');
            expect(result).toBe('English description');
        });

        it('should return default value if language not found', () => {
            const result = descriptionToDisplay(REFERABLE_DEFAULT, 'de', 'No Description');
            expect(result).toBe('No Description');
        });
    });

    describe('checkIdShort', () => {
        //const referable = { idShort: 'ProductImage00' } as IReferable;
        it('should return true for exact match', () => {
            const result = checkIdShort({ idShort: 'abc' } as IReferable, 'abc', false, true);
            expect(result).toBe(true);
        });

        it('should return true for case-insensitive match', () => {
            const result = checkIdShort({ idShort: 'abc' } as IReferable, 'ABC');
            expect(result).toBe(true);
        });

        it('should support startsWith with __ or { pattern', () => {
            const result1 = checkIdShort({ idShort: 'ProductImage{00}' } as IReferable, 'ProductImage', true);
            const result2 = checkIdShort({ idShort: 'Markings__00__' } as IReferable, 'Markings', true);
            expect(result1).toBe(true);
            expect(result2).toBe(true);
        });

        it('should return false for empty idShort', () => {
            const result = checkIdShort({ idShort: '' } as IReferable, 'x');
            expect(result).toBe(false);
        });
    });

    describe('getSubmodelElementByIdShort', () => {
        it('should find element in Submodel by idShort', () => {
            const sme = createSubmodelElement('testElement');
            const submodel = {
                modelType: () => ModelType.Submodel,
                submodelElements: [sme],
            } as unknown as Submodel;

            const result = getSubmodelElementByIdShort('testElement', submodel);
            expect(result).toBe(sme);
        });

        it('should find element in SubmodelElementCollection by idShort', () => {
            const sme = createSubmodelElement('testElement');
            const collection = {
                modelType: () => ModelType.SubmodelElementCollection,
                value: [sme],
            } as unknown as SubmodelElementCollection;

            const result = getSubmodelElementByIdShort('testElement', collection);
            expect(result).toBe(sme);
        });

        it('should find element in SubmodelElementList by idShort', () => {
            const sme = createSubmodelElement('testElement');
            const list = {
                modelType: () => ModelType.SubmodelElementList,
                value: [sme],
            } as unknown as SubmodelElementList;

            const result = getSubmodelElementByIdShort('testElement', list);
            expect(result).toBe(sme);
        });

        it('should return undefined for empty idShort', () => {
            const submodel = {
                modelType: () => ModelType.Submodel,
                submodelElements: [],
            } as unknown as Submodel;

            const result = getSubmodelElementByIdShort('', submodel);
            expect(result).toBeUndefined();
        });

        it('should return undefined when submodelElement has no modelType', () => {
            const result = getSubmodelElementByIdShort('test', {} as any);
            expect(result).toBeUndefined();
        });
    });

    describe('getSubmodelElementsByIdShort', () => {
        it('should find all matching elements in Submodel by idShort', () => {
            const sme1 = createSubmodelElement('testElement');
            const sme2 = createSubmodelElement('testElement');
            const sme3 = createSubmodelElement('differentElement');
            const submodel = {
                modelType: () => ModelType.Submodel,
                submodelElements: [sme1, sme2, sme3],
            } as unknown as Submodel;

            const result = getSubmodelElementsByIdShort('testElement', submodel);
            expect(result).toEqual([sme1, sme2]);
            expect(result).toHaveLength(2);
        });

        it('should find all matching elements in SubmodelElementCollection', () => {
            const sme1 = createSubmodelElement('testElement');
            const sme2 = createSubmodelElement('testElement');
            const collection = {
                modelType: () => ModelType.SubmodelElementCollection,
                value: [sme1, sme2],
            } as unknown as SubmodelElementCollection;

            const result = getSubmodelElementsByIdShort('testElement', collection);
            expect(result).toEqual([sme1, sme2]);
        });

        it('should find all matching elements in SubmodelElementList', () => {
            const sme1 = createSubmodelElement('testElement');
            const sme2 = createSubmodelElement('testElement');
            const list = {
                modelType: () => ModelType.SubmodelElementList,
                value: [sme1, sme2],
            } as unknown as SubmodelElementList;

            const result = getSubmodelElementsByIdShort('testElement', list);
            expect(result).toEqual([sme1, sme2]);
        });

        it('should return empty array for empty idShort', () => {
            const submodel = {
                modelType: () => ModelType.Submodel,
                submodelElements: [],
            } as unknown as Submodel;

            const result = getSubmodelElementsByIdShort('', submodel);
            expect(result).toEqual([]);
        });

        it('should return empty array when submodelElement has no modelType', () => {
            const result = getSubmodelElementsByIdShort('test', {} as any);
            expect(result).toEqual([]);
        });
        // it('should return all matching SMEs from SubmodelElementList', () => {
        //     const list = new SubmodelElementList();
        //     const sme1 = { idShort: 'match' };
        //     const sme2 = { idShort: 'match' };
        //     list.value = [sme1, sme2];
        //     list.modelType = () => ModelType.SubmodelElementList;

        //     const result = getSubmodelElementsByIdShort('match', list);
        //     expect(result).toEqual([sme1, sme2]);
        // });
    });
});
