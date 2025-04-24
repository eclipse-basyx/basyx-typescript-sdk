import type { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import type { ApiResult } from '../models/api';
import { SubmodelRepositoryService } from '../index'; // Updated import
import { applyDefaults } from '../lib/apiConfig';
import { base64Encode } from '../lib/base64Url';
import { convertApiSubmodelToCoreSubmodel, convertCoreSubmodelToApiSubmodel } from '../lib/convertSubmodelTypes';
import { handleApiError } from '../lib/errorHandler';

export class SubmodelRepositoryClient {
    async getAllSubmodels(options: {
        configuration: SubmodelRepositoryService.Configuration;
        semanticId?: string;
        idShort?: string;
        limit?: number;
        cursor?: string;
        level?: SubmodelRepositoryService.GetAllSubmodelsLevelEnum;
        extent?: SubmodelRepositoryService.GetAllSubmodelsExtentEnum;
    }): Promise<
        ApiResult<
            {
                pagedResult: SubmodelRepositoryService.PagedResultPagingMetadata | undefined;
                result: Submodel[];
            },
            SubmodelRepositoryService.Result
        >
    > {
        const { configuration, semanticId, idShort, limit, cursor, level, extent } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));
            const encodedSemanticId = semanticId ? base64Encode(JSON.stringify(semanticId)) : undefined;

            const result = await apiInstance.getAllSubmodels({
                semanticId: encodedSemanticId,
                idShort: idShort,
                limit: limit,
                cursor: cursor,
                level: level,
                extent: extent,
            });

            const submodels = (result.result ?? []).map(convertApiSubmodelToCoreSubmodel);
            return {
                success: true,
                data: { pagedResult: result.pagingMetadata, result: submodels },
            };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }
    async postSubmodel(options: {
        configuration: SubmodelRepositoryService.Configuration;
        submodel: Submodel;
    }): Promise<ApiResult<Submodel, SubmodelRepositoryService.Result>> {
        const { configuration, submodel } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const result = await apiInstance.postSubmodel({
                submodel: convertCoreSubmodelToApiSubmodel(submodel),
            });

            return { success: true, data: convertApiSubmodelToCoreSubmodel(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    async deleteSubmodelById(options: {
        configuration: SubmodelRepositoryService.Configuration;
        submodelIdentifier: string;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.deleteSubmodelById({
                submodelIdentifier: encodedSubmodelIdentifier,
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    async getSubmodelById(options: {
        configuration: SubmodelRepositoryService.Configuration;
        submodelIdentifier: string;
        level?: SubmodelRepositoryService.GetSubmodelByIdLevelEnum;
        extent?: SubmodelRepositoryService.GetSubmodelByIdExtentEnum;
    }): Promise<ApiResult<Submodel, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, level, extent } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.getSubmodelById({
                submodelIdentifier: encodedSubmodelIdentifier,
                level: level,
                extent: extent,
            });

            return { success: true, data: convertApiSubmodelToCoreSubmodel(result) };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    async putSubmodelById(options: {
        configuration: SubmodelRepositoryService.Configuration;
        submodelIdentifier: string;
        submodel: Submodel;
    }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
        const { configuration, submodelIdentifier, submodel } = options;

        try {
            const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

            const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

            const result = await apiInstance.putSubmodelById({
                submodelIdentifier: encodedSubmodelIdentifier,
                submodel: convertCoreSubmodelToApiSubmodel(submodel),
            });

            return { success: true, data: result };
        } catch (err) {
            const customError = await handleApiError(err);
            return { success: false, error: customError };
        }
    }

    // async patchSubmodelById(options: {
    //     configuration: SubmodelRepositoryService.Configuration;
    //     submodelIdentifier: string;
    //     submodel: Submodel;
    //     level?: SubmodelRepositoryService.PatchSubmodelByIdLevelEnum;
    // }): Promise<ApiResult<void, SubmodelRepositoryService.Result>> {
    //     const { configuration, submodelIdentifier, submodel, level } = options;

    //     try {
    //         const apiInstance = new SubmodelRepositoryService.SubmodelRepositoryAPIApi(applyDefaults(configuration));

    //         const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

    //         const result = await apiInstance.patchSubmodelById({
    //             submodelIdentifier: encodedSubmodelIdentifier,
    //             submodel: convertCoreSubmodelToApiSubmodel(submodel),
    //             level: level,
    //         });

    //         return { success: true, data: result };
    //     } catch (err) {
    //         const customError = await handleApiError(err);
    //         return { success: false, error: customError };
    //     }
    // }

    // async getAllSubmodelElements(options: {
    //     configuration: SM.Configuration;
    //     submodelIdentifier: string;
    //     limit?: number;
    //     cursor?: string;
    //     level?: SM.GetAllSubmodelsLevelEnum;
    //     extent?: SM.GetAllSubmodelsExtentEnum;
    // }): Promise<ApiResult<void, SM.Result>> {
    //     // const { configuration, submodelIdentifier, limit, cursor, level, extent  } = options;

    // try {
    //     const apiInstance = new SM.SubmodelRepositoryAPIApi(applyDefaults(configuration));

    //     const encodedSubmodelIdentifier = base64Encode(submodelIdentifier);

    //     const result = await apiInstance.getAllSubmodelElements({
    //         submodelIdentifier: encodedSubmodelIdentifier,
    //         limit: limit,
    //         cursor: cursor,
    //         level: level,
    //         extent: extent,
    //     });

    //     const submodelElements = (result.result ?? []).map(convertApiSubmodelToCoreSubmodel);
    //             return {
    //                 success: true,
    //                 data: { pagedResult: result.pagingMetadata, result: submodelElements },
    //             };
    // } catch (err) {
    //     const customError = await handleApiError(err);
    //     return { success: false, error: customError };
    // }
    //  }
}
