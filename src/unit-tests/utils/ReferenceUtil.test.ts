import {
    Key as CoreKey,
    KeyTypes,
    Reference as CoreReference,
    ReferenceTypes,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { extractId } from '../../utils/ReferenceUtil';

const CORE_REFERENCE1: CoreReference = new CoreReference(ReferenceTypes.ExternalReference, [
    new CoreKey(KeyTypes.GlobalReference, 'https://example.com/ids/submodel/7600_5912_3951_6917'),
]);

const CORE_REFERENCE2: CoreReference = new CoreReference(ReferenceTypes.ExternalReference, [
    new CoreKey(KeyTypes.ConceptDescription, 'https://example.com/ids/cd/1234'),
]);

describe('ReferenceUtil', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('extractId', () => {
        it('should extract the ID (Key) from the Reference object successfully', () => {
            const result = extractId(CORE_REFERENCE1, KeyTypes.GlobalReference);
            expect(result).toBe('https://example.com/ids/submodel/7600_5912_3951_6917');
        });

        it('should return empty string if no matching KeyType is found', () => {
            const result = extractId(CORE_REFERENCE2, KeyTypes.Submodel);
            expect(result).toBe('');
        });
    });
});
