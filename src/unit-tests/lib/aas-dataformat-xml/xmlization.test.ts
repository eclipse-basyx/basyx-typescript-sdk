import {
    AdministrativeInformation,
    AssetAdministrationShell,
    AssetInformation,
    AssetKind,
    ConceptDescription,
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
} from '@aas-core-works/aas-core3.0-typescript/types';
import { deserializeXml, serializeXml } from '../../../lib/aas-dataformat-xml';
import { BaSyxEnvironment } from '../../../models/BaSyxEnvironment';
import xmlContent from './test-full.xml';

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
        env.conceptDescriptions = [
            TEST_CONCEPT_DESCRIPTION,
            TEST_CONCEPT_DESCRIPTION_MINIMAL,
            TEST_CONCEPT_DESCRIPTION_1,
            TEST_CONCEPT_DESCRIPTION_FULL,
        ];
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
});
