/* tslint:disable */
/* eslint-disable */
/**
 * DotAAS Part 2 | HTTP/REST | Asset Administration Shell Repository Service Specification
 * The Full Profile of the Asset Administration Shell Repository Service Specification as part of the [Specification of the Asset Administration Shell: Part 2](http://industrialdigitaltwin.org/en/content-hub).   Publisher: Industrial Digital Twin Association (IDTA) April 2023
 *
 * The version of the OpenAPI document: V3.0.3_SSP-001
 * Contact: info@idtwin.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { ExecutionState } from './ExecutionState';
import {
    ExecutionStateFromJSON,
    ExecutionStateFromJSONTyped,
    ExecutionStateToJSON,
    ExecutionStateToJSONTyped,
} from './ExecutionState';
import type { OperationVariable } from './OperationVariable';
import {
    OperationVariableFromJSON,
    OperationVariableFromJSONTyped,
    OperationVariableToJSON,
    OperationVariableToJSONTyped,
} from './OperationVariable';
import type { Message } from './Message';
import {
    MessageFromJSON,
    MessageFromJSONTyped,
    MessageToJSON,
    MessageToJSONTyped,
} from './Message';

/**
 * 
 * @export
 * @interface OperationResult
 */
export interface OperationResult {
    /**
     * 
     * @type {Array<Message>}
     * @memberof OperationResult
     */
    messages?: Array<Message>;
    /**
     * 
     * @type {ExecutionState}
     * @memberof OperationResult
     */
    executionState?: ExecutionState;
    /**
     * 
     * @type {boolean}
     * @memberof OperationResult
     */
    success?: boolean;
    /**
     * 
     * @type {Array<OperationVariable>}
     * @memberof OperationResult
     */
    inoutputArguments?: Array<OperationVariable>;
    /**
     * 
     * @type {Array<OperationVariable>}
     * @memberof OperationResult
     */
    outputArguments?: Array<OperationVariable>;
}



/**
 * Check if a given object implements the OperationResult interface.
 */
export function instanceOfOperationResult(value: object): value is OperationResult {
    return true;
}

export function OperationResultFromJSON(json: any): OperationResult {
    return OperationResultFromJSONTyped(json, false);
}

export function OperationResultFromJSONTyped(json: any, ignoreDiscriminator: boolean): OperationResult {
    if (json == null) {
        return json;
    }
    return {
        
        'messages': json['messages'] == null ? undefined : ((json['messages'] as Array<any>).map(MessageFromJSON)),
        'executionState': json['executionState'] == null ? undefined : ExecutionStateFromJSON(json['executionState']),
        'success': json['success'] == null ? undefined : json['success'],
        'inoutputArguments': json['inoutputArguments'] == null ? undefined : ((json['inoutputArguments'] as Array<any>).map(OperationVariableFromJSON)),
        'outputArguments': json['outputArguments'] == null ? undefined : ((json['outputArguments'] as Array<any>).map(OperationVariableFromJSON)),
    };
}

export function OperationResultToJSON(json: any): OperationResult {
    return OperationResultToJSONTyped(json, false);
}

export function OperationResultToJSONTyped(value?: OperationResult | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'messages': value['messages'] == null ? undefined : ((value['messages'] as Array<any>).map(MessageToJSON)),
        'executionState': ExecutionStateToJSON(value['executionState']),
        'success': value['success'],
        'inoutputArguments': value['inoutputArguments'] == null ? undefined : ((value['inoutputArguments'] as Array<any>).map(OperationVariableToJSON)),
        'outputArguments': value['outputArguments'] == null ? undefined : ((value['outputArguments'] as Array<any>).map(OperationVariableToJSON)),
    };
}

