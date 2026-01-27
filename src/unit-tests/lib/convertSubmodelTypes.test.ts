import { jsonization } from '@aas-core-works/aas-core3.1-typescript';
import {
    ISubmodelElement as CoreSubmodelElement,
    Submodel as CoreSubmodel,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { SubmodelRepositoryService } from '../../generated';
import {
    convertApiSubmodelElementToCoreSubmodelElement,
    convertApiSubmodelToCoreSubmodel,
    convertCoreSubmodelElementToApiSubmodelElement,
    convertCoreSubmodelToApiSubmodel,
} from '../../lib/convertSubmodelTypes';

/**
 * Mock the jsonization methods used in convertSubmodelTypes.ts
 */
jest.mock('@aas-core-works/aas-core3.1-typescript', () => ({
    jsonization: {
        submodelFromJsonable: jest.fn(),
        toJsonable: jest.fn(),
        submodelElementFromJsonable: jest.fn(),
    },
}));

// Define mock constants
const API_SUBMODEL: SubmodelRepositoryService.Submodel = {
    id: 'https://example.com/ids/sm/123',
    modelType: SubmodelRepositoryService.ModelType.Submodel,
};
const CORE_SUBMODEL: CoreSubmodel = new CoreSubmodel('https://example.com/ids/sm/123');
const JSONABLE_SUBMODEL: jsonization.JsonObject = {
    id: 'https://example.com/ids/sm/123',
    modelType: 'Submodel',
};
const API_SUBMODELELEMENT: SubmodelRepositoryService.SubmodelElement = {
    modelType: SubmodelRepositoryService.ModelType.Property,
};
const CORE_SUBMODELELEMENT: CoreSubmodelElement = {} as CoreSubmodelElement;
const JSONABLE_SUBMODELELEMENT: jsonization.JsonObject = {
    modelType: 'Property',
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

    describe('convertApiSubmodelElementToCoreSubmodelElement', () => {
        it('should convert ApiSubmodelElement to CoreSubmodelElement successfully', () => {
            (jsonization.submodelElementFromJsonable as jest.Mock).mockReturnValue({
                error: null,
                mustValue: () => CORE_SUBMODELELEMENT,
            });

            const result = convertApiSubmodelElementToCoreSubmodelElement(API_SUBMODELELEMENT);

            expect(jsonization.submodelElementFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(API_SUBMODELELEMENT))
            );
            expect(result).toBe(CORE_SUBMODELELEMENT);
        });

        it('should throw an error if jsonization.submodelElementFromJsonable returns an error', () => {
            const error = new Error('Conversion failed');

            (jsonization.submodelElementFromJsonable as jest.Mock).mockReturnValue({
                error: error,
            });

            expect(() => convertApiSubmodelElementToCoreSubmodelElement(API_SUBMODELELEMENT)).toThrow(error);
            expect(jsonization.submodelElementFromJsonable).toHaveBeenCalledWith(
                JSON.parse(JSON.stringify(API_SUBMODELELEMENT))
            );
        });
    });

    describe('convertCoreSubmodelElementToApiSubmodelElement', () => {
        it('should convert CoreSubmodelElement to ApiSubmodelElement successfully', () => {
            (jsonization.toJsonable as jest.Mock).mockReturnValue(JSONABLE_SUBMODELELEMENT);

            const result = convertCoreSubmodelElementToApiSubmodelElement(CORE_SUBMODELELEMENT);

            expect(jsonization.toJsonable).toHaveBeenCalledWith(CORE_SUBMODELELEMENT);
            expect(result).toEqual(API_SUBMODELELEMENT);
        });
    });
});
