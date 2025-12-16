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
} from '@aas-core-works/aas-core3.0-typescript/types';
import { deserializeXml, serializeXml } from '../../../lib/aas-dataformat-xml';
import { BaSyxEnvironment } from '../../../models/BaSyxEnvironment';
import xmlContent from './testEnvironment.xml';

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

describe('serializeXml', () => {
    test('should return an empty string when encoding an empty string', () => {
        // testEnvironment.xml
        expect(serializeXml(new BaSyxEnvironment())).toBe('');
    });
    test('should return the correct XML when encoding a valid AssetAdministrationShell', () => {
        // testEnvironment.xml
        const env = new BaSyxEnvironment();
        env.assetAdministrationShells = [TEST_AAS];
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
});
