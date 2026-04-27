/* tslint:disable */
/* eslint-disable */
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
 * @interface GetPackageDescriptionsResult
 */
export interface GetPackageDescriptionsResult {
    /**
     * 
     * @type {PagedResultPagingMetadata}
     * @memberof GetPackageDescriptionsResult
     */
    paging_metadata?: PagedResultPagingMetadata;
    /**
     * 
     * @type {Array<PackageDescription>}
     * @memberof GetPackageDescriptionsResult
     */
    result?: Array<PackageDescription>;
}
/**
 * 
 * @export
 * @interface PackageDescription
 */
export interface PackageDescription {
    /**
     * 
     * @type {Array<string>}
     * @memberof PackageDescription
     */
    aasIds?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof PackageDescription
     */
    packageId?: string;
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
 * @interface Result
 */
export interface Result {
    /**
     * 
     * @type {Array<Message>}
     * @memberof Result
     */
    messages?: Array<Message>;
    /**
     * 
     * @type {boolean}
     * @memberof Result
     */
    success?: boolean;
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
