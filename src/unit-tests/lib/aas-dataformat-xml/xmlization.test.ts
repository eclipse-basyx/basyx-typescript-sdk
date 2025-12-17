import {
    AasSubmodelElements,
    AdministrativeInformation,
    AnnotatedRelationshipElement,
    AssetAdministrationShell,
    AssetInformation,
    AssetKind,
    BasicEventElement,
    Blob,
    Capability,
    ConceptDescription,
    DataSpecificationIec61360,
    DataTypeDefXsd,
    DataTypeIec61360,
    Direction,
    EmbeddedDataSpecification,
    Entity,
    EntityType,
    Extension,
    File,
    Key,
    KeyTypes,
    LangStringDefinitionTypeIec61360,
    LangStringNameType,
    LangStringPreferredNameTypeIec61360,
    LangStringShortNameTypeIec61360,
    LangStringTextType,
    LevelType,
    ModellingKind,
    ModelType,
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
    Resource,
    SpecificAssetId,
    StateOfEvent,
    Submodel,
    SubmodelElementCollection,
    SubmodelElementList,
    ValueList,
    ValueReferencePair,
} from '@aas-core-works/aas-core3.0-typescript/types';
import * as fs from 'fs';
import * as path from 'path';
import { deserializeXml, serializeXml } from '../../../lib/aas-dataformat-xml';
import { BaSyxEnvironment } from '../../../models/BaSyxEnvironment';

const TEST_AAS: AssetAdministrationShell = new AssetAdministrationShell(
    'http://customer.com/aas/9175_7013_7091_9168',
    new AssetInformation(
        AssetKind.Instance,
        'http://customer.com/assets/KHBVZJSQKIY',
        [
            new SpecificAssetId(
                'EquipmentID',
                '538fd1b3-f99f-4a52-9c75-72e9fa921270',
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://customer.com/Systems/ERP/012'),
                ])
            ),
            new SpecificAssetId(
                'DeviceID',
                'QjYgPggjwkiHk4RrQiYSLg==',
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://customer.com/Systems/IoT/1'),
                ])
            ),
        ],
        'TestAsset',
        new Resource('file:///master/verwaltungsschale-detail-part1.png', 'image/png')
    ),
    [
        new Extension(
            'Extension1',
            new Reference(ReferenceTypes.ExternalReference, [new Key(KeyTypes.GlobalReference, 'Extension1Key1')]),
            [new Reference(ReferenceTypes.ExternalReference, [new Key(KeyTypes.GlobalReference, 'Extension1Key2')])],
            DataTypeDefXsd.String,
            'This is an extension value',
            [new Reference(ReferenceTypes.ExternalReference, [new Key(KeyTypes.GlobalReference, 'Extension1Key3')])]
        ),
    ],
    'TestCategory',
    'ExampleMotor',
    [new LangStringNameType('de', 'Beispielmotor'), new LangStringNameType('en', 'Example Motor')],
    [
        new LangStringTextType('de', 'Dies ist ein Beispielmotor.'),
        new LangStringTextType('en', 'This is an example motor.'),
    ],
    new AdministrativeInformation([
        new EmbeddedDataSpecification(
            new Reference(ReferenceTypes.ExternalReference, [
                new Key(KeyTypes.GlobalReference, 'http://admin-shell.io/aas/3/0/RC02/AdministrativeInformation/1/0'),
            ]),
            new DataSpecificationIec61360(
                [new LangStringPreferredNameTypeIec61360('en', 'Administrative Information Data Specification')],
                [new LangStringShortNameTypeIec61360('en', 'AdminInfoDS')],
                '1.0',
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://admin-shell.io/iec61360/1/0/DataSpecificationIEC61360'),
                ]),
                'DataSpecificationIEC61360',
                'http://admin-shell.io/iec61360/1/0/DataSpecificationIEC61360',
                DataTypeIec61360.String,
                [
                    new LangStringDefinitionTypeIec61360('en', 'Data Specification for Administrative Information'),
                    new LangStringDefinitionTypeIec61360('de', 'Datenbeschreibung für Verwaltungsinformationen'),
                ],
                'http://www.w3.org/2001/XMLSchema#string',
                new ValueList([
                    new ValueReferencePair(
                        'Value1',
                        new Reference(ReferenceTypes.ExternalReference, [new Key(KeyTypes.GlobalReference, 'Ref1')])
                    ),
                    new ValueReferencePair(
                        'Value2',
                        new Reference(ReferenceTypes.ExternalReference, [new Key(KeyTypes.GlobalReference, 'Ref2')])
                    ),
                ]),
                'unit',
                new LevelType(true, false, false, false)
            )
        ),
    ]),
    [
        new EmbeddedDataSpecification(
            new Reference(ReferenceTypes.ExternalReference, [
                new Key(KeyTypes.GlobalReference, 'http://admin-shell.io/aas/3/0/RC02/AdministrativeInformation/1/0'),
            ]),
            new DataSpecificationIec61360(
                [new LangStringPreferredNameTypeIec61360('en', 'Administrative Information Data Specification')],
                [new LangStringShortNameTypeIec61360('en', 'AdminInfoDS')],
                '1.0',
                new Reference(ReferenceTypes.ExternalReference, [
                    new Key(KeyTypes.GlobalReference, 'http://admin-shell.io/iec61360/1/0/DataSpecificationIEC61360'),
                ]),
                'DataSpecificationIEC61360',
                'http://admin-shell.io/iec61360/1/0/DataSpecificationIEC61360',
                DataTypeIec61360.String,
                [
                    new LangStringDefinitionTypeIec61360('en', 'Data Specification for Administrative Information'),
                    new LangStringDefinitionTypeIec61360('de', 'Datenbeschreibung für Verwaltungsinformationen'),
                ],
                'http://www.w3.org/2001/XMLSchema#string',
                new ValueList([
                    new ValueReferencePair(
                        'Value1',
                        new Reference(ReferenceTypes.ExternalReference, [new Key(KeyTypes.GlobalReference, 'Ref1')])
                    ),
                    new ValueReferencePair(
                        'Value2',
                        new Reference(ReferenceTypes.ExternalReference, [new Key(KeyTypes.GlobalReference, 'Ref2')])
                    ),
                ]),
                'unit',
                new LevelType(true, false, false, false)
            )
        ),
    ],
    new Reference(ReferenceTypes.ExternalReference, [
        new Key(KeyTypes.GlobalReference, 'http://customer.com/aas/9175_7013_7091_9168'),
    ]),
    [
        new Reference(ReferenceTypes.ExternalReference, [
            new Key(KeyTypes.Submodel, 'http://i40.customer.com/type/1/1/7A7104BDAB57E184'),
        ]),
        new Reference(ReferenceTypes.ExternalReference, [
            new Key(KeyTypes.Submodel, 'http://i40.customer.com/instance/1/1/AC69B1CB44F07935'),
        ]),
        new Reference(ReferenceTypes.ExternalReference, [
            new Key(KeyTypes.Submodel, 'http://i40.customer.com/type/1/1/1A7B62B529F19152'),
        ]),
    ]
);

const TEST_SUBMODEL_IDENTIFICATION: Submodel = new Submodel(
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

const TEST_SUBMODEL_BILL_OF_MATERIAL: Submodel = new Submodel(
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

const TEST_SUBMODEL_1: Submodel = new Submodel(
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
                new Key(KeyTypes.GlobalReference, 'http://acplt.org/RelationshipElements/ExampleRelationshipElement'),
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
                        new Key(KeyTypes.GlobalReference, 'http://acplt.org/ReferenceElements/ExampleReferenceElement'),
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

const TEST_SUBMODEL_MANDATORY: Submodel = new Submodel(
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

const TEST_SUBMODEL_2_MANDATORY: Submodel = new Submodel(
    'https://acplt.org/Test_Submodel2_Mandatory',
    null,
    null,
    'Test_Submodel2_Mandatory',
    null,
    null,
    null,
    ModellingKind.Instance
);

const TEST_SUBMODEL_MISSING: Submodel = new Submodel(
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
                new Key(KeyTypes.GlobalReference, 'http://acplt.org/RelationshipElements/ExampleRelationshipElement'),
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
                        new Key(KeyTypes.GlobalReference, 'http://acplt.org/ReferenceElements/ExampleReferenceElement'),
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

const TEST_SUBMODEL_TEMPLATE: Submodel = new Submodel(
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
                new Key(KeyTypes.GlobalReference, 'http://acplt.org/RelationshipElements/ExampleRelationshipElement'),
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
                        new Key(KeyTypes.GlobalReference, 'http://acplt.org/ReferenceElements/ExampleReferenceElement'),
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

const TEST_CONCEPT_DESCRIPTION: ConceptDescription = new ConceptDescription(
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

const TEST_CONCEPT_DESCRIPTION_MINIMAL: ConceptDescription = new ConceptDescription(
    'https://acplt.org/Test_ConceptDescription_Mandatory',
    null,
    null,
    'Test_ConceptDescription_Mandatory'
);

const TEST_CONCEPT_DESCRIPTION_1: ConceptDescription = new ConceptDescription(
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

const TEST_CONCEPT_DESCRIPTION_FULL: ConceptDescription = new ConceptDescription(
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
                    new LangStringShortNameTypeIec61360('en-us', 'TestSpecification'),
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
                    new LangStringDefinitionTypeIec61360('en-us', 'This is a DataSpecification for testing purposes'),
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

describe('serializeXml', () => {
    test('should return an empty string when encoding an empty string', () => {
        // testEnvironment.xml
        expect(serializeXml(new BaSyxEnvironment())).toBe('');
    });
    test('should return the correct XML when encoding a valid AssetAdministrationShell', () => {
        // testEnvironment.xml
        const env = new BaSyxEnvironment();
        env.assetAdministrationShells = [TEST_AAS];
        env.submodels = [
            TEST_SUBMODEL_IDENTIFICATION,
            TEST_SUBMODEL_BILL_OF_MATERIAL,
            TEST_SUBMODEL_1,
            TEST_SUBMODEL_MANDATORY,
            TEST_SUBMODEL_2_MANDATORY,
            TEST_SUBMODEL_MISSING,
            TEST_SUBMODEL_TEMPLATE,
        ];
        env.conceptDescriptions = [
            TEST_CONCEPT_DESCRIPTION,
            TEST_CONCEPT_DESCRIPTION_MINIMAL,
            TEST_CONCEPT_DESCRIPTION_1,
            TEST_CONCEPT_DESCRIPTION_FULL,
        ];
        const xmlPath = path.join(__dirname, 'test-full.xml');
        const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
        expect(serializeXml(env)).toBe(xmlContent);
    });
});

describe('deserializeXml', () => {
    test('should return an empty BaSyxEnvironment when deserializing an empty string', () => {
        const result = deserializeXml('');
        expect(result).toBeInstanceOf(BaSyxEnvironment);
        expect(result.assetAdministrationShells).toBeNull();
        expect(result.submodels).toBeNull();
        expect(result.conceptDescriptions).toBeNull();
    });

    test('should deserialize XML back to a valid AssetAdministrationShell', () => {
        const env = new BaSyxEnvironment();
        env.assetAdministrationShells = [TEST_AAS];

        // Serialize to XML
        const xml = serializeXml(env);

        // Deserialize back
        const result = deserializeXml(xml);

        // Validate the deserialized result
        expect(result).toBeInstanceOf(BaSyxEnvironment);
        expect(result.assetAdministrationShells).toBeDefined();
        expect(result.assetAdministrationShells).toHaveLength(1);

        const aas = result.assetAdministrationShells![0];

        // Check basic properties
        expect(aas.id).toBe(TEST_AAS.id);
        expect(aas.idShort).toBe(TEST_AAS.idShort);
        expect(aas.category).toBe(TEST_AAS.category);

        // Check displayName
        expect(aas.displayName).toHaveLength(2);
        expect(aas.displayName![0].language).toBe('de');
        expect(aas.displayName![0].text).toBe('Beispielmotor');
        expect(aas.displayName![1].language).toBe('en');
        expect(aas.displayName![1].text).toBe('Example Motor');

        // Check description
        expect(aas.description).toHaveLength(2);
        expect(aas.description![0].language).toBe('de');
        expect(aas.description![0].text).toBe('Dies ist ein Beispielmotor.');
        expect(aas.description![1].language).toBe('en');
        expect(aas.description![1].text).toBe('This is an example motor.');

        // Check extensions
        expect(aas.extensions).toHaveLength(1);
        expect(aas.extensions![0].name).toBe('Extension1');
        expect(aas.extensions![0].valueType).toBe(DataTypeDefXsd.String);
        expect(aas.extensions![0].value).toBe('This is an extension value');

        // Check administration
        expect(aas.administration).toBeDefined();
        expect(aas.administration!.embeddedDataSpecifications).toHaveLength(1);

        // Check embedded data specifications
        expect(aas.embeddedDataSpecifications).toHaveLength(1);

        // Check derivedFrom
        expect(aas.derivedFrom).toBeDefined();
        expect(aas.derivedFrom!.type).toBe(ReferenceTypes.ExternalReference);
        expect(aas.derivedFrom!.keys).toHaveLength(1);
        expect(aas.derivedFrom!.keys[0].type).toBe(KeyTypes.GlobalReference);
        expect(aas.derivedFrom!.keys[0].value).toBe('http://customer.com/aas/9175_7013_7091_9168');

        // Check assetInformation
        expect(aas.assetInformation).toBeDefined();
        expect(aas.assetInformation.assetKind).toBe(AssetKind.Instance);
        expect(aas.assetInformation.globalAssetId).toBe('http://customer.com/assets/KHBVZJSQKIY');
        expect(aas.assetInformation.assetType).toBe('TestAsset');

        // Check specificAssetIds
        expect(aas.assetInformation.specificAssetIds).toHaveLength(2);
        expect(aas.assetInformation.specificAssetIds![0].name).toBe('EquipmentID');
        expect(aas.assetInformation.specificAssetIds![0].value).toBe('538fd1b3-f99f-4a52-9c75-72e9fa921270');
        expect(aas.assetInformation.specificAssetIds![1].name).toBe('DeviceID');
        expect(aas.assetInformation.specificAssetIds![1].value).toBe('QjYgPggjwkiHk4RrQiYSLg==');

        // Check defaultThumbnail
        expect(aas.assetInformation.defaultThumbnail).toBeDefined();
        expect(aas.assetInformation.defaultThumbnail!.path).toBe('file:///master/verwaltungsschale-detail-part1.png');
        expect(aas.assetInformation.defaultThumbnail!.contentType).toBe('image/png');

        // Check submodel references
        expect(aas.submodels).toHaveLength(3);
        expect(aas.submodels![0].type).toBe(ReferenceTypes.ExternalReference);
        expect(aas.submodels![0].keys[0].type).toBe(KeyTypes.Submodel);
        expect(aas.submodels![0].keys[0].value).toBe('http://i40.customer.com/type/1/1/7A7104BDAB57E184');
    });

    test('should deserialize XML with ConceptDescriptions', () => {
        const env = new BaSyxEnvironment();
        env.assetAdministrationShells = [TEST_AAS];
        env.conceptDescriptions = [
            TEST_CONCEPT_DESCRIPTION,
            TEST_CONCEPT_DESCRIPTION_MINIMAL,
            TEST_CONCEPT_DESCRIPTION_1,
            TEST_CONCEPT_DESCRIPTION_FULL,
        ];

        // Serialize to XML
        const xml = serializeXml(env);

        // Deserialize back
        const result = deserializeXml(xml);

        // Validate concept descriptions
        expect(result.conceptDescriptions).toBeDefined();
        expect(result.conceptDescriptions).toHaveLength(4);

        // Check first concept description
        const cd1 = result.conceptDescriptions![0];
        expect(cd1.id).toBe('https://acplt.org/Test_ConceptDescription');
        expect(cd1.idShort).toBe('TestConceptDescription');
        expect(cd1.description).toHaveLength(2);
        expect(cd1.description![0].language).toBe('en-us');
        expect(cd1.description![0].text).toBe('An example concept description for the test application');
        expect(cd1.administration).toBeDefined();
        expect(cd1.administration!.version).toBe('0');
        expect(cd1.administration!.revision).toBe('9');
        expect(cd1.isCaseOf).toBeDefined();
        expect(cd1.isCaseOf).toHaveLength(1);
        expect(cd1.isCaseOf![0].keys[0].value).toBe(
            'http://acplt.org/DataSpecifications/Conceptdescription/TestConceptDescription'
        );

        // Check minimal concept description
        const cd2 = result.conceptDescriptions![1];
        expect(cd2.id).toBe('https://acplt.org/Test_ConceptDescription_Mandatory');
        expect(cd2.idShort).toBe('Test_ConceptDescription_Mandatory');

        // Check concept description with category
        const cd3 = result.conceptDescriptions![2];
        expect(cd3.id).toBe('https://acplt.org/Test_ConceptDescription_Missing');
        expect(cd3.category).toBe('PROPERTY');
        expect(cd3.idShort).toBe('TestConceptDescription1');

        // Check concept description with full data specification
        const cd4 = result.conceptDescriptions![3];
        expect(cd4.id).toBe('http://acplt.org/DataSpecifciations/Example/Identification');
        expect(cd4.idShort).toBe('TestSpec_01');
        expect(cd4.administration).toBeDefined();
        expect(cd4.administration!.version).toBe('0');
        expect(cd4.administration!.revision).toBe('9');
        expect(cd4.embeddedDataSpecifications).toBeDefined();
        expect(cd4.embeddedDataSpecifications).toHaveLength(1);

        // Check embedded data specification
        const dataSpec = cd4.embeddedDataSpecifications![0];
        expect(dataSpec.dataSpecification).toBeDefined();
        expect(dataSpec.dataSpecification.keys[0].value).toBe(
            'https://admin-shell.io/aas/3/1/DataSpecificationIec61360'
        );

        const iec61360 = dataSpec.dataSpecificationContent as DataSpecificationIec61360;
        expect(iec61360.preferredName).toHaveLength(2);
        expect(iec61360.preferredName[0].language).toBe('de');
        expect(iec61360.preferredName[0].text).toBe('Test Specification');
        expect(iec61360.unit).toBe('SpaceUnit');
        expect(iec61360.symbol).toBe('SU');
        expect(iec61360.dataType).toBe(DataTypeIec61360.RealMeasure);
        expect(iec61360.valueList).toBeDefined();
        expect(iec61360.valueList!.valueReferencePairs).toHaveLength(2);
        expect(iec61360.value).toBe('TEST');
        expect(iec61360.levelType).toBeDefined();
        expect(iec61360.levelType!.max).toBe(true);
    });

    test('should deserialize XML with Submodels including Properties', () => {
        const env = new BaSyxEnvironment();
        env.assetAdministrationShells = [TEST_AAS];
        env.submodels = [TEST_SUBMODEL_IDENTIFICATION];

        // Serialize to XML
        const xml = serializeXml(env);

        // Deserialize back
        const result = deserializeXml(xml);

        // Validate submodels
        expect(result.submodels).toBeDefined();
        expect(result.submodels).toHaveLength(1);

        const submodel = result.submodels![0];
        expect(submodel.id).toBe('http://acplt.org/Submodels/Assets/TestAsset/Identification');
        expect(submodel.idShort).toBe('Identification');
        expect(submodel.kind).toBe(ModellingKind.Instance);

        // Check description
        expect(submodel.description).toHaveLength(2);
        expect(submodel.description![0].language).toBe('en-us');
        expect(submodel.description![0].text).toBe('An example asset identification submodel for the test application');

        // Check administration
        expect(submodel.administration).toBeDefined();
        expect(submodel.administration!.version).toBe('0');
        expect(submodel.administration!.revision).toBe('9');

        // Check semantic ID
        expect(submodel.semanticId).toBeDefined();
        expect(submodel.semanticId!.type).toBe(ReferenceTypes.ExternalReference);
        expect(submodel.semanticId!.keys[0].value).toBe('http://acplt.org/SubmodelTemplates/AssetIdentification');

        // Check submodel elements
        expect(submodel.submodelElements).toBeDefined();
        expect(submodel.submodelElements).toHaveLength(2);

        // Check first property
        const prop1 = submodel.submodelElements![0] as Property;
        expect(prop1.idShort).toBe('ManufacturerName');
        expect(prop1.valueType).toBe(DataTypeDefXsd.String);
        expect(prop1.displayName).toHaveLength(1);
        expect(prop1.displayName![0].language).toBe('en-us');
        expect(prop1.displayName![0].text).toBe('Manufacturer Name');
        expect(prop1.description).toHaveLength(2);
        expect(prop1.semanticId).toBeDefined();
        expect(prop1.semanticId!.keys[0].value).toBe('0173-1#02-AAO677#002');
        expect(prop1.qualifiers).toHaveLength(2);
        expect(prop1.qualifiers![0].type).toBe('http://acplt.org/Qualifier/ExampleQualifier');
        expect(prop1.qualifiers![0].valueType).toBe(DataTypeDefXsd.Int);
        expect(prop1.qualifiers![0].value).toBe('100');
        expect(prop1.value).toBe('http://acplt.org/ValueId/ACPLT');
        expect(prop1.valueId).toBeDefined();

        // Check second property
        const prop2 = submodel.submodelElements![1] as Property;
        expect(prop2.idShort).toBe('InstanceId');
        expect(prop2.valueType).toBe(DataTypeDefXsd.String);
        expect(prop2.category).toBe('VARIABLE');
        expect(prop2.description).toHaveLength(2);
        expect(prop2.semanticId).toBeDefined();
        expect(prop2.supplementalSemanticIds).toHaveLength(2);
        expect(prop2.value).toBe('978-8234-234-342');
        expect(prop2.valueId).toBeDefined();
    });

    test('should deserialize XML with complex Submodel including various element types', () => {
        const env = new BaSyxEnvironment();
        env.submodels = [TEST_SUBMODEL_MISSING];

        // Serialize to XML
        const xml = serializeXml(env);

        // Deserialize back
        const result = deserializeXml(xml);

        // Validate submodel
        expect(result.submodels).toBeDefined();
        expect(result.submodels).toHaveLength(1);

        const submodel = result.submodels![0];
        expect(submodel.id).toBe('https://acplt.org/Test_Submodel_Missing');
        expect(submodel.idShort).toBe('TestSubmodelMissing');
        expect(submodel.kind).toBe(ModellingKind.Instance);

        // Check submodel elements
        expect(submodel.submodelElements).toBeDefined();
        expect(submodel.submodelElements!.length).toBeGreaterThan(0);

        // Find and check RelationshipElement
        const relElement = submodel.submodelElements!.find(
            (el: any) => el.idShort === 'ExampleRelationshipElement'
        ) as RelationshipElement;
        expect(relElement).toBeDefined();
        expect(relElement.first).toBeDefined();
        expect(relElement.first.keys[0].type).toBe(KeyTypes.Submodel);
        expect(relElement.second).toBeDefined();
        expect(relElement.second.keys[0].type).toBe(KeyTypes.Submodel);

        // Find and check AnnotatedRelationshipElement
        const annotatedRel = submodel.submodelElements!.find(
            (el: any) => el.idShort === 'ExampleAnnotatedRelationshipElement'
        ) as AnnotatedRelationshipElement;
        expect(annotatedRel).toBeDefined();
        expect(annotatedRel.first).toBeDefined();
        expect(annotatedRel.second).toBeDefined();
        expect(annotatedRel.annotations).toBeDefined();
        expect(annotatedRel.annotations!.length).toBeGreaterThan(0);

        // Find and check Operation
        const operation = submodel.submodelElements!.find((el: any) => el.idShort === 'ExampleOperation') as Operation;
        expect(operation).toBeDefined();
        expect(operation.inputVariables).toBeDefined();
        expect(operation.outputVariables).toBeDefined();
        expect(operation.inoutputVariables).toBeDefined();

        // Find and check Capability
        const capability = submodel.submodelElements!.find(
            (el: any) => el.idShort === 'ExampleCapability'
        ) as Capability;
        expect(capability).toBeDefined();
        expect(capability.semanticId).toBeDefined();

        // Find and check BasicEventElement
        const eventElement = submodel.submodelElements!.find(
            (el: any) => el.idShort === 'ExampleBasicEvent'
        ) as BasicEventElement;
        expect(eventElement).toBeDefined();
        expect(eventElement.observed).toBeDefined();
        expect(eventElement.direction).toBe(Direction.Input);
        expect(eventElement.state).toBe(StateOfEvent.On);

        // Find and check SubmodelElementList
        const submodelList = submodel.submodelElements!.find(
            (el: any) => el.idShort === 'ExampleSubmodelElementListOrdered'
        ) as SubmodelElementList;
        expect(submodelList).toBeDefined();
        expect(submodelList.typeValueListElement).toBeDefined();
        expect(submodelList.orderRelevant).toBe(true);
        expect(submodelList.value).toBeDefined();

        // Find and check SubmodelElementCollection
        const collection = submodel.submodelElements!.find(
            (el: any) => el.idShort === 'ExampleSubmodelElementCollection'
        ) as SubmodelElementCollection;
        expect(collection).toBeDefined();
        expect(collection.value).toBeDefined();
        expect(collection.value!.length).toBeGreaterThan(0);
    });

    test('should deserialize XML with Submodel including Entity', () => {
        const env = new BaSyxEnvironment();
        env.submodels = [TEST_SUBMODEL_BILL_OF_MATERIAL];

        // Serialize to XML
        const xml = serializeXml(env);

        // Deserialize back
        const result = deserializeXml(xml);

        // Validate submodel
        expect(result.submodels).toBeDefined();
        expect(result.submodels).toHaveLength(1);

        const submodel = result.submodels![0];
        expect(submodel.id).toBe('http://acplt.org/Submodels/Assets/TestAsset/BillOfMaterial');

        // Find Entity elements
        const entities = submodel.submodelElements!.filter((el: any) => el.modelType() === ModelType.Entity);
        expect(entities.length).toBeGreaterThan(0);

        const entity = entities[0] as Entity;
        expect(entity.entityType).toBeDefined();
        expect(entity.idShort).toBeDefined();
        expect(entity.statements).toBeDefined();
    });

    test('should deserialize XML with full BaSyxEnvironment from test-full.xml', () => {
        // Read the test XML file
        const xmlPath = path.join(__dirname, 'test-full.xml');
        const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

        // Deserialize the full XML
        const result = deserializeXml(xmlContent);

        // Validate the result
        expect(result).toBeInstanceOf(BaSyxEnvironment);

        // Check Asset Administration Shells
        expect(result.assetAdministrationShells).toBeDefined();
        expect(result.assetAdministrationShells!.length).toBeGreaterThan(0);

        // Check Submodels
        expect(result.submodels).toBeDefined();
        expect(result.submodels!.length).toBeGreaterThan(0);

        // Verify we can find the Identification submodel
        const identificationSubmodel = result.submodels!.find((sm: Submodel) => sm.idShort === 'Identification');
        expect(identificationSubmodel).toBeDefined();
        expect(identificationSubmodel!.submodelElements).toBeDefined();

        // Verify we can find the TestSubmodel
        const testSubmodel = result.submodels!.find((sm: Submodel) => sm.idShort === 'TestSubmodel');
        expect(testSubmodel).toBeDefined();
        expect(testSubmodel!.submodelElements).toBeDefined();

        // Check various element types in TestSubmodel
        const relationshipElements = testSubmodel!.submodelElements!.filter(
            (el: any) => el.modelType() === ModelType.RelationshipElement
        );
        expect(relationshipElements.length).toBeGreaterThan(0);

        const annotatedRelElements = testSubmodel!.submodelElements!.filter(
            (el: any) => el.modelType() === ModelType.AnnotatedRelationshipElement
        );
        expect(annotatedRelElements.length).toBeGreaterThan(0);

        const operations = testSubmodel!.submodelElements!.filter((el: any) => el.modelType() === ModelType.Operation);
        expect(operations.length).toBeGreaterThan(0);

        const capabilities = testSubmodel!.submodelElements!.filter(
            (el: any) => el.modelType() === ModelType.Capability
        );
        expect(capabilities.length).toBeGreaterThan(0);

        const basicEventElements = testSubmodel!.submodelElements!.filter(
            (el: any) => el.modelType() === ModelType.BasicEventElement
        );
        expect(basicEventElements.length).toBeGreaterThan(0);

        const submodelLists = testSubmodel!.submodelElements!.filter(
            (el: any) => el.modelType() === ModelType.SubmodelElementList
        );
        expect(submodelLists.length).toBeGreaterThan(0);

        const submodelCollections = testSubmodel!.submodelElements!.filter(
            (el: any) => el.modelType() === ModelType.SubmodelElementCollection
        );
        expect(submodelCollections.length).toBeGreaterThan(0);

        // Check Concept Descriptions
        expect(result.conceptDescriptions).toBeDefined();
        expect(result.conceptDescriptions!.length).toBeGreaterThan(0);
    });

    test('should deserialize and re-serialize maintaining consistency', () => {
        const env = new BaSyxEnvironment();
        env.assetAdministrationShells = [TEST_AAS];
        env.submodels = [TEST_SUBMODEL_IDENTIFICATION, TEST_SUBMODEL_BILL_OF_MATERIAL, TEST_SUBMODEL_TEMPLATE];
        env.conceptDescriptions = [TEST_CONCEPT_DESCRIPTION];

        // First serialization
        const xml1 = serializeXml(env);

        // Deserialize
        const deserialized = deserializeXml(xml1);

        // Verify deserialized structure matches original
        expect(deserialized.assetAdministrationShells).toHaveLength(1);
        expect(deserialized.submodels).toHaveLength(3);
        expect(deserialized.conceptDescriptions).toHaveLength(1);

        // Second serialization - deserialize again to verify content equivalence
        const xml2 = serializeXml(deserialized);
        const deserialized2 = deserializeXml(xml2);

        // Verify both deserializations produce equivalent structures
        expect(deserialized2.assetAdministrationShells).toHaveLength(deserialized.assetAdministrationShells!.length);
        expect(deserialized2.submodels).toHaveLength(deserialized.submodels!.length);
        expect(deserialized2.conceptDescriptions).toHaveLength(deserialized.conceptDescriptions!.length);

        // Verify submodel elements are preserved (count and types)
        for (let i = 0; i < deserialized.submodels!.length; i++) {
            const sm1 = deserialized.submodels![i];
            const sm2 = deserialized2.submodels![i];
            expect(sm2.id).toBe(sm1.id);
            expect(sm2.idShort).toBe(sm1.idShort);
            if (sm1.submodelElements) {
                expect(sm2.submodelElements).toHaveLength(sm1.submodelElements.length);
            }
        }
    });
});
