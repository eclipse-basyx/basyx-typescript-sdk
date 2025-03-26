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


import * as runtime from '../runtime';
import type {
  Result,
  ServiceDescription,
} from '../models/index';

/**
 * 
 */
export class DescriptionAPIApi extends runtime.BaseAPI {

    /**
     * Returns the self-describing information of a network resource (ServiceDescription)
     */
    async getDescriptionRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ServiceDescription>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/description`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     * Returns the self-describing information of a network resource (ServiceDescription)
     */
    async getDescription(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ServiceDescription> {
        const response = await this.getDescriptionRaw(initOverrides);
        return await response.value();
    }

}
