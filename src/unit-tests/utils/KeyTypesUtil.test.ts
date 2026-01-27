import { KeyTypes } from '@aas-core-works/aas-core3.1-typescript/types';
import { getKeyTypeAbbreviation } from '../../utils/KeyTypesUtil';

describe('KeyTypesUtil', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getKeyTypeAbbreviation', () => {
        it('should retrieve the abbreviation for a given Key Type successfully', () => {
            const result1 = getKeyTypeAbbreviation(KeyTypes.AssetAdministrationShell);
            expect(result1).toBe('AAS');
            const result2 = getKeyTypeAbbreviation(KeyTypes.SubmodelElement);
            expect(result2).toBe('SME');
        });

        it('should return empty string for KeyType with no abbreviation', () => {
            const result1 = getKeyTypeAbbreviation(KeyTypes.Identifiable);
            expect(result1).toBe('');
            const result2 = getKeyTypeAbbreviation(KeyTypes.BasicEventElement);
            expect(result2).toBe('');
        });

        it('should return empty string for a non-enum (invalid type)', () => {
            const result = getKeyTypeAbbreviation('InvalidKeyType' as unknown as KeyTypes);
            expect(result).toBe('');
        });

        it('should return empty string for null/undefined input', () => {
            expect(getKeyTypeAbbreviation(null as any)).toBe('');
            expect(getKeyTypeAbbreviation(undefined as any)).toBe('');
        });

        it('should handle all defined KeyTypes correctly', () => {
            // Test all KeyTypes defined in the keyTypes array
            const testCases = [
                { keyType: KeyTypes.AnnotatedRelationshipElement, expected: 'RelA' },
                { keyType: KeyTypes.AssetAdministrationShell, expected: 'AAS' },
                { keyType: KeyTypes.BasicEventElement, expected: '' },
                { keyType: KeyTypes.Blob, expected: 'Blob' },
                { keyType: KeyTypes.Capability, expected: 'Cap' },
                { keyType: KeyTypes.ConceptDescription, expected: 'CD' },
                { keyType: KeyTypes.DataElement, expected: '' },
                { keyType: KeyTypes.Entity, expected: 'Ent' },
                { keyType: KeyTypes.EventElement, expected: 'Evt' },
                { keyType: KeyTypes.File, expected: 'File' },
                { keyType: KeyTypes.FragmentReference, expected: '' },
                { keyType: KeyTypes.GlobalReference, expected: 'GlobalRef' },
                { keyType: KeyTypes.Identifiable, expected: '' },
                { keyType: KeyTypes.MultiLanguageProperty, expected: 'MLP' },
                { keyType: KeyTypes.Operation, expected: 'Opr' },
                { keyType: KeyTypes.Property, expected: 'Prop' },
                { keyType: KeyTypes.Range, expected: 'Range' },
                { keyType: KeyTypes.Referable, expected: '' },
                { keyType: KeyTypes.ReferenceElement, expected: 'Ref' },
                { keyType: KeyTypes.RelationshipElement, expected: 'Rel' },
                { keyType: KeyTypes.Submodel, expected: 'SM' },
                { keyType: KeyTypes.SubmodelElement, expected: 'SME' },
                { keyType: KeyTypes.SubmodelElementCollection, expected: 'SMC' },
                { keyType: KeyTypes.SubmodelElementList, expected: 'SML' },
            ];

            testCases.forEach(({ keyType, expected }) => {
                const result = getKeyTypeAbbreviation(keyType);
                expect(result).toBe(expected);
            });
        });
    });
});
