/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ServiceDescription } from '../models/ServiceDescription';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DescriptionApiService {
    /**
     * Returns the self-describing information of a network resource (ServiceDescription)
     * @returns ServiceDescription Requested Description
     * @throws ApiError
     */
    public static getDescription(): CancelablePromise<ServiceDescription> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/description',
            errors: {
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
            },
        });
    }
}
