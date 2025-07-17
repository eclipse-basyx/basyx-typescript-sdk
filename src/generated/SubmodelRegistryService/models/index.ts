/* tslint:disable */
/* eslint-disable */
/**
 * 
 * @export
 * @interface AbstractLangString
 */
export interface AbstractLangString {
    /**
     * 
     * @type {string}
     * @memberof AbstractLangString
     */
    language: string;
    /**
     * 
     * @type {string}
     * @memberof AbstractLangString
     */
    text: string;
}
/**
 * 
 * @export
 * @interface AdministrativeInformation
 */
export interface AdministrativeInformation {
    /**
     * 
     * @type {Array<EmbeddedDataSpecification>}
     * @memberof AdministrativeInformation
     */
    embeddedDataSpecifications?: Array<EmbeddedDataSpecification>;
    /**
     * 
     * @type {AdministrativeInformationAllOfVersion}
     * @memberof AdministrativeInformation
     */
    version?: AdministrativeInformationAllOfVersion;
    /**
     * 
     * @type {AdministrativeInformationAllOfRevision}
     * @memberof AdministrativeInformation
     */
    revision?: AdministrativeInformationAllOfRevision;
    /**
     * 
     * @type {Reference}
     * @memberof AdministrativeInformation
     */
    creator?: Reference;
    /**
     * 
     * @type {string}
     * @memberof AdministrativeInformation
     */
    templateId?: string;
}
/**
 * 
 * @export
 * @interface AdministrativeInformationAllOfRevision
 */
export interface AdministrativeInformationAllOfRevision {
}
/**
 * 
 * @export
 * @interface AdministrativeInformationAllOfVersion
 */
export interface AdministrativeInformationAllOfVersion {
}
/**
 * 
 * @export
 * @interface DataSpecificationContent
 */
export interface DataSpecificationContent {
    /**
     * 
     * @type {ModelType}
     * @memberof DataSpecificationContent
     */
    modelType: ModelType;
}


/**
 * @type DataSpecificationContentChoice
 * 
 * @export
 */
export type DataSpecificationContentChoice = DataSpecificationIec61360;
/**
 * 
 * @export
 * @interface DataSpecificationIec61360
 */
export interface DataSpecificationIec61360 {
    /**
     * 
     * @type {any}
     * @memberof DataSpecificationIec61360
     */
    modelType: any | null;
    /**
     * 
     * @type {Array<LangStringPreferredNameTypeIec61360>}
     * @memberof DataSpecificationIec61360
     */
    preferredName: Array<LangStringPreferredNameTypeIec61360>;
    /**
     * 
     * @type {Array<LangStringShortNameTypeIec61360>}
     * @memberof DataSpecificationIec61360
     */
    shortName?: Array<LangStringShortNameTypeIec61360>;
    /**
     * 
     * @type {string}
     * @memberof DataSpecificationIec61360
     */
    unit?: string;
    /**
     * 
     * @type {Reference}
     * @memberof DataSpecificationIec61360
     */
    unitId?: Reference;
    /**
     * 
     * @type {string}
     * @memberof DataSpecificationIec61360
     */
    sourceOfDefinition?: string;
    /**
     * 
     * @type {string}
     * @memberof DataSpecificationIec61360
     */
    symbol?: string;
    /**
     * 
     * @type {DataTypeIec61360}
     * @memberof DataSpecificationIec61360
     */
    dataType?: DataTypeIec61360;
    /**
     * 
     * @type {Array<LangStringDefinitionTypeIec61360>}
     * @memberof DataSpecificationIec61360
     */
    definition?: Array<LangStringDefinitionTypeIec61360>;
    /**
     * 
     * @type {string}
     * @memberof DataSpecificationIec61360
     */
    valueFormat?: string;
    /**
     * 
     * @type {ValueList}
     * @memberof DataSpecificationIec61360
     */
    valueList?: ValueList;
    /**
     * 
     * @type {string}
     * @memberof DataSpecificationIec61360
     */
    value?: string;
    /**
     * 
     * @type {LevelType}
     * @memberof DataSpecificationIec61360
     */
    levelType?: LevelType;
}



/**
 * 
 * @export
 */
export const DataTypeDefXsd = {
    XsAnyUri: 'xs:anyURI',
    XsBase64Binary: 'xs:base64Binary',
    XsBoolean: 'xs:boolean',
    XsByte: 'xs:byte',
    XsDate: 'xs:date',
    XsDateTime: 'xs:dateTime',
    XsDecimal: 'xs:decimal',
    XsDouble: 'xs:double',
    XsDuration: 'xs:duration',
    XsFloat: 'xs:float',
    XsGDay: 'xs:gDay',
    XsGMonth: 'xs:gMonth',
    XsGMonthDay: 'xs:gMonthDay',
    XsGYear: 'xs:gYear',
    XsGYearMonth: 'xs:gYearMonth',
    XsHexBinary: 'xs:hexBinary',
    XsInt: 'xs:int',
    XsInteger: 'xs:integer',
    XsLong: 'xs:long',
    XsNegativeInteger: 'xs:negativeInteger',
    XsNonNegativeInteger: 'xs:nonNegativeInteger',
    XsNonPositiveInteger: 'xs:nonPositiveInteger',
    XsPositiveInteger: 'xs:positiveInteger',
    XsShort: 'xs:short',
    XsString: 'xs:string',
    XsTime: 'xs:time',
    XsUnsignedByte: 'xs:unsignedByte',
    XsUnsignedInt: 'xs:unsignedInt',
    XsUnsignedLong: 'xs:unsignedLong',
    XsUnsignedShort: 'xs:unsignedShort'
} as const;
export type DataTypeDefXsd = typeof DataTypeDefXsd[keyof typeof DataTypeDefXsd];


/**
 * 
 * @export
 */
export const DataTypeIec61360 = {
    Blob: 'BLOB',
    Boolean: 'BOOLEAN',
    Date: 'DATE',
    File: 'FILE',
    Html: 'HTML',
    IntegerCount: 'INTEGER_COUNT',
    IntegerCurrency: 'INTEGER_CURRENCY',
    IntegerMeasure: 'INTEGER_MEASURE',
    Irdi: 'IRDI',
    Iri: 'IRI',
    Rational: 'RATIONAL',
    RationalMeasure: 'RATIONAL_MEASURE',
    RealCount: 'REAL_COUNT',
    RealCurrency: 'REAL_CURRENCY',
    RealMeasure: 'REAL_MEASURE',
    String: 'STRING',
    StringTranslatable: 'STRING_TRANSLATABLE',
    Time: 'TIME',
    Timestamp: 'TIMESTAMP'
} as const;
export type DataTypeIec61360 = typeof DataTypeIec61360[keyof typeof DataTypeIec61360];

/**
 * 
 * @export
 * @interface Descriptor
 */
export interface Descriptor {
    /**
     * 
     * @type {Array<LangStringTextType>}
     * @memberof Descriptor
     */
    description?: Array<LangStringTextType>;
    /**
     * 
     * @type {Array<LangStringNameType>}
     * @memberof Descriptor
     */
    displayName?: Array<LangStringNameType>;
    /**
     * 
     * @type {Array<Extension>}
     * @memberof Descriptor
     */
    extensions?: Array<Extension>;
}
/**
 * 
 * @export
 * @interface EmbeddedDataSpecification
 */
export interface EmbeddedDataSpecification {
    /**
     * 
     * @type {DataSpecificationContentChoice}
     * @memberof EmbeddedDataSpecification
     */
    dataSpecificationContent: DataSpecificationContentChoice;
    /**
     * 
     * @type {Reference}
     * @memberof EmbeddedDataSpecification
     */
    dataSpecification: Reference;
}
/**
 * 
 * @export
 * @interface Endpoint
 */
export interface Endpoint {
    /**
     * 
     * @type {string}
     * @memberof Endpoint
     */
    _interface: string;
    /**
     * 
     * @type {ProtocolInformation}
     * @memberof Endpoint
     */
    protocolInformation: ProtocolInformation;
}
/**
 * 
 * @export
 * @interface Extension
 */
export interface Extension {
    /**
     * 
     * @type {Reference}
     * @memberof Extension
     */
    semanticId?: Reference;
    /**
     * 
     * @type {Array<Reference>}
     * @memberof Extension
     */
    supplementalSemanticIds?: Array<Reference>;
    /**
     * 
     * @type {string}
     * @memberof Extension
     */
    name: string;
    /**
     * 
     * @type {DataTypeDefXsd}
     * @memberof Extension
     */
    valueType?: DataTypeDefXsd;
    /**
     * 
     * @type {string}
     * @memberof Extension
     */
    value?: string;
    /**
     * 
     * @type {Array<Reference>}
     * @memberof Extension
     */
    refersTo?: Array<Reference>;
}


/**
 * 
 * @export
 * @interface GetSubmodelDescriptorsResult
 */
export interface GetSubmodelDescriptorsResult {
    /**
     * 
     * @type {PagedResultPagingMetadata}
     * @memberof GetSubmodelDescriptorsResult
     */
    pagingMetadata: PagedResultPagingMetadata;
    /**
     * 
     * @type {Array<SubmodelDescriptor>}
     * @memberof GetSubmodelDescriptorsResult
     */
    result?: Array<SubmodelDescriptor>;
}
/**
 * 
 * @export
 * @interface HasDataSpecification
 */
export interface HasDataSpecification {
    /**
     * 
     * @type {Array<EmbeddedDataSpecification>}
     * @memberof HasDataSpecification
     */
    embeddedDataSpecifications?: Array<EmbeddedDataSpecification>;
}
/**
 * 
 * @export
 * @interface HasSemantics
 */
export interface HasSemantics {
    /**
     * 
     * @type {Reference}
     * @memberof HasSemantics
     */
    semanticId?: Reference;
    /**
     * 
     * @type {Array<Reference>}
     * @memberof HasSemantics
     */
    supplementalSemanticIds?: Array<Reference>;
}
/**
 * 
 * @export
 * @interface Key
 */
export interface Key {
    /**
     * 
     * @type {KeyTypes}
     * @memberof Key
     */
    type: KeyTypes;
    /**
     * 
     * @type {string}
     * @memberof Key
     */
    value: string;
}



/**
 * 
 * @export
 */
export const KeyTypes = {
    AnnotatedRelationshipElement: 'AnnotatedRelationshipElement',
    AssetAdministrationShell: 'AssetAdministrationShell',
    BasicEventElement: 'BasicEventElement',
    Blob: 'Blob',
    Capability: 'Capability',
    ConceptDescription: 'ConceptDescription',
    DataElement: 'DataElement',
    Entity: 'Entity',
    EventElement: 'EventElement',
    File: 'File',
    FragmentReference: 'FragmentReference',
    GlobalReference: 'GlobalReference',
    Identifiable: 'Identifiable',
    MultiLanguageProperty: 'MultiLanguageProperty',
    Operation: 'Operation',
    Property: 'Property',
    Range: 'Range',
    Referable: 'Referable',
    ReferenceElement: 'ReferenceElement',
    RelationshipElement: 'RelationshipElement',
    Submodel: 'Submodel',
    SubmodelElement: 'SubmodelElement',
    SubmodelElementCollection: 'SubmodelElementCollection',
    SubmodelElementList: 'SubmodelElementList'
} as const;
export type KeyTypes = typeof KeyTypes[keyof typeof KeyTypes];

/**
 * 
 * @export
 * @interface LangStringDefinitionTypeIec61360
 */
export interface LangStringDefinitionTypeIec61360 {
    /**
     * 
     * @type {string}
     * @memberof LangStringDefinitionTypeIec61360
     */
    language: string;
    /**
     * 
     * @type {any}
     * @memberof LangStringDefinitionTypeIec61360
     */
    text: any | null;
}
/**
 * 
 * @export
 * @interface LangStringNameType
 */
export interface LangStringNameType {
    /**
     * 
     * @type {string}
     * @memberof LangStringNameType
     */
    language: string;
    /**
     * 
     * @type {any}
     * @memberof LangStringNameType
     */
    text: any | null;
}
/**
 * 
 * @export
 * @interface LangStringPreferredNameTypeIec61360
 */
export interface LangStringPreferredNameTypeIec61360 {
    /**
     * 
     * @type {string}
     * @memberof LangStringPreferredNameTypeIec61360
     */
    language: string;
    /**
     * 
     * @type {any}
     * @memberof LangStringPreferredNameTypeIec61360
     */
    text: any | null;
}
/**
 * 
 * @export
 * @interface LangStringShortNameTypeIec61360
 */
export interface LangStringShortNameTypeIec61360 {
    /**
     * 
     * @type {string}
     * @memberof LangStringShortNameTypeIec61360
     */
    language: string;
    /**
     * 
     * @type {any}
     * @memberof LangStringShortNameTypeIec61360
     */
    text: any | null;
}
/**
 * 
 * @export
 * @interface LangStringTextType
 */
export interface LangStringTextType {
    /**
     * 
     * @type {string}
     * @memberof LangStringTextType
     */
    language: string;
    /**
     * 
     * @type {any}
     * @memberof LangStringTextType
     */
    text: any | null;
}
/**
 * 
 * @export
 * @interface LevelType
 */
export interface LevelType {
    /**
     * 
     * @type {boolean}
     * @memberof LevelType
     */
    min: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof LevelType
     */
    nom: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof LevelType
     */
    typ: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof LevelType
     */
    max: boolean;
}
/**
 * 
 * @export
 * @interface Message
 */
export interface Message {
    /**
     * 
     * @type {string}
     * @memberof Message
     */
    code?: string;
    /**
     * 
     * @type {string}
     * @memberof Message
     */
    correlationId?: string;
    /**
     * 
     * @type {string}
     * @memberof Message
     */
    messageType?: MessageMessageTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof Message
     */
    text?: string;
    /**
     * 
     * @type {string}
     * @memberof Message
     */
    timestamp?: string;
}


/**
 * @export
 */
export const MessageMessageTypeEnum = {
    Undefined: 'Undefined',
    Info: 'Info',
    Warning: 'Warning',
    Error: 'Error',
    Exception: 'Exception'
} as const;
export type MessageMessageTypeEnum = typeof MessageMessageTypeEnum[keyof typeof MessageMessageTypeEnum];


/**
 * 
 * @export
 */
export const ModelType = {
    AnnotatedRelationshipElement: 'AnnotatedRelationshipElement',
    AssetAdministrationShell: 'AssetAdministrationShell',
    BasicEventElement: 'BasicEventElement',
    Blob: 'Blob',
    Capability: 'Capability',
    ConceptDescription: 'ConceptDescription',
    DataSpecificationIec61360: 'DataSpecificationIec61360',
    Entity: 'Entity',
    File: 'File',
    MultiLanguageProperty: 'MultiLanguageProperty',
    Operation: 'Operation',
    Property: 'Property',
    Range: 'Range',
    ReferenceElement: 'ReferenceElement',
    RelationshipElement: 'RelationshipElement',
    Submodel: 'Submodel',
    SubmodelElementCollection: 'SubmodelElementCollection',
    SubmodelElementList: 'SubmodelElementList'
} as const;
export type ModelType = typeof ModelType[keyof typeof ModelType];

/**
 * 
 * @export
 * @interface PagedResult
 */
export interface PagedResult {
    /**
     * 
     * @type {PagedResultPagingMetadata}
     * @memberof PagedResult
     */
    pagingMetadata: PagedResultPagingMetadata;
}
/**
 * 
 * @export
 * @interface PagedResultPagingMetadata
 */
export interface PagedResultPagingMetadata {
    /**
     * 
     * @type {string}
     * @memberof PagedResultPagingMetadata
     */
    cursor?: string;
}
/**
 * 
 * @export
 * @interface ProtocolInformation
 */
export interface ProtocolInformation {
    /**
     * 
     * @type {string}
     * @memberof ProtocolInformation
     */
    href: string;
    /**
     * 
     * @type {string}
     * @memberof ProtocolInformation
     */
    endpointProtocol?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof ProtocolInformation
     */
    endpointProtocolVersion?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof ProtocolInformation
     */
    subprotocol?: string;
    /**
     * 
     * @type {string}
     * @memberof ProtocolInformation
     */
    subprotocolBody?: string;
    /**
     * 
     * @type {string}
     * @memberof ProtocolInformation
     */
    subprotocolBodyEncoding?: string;
    /**
     * 
     * @type {Array<ProtocolInformationSecurityAttributes>}
     * @memberof ProtocolInformation
     */
    securityAttributes?: Array<ProtocolInformationSecurityAttributes>;
}
/**
 * 
 * @export
 * @interface ProtocolInformationSecurityAttributes
 */
export interface ProtocolInformationSecurityAttributes {
    /**
     * 
     * @type {string}
     * @memberof ProtocolInformationSecurityAttributes
     */
    type: ProtocolInformationSecurityAttributesTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof ProtocolInformationSecurityAttributes
     */
    key: string;
    /**
     * 
     * @type {string}
     * @memberof ProtocolInformationSecurityAttributes
     */
    value: string;
}


/**
 * @export
 */
export const ProtocolInformationSecurityAttributesTypeEnum = {
    None: 'NONE',
    RfcTlsa: 'RFC_TLSA',
    W3CDid: 'W3C_DID'
} as const;
export type ProtocolInformationSecurityAttributesTypeEnum = typeof ProtocolInformationSecurityAttributesTypeEnum[keyof typeof ProtocolInformationSecurityAttributesTypeEnum];

/**
 * 
 * @export
 * @interface Reference
 */
export interface Reference {
    /**
     * 
     * @type {ReferenceTypes}
     * @memberof Reference
     */
    type: ReferenceTypes;
    /**
     * 
     * @type {Array<Key>}
     * @memberof Reference
     */
    keys: Array<Key>;
    /**
     * 
     * @type {ReferenceParent}
     * @memberof Reference
     */
    referredSemanticId?: ReferenceParent;
}


/**
 * 
 * @export
 * @interface ReferenceParent
 */
export interface ReferenceParent {
    /**
     * 
     * @type {ReferenceTypes}
     * @memberof ReferenceParent
     */
    type: ReferenceTypes;
    /**
     * 
     * @type {Array<Key>}
     * @memberof ReferenceParent
     */
    keys: Array<Key>;
}



/**
 * 
 * @export
 */
export const ReferenceTypes = {
    ExternalReference: 'ExternalReference',
    ModelReference: 'ModelReference'
} as const;
export type ReferenceTypes = typeof ReferenceTypes[keyof typeof ReferenceTypes];

/**
 * 
 * @export
 * @interface Result
 */
export interface Result {
    /**
     * 
     * @type {Array<Message>}
     * @memberof Result
     */
    messages?: Array<Message>;
}
/**
 * The Description object enables servers to present their capabilities to the clients, in particular which profiles they implement. At least one defined profile is required. Additional, proprietary attributes might be included. Nevertheless, the server must not expect that a regular client understands them.
 * @export
 * @interface ServiceDescription
 */
export interface ServiceDescription {
    /**
     * 
     * @type {Array<string>}
     * @memberof ServiceDescription
     */
    profiles?: Array<string>;
}
/**
 * 
 * @export
 * @interface SubmodelDescriptor
 */
export interface SubmodelDescriptor {
    /**
     * 
     * @type {AdministrativeInformation}
     * @memberof SubmodelDescriptor
     */
    administration?: AdministrativeInformation;
    /**
     * 
     * @type {Array<Endpoint>}
     * @memberof SubmodelDescriptor
     */
    endpoints: Array<Endpoint>;
    /**
     * 
     * @type {string}
     * @memberof SubmodelDescriptor
     */
    idShort?: string;
    /**
     * 
     * @type {string}
     * @memberof SubmodelDescriptor
     */
    id: string;
    /**
     * 
     * @type {Reference}
     * @memberof SubmodelDescriptor
     */
    semanticId?: Reference;
    /**
     * 
     * @type {Array<Reference>}
     * @memberof SubmodelDescriptor
     */
    supplementalSemanticId?: Array<Reference>;
    /**
     * 
     * @type {Array<LangStringTextType>}
     * @memberof SubmodelDescriptor
     */
    description?: Array<LangStringTextType>;
    /**
     * 
     * @type {Array<LangStringNameType>}
     * @memberof SubmodelDescriptor
     */
    displayName?: Array<LangStringNameType>;
    /**
     * 
     * @type {Array<Extension>}
     * @memberof SubmodelDescriptor
     */
    extensions?: Array<Extension>;
}
/**
 * 
 * @export
 * @interface ValueList
 */
export interface ValueList {
    /**
     * 
     * @type {Array<ValueReferencePair>}
     * @memberof ValueList
     */
    valueReferencePairs: Array<ValueReferencePair>;
}
/**
 * 
 * @export
 * @interface ValueReferencePair
 */
export interface ValueReferencePair {
    /**
     * 
     * @type {string}
     * @memberof ValueReferencePair
     */
    value: string;
    /**
     * 
     * @type {Reference}
     * @memberof ValueReferencePair
     */
    valueId?: Reference;
}
