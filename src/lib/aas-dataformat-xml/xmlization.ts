import { jsonization } from '@aas-core-works/aas-core3.0-typescript';
import { XMLBuilder } from 'fast-xml-parser';
import { BaSyxEnvironment } from '../../../src/models/BaSyxEnvironment';

export function serializeXml(data: BaSyxEnvironment): string {
    console.log('serializeXml called with data:', data);

    // Return empty string for empty environment
    if (!data.assetAdministrationShells?.length && !data.submodels?.length && !data.conceptDescriptions?.length) {
        return '';
    }

    const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        attributeValueProcessor: (name, val) => val,
        format: true,
        indentBy: '  ',
        suppressEmptyNode: true,
        suppressBooleanAttributes: false,
        processEntities: true,
        cdataPropName: '__cdata',
        arrayNodeName: 'element',
        suppressUnpairedNode: false,
        unpairedTags: [],
        tagValueProcessor: (name, val) => val,
    });

    // Transform and add aas: prefix to all elements
    const envData = transformEnvironmentToXmlStructure(data);
    const prefixedData = addAasPrefix(envData);

    // Wrap the environment data with proper XML declaration and namespace
    const xmlObject = {
        '?xml': {
            '@_version': '1.0',
            '@_encoding': 'UTF-8',
        },
        'aas:environment': {
            '@_xmlns:aas': 'https://admin-shell.io/aas/3/1',
            '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            '@_xsi:schemaLocation': 'https://admin-shell.io/aas/3/1 AAS.xsd',
            ...prefixedData,
        },
    };

    return builder.build(xmlObject);
}

/**
 * Recursively adds 'aas:' prefix to all object keys except attributes
 */
function addAasPrefix(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => addAasPrefix(item));
    }

    if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            // Skip attributes (they start with @_) and keys that already have aas: prefix
            if (key.startsWith('@_') || key.startsWith('aas:')) {
                result[key] = addAasPrefix(obj[key]);
            } else {
                result[`aas:${key}`] = addAasPrefix(obj[key]);
            }
        }
        return result;
    }

    return obj;
}
function transformEnvironmentToXmlStructure(env: BaSyxEnvironment): any {
    const result: any = {};

    // Convert entire environment to jsonable to handle all enum conversions
    const jsonableEnv = JSON.parse(JSON.stringify(jsonization.toJsonable(env)));

    // Transform Asset Administration Shells
    if (jsonableEnv.assetAdministrationShells && jsonableEnv.assetAdministrationShells.length > 0) {
        result['assetAdministrationShells'] = {
            'assetAdministrationShell': jsonableEnv.assetAdministrationShells.map(transformAAS),
        };
    }

    // Transform Submodels
    if (jsonableEnv.submodels && jsonableEnv.submodels.length > 0) {
        result['submodels'] = {
            'submodel': jsonableEnv.submodels.map(transformSubmodel),
        };
    }

    // Transform Concept Descriptions
    if (jsonableEnv.conceptDescriptions && jsonableEnv.conceptDescriptions.length > 0) {
        result['conceptDescriptions'] = {
            'conceptDescription': jsonableEnv.conceptDescriptions.map(transformConceptDescription),
        };
    }

    return result;
}

function transformAAS(aas: any): any {
    const result: any = {};

    // hasExtensions (from referable)
    if (aas.extensions && aas.extensions.length > 0) {
        result['extensions'] = {
            'extension': aas.extensions.map(transformExtension),
        };
    }

    // category (from referable)
    if (aas.category) {
        result['category'] = aas.category;
    }

    // idShort (from referable)
    if (aas.idShort) {
        result['idShort'] = aas.idShort;
    }

    // displayName (from referable)
    if (aas.displayName && aas.displayName.length > 0) {
        result['displayName'] = {
            'langStringNameType': aas.displayName.map(transformLangString),
        };
    }

    // description (from referable)
    if (aas.description && aas.description.length > 0) {
        result['description'] = {
            'langStringTextType': aas.description.map(transformLangString),
        };
    }

    // administration (from identifiable)
    if (aas.administration) {
        result['administration'] = transformAdministrativeInformation(aas.administration);
    }

    // id (from identifiable) - REQUIRED
    result['id'] = aas.id;

    // embeddedDataSpecifications (from hasDataSpecification)
    if (aas.embeddedDataSpecifications && aas.embeddedDataSpecifications.length > 0) {
        result['embeddedDataSpecifications'] = {
            'embeddedDataSpecification': aas.embeddedDataSpecifications.map(transformEmbeddedDataSpecification),
        };
    }

    // derivedFrom (specific to AAS)
    if (aas.derivedFrom) {
        result['derivedFrom'] = transformReference(aas.derivedFrom);
    }

    // assetInformation (specific to AAS) - REQUIRED
    result['assetInformation'] = transformAssetInformation(aas.assetInformation);

    // submodels (specific to AAS)
    if (aas.submodels && aas.submodels.length > 0) {
        result['submodels'] = {
            'reference': aas.submodels.map(transformReference),
        };
    }

    return result;
}

function transformExtension(ext: any): any {
    const result: any = {};

    // semanticId (from hasSemantics)
    if (ext.semanticId) {
        result.semanticId = transformReference(ext.semanticId);
    }

    // supplementalSemanticIds (from hasSemantics)
    if (ext.supplementalSemanticIds && ext.supplementalSemanticIds.length > 0) {
        result.supplementalSemanticIds = {
            reference: ext.supplementalSemanticIds.map(transformReference),
        };
    }

    // name - REQUIRED
    result.name = ext.name;

    // valueType
    if (ext.valueType !== undefined && ext.valueType !== null) {
        result.valueType = ext.valueType;
    }

    // value
    if (ext.value !== undefined && ext.value !== null) {
        result.value = ext.value;
    }

    // refersTo
    if (ext.refersTo && ext.refersTo.length > 0) {
        result.refersTo = {
            reference: ext.refersTo.map(transformReference),
        };
    }

    return result;
}

function transformLangString(langStr: any): any {
    return {
        language: langStr.language,
        text: langStr.text,
    };
}

function transformAdministrativeInformation(admin: any): any {
    const result: any = {};

    // embeddedDataSpecifications (from hasDataSpecification)
    if (admin.embeddedDataSpecifications && admin.embeddedDataSpecifications.length > 0) {
        result.embeddedDataSpecifications = {
            embeddedDataSpecification: admin.embeddedDataSpecifications.map(transformEmbeddedDataSpecification),
        };
    }

    // version
    if (admin.version) {
        result.version = admin.version;
    }

    // revision
    if (admin.revision) {
        result.revision = admin.revision;
    }

    // creator
    if (admin.creator) {
        result.creator = transformReference(admin.creator);
    }

    // templateId
    if (admin.templateId) {
        result.templateId = admin.templateId;
    }

    return result;
}

function transformEmbeddedDataSpecification(eds: any): any {
    const result: any = {};

    // dataSpecification - REQUIRED
    result.dataSpecification = transformReference(eds.dataSpecification);

    // dataSpecificationContent
    if (eds.dataSpecificationContent) {
        result.dataSpecificationContent = transformDataSpecificationContent(eds.dataSpecificationContent);
    }

    return result;
}

function transformDataSpecificationContent(content: any): any {
    // Check the type and transform accordingly
    // For now, assume IEC61360
    if (content.preferredName) {
        return {
            dataSpecificationIec61360: transformDataSpecificationIec61360(content),
        };
    }
    return content;
}

function transformDataSpecificationIec61360(spec: any): any {
    const result: any = {};

    // preferredName - REQUIRED
    if (spec.preferredName && spec.preferredName.length > 0) {
        result.preferredName = {
            langStringPreferredNameTypeIec61360: spec.preferredName.map(transformLangString),
        };
    }

    // shortName
    if (spec.shortName && spec.shortName.length > 0) {
        result.shortName = {
            langStringShortNameTypeIec61360: spec.shortName.map(transformLangString),
        };
    }

    // unit
    if (spec.unit) {
        result.unit = spec.unit;
    }

    // unitId
    if (spec.unitId) {
        result.unitId = transformReference(spec.unitId);
    }

    // sourceOfDefinition
    if (spec.sourceOfDefinition) {
        result.sourceOfDefinition = spec.sourceOfDefinition;
    }

    // symbol
    if (spec.symbol) {
        result.symbol = spec.symbol;
    }

    // dataType
    if (spec.dataType !== undefined && spec.dataType !== null) {
        result.dataType = spec.dataType;
    }

    // definition
    if (spec.definition && spec.definition.length > 0) {
        result.definition = {
            langStringDefinitionTypeIec61360: spec.definition.map(transformLangString),
        };
    }

    // valueFormat
    if (spec.valueFormat) {
        result.valueFormat = spec.valueFormat;
    }

    // valueList
    if (spec.valueList) {
        result.valueList = transformValueList(spec.valueList);
    }

    // value
    if (spec.value) {
        result.value = spec.value;
    }

    // levelType
    if (spec.levelType) {
        result.levelType = spec.levelType;
    }

    return result;
}

function transformValueList(valueList: any): any {
    if (!valueList.valueReferencePairs || valueList.valueReferencePairs.length === 0) {
        return valueList;
    }

    return {
        valueReferencePairs: {
            valueReferencePair: valueList.valueReferencePairs.map((vrp: any) => ({
                value: vrp.value,
                ...(vrp.valueId && { valueId: transformReference(vrp.valueId) }),
            })),
        },
    };
}

function transformReference(ref: any): any {
    const result: any = {};

    // type - REQUIRED
    result.type = ref.type;

    // referredSemanticId
    if (ref.referredSemanticId) {
        result.referredSemanticId = transformReference(ref.referredSemanticId);
    }

    // keys - REQUIRED
    if (ref.keys && ref.keys.length > 0) {
        result.keys = {
            key: ref.keys.map((k: any) => ({
                type: k.type,
                value: k.value,
            })),
        };
    }

    return result;
}

function transformAssetInformation(assetInfo: any): any {
    const result: any = {};

    // assetKind - REQUIRED
    // Convert AssetKind enum to string value
    const assetKindValue = getAssetKindString(assetInfo.assetKind);
    result['assetKind'] = assetKindValue;

    // globalAssetId
    if (assetInfo.globalAssetId) {
        result['globalAssetId'] = assetInfo.globalAssetId;
    }

    // specificAssetIds
    if (assetInfo.specificAssetIds && assetInfo.specificAssetIds.length > 0) {
        result['specificAssetIds'] = {
            'specificAssetId': assetInfo.specificAssetIds.map(transformSpecificAssetId),
        };
    }

    // assetType
    if (assetInfo.assetType) {
        result['assetType'] = assetInfo.assetType;
    }

    // defaultThumbnail
    if (assetInfo.defaultThumbnail) {
        result['defaultThumbnail'] = transformResource(assetInfo.defaultThumbnail);
    }

    return result;
}

function getAssetKindString(assetKind: any): string {
    // toJsonable() already converts enums to strings
    return assetKind;
}

function transformSpecificAssetId(sai: any): any {
    const result: any = {};

    // name - REQUIRED
    result.name = sai.name;

    // value - REQUIRED
    result.value = sai.value;

    // externalSubjectId
    if (sai.externalSubjectId) {
        result.externalSubjectId = transformReference(sai.externalSubjectId);
    }

    // semanticId (from hasSemantics)
    if (sai.semanticId) {
        result.semanticId = transformReference(sai.semanticId);
    }

    // supplementalSemanticIds (from hasSemantics)
    if (sai.supplementalSemanticIds && sai.supplementalSemanticIds.length > 0) {
        result.supplementalSemanticIds = {
            reference: sai.supplementalSemanticIds.map(transformReference),
        };
    }

    return result;
}

function transformResource(resource: any): any {
    const result: any = {};

    // path - REQUIRED
    result.path = resource.path;

    // contentType
    if (resource.contentType) {
        result.contentType = resource.contentType;
    }

    return result;
}

function transformSubmodel(submodel: any): any {
    // TODO: Implement full Submodel transformation according to XSD
    return submodel;
}

function transformConceptDescription(cd: any): any {
    // TODO: Implement full ConceptDescription transformation according to XSD
    return cd;
}

export function deserializeXml(xmlString: string): BaSyxEnvironment {
    console.log('deserializeXml called with xmlString:', xmlString);
    return new BaSyxEnvironment();
}
