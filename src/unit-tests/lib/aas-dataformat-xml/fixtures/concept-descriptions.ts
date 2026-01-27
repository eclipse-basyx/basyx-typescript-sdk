import {
    AdministrativeInformation,
    ConceptDescription,
    DataSpecificationIec61360,
    DataTypeIec61360,
    EmbeddedDataSpecification,
    Key,
    KeyTypes,
    LangStringDefinitionTypeIec61360,
    LangStringPreferredNameTypeIec61360,
    LangStringShortNameTypeIec61360,
    LangStringTextType,
    LevelType,
    Reference,
    ReferenceTypes,
    ValueList,
    ValueReferencePair,
} from '@aas-core-works/aas-core3.1-typescript/types';

export function createTestConceptDescription(): ConceptDescription {
    return new ConceptDescription(
        'https://acplt.org/Test_ConceptDescription',
        null,
        null,
        'TestConceptDescription',
        null,
        [
            new LangStringTextType('en-us', 'An example concept description for the test application'),
            new LangStringTextType('de', 'Ein Beispiel-ConceptDescription für eine Test-Anwendung'),
        ],
        new AdministrativeInformation(null, '0', '9'),
        null,
        [
            new Reference(ReferenceTypes.ExternalReference, [
                new Key(
                    KeyTypes.GlobalReference,
                    'http://acplt.org/DataSpecifications/Conceptdescription/TestConceptDescription'
                ),
            ]),
        ]
    );
}

export function createTestConceptDescriptionMinimal(): ConceptDescription {
    return new ConceptDescription(
        'https://acplt.org/Test_ConceptDescription_Mandatory',
        null,
        null,
        'Test_ConceptDescription_Mandatory'
    );
}

export function createTestConceptDescription1(): ConceptDescription {
    return new ConceptDescription(
        'https://acplt.org/Test_ConceptDescription_Missing',
        null,
        'PROPERTY',
        'TestConceptDescription1',
        null,
        [
            new LangStringTextType('en-us', 'An example concept description for the test application'),
            new LangStringTextType('de', 'Ein Beispiel-ConceptDescription für eine Test-Anwendung'),
        ],
        new AdministrativeInformation(null, '0', '9'),
        null
    );
}

export function createTestConceptDescriptionFull(): ConceptDescription {
    return new ConceptDescription(
        'http://acplt.org/DataSpecifciations/Example/Identification',
        null,
        null,
        'TestSpec_01',
        null,
        null,
        new AdministrativeInformation(null, '0', '9'),
        [
            new EmbeddedDataSpecification(
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'https://admin-shell.io/aas/3/1/DataSpecificationIec61360'),
                ]),
                new DataSpecificationIec61360(
                    [
                        new LangStringPreferredNameTypeIec61360('de', 'Test Specification'),
                        new LangStringPreferredNameTypeIec61360('en-us', 'TestSpecification'),
                    ],
                    [
                        new LangStringShortNameTypeIec61360('de', 'Test Spec'),
                        new LangStringShortNameTypeIec61360('en-us', 'TestSpec'),
                    ],
                    'SpaceUnit',
                    new Reference(ReferenceTypes.ExternalReference, [
                        new Key(KeyTypes.GlobalReference, 'http://acplt.org/Units/SpaceUnit'),
                    ]),
                    'http://acplt.org/DataSpec/ExampleDef',
                    'SU',
                    DataTypeIec61360.RealMeasure,
                    [
                        new LangStringDefinitionTypeIec61360('de', 'Dies ist eine Data Specification für Testzwecke'),
                        new LangStringDefinitionTypeIec61360(
                            'en-us',
                            'This is a DataSpecification for testing purposes'
                        ),
                    ],
                    'string',
                    new ValueList([
                        new ValueReferencePair(
                            'http://acplt.org/ValueId/ExampleValueId',
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ExampleValueId'),
                            ])
                        ),
                        new ValueReferencePair(
                            'http://acplt.org/ValueId/ExampleValueId2',
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ExampleValueId2'),
                            ])
                        ),
                    ]),
                    'TEST',
                    new LevelType(false, false, false, true)
                )
            ),
        ],
        [
            new Reference(ReferenceTypes.ExternalReference, [
                new Key(KeyTypes.GlobalReference, 'http://acplt.org/ReferenceElements/ConceptDescriptionX'),
            ]),
        ]
    );
}
