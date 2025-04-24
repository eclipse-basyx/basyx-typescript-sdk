import { LangStringTextType, ModellingKind, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

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

export function createDescription(): LangStringTextType {
    return new LangStringTextType('en', 'Test Description for Submodel');
}

export function createSemanticId(): string {
    return 'https://example.com/ids/submodel/123';
}
