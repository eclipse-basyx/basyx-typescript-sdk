import type { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import * as SubmodelRepository from '../generated';
import { convertApiSubmodelToCoreSubmodel, convertCoreSubmodelToApiSubmodel } from '../lib/convertAasTypes';
import { createCustomClient } from '../lib/createCustomClient';
import { GetAllSubmodelsResponse } from '../models/submodel-repository';

export class SubmodelRepositoryClient {
    /**
     * Returns all Submodels
     *
     * @async
     * @function getAllSubmodels
     * @param baseURL The API base URL
     * @param headers Request headers
     * @param semanticId The value of the semantic id reference (BASE64-URL-encoded)
     * @param idShort The Submodels IdShort
     * @param limit The maximum number of elements in the response array
     * @param cursor A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     * @param level Determines the structural depth of the respective resource content
     * @param extent Determines to which extent the resource is being serialized
     * @returns Requested Submodels
     */
    async getAllSubmodels(
        baseURL: string,
        headers?: Headers,
        semanticId?: string,
        idShort?: string,
        limit?: number,
        cursor?: string,
        level?: 'deep' | 'core',
        extent?: 'withBlobValue' | 'withoutBlobValue'
    ): Promise<GetAllSubmodelsResponse> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { data, error } = await SubmodelRepository.getAllSubmodels({
                client,
                query: {
                    semanticId,
                    idShort,
                    limit,
                    cursor,
                    level,
                    extent,
                },
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            const submodels = (data.result ?? []).map(convertApiSubmodelToCoreSubmodel);

            return {
                pagedResult: data.paging_metadata,
                result: submodels,
            };
        } catch (error) {
            console.error('Error fetching Submodels:', error);
            throw error;
        }
    }

    /**
     * Creates a new Submodel
     *
     * @async
     * @function createSubmodel
     * @param baseURL The API base URL
     * @param submodel Submodel object
     * @param headers Request headers
     * @returns Submodel created successfully
     */
    async createSubmodel(baseURL: string, submodel: Submodel, headers?: Headers): Promise<Submodel> {
        try {
            const client = createCustomClient(baseURL, headers);

            const { data, error } = await SubmodelRepository.postSubmodel({
                client,
                body: convertCoreSubmodelToApiSubmodel(submodel),
            });

            if (error) {
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            return convertApiSubmodelToCoreSubmodel(data);
        } catch (error) {
            console.error('Error creating Submodel:', error);
            throw error;
        }
    }
}
