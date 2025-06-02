import { jsonization } from '@aas-core-works/aas-core3.0-typescript';
import { ConceptDescription as CoreConceptDescription } from '@aas-core-works/aas-core3.0-typescript/types';
import { ConceptDescriptionRepositoryService } from '../../generated';
import { convertApiCDToCoreCD, convertCoreCDToApiCD } from '../../lib/convertConceptDescriptionTypes';

/**
 * Mock the jsonization methods used in convertConceptDescriptionTypes.ts
 */
jest.mock('@aas-core-works/aas-core3.0-typescript', () => ({
    jsonization: {
        conceptDescriptionFromJsonable: jest.fn(),
        toJsonable: jest.fn(),
    },
}));

// Define mock constants
const API_CD: ConceptDescriptionRepositoryService.ConceptDescription = {
    id: 'https://example.com/ids/cd/1234',
    modelType: ConceptDescriptionRepositoryService.ModelType.ConceptDescription,
};
const CORE_CD: CoreConceptDescription = new CoreConceptDescription('https://example.com/ids/cd/1234');
const JSONABLE_CD: jsonization.JsonObject = {
    id: 'https://example.com/ids/cd/1234',
    modelType: 'ConceptDescription',
    //assetInformation: { assetKind: 'Instance' },
};

describe('convertConceptDescriptionTypes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('convertApiCDToCoreCD', () => {
        it('should convert ApiConceptDescription to CoreConceptDescription successfully', () => {
            (jsonization.conceptDescriptionFromJsonable as jest.Mock).mockReturnValue({
                error: null,
                mustValue: () => CORE_CD,
            });

            const result = convertApiCDToCoreCD(API_CD);

            expect(jsonization.conceptDescriptionFromJsonable).toHaveBeenCalledWith(JSON.parse(JSON.stringify(API_CD)));
            expect(result).toBe(CORE_CD);
        });

        it('should throw an error if jsonization.conceptDescriptionFromJsonable returns an error', () => {
            const error = new Error('Conversion failed');

            (jsonization.conceptDescriptionFromJsonable as jest.Mock).mockReturnValue({
                error: error,
            });

            expect(() => convertApiCDToCoreCD(API_CD)).toThrow(error);
            expect(jsonization.conceptDescriptionFromJsonable).toHaveBeenCalledWith(JSON.parse(JSON.stringify(API_CD)));
        });
    });

    describe('convertCoreCDToApiCD', () => {
        it('should convert CoreConceptDescription to ApiConceptDescription successfully', () => {
            (jsonization.toJsonable as jest.Mock).mockReturnValue(JSONABLE_CD);

            const result = convertCoreCDToApiCD(CORE_CD);

            expect(jsonization.toJsonable).toHaveBeenCalledWith(CORE_CD);
            expect(result).toEqual(API_CD);
        });
    });
});
