import { LangStringTextType, ModellingKind, Submodel, ISubmodelElement,
     SubmodelElementList, SubmodelElementCollection, Property, DataTypeDefXsd } from '@aas-core-works/aas-core3.0-typescript/types';
import { AasSubmodelElements } from '../../generated/SubmodelRepositoryService';

export function createTestSubmodel(): Submodel {
    const demoSubmodel = new Submodel(
        'https://example.com/ids/submodel/123',
        null, // extensions
        null, // category
        null, // idShort
        null, // displayName
        null, // description
        null, // administration
        ModellingKind.Instance
    );
    //demoSubmodel.kind = ModellingKind.Instance;
    return demoSubmodel;
}

export function createTestSubmodelElement(): ISubmodelElement {
    const property = new Property(
        DataTypeDefXsd.Boolean ,
        null,                  // extensions
        null,                  // category
        'testProperty',        // idShort (REQUIRED)
        null,                    // displayName
        null,                    // description
        null,                  // semanticId
        null,                  // supplementalSemanticIds
        null,                  // qualifiers
        null,     
        '1984'      
    );
    
    return property;
}


export function createDescription(): LangStringTextType {
    return new LangStringTextType('en', 'Test Description for Submodel');
}

export function createSemanticId(): string {
    return 'https://example.com/ids/submodel/123';
}
