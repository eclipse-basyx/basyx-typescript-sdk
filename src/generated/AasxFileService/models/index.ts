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
