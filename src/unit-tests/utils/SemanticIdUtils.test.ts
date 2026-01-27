import {
    ISubmodelElement as CoreSubmodelElement,
    Key as CoreKey,
    KeyTypes,
    ModelType,
    Reference as CoreReference,
    ReferenceTypes,
    Submodel,
} from '@aas-core-works/aas-core3.1-typescript/types';
import {
    checkSemanticId,
    checkSemanticIdEclassIrdi,
    checkSemanticIdEclassIrdiUrl,
    checkSemanticIdIecCdd,
    checkSemanticIdIri,
    extractVersionRevision,
    getEquivalentEclassSemanticIds,
    getEquivalentIriSemanticIds,
    getSubmodelElementBySemanticId,
    getSubmodelElementsBySemanticId,
} from '../../utils/SemanticIdUtils';

// Helper function to create proper Reference with Keys
function createReference(keyValues: string[]): CoreReference {
    const keys = keyValues.map((value) => new CoreKey(KeyTypes.GlobalReference, value));
    return new CoreReference(ReferenceTypes.ExternalReference, keys);
}

// Helper function to create SubmodelElement with semantic ID
function createSubmodelElementWithSemanticId(keyValues: string[]): CoreSubmodelElement {
    const semanticId = createReference(keyValues);

    return {
        idShort: 'testElement',
        semanticId: semanticId,
    } as CoreSubmodelElement;
}

// const CORE_SUBMODELELEMENT_WITH_HTTP_SEMANTIC_ID: CoreSubmodelElement = createSubmodelElementWithSemanticId([
//     'https://example.com/ids/sm/123'
// ]);
// const ELEMENT_WITH_NO_SEMANTIC_ID: CoreSubmodelElement = {
//     idShort: 'temperature',
// } as CoreSubmodelElement;
// const ELEMENT_WITH_CUSTOM_SEMANTIC_ID = createSubmodelElementWithSemanticId(['sample-id-123']);
// const ELEMENT_WITH_HTTP_SEMANTIC_ID = createSubmodelElementWithSemanticId(['https://example.com/ids/sm/123']);
// const ELEMENT_WITH_ECLASS_SEMANTIC_ID = createSubmodelElementWithSemanticId(['0173-1#01-AHF578#001']);
// const ELEMENT_WITH_IEC_CDD_SEMANTIC_ID = createSubmodelElementWithSemanticId(['0112/2///61987#ABN590#002']);
// const ELEMENT_WITH_EMPTY_KEYS = createSubmodelElementWithSemanticId([]);

describe('SemanticIdUtils', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('checkSemanticId', () => {
        // IRIs
        const iriWithSlashEnding = 'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/';
        const iriWithoutSlashEnding = 'https://admin-shell.io/zvei/nameplate/2/0/Nameplate';
        const iriWithVersionWithSlashEnding = 'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprint/0/9/';
        const iriWithVersionWithoutSlashEnding =
            'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprint/0/9';
        //const iriWithoutVersionWithSlashEnding = 'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprint/';
        const iriWithoutVersionWithoutSlashEnding =
            'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprint';
        const iriSMContactInformations = 'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations';
        const iriSMCContactInformation =
            'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation';

        // Eclass IRDI
        const eclassIrdiWithVersion = '0173-1#01-AHF578#001';
        const eclassIrdiWithoutVersion = '0173-1#01-AHF578';
        //const eclassIrdiWithVersionAndCardinality = '0173-1#02-ABI502#001/0173-1#01-AHF581#001*02';
        //const eclassIrdiWithVersionAndNoCardinality = '0173-1#02-ABI502#001/0173-1#01-AHF581#001';
        const eclassIrdiSlashesWithVersion = '0173/1///01#AHF578#001';
        const eclassIrdiSlashesWithoutVersion = '0173/1///01#AHF578';

        // Eclass IRI
        const eclassIriWithVersion = 'https://api.eclass-cdp.com/0173-1-01-AHF578-001';
        const eclassIriWithoutVersion = 'https://api.eclass-cdp.com/0173-1-01-AHF578';
        //const eclassIriWithVersionAndCardinality = 'https://api.eclass-cdp.com/0173-1-01-AHF578-001~1';
        //const eclassIriWithVersionAndNoCardinality = 'https://api.eclass-cdp.com/0173-1-01-AHF578';

        // IEC CDD
        const ieccddIrdiWithVersion = '0112/2///61987#ABN590#002';
        const ieccddIrdiWithOutVersion = '0112/2///61987#ABN590';

        // Matrix of test cases
        const semanticIdTestCombinations = [
            { semanticId: iriSMContactInformations, submodelElementSemanticId: iriSMCContactInformation, match: false },
            { semanticId: iriWithSlashEnding, submodelElementSemanticId: iriWithoutSlashEnding, match: true },
            {
                semanticId: iriWithVersionWithSlashEnding,
                submodelElementSemanticId: iriWithVersionWithoutSlashEnding,
                match: true,
            },
            {
                semanticId: iriWithoutVersionWithoutSlashEnding,
                submodelElementSemanticId: iriWithVersionWithSlashEnding,
                match: true,
            },

            { semanticId: eclassIrdiWithVersion, submodelElementSemanticId: eclassIrdiWithoutVersion, match: false },
            { semanticId: eclassIrdiWithoutVersion, submodelElementSemanticId: eclassIrdiWithVersion, match: true },

            {
                semanticId: eclassIrdiSlashesWithVersion,
                submodelElementSemanticId: eclassIrdiSlashesWithoutVersion,
                match: false,
            },
            {
                semanticId: eclassIrdiSlashesWithoutVersion,
                submodelElementSemanticId: eclassIrdiSlashesWithVersion,
                match: true,
            },

            { semanticId: eclassIriWithVersion, submodelElementSemanticId: eclassIriWithoutVersion, match: false },
            { semanticId: eclassIriWithoutVersion, submodelElementSemanticId: eclassIriWithVersion, match: true },

            { semanticId: ieccddIrdiWithVersion, submodelElementSemanticId: ieccddIrdiWithOutVersion, match: false },
            { semanticId: ieccddIrdiWithOutVersion, submodelElementSemanticId: ieccddIrdiWithVersion, match: true },

            // Cross-formats
            { semanticId: eclassIrdiWithVersion, submodelElementSemanticId: eclassIriWithVersion, match: true },
            { semanticId: eclassIrdiSlashesWithVersion, submodelElementSemanticId: eclassIriWithVersion, match: true },
            {
                semanticId: eclassIrdiSlashesWithoutVersion,
                submodelElementSemanticId: eclassIriWithVersion,
                match: true,
            },
        ];

        semanticIdTestCombinations.forEach(({ semanticId, submodelElementSemanticId, match }) => {
            it(`checkSemanticId(${semanticId}, ${submodelElementSemanticId}) should be ${match}`, () => {
                const sme = createSubmodelElementWithSemanticId([submodelElementSemanticId]);
                expect(checkSemanticId(sme, semanticId)).toBe(match);
            });
        });
    });

    describe('checkSemanticIdEclassIrdi', () => {
        it('should check if a given EClass IRDI semantic ID matches an equivalent key value successfully with 0173-1# format', () => {
            const result = checkSemanticIdEclassIrdi('0173-1#01-AHF578#001', '0173-1#01-AHF578');
            expect(result).toBe(true);
        });

        it('should check if a given EClass IRDI semantic ID matches an equivalent key value successfully with 0173/1/// format', () => {
            const result = checkSemanticIdEclassIrdi('0173/1///01#AHF578#001', '0173/1///01#AHF578#001');
            expect(result).toBe(true);
        });

        it('should return false for empty semanticId string', () => {
            const result = checkSemanticIdEclassIrdi('0173-1#', '');
            expect(result).toBe(false);
        });

        it('should return false  when keyValue does not start with expected format', () => {
            const result = checkSemanticIdEclassIrdi('invalid-key', '0173-1#01-AHF578#001');
            expect(result).toBe(false);
        });
    });

    describe('checkSemanticIdEclassIrdiUrl', () => {
        it('should check if a given EClass IRDI URL semantic ID matches an equivalent key value successfully', () => {
            const result = checkSemanticIdEclassIrdiUrl(
                'https://api.eclass-cdp.com/0173-1-23',
                'https://api.eclass-cdp.com/0173-1'
            );
            expect(result).toBe(true);
        });

        it('should return false for empty semanticId string', () => {
            const result = checkSemanticIdEclassIrdiUrl('https://api.eclass-cdp.com/0173-1', '');
            expect(result).toBe(false);
        });

        it('should return false when keyValue does not start with expected format', () => {
            const result = checkSemanticIdEclassIrdiUrl(
                'https://invalid.com/test',
                'https://api.eclass-cdp.com/0173-1-23'
            );
            expect(result).toBe(false);
        });
    });

    describe('checkSemanticIdIecCdd', () => {
        it('should check if a given IEC CDD semantic ID matches the equivalent key value successfully', () => {
            const result = checkSemanticIdIecCdd('0112/xyz', '0112/');
            expect(result).toBe(true);
        });

        it('should return false for empty semanticId string', () => {
            const result = checkSemanticIdIecCdd('0112/', '');
            expect(result).toBe(false);
        });

        it('should return false when semanticId does not start with 0112/', () => {
            const result = checkSemanticIdIecCdd('0112/test', 'invalid-prefix');
            expect(result).toBe(false);
        });

        it('should return false when keyValue does not start with 0112/', () => {
            const result = checkSemanticIdIecCdd('invalid-prefix', '0112/test');
            expect(result).toBe(false);
        });
    });

    describe('checkSemanticIdIri', () => {
        it('should return true for matching IRIs (case-insensitive, with/without trailing slash)', () => {
            const iri1 = 'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprint/0/9';
            const iri2 = 'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprint/0/9/';
            expect(checkSemanticIdIri(iri1, iri2)).toBe(true);
            expect(checkSemanticIdIri(iri2, iri1)).toBe(true);
        });
        it('should return false for non-matching IRIs', () => {
            const result = checkSemanticIdIri('https://admin-shell.io/foo', 'https://admin-shell.io/bar');
            expect(result).toBe(false);
        });
        it('should return false for empty semanticId', () => {
            const result = checkSemanticIdIri('https://admin-shell.io/foo', '');
            expect(result).toBe(false);
        });

        it('should return false when semanticId is not http/https', () => {
            const result = checkSemanticIdIri('https://example.com/test', 'ftp://invalid.com');
            expect(result).toBe(false);
        });

        it('should return false when keyValue is not http/https', () => {
            const result = checkSemanticIdIri('ftp://invalid.com', 'https://example.com/test');
            expect(result).toBe(false);
        });
    });

    describe('getEquivalentEclassSemanticIds', () => {
        const equivalentEclassSemanticIds = [
            {
                testId: 'f53aef0c-dfc8-4408-b803-f501cba3122a',
                semanticId: '0173-1#01-AHF578#001',
                semanticIds: [
                    '0173-1#01-AHF578#001',
                    '0173/1///01#AHF578#001',
                    'https://api.eclass-cdp.com/0173-1-01-AHF578-001',
                ],
            },
            {
                testId: '7106149a-b8fa-4059-9776-d2e37ad35fd2',
                semanticId: '0173-1#01-AHF578',
                semanticIds: ['0173-1#01-AHF578', '0173/1///01#AHF578', 'https://api.eclass-cdp.com/0173-1-01-AHF578'],
            },
        ];

        equivalentEclassSemanticIds.forEach(function (testCase) {
            it(`${testCase.testId}: getEquivalentEclassSemanticIds('${testCase.semanticId}') should return all equivalent forms`, () => {
                expect(getEquivalentEclassSemanticIds(testCase.semanticId).sort()).toStrictEqual(
                    testCase.semanticIds.sort()
                );
            });
        });

        it('should return empty array for invalid input', () => {
            const result = getEquivalentEclassSemanticIds('foo');
            expect(result).toEqual([]);
        });
    });

    describe('getEquivalentIriSemanticIds', () => {
        const equivalentIriSemanticIds = [
            {
                testId: '71eeb554-da62-4f91-85b2-bd2be844ada0',
                semanticId: 'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/',
                semanticIds: [
                    'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/',
                    'https://admin-shell.io/zvei/nameplate/2/0/Nameplate',
                ],
            },
            {
                testId: 'e518544c-f874-4b45-a9b0-442d0c740af9',
                semanticId: 'https://admin-shell.io/zvei/nameplate/2/0/Nameplate',
                semanticIds: [
                    'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/',
                    'https://admin-shell.io/zvei/nameplate/2/0/Nameplate',
                ],
            },
        ];

        equivalentIriSemanticIds.forEach(function (testCase) {
            it(`${testCase.testId}: getEquivalentIriSemanticIds('${testCase.semanticId}') should return both with and without trailing slash`, () => {
                expect(getEquivalentIriSemanticIds(testCase.semanticId).sort()).toStrictEqual(
                    testCase.semanticIds.sort()
                );
            });
        });

        it('should return empty array for invalid input', () => {
            const result = getEquivalentIriSemanticIds('foo');
            expect(result).toEqual([]);
        });
    });

    describe('extractVersionRevision', () => {
        it('should extract version and revision from semanticId', () => {
            expect(extractVersionRevision('https://admin-shell.io/zvei/nameplate/1/0/ContactInformations')).toEqual({
                version: '1',
                revision: '0',
            });
        });
        it('should return empty strings for no match', () => {
            expect(extractVersionRevision('foo')).toEqual({ version: '', revision: '' });
        });
    });

    describe('getSubmodelElementBySemanticId', () => {
        it('should return the SME with matching semanticId', () => {
            const sme = createSubmodelElementWithSemanticId(['https://example.com/ids/sm/123']);
            const submodel = {
                modelType: () => ModelType.Submodel,
                submodelElements: [sme],
            } as unknown as Submodel;
            const result = getSubmodelElementBySemanticId('https://example.com/ids/sm/123', submodel);
            expect(result).toBe(sme);
        });

        it('should return undefined if no match', () => {
            const submodel = {
                modelType: () => ModelType.Submodel,
                submodelElements: [],
            } as unknown as Submodel;
            const result = getSubmodelElementBySemanticId('https://example.com/ids/sm/123', submodel);
            expect(result).toBeUndefined();
        });

        it('should return undefined for empty semanticId', () => {
            const submodel = {
                modelType: () => ModelType.Submodel,
                submodelElements: [],
            } as unknown as Submodel;

            const result = getSubmodelElementBySemanticId('', submodel);
            expect(result).toBeUndefined();
        });
    });

    describe('getSubmodelElementsBySemanticId', () => {
        it('should return all SMEs with matching semanticId', () => {
            const sme1 = createSubmodelElementWithSemanticId(['https://example.com/ids/sm/123']);
            const sme2 = createSubmodelElementWithSemanticId(['https://example.com/ids/sm/123']);
            const submodel = {
                modelType: () => ModelType.Submodel,
                submodelElements: [sme1, sme2],
            } as unknown as Submodel;

            const result = getSubmodelElementsBySemanticId('https://example.com/ids/sm/123', submodel);
            expect(result).toEqual([sme1, sme2]);
        });

        it('should return empty array if no match', () => {
            const submodel = {
                modelType: () => ModelType.Submodel,
                submodelElements: [],
            } as unknown as Submodel;

            const result = getSubmodelElementsBySemanticId('https://example.com/ids/sm/123', submodel);
            expect(result).toEqual([]);
        });

        it('should return empty array for empty semanticId', () => {
            const submodel = {
                modelType: () => ModelType.Submodel,
                submodelElements: [],
            } as unknown as Submodel;

            const result = getSubmodelElementsBySemanticId('', submodel);
            expect(result).toEqual([]);
        });
    });
});
