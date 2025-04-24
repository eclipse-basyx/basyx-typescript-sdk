import { jsonization } from '@aas-core-works/aas-core3.0-typescript';
import { Submodel as CoreSubmodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelRepositoryService } from '../../index';
import { convertApiSubmodelToCoreSubmodel, convertCoreSubmodelToApiSubmodel } from '../../lib/convertSubmodelTypes';

/**
 * Mock the jsonization methods used in convertSubmodelTypes.ts
 */
jest.mock('@aas-core-works/aas-core3.0-typescript', () => ({
    jsonization: {
        submodelFromJsonable: jest.fn(),
        toJsonable: jest.fn(),
    },
}));

// Define mock constants
const API_SUBMODEL: SubmodelRepositoryService.Submodel = {
    id: 'https://example.com/submodel/123',
    modelType: SubmodelRepositoryService.ModelType.Submodel,
};
const CORE_SUBMODEL: CoreSubmodel = new CoreSubmodel('https://example.com/submodel/123');
const JSONABLE_SUBMODEL: jsonization.JsonObject = {
    id: 'https://example.com/submodel/123',
    modelType: 'Submodel',
};

describe('convertSubmodelTypes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('convertApiSubmodelToCoreSubmodel', () => {
        it('should convert ApiSubmodel to CoreSubmodel successfully', () => {
            (jsonization.submodelFromJsonable as jest.Mock).mockReturnValue({
                error: null,
                mustValue: () => CORE_SUBMODEL,
            });

            const result = convertApiSubmodelToCoreSubmodel(API_SUBMODEL);

            expect(jsonization.submodelFromJsonable).toHaveBeenCalledWith(JSON.parse(JSON.stringify(API_SUBMODEL)));
            expect(result).toBe(CORE_SUBMODEL);
        });

        it('should throw an error if jsonization.submodelFromJsonable returns an error', () => {
            const error = new Error('Conversion failed');

            (jsonization.submodelFromJsonable as jest.Mock).mockReturnValue({
                error: error,
            });

            expect(() => convertApiSubmodelToCoreSubmodel(API_SUBMODEL)).toThrow(error);
            expect(jsonization.submodelFromJsonable).toHaveBeenCalledWith(JSON.parse(JSON.stringify(API_SUBMODEL)));
        });
    });

    describe('convertCoreSubmodelToApiSubmodel', () => {
        it('should convert CoreSubmodel to ApiSubmodel successfully', () => {
            (jsonization.toJsonable as jest.Mock).mockReturnValue(JSONABLE_SUBMODEL);

            const result = convertCoreSubmodelToApiSubmodel(CORE_SUBMODEL);

            expect(jsonization.toJsonable).toHaveBeenCalledWith(CORE_SUBMODEL);
            expect(result).toEqual(API_SUBMODEL);
        });
    });
});
