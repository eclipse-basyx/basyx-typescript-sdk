import {
    AdministrativeInformation,
    AssetAdministrationShell,
    AssetInformation,
    AssetKind,
    DataSpecificationIec61360,
    DataTypeDefXsd,
    DataTypeIec61360,
    EmbeddedDataSpecification,
    Extension,
    Key,
    KeyTypes,
    LangStringDefinitionTypeIec61360,
    LangStringNameType,
    LangStringPreferredNameTypeIec61360,
    LangStringShortNameTypeIec61360,
    LangStringTextType,
    LevelType,
    Reference,
    ReferenceTypes,
    Resource,
    SpecificAssetId,
    ValueList,
    ValueReferencePair,
} from '@aas-core-works/aas-core3.1-typescript/types';

export function createTestAas(): AssetAdministrationShell {
    return new AssetAdministrationShell(
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
                [
                    new Reference(ReferenceTypes.ExternalReference, [
                        new Key(KeyTypes.GlobalReference, 'Extension1Key2'),
                    ]),
                ],
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
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://admin-shell.io/aas/3/0/RC02/AdministrativeInformation/1/0'
                    ),
                ]),
                new DataSpecificationIec61360(
                    [new LangStringPreferredNameTypeIec61360('en', 'Administrative Information Data Specification')],
                    [new LangStringShortNameTypeIec61360('en', 'AdminInfoDS')],
                    '1.0',
                    new Reference(ReferenceTypes.ExternalReference, [
                        new Key(
                            KeyTypes.GlobalReference,
                            'http://admin-shell.io/iec61360/1/0/DataSpecificationIEC61360'
                        ),
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
                    new Key(
                        KeyTypes.GlobalReference,
                        'http://admin-shell.io/aas/3/0/RC02/AdministrativeInformation/1/0'
                    ),
                ]),
                new DataSpecificationIec61360(
                    [new LangStringPreferredNameTypeIec61360('en', 'Administrative Information Data Specification')],
                    [new LangStringShortNameTypeIec61360('en', 'AdminInfoDS')],
                    '1.0',
                    new Reference(ReferenceTypes.ExternalReference, [
                        new Key(
                            KeyTypes.GlobalReference,
                            'http://admin-shell.io/iec61360/1/0/DataSpecificationIEC61360'
                        ),
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
}

export function createTestAasMinimal(): AssetAdministrationShell {
    return new AssetAdministrationShell(
        'https://acplt.org/Test_AssetAdministrationShell',
        new AssetInformation(AssetKind.Instance)
    );
}
