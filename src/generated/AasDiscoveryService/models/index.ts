/* tslint:disable */
/* eslint-disable */
/**
 * 
 * @export
 * @interface AssetLink
 */
export interface AssetLink {
    /**
     * 
     * @type {string}
     * @memberof AssetLink
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof AssetLink
     */
    value?: string;
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
 * @interface InlineResponse200
 */
export interface InlineResponse200 {
    /**
     * 
     * @type {PagedResultPagingMetadata}
     * @memberof InlineResponse200
     */
    pagingMetadata: PagedResultPagingMetadata;
    /**
     * 
     * @type {Array<string>}
     * @memberof InlineResponse200
     */
    result?: Array<string>;
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
 * @interface SpecificAssetId
 */
export interface SpecificAssetId {
    /**
     * 
     * @type {Reference}
     * @memberof SpecificAssetId
     */
    semanticId?: Reference;
    /**
     * 
     * @type {Array<Reference>}
     * @memberof SpecificAssetId
     */
    supplementalSemanticIds?: Array<Reference>;
    /**
     * 
     * @type {string}
     * @memberof SpecificAssetId
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof SpecificAssetId
     */
    value: string;
    /**
     * 
     * @type {Reference}
     * @memberof SpecificAssetId
     */
    externalSubjectId?: Reference;
}
