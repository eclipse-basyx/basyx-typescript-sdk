/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Environment } from '../models/Environment';
import type { Result } from '../models/Result';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SerializationApiService {
    /**
     * Returns an appropriate serialization based on the specified format (see SerializationFormat)
     * @param aasIds The Asset Administration Shells' unique ids (UTF8-BASE64-URL-encoded)
     * @param submodelIds The Submodels' unique ids (UTF8-BASE64-URL-encoded)
     * @param includeConceptDescriptions Include Concept Descriptions?
     * @returns Environment Requested serialization based on SerializationFormat
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static generateSerializationByIds(
        aasIds?: Array<string>,
        submodelIds?: Array<string>,
        includeConceptDescriptions: boolean = true,
    ): CancelablePromise<Environment | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/serialization',
            query: {
                'aasIds': aasIds,
                'submodelIds': submodelIds,
                'includeConceptDescriptions': includeConceptDescriptions,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                500: `Internal Server Error`,
            },
        });
    }
}
