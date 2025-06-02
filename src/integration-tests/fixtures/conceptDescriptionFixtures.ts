import { ConceptDescription, LangStringTextType } from '@aas-core-works/aas-core3.0-typescript/types';

export function createTestCD(): ConceptDescription {
    const demoCD = new ConceptDescription('https://example.com/ids/cd/1234');
    return demoCD;
}

export function createDescription(): LangStringTextType {
    return new LangStringTextType('en', 'Test Description of CD');
}
