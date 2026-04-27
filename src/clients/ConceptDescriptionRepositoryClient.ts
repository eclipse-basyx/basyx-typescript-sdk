import type { ConceptDescription } from '@aas-core-works/aas-core3.1-typescript/types';
import type { ApiResult } from '../models/api';
import { ConceptDescriptionRepositoryService } from '../generated'; // Updated import
import { Configuration, RequiredError } from '../generated/runtime';
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import { convertApiCDToCoreCD, convertCoreCDToApiCD } from '../lib/convertConceptDescriptionTypes';
import { handleApiError } from '../lib/errorHandler';

export class ConceptDescriptionRepositoryClient {
    private static requireIdentifier(value: string | null | undefined, field: string): string {
        if (value === null || value === undefined || value.trim() === '') {
            throw new RequiredError(field, `Required parameter "${field}" was null, undefined, or empty.`);
        }

        return value;
    }

    private static extractStatusCode(
        err: unknown,
        parsedError?: ConceptDescriptionRepositoryService.Result
    ): number | undefined {
        const responseStatus = (err as { response?: { status?: unknown } })?.response?.status;
        if (typeof responseStatus === 'number') {
            return responseStatus;
        }

        if (err instanceof RequiredError || (err as { name?: unknown })?.name === 'RequiredError') {
            return 400;
        }

        const code = parsedError?.messages?.[0]?.code;
        if (!code) {
            return undefined;
        }

        const parsedCode = Number.parseInt(code, 10);
        return Number.isNaN(parsedCode) ? undefined : parsedCode;
    }

    /**
     * Returns a specific Concept Description
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - cdIdentifier: The Concept Description’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getConceptDescriptionById(options: {
        configuration: Configuration;
        cdIdentifier: string;
    }): Promise<ApiResult<ConceptDescription, ConceptDescriptionRepositoryService.Result>> {
        const { configuration, cdIdentifier } = options;

        try {
            const apiInstance = new ConceptDescriptionRepositoryService.ConceptDescriptionRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedCdIdentifier = base64Encode(
                ConceptDescriptionRepositoryClient.requireIdentifier(cdIdentifier, 'cdIdentifier')
            );

            const response = await apiInstance.getConceptDescriptionByIdRaw({
                cdIdentifier: encodedCdIdentifier,
            });
            const result = await response.value();

            return { success: true, data: convertApiCDToCoreCD(result), statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: ConceptDescriptionRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Deletes a Concept Description
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - cdIdentifier: The Concept Description’s unique id
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async deleteConceptDescriptionById(options: {
        configuration: Configuration;
        cdIdentifier: string;
    }): Promise<ApiResult<void, ConceptDescriptionRepositoryService.Result>> {
        const { configuration, cdIdentifier } = options;

        try {
            const apiInstance = new ConceptDescriptionRepositoryService.ConceptDescriptionRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedCdIdentifier = base64Encode(
                ConceptDescriptionRepositoryClient.requireIdentifier(cdIdentifier, 'cdIdentifier')
            );

            const response = await apiInstance.deleteConceptDescriptionByIdRaw({
                cdIdentifier: encodedCdIdentifier,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: ConceptDescriptionRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Updates an existing Concept Description
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - cdIdentifier: The Concept Description’s unique id
     *  - conceptDescription: Concept Description object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async putConceptDescriptionById(options: {
        configuration: Configuration;
        cdIdentifier: string;
        conceptDescription: ConceptDescription;
    }): Promise<ApiResult<ConceptDescription | void, ConceptDescriptionRepositoryService.Result>> {
        const { configuration, cdIdentifier, conceptDescription } = options;

        try {
            const apiInstance = new ConceptDescriptionRepositoryService.ConceptDescriptionRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const encodedCdIdentifier = base64Encode(
                ConceptDescriptionRepositoryClient.requireIdentifier(cdIdentifier, 'cdIdentifier')
            );

            const response = await apiInstance.putConceptDescriptionByIdRaw({
                cdIdentifier: encodedCdIdentifier,
                conceptDescription: convertCoreCDToApiCD(conceptDescription),
            });

            if (response.raw.status === 204) {
                return { success: true, data: undefined, statusCode: response.raw.status };
            }

            const result = await response.value();

            return {
                success: true,
                data: result ? convertApiCDToCoreCD(result) : undefined,
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: ConceptDescriptionRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns all Concept Descriptions
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - idShort?: The Concept Description’s IdShort
     *  - isCaseOf?: IsCaseOf reference (UTF8-BASE64-URL-encoded)
     *  - dataSpecificationRef?: DataSpecification reference (UTF8-BASE64-URL-encoded)
     *  - limit?: The maximum number of elements in the response array
     *  - cursor?: A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getAllConceptDescriptions(options: {
        configuration: Configuration;
        idShort?: string;
        isCaseOf?: string;
        dataSpecificationRef?: string;
        limit?: number;
        cursor?: string;
    }): Promise<
        ApiResult<
            {
                pagedResult: ConceptDescriptionRepositoryService.PagedResultPagingMetadata | undefined;
                result: ConceptDescription[];
            },
            ConceptDescriptionRepositoryService.Result
        >
    > {
        const { configuration, idShort, isCaseOf, dataSpecificationRef, limit, cursor } = options;

        try {
            const apiInstance = new ConceptDescriptionRepositoryService.ConceptDescriptionRepositoryAPIApi(
                applyDefaults(configuration)
            );
            const encodedIsCaseOf = isCaseOf ? base64Encode(isCaseOf) : undefined;
            const encodedDataSpecificationRef = dataSpecificationRef ? base64Encode(dataSpecificationRef) : undefined;

            const response = await apiInstance.getAllConceptDescriptionsRaw({
                idShort: idShort,
                isCaseOf: encodedIsCaseOf,
                dataSpecificationRef: encodedDataSpecificationRef,
                limit: limit,
                cursor: cursor,
            });
            const result = await response.value();

            const conceptDescriptions = (result.result ?? []).map(convertApiCDToCoreCD);
            const pagedResult =
                result.pagingMetadata ??
                (
                    result as typeof result & {
                        paging_metadata?: ConceptDescriptionRepositoryService.PagedResultPagingMetadata;
                    }
                ).paging_metadata;
            return {
                success: true,
                data: { pagedResult, result: conceptDescriptions },
                statusCode: response.raw.status,
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: ConceptDescriptionRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Creates a new Concept Description
     *
     * @param options Object containing:
     *  - configuration: The http request options.
     *  - conceptDescription: Concept Description object
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async postConceptDescription(options: {
        configuration: Configuration;
        conceptDescription: ConceptDescription;
    }): Promise<ApiResult<ConceptDescription, ConceptDescriptionRepositoryService.Result>> {
        const { configuration, conceptDescription } = options;

        try {
            const apiInstance = new ConceptDescriptionRepositoryService.ConceptDescriptionRepositoryAPIApi(
                applyDefaults(configuration)
            );

            const response = await apiInstance.postConceptDescriptionRaw({
                conceptDescription: convertCoreCDToApiCD(conceptDescription),
            });
            const result = await response.value();

            return { success: true, data: convertApiCDToCoreCD(result), statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: ConceptDescriptionRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns an appropriate serialization based on the specified format
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *  - aasIds?: The Asset Administration Shell IDs
     *  - submodelIds?: The Submodel IDs
     *  - includeConceptDescriptions?: Include concept descriptions in the environment
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async generateSerializationByIds(options: {
        configuration: Configuration;
        aasIds?: string[];
        submodelIds?: string[];
        includeConceptDescriptions?: boolean;
    }): Promise<ApiResult<Blob, ConceptDescriptionRepositoryService.Result>> {
        const { configuration, aasIds, submodelIds, includeConceptDescriptions } = options;

        try {
            const apiInstance = new ConceptDescriptionRepositoryService.SerializationAPIApi(
                applyDefaults(configuration)
            );

            const response = await apiInstance.generateSerializationByIdsRaw({
                aasIds: aasIds,
                submodelIds: submodelIds,
                includeConceptDescriptions: includeConceptDescriptions,
            });
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: ConceptDescriptionRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }

    /**
     * Returns the self-describing information of a network resource (ServiceDescription)
     *
     * @param options Object containing:
     *  - configuration: The http request options
     *
     * @returns Either `{ success: true; data: ... }` or `{ success: false; error: ... }`.
     */
    async getSelfDescription(options: {
        configuration: Configuration;
    }): Promise<
        ApiResult<ConceptDescriptionRepositoryService.ServiceDescription, ConceptDescriptionRepositoryService.Result>
    > {
        const { configuration } = options;

        try {
            const apiInstance = new ConceptDescriptionRepositoryService.DescriptionAPIApi(applyDefaults(configuration));
            const response = await apiInstance.getSelfDescriptionRaw();
            const result = await response.value();

            return { success: true, data: result, statusCode: response.raw.status };
        } catch (err) {
            const customError = await handleApiError(err);
            return {
                success: false,
                error: customError,
                statusCode: ConceptDescriptionRepositoryClient.extractStatusCode(err, customError),
            };
        }
    }
}
