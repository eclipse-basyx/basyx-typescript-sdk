import {
    AasSubmodelElements,
    AdministrativeInformation,
    AnnotatedRelationshipElement,
    BasicEventElement,
    Blob,
    Capability,
    DataTypeDefXsd,
    Direction,
    Entity,
    EntityType,
    File,
    Key,
    KeyTypes,
    LangStringNameType,
    LangStringTextType,
    ModellingKind,
    MultiLanguageProperty,
    Operation,
    OperationVariable,
    Property,
    Qualifier,
    Range,
    Reference,
    ReferenceElement,
    ReferenceTypes,
    RelationshipElement,
    StateOfEvent,
    Submodel,
    SubmodelElementCollection,
    SubmodelElementList,
} from '@aas-core-works/aas-core3.0-typescript/types';

export function createTestSubmodelIdentification(): Submodel {
    return new Submodel(
        'http://acplt.org/Submodels/Assets/TestAsset/Identification',
        null,
        null,
        'Identification',
        null,
        [
            new LangStringTextType('en-us', 'An example asset identification submodel for the test application'),
            new LangStringTextType('de', 'Ein Beispiel-Identifikations-Submodel für eine Test-Anwendung'),
        ],
        new AdministrativeInformation(null, '0', '9'),
        ModellingKind.Instance,
        new Reference(ReferenceTypes.ExternalReference, [
            new Key(KeyTypes.Submodel, 'http://acplt.org/SubmodelTemplates/AssetIdentification'),
        ]),
        null,
        null,
        null,
        [
            new Property(
                DataTypeDefXsd.String,
                null,
                null,
                'ManufacturerName',
                [new LangStringNameType('en-us', 'Manufacturer Name')],
                [
                    new LangStringTextType(
                        'en-us',
                        'Legally valid designation of the natural or judicial person which is directly responsible for the design, production, packaging and labeling of a product in respect to its being brought into circulation.'
                    ),
                    new LangStringTextType(
                        'de',
                        "Bezeichnung für eine natürliche oder juristische Person, die für die Auslegung, Herstellung und Verpackung sowie die Etikettierung eines Produkts im Hinblick auf das 'Inverkehrbringen' im eigenen Namen verantwortlich ist"
                    ),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, '0173-1#02-AAO677#002'),
                ]),
                null,
                [
                    new Qualifier(
                        'http://acplt.org/Qualifier/ExampleQualifier',
                        DataTypeDefXsd.Int,
                        null,
                        null,
                        null,
                        '100'
                    ),
                    new Qualifier(
                        'http://acplt.org/Qualifier/ExampleQualifier2',
                        DataTypeDefXsd.Int,
                        null,
                        null,
                        null,
                        '50'
                    ),
                ],
                null,
                'http://acplt.org/ValueId/ACPLT',
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ACPLT'),
                ])
            ),
            new Property(
                DataTypeDefXsd.String,
                null,
                'VARIABLE',
                'InstanceId',
                null,
                [
                    new LangStringTextType(
                        'en-us',
                        'Legally valid designation of the natural or judicial person which is directly responsible for the design, production, packaging and labeling of a product in respect to its being brought into circulation.'
                    ),
                    new LangStringTextType(
                        'de',
                        "Bezeichnung für eine natürliche oder juristische Person, die für die Auslegung, Herstellung und Verpackung sowie die Etikettierung eines Produkts im Hinblick auf das 'Inverkehrbringen' im eigenen Namen verantwortlich ist"
                    ),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://opcfoundation.org/UA/DI/1.1/DeviceType/Serialnumber'),
                ]),
                [
                    new Reference(ReferenceTypes.ExternalReference, [
                        new Key(KeyTypes.GlobalReference, 'something_random_e14ad770'),
                    ]),
                    new Reference(ReferenceTypes.ExternalReference, [
                        new Key(KeyTypes.GlobalReference, 'something_random_bd061acd'),
                    ]),
                ],
                null,
                null,
                '978-8234-234-342',
                new Reference(ReferenceTypes.ExternalReference, [new Key(KeyTypes.GlobalReference, '978-8234-234-342')])
            ),
        ]
    );
}

export function createTestSubmodelBillOfMaterials(): Submodel {
    return new Submodel(
        'http://acplt.org/Submodels/Assets/TestAsset/BillOfMaterial',
        null,
        null,
        'BillOfMaterial',
        null,
        [
            new LangStringTextType('en-us', 'An example bill of material submodel for the test application'),
            new LangStringTextType('de', 'Ein Beispiel-BillofMaterial-Submodel für eine Test-Anwendung'),
        ],
        new AdministrativeInformation(null, '0'),
        ModellingKind.Instance,
        new Reference(ReferenceTypes.ExternalReference, [
            new Key(KeyTypes.Submodel, 'http://acplt.org/SubmodelTemplates/BillOfMaterial'),
        ]),
        null,
        null,
        null,
        [
            new Entity(
                EntityType.CoManagedEntity,
                null,
                null,
                'ExampleEntity',
                null,
                [
                    new LangStringTextType(
                        'en-us',
                        'Legally valid designation of the natural or judicial person which is directly responsible for the design, production, packaging and labeling of a product in respect to its being brought into circulation.'
                    ),
                    new LangStringTextType(
                        'de',
                        "Bezeichnung für eine natürliche oder juristische Person, die für die Auslegung, Herstellung und Verpackung sowie die Etikettierung eines Produkts im Hinblick auf das 'Inverkehrbringen' im eigenen Namen verantwortlich ist"
                    ),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://opcfoundation.org/UA/DI/1.1/DeviceType/Serialnumber'),
                ]),
                null,
                null,
                null,
                [
                    new Property(
                        DataTypeDefXsd.String,
                        null,
                        'CONSTANT',
                        'ExampleProperty2',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Property object'),
                            new LangStringTextType('de', 'Beispiel Property Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                        ]),
                        null,
                        null,
                        null,
                        'http://acplt.org/ValueId/ExampleValue2',
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ExampleValue2'),
                        ])
                    ),
                    new Property(
                        DataTypeDefXsd.String,
                        null,
                        'CONSTANT',
                        'ExampleProperty',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Property object'),
                            new LangStringTextType('de', 'Beispiel Property Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                        ]),
                        null,
                        null,
                        null,
                        'http://acplt.org/ValueId/ExampleValueId',
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ExampleValueId'),
                        ])
                    ),
                ]
            ),
            new Entity(
                EntityType.SelfManagedEntity,
                null,
                null,
                'ExampleEntity2',
                null,
                [
                    new LangStringTextType(
                        'en-us',
                        'Legally valid designation of the natural or judicial person which is directly responsible for the design, production, packaging and labeling of a product in respect to its being brought into circulation.'
                    ),
                    new LangStringTextType(
                        'de',
                        "Bezeichnung für eine natürliche oder juristische Person, die für die Auslegung, Herstellung und Verpackung sowie die Etikettierung eines Produkts im Hinblick auf das 'Inverkehrbringen' im eigenen Namen verantwortlich ist"
                    ),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://opcfoundation.org/UA/DI/1.1/DeviceType/Serialnumber'),
                ]),
                null,
                null,
                null,
                null,
                'https://acplt.org/Test_Asset2'
            ),
        ]
    );
}

export function createTestSubmodel1(): Submodel {
    return new Submodel(
        'https://acplt.org/Test_Submodel',
        null,
        null,
        'TestSubmodel',
        null,
        [
            new LangStringTextType('en-us', 'An example submodel for the test application'),
            new LangStringTextType('de', 'Ein Beispiel-Teilmodell für eine Test-Anwendung'),
        ],
        new AdministrativeInformation(null, '0', '9'),
        ModellingKind.Instance,
        new Reference(ReferenceTypes.ExternalReference, [
            new Key(KeyTypes.GlobalReference, 'http://acplt.org/SubmodelTemplates/ExampleSubmodel'),
        ]),
        null,
        null,
        null,
        [
            new RelationshipElement(
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel'),
                    new Key(KeyTypes.SubmodelElementList, 'ExampleSubmodelElementListOrdered'),
                    new Key(KeyTypes.Property, 'ExampleProperty'),
                ]),
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'http://acplt.org/Submodels/Assets/TestAsset/BillOfMaterial'),
                    new Key(KeyTypes.Entity, 'ExampleEntity'),
                    new Key(KeyTypes.Property, 'ExampleProperty2'),
                ]),
                null,
                'PARAMETER',
                'ExampleRelationshipElement',
                null,
                [
                    new LangStringTextType('en-us', 'Example RelationshipElement object'),
                    new LangStringTextType('de', 'Beispiel RelationshipElement Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://acplt.org/RelationshipElements/ExampleRelationshipElement'
                    ),
                ])
            ),
            new AnnotatedRelationshipElement(
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel'),
                    new Key(KeyTypes.SubmodelElementList, 'ExampleSubmodelElementListOrdered'),
                    new Key(KeyTypes.Property, 'ExampleProperty'),
                ]),
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'http://acplt.org/Submodels/Assets/TestAsset/BillOfMaterial'),
                    new Key(KeyTypes.Entity, 'ExampleEntity'),
                    new Key(KeyTypes.Property, 'ExampleProperty2'),
                ]),
                null,
                'PARAMETER',
                'ExampleAnnotatedRelationshipElement',
                null,
                [
                    new LangStringTextType('en-us', 'Example AnnotatedRelationshipElement object'),
                    new LangStringTextType('de', 'Beispiel AnnotatedRelationshipElement Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://acplt.org/RelationshipElements/ExampleAnnotatedRelationshipElement'
                    ),
                ]),
                null,
                null,
                null,
                [
                    new Property(
                        DataTypeDefXsd.String,
                        null,
                        'PARAMETER',
                        'ExampleProperty3',
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        'some example annotation'
                    ),
                ]
            ),
            new Operation(
                null,
                'PARAMETER',
                'ExampleOperation',
                null,
                [
                    new LangStringTextType('en-us', 'Example Operation object'),
                    new LangStringTextType('de', 'Beispiel Operation Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://acplt.org/Operations/ExampleOperation'),
                ]),
                null,
                null,
                null,
                [
                    new OperationVariable(
                        new Property(
                            DataTypeDefXsd.String,
                            null,
                            'CONSTANT',
                            'ExampleProperty1',
                            null,
                            [
                                new LangStringTextType('en-us', 'Example Property object'),
                                new LangStringTextType('de', 'Beispiel Property Element'),
                            ],
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                            ]),
                            null,
                            null,
                            null,
                            'http://acplt.org/ValueId/ExampleValueId',
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ExampleValueId'),
                            ])
                        )
                    ),
                    new OperationVariable(
                        new Property(
                            DataTypeDefXsd.String,
                            null,
                            'CONSTANT',
                            'ExampleProperty2',
                            null,
                            [
                                new LangStringTextType('en-us', 'Example Property object'),
                                new LangStringTextType('de', 'Beispiel Property Element'),
                            ],
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                            ]),
                            null,
                            null,
                            null,
                            'http://acplt.org/ValueId/ExampleValueId',
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ExampleValueId'),
                            ])
                        )
                    ),
                ],
                [
                    new OperationVariable(
                        new Property(
                            DataTypeDefXsd.String,
                            null,
                            'CONSTANT',
                            'ExampleProperty2',
                            null,
                            [
                                new LangStringTextType('en-us', 'Example Property object'),
                                new LangStringTextType('de', 'Beispiel Property Element'),
                            ],
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                            ]),
                            null,
                            null,
                            null,
                            'http://acplt.org/ValueId/ExampleValueId',
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ExampleValueId'),
                            ])
                        )
                    ),
                ],
                [
                    new OperationVariable(
                        new Property(
                            DataTypeDefXsd.String,
                            null,
                            'CONSTANT',
                            'ExampleProperty3',
                            null,
                            [
                                new LangStringTextType('en-us', 'Example Property object'),
                                new LangStringTextType('de', 'Beispiel Property Element'),
                            ],
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                            ]),
                            null,
                            null,
                            null,
                            'http://acplt.org/ValueId/ExampleValueId',
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ExampleValueId'),
                            ])
                        )
                    ),
                ]
            ),
            new Capability(
                null,
                'PARAMETER',
                'ExampleCapability',
                null,
                [
                    new LangStringTextType('en-us', 'Example Capability object'),
                    new LangStringTextType('de', 'Beispiel Capability Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://acplt.org/Capabilities/ExampleCapability'),
                ])
            ),
            new BasicEventElement(
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel'),
                    new Key(KeyTypes.SubmodelElementList, 'ExampleSubmodelElementListOrdered'),
                    new Key(KeyTypes.Property, 'ExampleProperty'),
                ]),
                Direction.Input,
                StateOfEvent.On,
                null,
                'PARAMETER',
                'ExampleBasicEvent',
                null,
                [
                    new LangStringTextType('en-us', 'Example BasicEvent object'),
                    new LangStringTextType('de', 'Beispiel BasicEvent Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://acplt.org/Events/ExampleBasicEvent'),
                ]),
                null,
                null,
                null,
                null,
                null,
                null
            ),
            new SubmodelElementList(
                AasSubmodelElements.SubmodelElement,
                null,
                'PARAMETER',
                'ExampleSubmodelElementListOrdered',
                null,
                [
                    new LangStringTextType('en-us', 'Example ExampleSubmodelElementListOrdered object'),
                    new LangStringTextType('de', 'Beispiel ExampleSubmodelElementListOrdered Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://acplt.org/SubmodelElementLists/ExampleSubmodelElementListOrdered'
                    ),
                ]),
                null,
                null,
                null,
                true,
                null,
                null,
                [
                    new Property(
                        DataTypeDefXsd.String,
                        null,
                        'CONSTANT',
                        'ExampleProperty',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Property object'),
                            new LangStringTextType('de', 'Beispiel Property Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                        ]),
                        null,
                        null,
                        null,
                        'http://acplt.org/ValueId/ExampleValueId',
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ExampleValueId'),
                        ])
                    ),
                    new MultiLanguageProperty(
                        null,
                        'CONSTANT',
                        'ExampleMultiLanguageProperty',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example MultiLanguageProperty object'),
                            new LangStringTextType('de', 'Beispiel MultiLanguageProperty Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(
                                KeyTypes.GlobalReference,
                                'http://acplt.org/MultiLanguageProperties/ExampleMultiLanguageProperty'
                            ),
                        ]),
                        null,
                        null,
                        null,
                        [
                            new LangStringTextType('en-us', 'Example value of a MultiLanguageProperty element'),
                            new LangStringTextType('de', 'Beispielswert für ein MultiLanguageProperty-Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ExampleMultiLanguageValueId'),
                        ])
                    ),
                    new Range(
                        DataTypeDefXsd.Int,
                        null,
                        'PARAMETER',
                        'ExampleRange',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Range object'),
                            new LangStringTextType('de', 'Beispiel Range Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Ranges/ExampleRange'),
                        ]),
                        null,
                        null,
                        null,
                        '0',
                        '100'
                    ),
                ]
            ),
            new SubmodelElementCollection(
                null,
                'PARAMETER',
                'ExampleSubmodelElementCollection',
                null,
                [
                    new LangStringTextType('en-us', 'Example SubmodelElementCollection object'),
                    new LangStringTextType('de', 'Beispiel SubmodelElementCollection Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://acplt.org/SubmodelElementCollections/ExampleSubmodelElementCollection'
                    ),
                ]),
                null,
                null,
                null,
                [
                    new Blob(
                        'application/pdf',
                        null,
                        'PARAMETER',
                        'ExampleBlob',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Blob object'),
                            new LangStringTextType('de', 'Beispiel Blob Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Blobs/ExampleBlob'),
                        ]),
                        null,
                        null,
                        null,
                        Uint8Array.from(Buffer.from('AQIDBAU=', 'base64'))
                    ),
                    new File(
                        'application/pdf',
                        null,
                        'PARAMETER',
                        'ExampleFile',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example File object'),
                            new LangStringTextType('de', 'Beispiel File Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Files/ExampleFile'),
                        ]),
                        null,
                        null,
                        null,
                        'file:///TestFile.pdf'
                    ),
                    new ReferenceElement(
                        null,
                        'PARAMETER',
                        'ExampleReferenceElement',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Reference Element object'),
                            new LangStringTextType('de', 'Beispiel Reference Element Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(
                                KeyTypes.GlobalReference,
                                'http://acplt.org/ReferenceElements/ExampleReferenceElement'
                            ),
                        ]),
                        null,
                        null,
                        null,
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel'),
                            new Key(KeyTypes.SubmodelElementList, 'ExampleSubmodelElementListOrdered'),
                            new Key(KeyTypes.Property, 'ExampleProperty'),
                        ])
                    ),
                ]
            ),
        ]
    );
}

export function createTestSubmodelMandatory(): Submodel {
    return new Submodel(
        'https://acplt.org/Test_Submodel_Mandatory',
        null,
        null,
        'Test_Submodel_Mandatory',
        null,
        null,
        null,
        ModellingKind.Template,
        null,
        null,
        null,
        null,
        [
            new RelationshipElement(
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Mandatory'),
                    new Key(KeyTypes.SubmodelElementList, 'ExampleSubmodelElementListUnordered'),
                    new Key(KeyTypes.Property, 'ExampleProperty'),
                ]),
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Mandatory'),
                    new Key(KeyTypes.SubmodelElementList, 'ExampleSubmodelElementListUnordered'),
                    new Key(KeyTypes.MultiLanguageProperty, 'ExampleMultiLanguageProperty'),
                ]),
                null,
                null,
                'ExampleRelationshipElement'
            ),
            new AnnotatedRelationshipElement(
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Mandatory'),
                    new Key(KeyTypes.SubmodelElementCollection, 'ExampleSubmodelElementCollection'),
                    new Key(KeyTypes.Blob, 'ExampleBlob'),
                ]),
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Mandatory'),
                    new Key(KeyTypes.SubmodelElementList, 'ExampleSubmodelElementListUnordered'),
                    new Key(KeyTypes.MultiLanguageProperty, 'ExampleMultiLanguageProperty'),
                ]),
                null,
                null,
                'ExampleAnnotatedRelationshipElement'
            ),
            new Operation(null, null, 'ExampleOperation'),
            new Capability(null, null, 'ExampleCapability'),
            new BasicEventElement(
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Mandatory'),
                    new Key(KeyTypes.SubmodelElementList, 'ExampleSubmodelElementListUnordered'),
                    new Key(KeyTypes.Property, 'ExampleProperty'),
                ]),
                Direction.Output,
                StateOfEvent.Off,
                null,
                null,
                'ExampleBasicEvent'
            ),
            new SubmodelElementList(
                AasSubmodelElements.SubmodelElement,
                null,
                null,
                'ExampleSubmodelElementListUnordered',
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                [
                    new Property(DataTypeDefXsd.String, null, null, 'ExampleProperty'),
                    new MultiLanguageProperty(null, null, 'ExampleMultiLanguageProperty'),
                    new Range(DataTypeDefXsd.Int, null, null, 'ExampleRange'),
                ]
            ),
            new SubmodelElementCollection(
                null,
                null,
                'ExampleSubmodelElementCollection',
                null,
                null,
                null,
                null,
                null,
                null,
                [
                    new Blob('application/pdf', null, null, 'ExampleBlob'),
                    new File('application/pdf', null, null, 'ExampleFile'),
                    new ReferenceElement(null, null, 'ExampleReferenceElement'),
                ]
            ),
            new SubmodelElementCollection(null, null, 'ExampleSubmodelElementCollection2'),
        ]
    );
}

export function createTestSubmodelMandatory2(): Submodel {
    return new Submodel(
        'https://acplt.org/Test_Submodel2_Mandatory',
        null,
        null,
        'Test_Submodel2_Mandatory',
        null,
        null,
        null,
        ModellingKind.Instance
    );
}

export function createTestSubmodelMissing(): Submodel {
    return new Submodel(
        'https://acplt.org/Test_Submodel_Missing',
        null,
        null,
        'TestSubmodelMissing',
        null,
        [
            new LangStringTextType('en-us', 'An example submodel for the test application'),
            new LangStringTextType('de', 'Ein Beispiel-Teilmodell für eine Test-Anwendung'),
        ],
        new AdministrativeInformation(null, '0', '9'),
        ModellingKind.Instance,
        new Reference(ReferenceTypes.ExternalReference, [
            new Key(KeyTypes.GlobalReference, 'http://acplt.org/SubmodelTemplates/ExampleSubmodel'),
        ]),
        null,
        null,
        null,
        [
            new RelationshipElement(
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Missing'),
                    new Key(KeyTypes.SubmodelElementList, 'ExampleSubmodelElementListOrdered'),
                    new Key(KeyTypes.Property, 'ExampleProperty'),
                ]),
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Missing'),
                    new Key(KeyTypes.SubmodelElementList, 'ExampleSubmodelElementListOrdered'),
                    new Key(KeyTypes.MultiLanguageProperty, 'ExampleMultiLanguageProperty'),
                ]),
                null,
                'PARAMETER',
                'ExampleRelationshipElement',
                null,
                [
                    new LangStringTextType('en-us', 'Example RelationshipElement object'),
                    new LangStringTextType('de', 'Beispiel RelationshipElement Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://acplt.org/RelationshipElements/ExampleRelationshipElement'
                    ),
                ])
            ),
            new AnnotatedRelationshipElement(
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Missing'),
                    new Key(KeyTypes.SubmodelElementList, 'ExampleSubmodelElementListOrdered'),
                    new Key(KeyTypes.Property, 'ExampleProperty'),
                ]),
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Missing'),
                    new Key(KeyTypes.SubmodelElementList, 'ExampleSubmodelElementListOrdered'),
                    new Key(KeyTypes.MultiLanguageProperty, 'ExampleMultiLanguageProperty'),
                ]),
                null,
                'PARAMETER',
                'ExampleAnnotatedRelationshipElement',
                null,
                [
                    new LangStringTextType('en-us', 'Example AnnotatedRelationshipElement object'),
                    new LangStringTextType('de', 'Beispiel AnnotatedRelationshipElement Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://acplt.org/RelationshipElements/ExampleAnnotatedRelationshipElement'
                    ),
                ]),
                null,
                null,
                null,
                [
                    new Property(
                        DataTypeDefXsd.String,
                        null,
                        'PARAMETER',
                        'ExampleProperty',
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        'some example annotation'
                    ),
                ]
            ),
            new Operation(
                null,
                'PARAMETER',
                'ExampleOperation',
                null,
                [
                    new LangStringTextType('en-us', 'Example Operation object'),
                    new LangStringTextType('de', 'Beispiel Operation Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://acplt.org/Operations/ExampleOperation'),
                ]),
                null,
                null,
                null,
                [
                    new OperationVariable(
                        new Property(
                            DataTypeDefXsd.String,
                            null,
                            'CONSTANT',
                            'ExampleProperty1',
                            null,
                            [
                                new LangStringTextType('en-us', 'Example Property object'),
                                new LangStringTextType('de', 'Beispiel Property Element'),
                            ],
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                            ]),
                            null,
                            [
                                new Qualifier(
                                    'http://acplt.org/Qualifier/ExampleQualifier',
                                    DataTypeDefXsd.String,
                                    null,
                                    null,
                                    null,
                                    null
                                ),
                            ],
                            null,
                            'exampleValue'
                        )
                    ),
                ],
                [
                    new OperationVariable(
                        new Property(
                            DataTypeDefXsd.String,
                            null,
                            'CONSTANT',
                            'ExampleProperty2',
                            null,
                            [
                                new LangStringTextType('en-us', 'Example Property object'),
                                new LangStringTextType('de', 'Beispiel Property Element'),
                            ],
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                            ]),
                            null,
                            [
                                new Qualifier(
                                    'http://acplt.org/Qualifier/ExampleQualifier',
                                    DataTypeDefXsd.String,
                                    null,
                                    null,
                                    null,
                                    null
                                ),
                            ],
                            null,
                            'exampleValue'
                        )
                    ),
                ],
                [
                    new OperationVariable(
                        new Property(
                            DataTypeDefXsd.String,
                            null,
                            'CONSTANT',
                            'ExampleProperty3',
                            null,
                            [
                                new LangStringTextType('en-us', 'Example Property object'),
                                new LangStringTextType('de', 'Beispiel Property Element'),
                            ],
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                            ]),
                            null,
                            [
                                new Qualifier(
                                    'http://acplt.org/Qualifier/ExampleQualifier',
                                    DataTypeDefXsd.String,
                                    null,
                                    null,
                                    null,
                                    null
                                ),
                            ],
                            null,
                            'exampleValue'
                        )
                    ),
                ]
            ),
            new Capability(
                null,
                'PARAMETER',
                'ExampleCapability',
                null,
                [
                    new LangStringTextType('en-us', 'Example Capability object'),
                    new LangStringTextType('de', 'Beispiel Capability Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://acplt.org/Capabilities/ExampleCapability'),
                ])
            ),
            new BasicEventElement(
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Missing'),
                    new Key(KeyTypes.SubmodelElementList, 'ExampleSubmodelElementListOrdered'),
                    new Key(KeyTypes.Property, 'ExampleProperty'),
                ]),
                Direction.Input,
                StateOfEvent.On,
                null,
                'PARAMETER',
                'ExampleBasicEvent',
                null,
                [
                    new LangStringTextType('en-us', 'Example BasicEvent object'),
                    new LangStringTextType('de', 'Beispiel BasicEvent Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://acplt.org/Events/ExampleBasicEvent'),
                ])
            ),
            new SubmodelElementList(
                AasSubmodelElements.SubmodelElement,
                null,
                'PARAMETER',
                'ExampleSubmodelElementListOrdered',
                null,
                [
                    new LangStringTextType('en-us', 'Example SubmodelElementListOrdered object'),
                    new LangStringTextType('de', 'Beispiel SubmodelElementListOrdered Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://acplt.org/SubmodelElementLists/ExampleSubmodelElementListOrdered'
                    ),
                ]),
                null,
                null,
                null,
                true,
                null,
                null,
                [
                    new Property(
                        DataTypeDefXsd.String,
                        null,
                        'CONSTANT',
                        'ExampleProperty',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Property object'),
                            new LangStringTextType('de', 'Beispiel Property Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                        ]),
                        null,
                        [
                            new Qualifier(
                                'http://acplt.org/Qualifier/ExampleQualifier',
                                DataTypeDefXsd.String,
                                null,
                                null,
                                null,
                                null
                            ),
                        ],
                        null,
                        'exampleValue'
                    ),
                    new MultiLanguageProperty(
                        null,
                        'CONSTANT',
                        'ExampleMultiLanguageProperty',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example MultiLanguageProperty object'),
                            new LangStringTextType('de', 'Beispiel MultiLanguageProperty Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(
                                KeyTypes.GlobalReference,
                                'http://acplt.org/MultiLanguageProperties/ExampleMultiLanguageProperty'
                            ),
                        ]),
                        null,
                        null,
                        null,
                        [
                            new LangStringTextType('en-us', 'Example value of a MultiLanguageProperty element'),
                            new LangStringTextType('de', 'Beispielswert für ein MultiLanguageProperty-Element'),
                        ]
                    ),
                    new Range(
                        DataTypeDefXsd.Int,
                        null,
                        'PARAMETER',
                        'ExampleRange',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Range object'),
                            new LangStringTextType('de', 'Beispiel Range Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Ranges/ExampleRange'),
                        ]),
                        null,
                        null,
                        null,
                        '0',
                        '100'
                    ),
                ]
            ),
            new SubmodelElementCollection(
                null,
                'PARAMETER',
                'ExampleSubmodelElementCollection',
                null,
                [
                    new LangStringTextType('en-us', 'Example SubmodelElementCollection object'),
                    new LangStringTextType('de', 'Beispiel SubmodelElementCollection Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://acplt.org/SubmodelElementCollections/ExampleSubmodelElementCollection'
                    ),
                ]),
                null,
                null,
                null,
                [
                    new Blob(
                        'application/pdf',
                        null,
                        'PARAMETER',
                        'ExampleBlob',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Blob object'),
                            new LangStringTextType('de', 'Beispiel Blob Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Blobs/ExampleBlob'),
                        ]),
                        null,
                        null,
                        null,
                        Uint8Array.from(Buffer.from('AQIDBAU=', 'base64'))
                    ),
                    new File(
                        'application/pdf',
                        null,
                        'PARAMETER',
                        'ExampleFile',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example File object'),
                            new LangStringTextType('de', 'Beispiel File Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Files/ExampleFile'),
                        ]),
                        null,
                        null,
                        null,
                        'file:///TestFile.pdf'
                    ),
                    new ReferenceElement(
                        null,
                        'PARAMETER',
                        'ExampleReferenceElement',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Reference Element object'),
                            new LangStringTextType('de', 'Beispiel Reference Element Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(
                                KeyTypes.GlobalReference,
                                'http://acplt.org/ReferenceElements/ExampleReferenceElement'
                            ),
                        ]),
                        null,
                        null,
                        null,
                        new Reference(ReferenceTypes.ModelReference, [
                            new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Missing'),
                            new Key(KeyTypes.SubmodelElementCollection, 'ExampleSubmodelElementCollection'),
                            new Key(KeyTypes.File, 'ExampleFile'),
                        ])
                    ),
                ]
            ),
        ]
    );
}

export function createTestSubmodelTemplate(): Submodel {
    return new Submodel(
        'https://acplt.org/Test_Submodel_Template',
        null,
        null,
        'TestSubmodelTemplate',
        null,
        [
            new LangStringTextType('en-us', 'An example submodel for the test application'),
            new LangStringTextType('de', 'Ein Beispiel-Teilmodell für eine Test-Anwendung'),
        ],
        new AdministrativeInformation(null, '0', '9'),
        ModellingKind.Template,
        new Reference(ReferenceTypes.ExternalReference, [
            new Key(KeyTypes.GlobalReference, 'http://acplt.org/SubmodelTemplates/ExampleSubmodel'),
        ]),
        null,
        null,
        null,
        [
            new RelationshipElement(
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Template'),
                    new Key(KeyTypes.Operation, 'ExampleOperation'),
                    new Key(KeyTypes.Property, 'ExampleProperty'),
                ]),
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Template'),
                    new Key(KeyTypes.Operation, 'ExampleOperation'),
                    new Key(KeyTypes.Property, 'ExampleProperty'),
                ]),
                null,
                'PARAMETER',
                'ExampleRelationshipElement',
                null,
                [
                    new LangStringTextType('en-us', 'Example RelationshipElement object'),
                    new LangStringTextType('de', 'Beispiel RelationshipElement Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://acplt.org/RelationshipElements/ExampleRelationshipElement'
                    ),
                ])
            ),
            new AnnotatedRelationshipElement(
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Template'),
                    new Key(KeyTypes.Operation, 'ExampleOperation'),
                    new Key(KeyTypes.Property, 'ExampleProperty'),
                ]),
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Template'),
                    new Key(KeyTypes.Operation, 'ExampleOperation'),
                    new Key(KeyTypes.Property, 'ExampleProperty'),
                ]),
                null,
                'PARAMETER',
                'ExampleAnnotatedRelationshipElement',
                null,
                [
                    new LangStringTextType('en-us', 'Example AnnotatedRelationshipElement object'),
                    new LangStringTextType('de', 'Beispiel AnnotatedRelationshipElement Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://acplt.org/RelationshipElements/ExampleAnnotatedRelationshipElement'
                    ),
                ]),
                null,
                null,
                null
            ),
            new Operation(
                null,
                'PARAMETER',
                'ExampleOperation',
                null,
                [
                    new LangStringTextType('en-us', 'Example Operation object'),
                    new LangStringTextType('de', 'Beispiel Operation Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://acplt.org/Operations/ExampleOperation'),
                ]),
                null,
                null,
                null,
                [
                    new OperationVariable(
                        new Property(
                            DataTypeDefXsd.String,
                            null,
                            'CONSTANT',
                            'ExampleProperty',
                            null,
                            [
                                new LangStringTextType('en-us', 'Example Property object'),
                                new LangStringTextType('de', 'Beispiel Property Element'),
                            ],
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                            ])
                        )
                    ),
                ],
                [
                    new OperationVariable(
                        new Property(
                            DataTypeDefXsd.String,
                            null,
                            'CONSTANT',
                            'ExampleProperty',
                            null,
                            [
                                new LangStringTextType('en-us', 'Example Property object'),
                                new LangStringTextType('de', 'Beispiel Property Element'),
                            ],
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                            ])
                        )
                    ),
                ],
                [
                    new OperationVariable(
                        new Property(
                            DataTypeDefXsd.String,
                            null,
                            'CONSTANT',
                            'ExampleProperty',
                            null,
                            [
                                new LangStringTextType('en-us', 'Example Property object'),
                                new LangStringTextType('de', 'Beispiel Property Element'),
                            ],
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                            ])
                        )
                    ),
                ]
            ),
            new Capability(
                null,
                'PARAMETER',
                'ExampleCapability',
                null,
                [
                    new LangStringTextType('en-us', 'Example Capability object'),
                    new LangStringTextType('de', 'Beispiel Capability Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://acplt.org/Capabilities/ExampleCapability'),
                ])
            ),
            new BasicEventElement(
                new Reference(ReferenceTypes.ModelReference, [
                    new Key(KeyTypes.Submodel, 'https://acplt.org/Test_Submodel_Template'),
                    new Key(KeyTypes.Operation, 'ExampleOperation'),
                    new Key(KeyTypes.Property, 'ExampleProperty'),
                ]),
                Direction.Output,
                StateOfEvent.Off,
                null,
                'PARAMETER',
                'ExampleBasicEvent',
                null,
                [
                    new LangStringTextType('en-us', 'Example BasicEvent object'),
                    new LangStringTextType('de', 'Beispiel BasicEvent Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://acplt.org/Events/ExampleBasicEvent'),
                ])
            ),
            new SubmodelElementList(
                AasSubmodelElements.SubmodelElement,
                null,
                'PARAMETER',
                'ExampleSubmodelElementListOrdered',
                null,
                [
                    new LangStringTextType('en-us', 'Example SubmodelElementListOrdered object'),
                    new LangStringTextType('de', 'Beispiel SubmodelElementListOrdered Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://acplt.org/SubmodelElementLists/ExampleSubmodelElementListOrdered'
                    ),
                ]),
                null,
                null,
                null,
                true,
                null,
                null,
                [
                    new Property(
                        DataTypeDefXsd.String,
                        null,
                        'CONSTANT',
                        'ExampleProperty',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Property object'),
                            new LangStringTextType('de', 'Beispiel Property Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                        ])
                    ),
                    new MultiLanguageProperty(
                        null,
                        'CONSTANT',
                        'ExampleMultiLanguageProperty',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example MultiLanguageProperty object'),
                            new LangStringTextType('de', 'Beispiel MultiLanguageProperty Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(
                                KeyTypes.GlobalReference,
                                'http://acplt.org/MultiLanguageProperties/ExampleMultiLanguageProperty'
                            ),
                        ])
                    ),
                    new Range(
                        DataTypeDefXsd.Int,
                        null,
                        'PARAMETER',
                        'ExampleRange',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Range object'),
                            new LangStringTextType('de', 'Beispiel Range Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Ranges/ExampleRange'),
                        ]),
                        null,
                        null,
                        null,
                        null,
                        '100'
                    ),
                    new Range(
                        DataTypeDefXsd.Int,
                        null,
                        'PARAMETER',
                        'ExampleRange2',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Range object'),
                            new LangStringTextType('de', 'Beispiel Range Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Ranges/ExampleRange'),
                        ]),
                        null,
                        null,
                        null,
                        '0',
                        null
                    ),
                ]
            ),
            new SubmodelElementCollection(
                null,
                'PARAMETER',
                'ExampleSubmodelElementCollection',
                null,
                [
                    new LangStringTextType('en-us', 'Example SubmodelElementCollection object'),
                    new LangStringTextType('de', 'Beispiel SubmodelElementCollection Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://acplt.org/SubmodelElementCollections/ExampleSubmodelElementCollection'
                    ),
                ]),
                null,
                null,
                null,
                [
                    new Blob(
                        'application/pdf',
                        null,
                        'PARAMETER',
                        'ExampleBlob',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Blob object'),
                            new LangStringTextType('de', 'Beispiel Blob Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Blobs/ExampleBlob'),
                        ])
                    ),
                    new File(
                        'application/pdf',
                        null,
                        'PARAMETER',
                        'ExampleFile',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example File object'),
                            new LangStringTextType('de', 'Beispiel File Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(KeyTypes.GlobalReference, 'http://acplt.org/Files/ExampleFile'),
                        ])
                    ),
                    new ReferenceElement(
                        null,
                        'PARAMETER',
                        'ExampleReferenceElement',
                        null,
                        [
                            new LangStringTextType('en-us', 'Example Reference Element object'),
                            new LangStringTextType('de', 'Beispiel Reference Element Element'),
                        ],
                        new Reference(ReferenceTypes.ExternalReference, [
                            new Key(
                                KeyTypes.GlobalReference,
                                'http://acplt.org/ReferenceElements/ExampleReferenceElement'
                            ),
                        ])
                    ),
                ]
            ),
            new SubmodelElementCollection(
                null,
                'PARAMETER',
                'ExampleSubmodelElementCollection2',
                null,
                [
                    new LangStringTextType('en-us', 'Example SubmodelElementCollection object'),
                    new LangStringTextType('de', 'Beispiel SubmodelElementCollection Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://acplt.org/SubmodelElementCollections/ExampleSubmodelElementCollection'
                    ),
                ])
            ),
        ]
    );
}

export function createTestSubmodelWithOperation(): Submodel {
    return new Submodel(
        'https://acplt.org/Test_Submodel',
        null,
        null,
        'TestSubmodel',
        null,
        [
            new LangStringTextType('en-us', 'An example submodel for the test application'),
            new LangStringTextType('de', 'Ein Beispiel-Teilmodell für eine Test-Anwendung'),
        ],
        new AdministrativeInformation(null, '0', '9'),
        ModellingKind.Instance,
        new Reference(ReferenceTypes.ExternalReference, [
            new Key(KeyTypes.GlobalReference, 'http://acplt.org/SubmodelTemplates/ExampleSubmodel'),
        ]),
        null,
        null,
        null,
        [
            new Operation(
                null,
                'PARAMETER',
                'ExampleOperation',
                null,
                [
                    new LangStringTextType('en-us', 'Example Operation object'),
                    new LangStringTextType('de', 'Beispiel Operation Element'),
                ],
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://acplt.org/Operations/ExampleOperation'),
                ]),
                null,
                null,
                null,
                [
                    new OperationVariable(
                        new Property(
                            DataTypeDefXsd.String,
                            null,
                            'CONSTANT',
                            'ExampleProperty1',
                            null,
                            null,
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                            ]),
                            null,
                            null,
                            null,
                            'http://acplt.org/ValueId/ExampleValueId',
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ExampleValueId'),
                            ])
                        )
                    ),
                    new OperationVariable(
                        new Property(
                            DataTypeDefXsd.String,
                            null,
                            'VARIABLE',
                            'ExampleProperty2',
                            null,
                            null,
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                            ]),
                            null,
                            null,
                            null,
                            'http://acplt.org/ValueId/ExampleValueId',
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ExampleValueId'),
                            ])
                        )
                    ),
                ],
                [
                    new OperationVariable(
                        new Property(
                            DataTypeDefXsd.String,
                            null,
                            'CONSTANT',
                            'ExampleProperty2',
                            null,
                            null,
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                            ]),
                            null,
                            null,
                            null,
                            'http://acplt.org/ValueId/ExampleValueId',
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ExampleValueId'),
                            ])
                        )
                    ),
                ],
                [
                    new OperationVariable(
                        new Property(
                            DataTypeDefXsd.String,
                            null,
                            'CONSTANT',
                            'ExampleProperty3',
                            null,
                            null,
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/Properties/ExampleProperty'),
                            ]),
                            null,
                            null,
                            null,
                            'http://acplt.org/ValueId/ExampleValueId',
                            new Reference(ReferenceTypes.ExternalReference, [
                                new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ExampleValueId'),
                            ])
                        )
                    ),
                ]
            ),
        ]
    );
}

export function createTestSubmodelWithQualifier(): Submodel {
    return new Submodel(
        'https://acplt.org/Test_Submodel',
        null,
        null,
        'TestSubmodel',
        null,
        null,
        new AdministrativeInformation(null, '0', '9'),
        ModellingKind.Instance,
        null,
        null,
        null,
        null,
        [
            new Property(
                DataTypeDefXsd.String,
                null,
                null,
                'ManufacturerName',
                null,
                null,
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, '0173-1#02-AAO677#002'),
                ]),
                null,
                [
                    new Qualifier(
                        'http://acplt.org/Qualifier/ExampleQualifier',
                        DataTypeDefXsd.Int,
                        null,
                        null,
                        null,
                        '100'
                    ),
                    new Qualifier(
                        'http://acplt.org/Qualifier/ExampleQualifier2',
                        DataTypeDefXsd.Int,
                        null,
                        null,
                        null,
                        '50'
                    ),
                ],
                null,
                'http://acplt.org/ValueId/ACPLT',
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://acplt.org/ValueId/ACPLT'),
                ])
            ),
        ]
    );
}
