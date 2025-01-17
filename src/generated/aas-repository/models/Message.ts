/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Message = {
    code?: string;
    correlationId?: string;
    messageType?: Message.messageType;
    text?: string;
    timestamp?: string;
};
export namespace Message {
    export enum messageType {
        UNDEFINED = 'Undefined',
        INFO = 'Info',
        WARNING = 'Warning',
        ERROR = 'Error',
        EXCEPTION = 'Exception',
    }
}

