import {
    DataTypeDefXsd,
    ISubmodelElement,
    LangStringTextType,
    ModellingKind,
    Operation,
    OperationVariable,
    Property,
    Submodel,
    SubmodelElementCollection,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { OperationRequest, OperationResult, PropertyValue } from '../../generated/SubmodelRepositoryService';

export function createTestSubmodel(): Submodel {
    const demoSubmodel = new Submodel(
        'https://example.com/ids/sm/123',
        null, // extensions
        null, // category
        'sampleIdentification', // idShort
        null, // displayName
        null, // description
        null, // administration
        ModellingKind.Instance
    );
    return demoSubmodel;
}

export function createTestSubmodelElement(): ISubmodelElement {
    const property = new Property(
        DataTypeDefXsd.Integer,
        null, // extensions
        null, // category
        'testProperty', // idShort (REQUIRED)
        null, // displayName
        null, // description
        null, // semanticId
        null, // supplementalSemanticIds
        null, // qualifiers
        null,
        '1984'
    );

    return property;
}

export function createNewSubmodelElement(): ISubmodelElement {
    const property = new Property(
        DataTypeDefXsd.Integer,
        null, // extensions
        null, // category
        'newProperty', // idShort (REQUIRED)
        null, // displayName
        null, // description
        null, // semanticId
        null, // supplementalSemanticIds
        null, // qualifiers
        null,
        '123'
    );

    return property;
}

export function createTestSubmodelElementCollection(): ISubmodelElement {
    const submodelElementCollection = new SubmodelElementCollection(
        null, // extensions
        null,
        'parentCollection',
        null,
        null,
        null,
        null,
        null,
        null,
        [createNewSubmodelElement()]
    );
    return submodelElementCollection;
}

export function createDescription(): LangStringTextType {
    return new LangStringTextType('en', 'Test Description for SubmodelElement');
}
export function createValue(): PropertyValue {
    return 'updatedPropertyValue';
}
export function createSemanticId(): string {
    return 'https://example.com/ids/sm/123';
}

export function createTestOperationElement(): ISubmodelElement {
    const inputProperty = new Property(
        DataTypeDefXsd.Double,
        null, // extensions
        null, // category
        'temperature', // idShort
        null, // displayName
        null, // description
        null, // semanticId
        null, // supplementalSemanticIds
        null, // qualifiers
        null, // embeddedDataSpecifications
        '25' // value
    );
    const inputVar = new OperationVariable(inputProperty);

    // Create output property
    const outputProperty = new Property(
        DataTypeDefXsd.String,
        null,
        null,
        'status',
        null,
        null,
        null,
        null,
        null,
        null,
        'ok'
    );

    const outputVar = new OperationVariable(outputProperty);
    const operation = new Operation(
        null, // extensions
        null, // category
        'testOperation', // idShort
        null, // displayName
        null, // description
        null, // semanticId
        null, // supplementalSemanticIds
        null, // qualifiers
        null, // embeddedDataSpecifications
        [inputVar],
        [outputVar],
        null // inoutputVariables
    );

    return operation;
}
export function createTestOperationRequest(): OperationRequest {
    return {
        inputArguments: [
            {
                value: {
                    idShort: 'temperature',
                    value: '25',
                    modelType: 'Property',
                },
            },
        ],
    };
}
export function createTestOperationResult(): OperationResult {
    return {
        success: true,
        outputArguments: [
            {
                value: {
                    idShort: 'status',
                    value: 'ok',
                    modelType: 'Property',
                },
            },
        ],
    };
}
