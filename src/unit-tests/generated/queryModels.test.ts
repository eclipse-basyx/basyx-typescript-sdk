import {
    AasRegistryService,
    AasRepositoryService,
    ConceptDescriptionRepositoryService,
    SubmodelRegistryService,
    SubmodelRepositoryService,
} from '../../generated';
import { toJsonableQuery } from '../../lib/queryJsonization';
import {
    ContainsComparison,
    EndsWithComparison,
    FieldOperand,
    NumberLiteral,
    OrExpression,
    Query,
    RegexComparison,
    StartsWithComparison,
    StringCast,
    StringLiteral,
} from '../../models/Query';

// The generated Query models are checked by the type checker: string operations take operand objects, not strings.
// The repository specifications also contain the value-only `StringValue` (a string), which the generator merges with
// the `stringValue` operand of the query language, so the operand type is corrected after generation.
const condition = {
    $or: [
        { $contains: [{ $field: '$aas#idShort' }, { $strVal: 'Robot' }] },
        { '$starts-with': [{ $field: '$aas#idShort' }, { $strCast: { $numVal: 1 } }] },
        { '$ends-with': [{ $field: '$aas#idShort' }, { $strVal: 'bot' }] },
        { $regex: [{ $field: '$aas#idShort' }, { $strVal: '^R' }] },
    ],
};

const GENERATED_QUERIES = {
    AasRepositoryService: { $condition: condition } satisfies AasRepositoryService.Query,
    SubmodelRepositoryService: { $condition: condition } satisfies SubmodelRepositoryService.Query,
    ConceptDescriptionRepositoryService: {
        $condition: condition,
    } satisfies ConceptDescriptionRepositoryService.Query,
    AasRegistryService: { $condition: condition } satisfies AasRegistryService.Query,
    SubmodelRegistryService: { $condition: condition } satisfies SubmodelRegistryService.Query,
};

describe('generated Query models', () => {
    const query = new Query(
        new OrExpression([
            new ContainsComparison([new FieldOperand('$aas#idShort'), new StringLiteral('Robot')]),
            new StartsWithComparison([new FieldOperand('$aas#idShort'), new StringCast(new NumberLiteral(1))]),
            new EndsWithComparison([new FieldOperand('$aas#idShort'), new StringLiteral('bot')]),
            new RegexComparison([new FieldOperand('$aas#idShort'), new StringLiteral('^R')]),
        ])
    );

    it.each(Object.entries(GENERATED_QUERIES))('%s.Query accepts the JSON of the query model', (_, generated) => {
        expect(toJsonableQuery(query)).toEqual(generated);
    });
});
