import type { ConceptDescription } from '@aas-core-works/aas-core3.0-typescript/types';
import type { ApiResult } from '../models/api';
import { ConceptDescriptionRepositoryService } from '../generated'; // Updated import
import { Configuration } from '../generated/runtime';
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import { convertApiCDToCoreCD, convertCoreCDToApiCD } from '../lib/convertConceptDescriptionTypes';
import { handleApiError } from '../lib/errorHandler';

export class ConceptDescriptionRepositoryClient {
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

            const encodedCdIdentifier = base64Encode(cdIdentifier);

            const result = await apiInstance.getConceptDescriptionById({
                cdIdentifier: encodedCdIdentifier,
            });

            return { success: true, data: convertApiCDToCoreCD(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            const encodedCdIdentifier = base64Encode(cdIdentifier);

            const result = await apiInstance.deleteConceptDescriptionById({
                cdIdentifier: encodedCdIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            const encodedCdIdentifier = base64Encode(cdIdentifier);

            const result = await apiInstance.putConceptDescriptionById({
                cdIdentifier: encodedCdIdentifier,
                conceptDescription: convertCoreCDToApiCD(conceptDescription),
            });

            return { success: true, data: result ? convertApiCDToCoreCD(result) : undefined };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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
            const encodedIsCaseOf = isCaseOf ? base64Encode(JSON.stringify(isCaseOf)) : undefined;
            const encodedDataSpecificationRef = dataSpecificationRef
                ? base64Encode(JSON.stringify(dataSpecificationRef))
                : undefined;

            const result = await apiInstance.getAllConceptDescriptions({
                idShort: idShort,
                isCaseOf: encodedIsCaseOf,
                dataSpecificationRef: encodedDataSpecificationRef,
                limit: limit,
                cursor: cursor,
            });

            const conceptDescriptions = (result.result ?? []).map(convertApiCDToCoreCD);
            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: conceptDescriptions },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
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

            const result = await apiInstance.postConceptDescription({
                conceptDescription: convertCoreCDToApiCD(conceptDescription),
            });

            return { success: true, data: convertApiCDToCoreCD(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }
}
