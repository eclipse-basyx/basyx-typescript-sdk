import {
    ISubmodelElement as CoreSubmodelElement,
    ModelType,
    Submodel,
    SubmodelElementCollection,
    SubmodelElementList,
} from '@aas-core-works/aas-core3.0-typescript/types';
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

const SEMANTIC_ID = JSON.stringify({
    type: 'ExternalReference',
    keys: [
        {
            type: 'GlobalReference',
            value: 'https://example.com/ids/sm/123',
        },
    ],
});
const CORE_SUBMODELELEMENT1: CoreSubmodelElement = {
    idShort: 'temperature',
    // Add other properties as needed
} as CoreSubmodelElement;

describe('SemanticIdUtils', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('checkSemanticId', () => {
        it('should check if the `semanticId` of a SubmodelElement matches the given `semanticId` successfully', () => {
            const result = checkSemanticId(CORE_SUBMODELELEMENT1, SEMANTIC_ID);
            expect(result).toBe(false);
        });
    });
});
