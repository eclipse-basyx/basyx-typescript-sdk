/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetAdministrationShell } from '../models/AssetAdministrationShell';
import type { AssetInformation } from '../models/AssetInformation';
import type { assetinformation_thumbnail_body } from '../models/assetinformation_thumbnail_body';
import type { BaseOperationResult } from '../models/BaseOperationResult';
import type { GetAssetAdministrationShellsResult } from '../models/GetAssetAdministrationShellsResult';
import type { GetPathItemsResult } from '../models/GetPathItemsResult';
import type { GetReferencesResult } from '../models/GetReferencesResult';
import type { GetSubmodelElementsMetadataResult } from '../models/GetSubmodelElementsMetadataResult';
import type { GetSubmodelElementsResult } from '../models/GetSubmodelElementsResult';
import type { GetSubmodelElementsValueResult } from '../models/GetSubmodelElementsValueResult';
import type { idShortPath_attachment_body } from '../models/idShortPath_attachment_body';
import type { OperationRequest } from '../models/OperationRequest';
import type { OperationRequestValueOnly } from '../models/OperationRequestValueOnly';
import type { OperationResult } from '../models/OperationResult';
import type { OperationResultValueOnly } from '../models/OperationResultValueOnly';
import type { PathItem } from '../models/PathItem';
import type { Reference } from '../models/Reference';
import type { Result } from '../models/Result';
import type { Submodel } from '../models/Submodel';
import type { SubmodelElement } from '../models/SubmodelElement';
import type { SubmodelElementMetadata } from '../models/SubmodelElementMetadata';
import type { SubmodelElementValue } from '../models/SubmodelElementValue';
import type { SubmodelMetadata } from '../models/SubmodelMetadata';
import type { SubmodelValue } from '../models/SubmodelValue';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssetAdministrationShellRepositoryApiService {
    /**
     * Returns all Asset Administration Shells
     * @param assetIds A list of specific Asset identifiers. Every single value asset identifier is a base64-url-encoded [SpecificAssetId](https://api.swaggerhub.com/domains/Plattform_i40/Part1-MetaModel-Schemas/V3.0.3#/components/schemas/SpecificAssetId).
     * @param idShort The Asset Administration Shell’s IdShort
     * @param limit The maximum number of elements in the response array
     * @param cursor A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     * @returns GetAssetAdministrationShellsResult Requested Asset Administration Shells
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getAllAssetAdministrationShells(
        assetIds?: Array<string>,
        idShort?: string,
        limit?: number,
        cursor?: string,
    ): CancelablePromise<GetAssetAdministrationShellsResult | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells',
            query: {
                'assetIds': assetIds,
                'idShort': idShort,
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Creates a new Asset Administration Shell
     * @param requestBody Asset Administration Shell object
     * @returns Result Default error handling for unmentioned status codes
     * @returns AssetAdministrationShell Asset Administration Shell created successfully
     * @throws ApiError
     */
    public static postAssetAdministrationShell(
        requestBody: AssetAdministrationShell,
    ): CancelablePromise<Result | AssetAdministrationShell> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/shells',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                409: `Conflict, a resource which shall be created exists already. Might be thrown if a Submodel or SubmodelElement with the same ShortId is contained in a POST request.`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns References to all Asset Administration Shells
     * @param assetIds A list of specific Asset identifiers. Every single value asset identifier is a base64-url-encoded [SpecificAssetId](https://api.swaggerhub.com/domains/Plattform_i40/Part1-MetaModel-Schemas/V3.0.3#/components/schemas/SpecificAssetId).
     * @param idShort The Asset Administration Shell’s IdShort
     * @param limit The maximum number of elements in the response array
     * @param cursor A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     * @returns GetReferencesResult Requested Asset Administration Shells as a list of References
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getAllAssetAdministrationShellsReference(
        assetIds?: Array<string>,
        idShort?: string,
        limit?: number,
        cursor?: string,
    ): CancelablePromise<GetReferencesResult | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/$reference',
            query: {
                'assetIds': assetIds,
                'idShort': idShort,
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns a specific Asset Administration Shell
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @returns AssetAdministrationShell Requested Asset Administration Shell
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getAssetAdministrationShellById(
        aasIdentifier: string,
    ): CancelablePromise<AssetAdministrationShell | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}',
            path: {
                'aasIdentifier': aasIdentifier,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Updates an existing Asset Administration Shell
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param requestBody Asset Administration Shell object
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static putAssetAdministrationShellById(
        aasIdentifier: string,
        requestBody: AssetAdministrationShell,
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/shells/{aasIdentifier}',
            path: {
                'aasIdentifier': aasIdentifier,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Deletes an Asset Administration Shell
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static deleteAssetAdministrationShellById(
        aasIdentifier: string,
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/shells/{aasIdentifier}',
            path: {
                'aasIdentifier': aasIdentifier,
            },
            errors: {
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns a specific Asset Administration Shell as a Reference
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @returns Reference Requested Asset Administration Shell
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getAssetAdministrationShellByIdReferenceAasRepository(
        aasIdentifier: string,
    ): CancelablePromise<Reference | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/$reference',
            path: {
                'aasIdentifier': aasIdentifier,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns the Asset Information
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @returns AssetInformation Requested Asset Information
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getAssetInformationAasRepository(
        aasIdentifier: string,
    ): CancelablePromise<AssetInformation | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/asset-information',
            path: {
                'aasIdentifier': aasIdentifier,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Updates the Asset Information
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param requestBody Asset Information object
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static putAssetInformationAasRepository(
        aasIdentifier: string,
        requestBody: AssetInformation,
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/shells/{aasIdentifier}/asset-information',
            path: {
                'aasIdentifier': aasIdentifier,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @returns binary The thumbnail of the Asset Information.
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getThumbnailAasRepository(
        aasIdentifier: string,
    ): CancelablePromise<Blob | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/asset-information/thumbnail',
            path: {
                'aasIdentifier': aasIdentifier,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param formData Thumbnail to upload
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static putThumbnailAasRepository(
        aasIdentifier: string,
        formData: assetinformation_thumbnail_body,
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/shells/{aasIdentifier}/asset-information/thumbnail',
            path: {
                'aasIdentifier': aasIdentifier,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @returns any Thumbnail deletion successful
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static deleteThumbnailAasRepository(
        aasIdentifier: string,
    ): CancelablePromise<any | Result> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/shells/{aasIdentifier}/asset-information/thumbnail',
            path: {
                'aasIdentifier': aasIdentifier,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns all submodel references
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param limit The maximum number of elements in the response array
     * @param cursor A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     * @returns GetReferencesResult Requested submodel references
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getAllSubmodelReferencesAasRepository(
        aasIdentifier: string,
        limit?: number,
        cursor?: string,
    ): CancelablePromise<GetReferencesResult | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodel-refs',
            path: {
                'aasIdentifier': aasIdentifier,
            },
            query: {
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Creates a submodel reference at the Asset Administration Shell
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param requestBody Reference to the Submodel
     * @returns Result Default error handling for unmentioned status codes
     * @returns Reference Submodel reference created successfully
     * @throws ApiError
     */
    public static postSubmodelReferenceAasRepository(
        aasIdentifier: string,
        requestBody: Reference,
    ): CancelablePromise<Result | Reference> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/shells/{aasIdentifier}/submodel-refs',
            path: {
                'aasIdentifier': aasIdentifier,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                409: `Conflict, a resource which shall be created exists already. Might be thrown if a Submodel or SubmodelElement with the same ShortId is contained in a POST request.`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Deletes the submodel reference from the Asset Administration Shell. Does not delete the submodel itself!
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static deleteSubmodelReferenceByIdAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/shells/{aasIdentifier}/submodel-refs/{submodelIdentifier}',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns the Submodel
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param level Determines the structural depth of the respective resource content
     * @param extent Determines to which extent the resource is being serialized
     * @returns Submodel Requested Submodel
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getSubmodelByIdAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        level: 'deep' | 'core' = 'deep',
        extent: 'withBlobValue' | 'withoutBlobValue' = 'withoutBlobValue',
    ): CancelablePromise<Submodel | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            query: {
                'level': level,
                'extent': extent,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Updates the Submodel
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param requestBody Submodel object
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static putSubmodelByIdAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        requestBody: Submodel,
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Deletes the submodel from the Asset Administration Shell and the Repository.
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static deleteSubmodelByIdAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Updates the Submodel
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param requestBody Submodel object
     * @param level Determines the structural depth of the respective resource content
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static patchSubmodelAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        requestBody: Submodel,
        level: 'core' = 'core',
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            query: {
                'level': level,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns the Submodel's metadata elements
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @returns SubmodelMetadata Requested Submodel
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getSubmodelByIdMetadataAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
    ): CancelablePromise<SubmodelMetadata | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/$metadata',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Updates the metadata attributes of the Submodel
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param requestBody Submodel object
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static patchSubmodelByIdMetadataAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        requestBody: SubmodelMetadata,
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/$metadata',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns the Submodel's ValueOnly representation
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param level Determines the structural depth of the respective resource content
     * @param extent Determines to which extent the resource is being serialized
     * @returns SubmodelValue Requested Submodel
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getSubmodelByIdValueOnlyAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        level: 'deep' | 'core' = 'deep',
        extent: 'withBlobValue' | 'withoutBlobValue' = 'withoutBlobValue',
    ): CancelablePromise<SubmodelValue | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/$value',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            query: {
                'level': level,
                'extent': extent,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Updates the values of the Submodel
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param requestBody Submodel object in the ValueOnly representation
     * @param level Determines the structural depth of the respective resource content
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static patchSubmodelByIdValueOnlyAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        requestBody: SubmodelValue,
        level: 'core' = 'core',
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/$value',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            query: {
                'level': level,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns the Submodel as a Reference
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @returns Reference Requested Submodel as a Reference
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getSubmodelByIdReferenceAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
    ): CancelablePromise<Reference | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/$reference',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns the Submodel's metadata elements
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param level Determines the structural depth of the respective resource content
     * @returns PathItem Requested Submodel in Path notation
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getSubmodelByIdPathAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        level: 'deep' | 'core' = 'deep',
    ): CancelablePromise<Array<PathItem> | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/$path',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            query: {
                'level': level,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns all submodel elements including their hierarchy
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param limit The maximum number of elements in the response array
     * @param cursor A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     * @param level Determines the structural depth of the respective resource content
     * @param extent Determines to which extent the resource is being serialized
     * @returns GetSubmodelElementsResult List of found submodel elements
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getAllSubmodelElementsAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        limit?: number,
        cursor?: string,
        level: 'deep' | 'core' = 'deep',
        extent: 'withBlobValue' | 'withoutBlobValue' = 'withoutBlobValue',
    ): CancelablePromise<GetSubmodelElementsResult | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            query: {
                'limit': limit,
                'cursor': cursor,
                'level': level,
                'extent': extent,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Creates a new submodel element
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param requestBody Requested submodel element
     * @returns Result Default error handling for unmentioned status codes
     * @returns SubmodelElement Submodel element created successfully
     * @throws ApiError
     */
    public static postSubmodelElementAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        requestBody: SubmodelElement,
    ): CancelablePromise<Result | SubmodelElement> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                409: `Conflict, a resource which shall be created exists already. Might be thrown if a Submodel or SubmodelElement with the same ShortId is contained in a POST request.`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns all submodel elements including their hierarchy
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param limit The maximum number of elements in the response array
     * @param cursor A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     * @returns GetSubmodelElementsMetadataResult List of found submodel elements
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getAllSubmodelElementsMetadataAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        limit?: number,
        cursor?: string,
    ): CancelablePromise<GetSubmodelElementsMetadataResult | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/$metadata',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            query: {
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns all submodel elements including their hierarchy in the ValueOnly representation
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param limit The maximum number of elements in the response array
     * @param cursor A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     * @param level Determines the structural depth of the respective resource content
     * @returns GetSubmodelElementsValueResult List of found submodel elements in their ValueOnly representation
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getAllSubmodelElementsValueOnlyAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        limit?: number,
        cursor?: string,
        level: 'deep' | 'core' = 'deep',
    ): CancelablePromise<GetSubmodelElementsValueResult | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/$value',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            query: {
                'limit': limit,
                'cursor': cursor,
                'level': level,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns all submodel elements as a list of References
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param limit The maximum number of elements in the response array
     * @param cursor A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     * @param level Determines the structural depth of the respective resource content
     * @returns GetReferencesResult List of References of the found submodel elements
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getAllSubmodelElementsReferenceAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        limit?: number,
        cursor?: string,
        level: 'core' = 'core',
    ): CancelablePromise<GetReferencesResult | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/$reference',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            query: {
                'limit': limit,
                'cursor': cursor,
                'level': level,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns all submodel elements including their hierarchy
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param limit The maximum number of elements in the response array
     * @param cursor A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue
     * @param level Determines the structural depth of the respective resource content
     * @param extent Determines to which extent the resource is being serialized
     * @returns GetPathItemsResult List of found submodel elements in the Path notation
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getAllSubmodelElementsPathAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        limit?: number,
        cursor?: string,
        level: 'deep' | 'core' = 'deep',
        extent: 'withBlobValue' | 'withoutBlobValue' = 'withoutBlobValue',
    ): CancelablePromise<GetPathItemsResult | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/$path',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
            },
            query: {
                'limit': limit,
                'cursor': cursor,
                'level': level,
                'extent': extent,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns a specific submodel element from the Submodel at a specified path
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param level Determines the structural depth of the respective resource content
     * @param extent Determines to which extent the resource is being serialized
     * @returns SubmodelElement Requested submodel element
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getSubmodelElementByPathAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        level: 'deep' | 'core' = 'deep',
        extent: 'withBlobValue' | 'withoutBlobValue' = 'withoutBlobValue',
    ): CancelablePromise<SubmodelElement | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            query: {
                'level': level,
                'extent': extent,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Updates an existing submodel element at a specified path within submodel elements hierarchy
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param requestBody Requested submodel element
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static putSubmodelElementByPathAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        requestBody: SubmodelElement,
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Creates a new submodel element at a specified path within submodel elements hierarchy
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param requestBody Requested submodel element
     * @returns Result Default error handling for unmentioned status codes
     * @returns SubmodelElement Submodel element created successfully
     * @throws ApiError
     */
    public static postSubmodelElementByPathAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        requestBody: SubmodelElement,
    ): CancelablePromise<Result | SubmodelElement> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                409: `Conflict, a resource which shall be created exists already. Might be thrown if a Submodel or SubmodelElement with the same ShortId is contained in a POST request.`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Deletes a submodel element at a specified path within the submodel elements hierarchy
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static deleteSubmodelElementByPathAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Updates an existing submodel element value at a specified path within submodel elements hierarchy
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param requestBody The updated value of the submodel element
     * @param level Determines the structural depth of the respective resource content
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static patchSubmodelElementValueByPathAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        requestBody: SubmodelElement,
        level: 'deep' | 'core' = 'deep',
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            query: {
                'level': level,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns the metadata attributes if a specific submodel element from the Submodel at a specified path
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @returns SubmodelElementMetadata Requested submodel element
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getSubmodelElementByPathMetadataAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
    ): CancelablePromise<SubmodelElementMetadata | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/$metadata',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Updates the metadata attributes of an existing submodel element value at a specified path within submodel elements hierarchy
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param requestBody The updated metadata attributes of the submodel element
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static patchSubmodelElementValueByPathMetadata(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        requestBody: SubmodelElementMetadata,
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/$metadata',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns a specific submodel element from the Submodel at a specified path in the ValueOnly representation
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param level Determines the structural depth of the respective resource content
     * @param extent Determines to which extent the resource is being serialized
     * @returns SubmodelElementValue Requested submodel element in its ValueOnly representation
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getSubmodelElementByPathValueOnlyAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        level: 'deep' | 'core' = 'deep',
        extent: 'withBlobValue' | 'withoutBlobValue' = 'withoutBlobValue',
    ): CancelablePromise<SubmodelElementValue | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/$value',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            query: {
                'level': level,
                'extent': extent,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Updates the value of an existing submodel element value at a specified path within submodel elements hierarchy
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param requestBody The updated value of the submodel element
     * @param level Determines the structural depth of the respective resource content
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static patchSubmodelElementValueByPathValueOnly(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        requestBody: SubmodelElementValue,
        level: 'deep' | 'core' = 'deep',
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/$value',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            query: {
                'level': level,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns the Reference of a specific submodel element from the Submodel at a specified path
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param level Determines the structural depth of the respective resource content
     * @returns Reference Requested submodel element in its ValueOnly representation
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getSubmodelElementByPathReferenceAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        level: 'core' = 'core',
    ): CancelablePromise<Reference | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/$reference',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            query: {
                'level': level,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns a specific submodel element from the Submodel at a specified path in the Path notation
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param level Determines the structural depth of the respective resource content
     * @returns PathItem Requested submodel element in the Path notation
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getSubmodelElementByPathPathAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        level: 'deep' | 'core' = 'deep',
    ): CancelablePromise<Array<PathItem> | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/$path',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            query: {
                'level': level,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Downloads file content from a specific submodel element from the Submodel at a specified path
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @returns binary Requested file
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getFileByPathAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
    ): CancelablePromise<Blob | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/attachment',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Uploads file content to an existing submodel element at a specified path within submodel elements hierarchy
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param formData File to upload
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static putFileByPathAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        formData: idShortPath_attachment_body,
    ): CancelablePromise<Result> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/attachment',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Deletes file content of an existing submodel element at a specified path within submodel elements hierarchy
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @returns any Submodel element updated successfully
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static deleteFileByPathAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
    ): CancelablePromise<any | Result> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/attachment',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Synchronously invokes an Operation at a specified path
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param requestBody Operation request object
     * @returns OperationResult Operation result object
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static invokeOperationAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        requestBody: OperationRequest,
    ): CancelablePromise<OperationResult | Result> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/invoke',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Synchronously invokes an Operation at a specified path
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param requestBody Operation request object
     * @returns OperationResultValueOnly Operation result object
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static invokeOperationValueOnlyAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        requestBody: OperationRequestValueOnly,
    ): CancelablePromise<OperationResultValueOnly | Result> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/invoke/$value',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Asynchronously invokes an Operation at a specified path
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param requestBody Operation request object
     * @returns Result Default error handling for unmentioned status codes
     * @returns string The server has accepted the request.
     * @throws ApiError
     */
    public static invokeOperationAsyncAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        requestBody: OperationRequest,
    ): CancelablePromise<Result | string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/invoke-async',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            body: requestBody,
            mediaType: 'application/json',
            responseHeader: 'Location',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Asynchronously invokes an Operation at a specified path
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param requestBody Operation request object
     * @returns Result Default error handling for unmentioned status codes
     * @returns string The server has accepted the request.
     * @throws ApiError
     */
    public static invokeOperationAsyncValueOnlyAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        requestBody: OperationRequestValueOnly,
    ): CancelablePromise<Result | string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/invoke-async/$value',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
            },
            body: requestBody,
            mediaType: 'application/json',
            responseHeader: 'Location',
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns the Operation status of an asynchronous invoked Operation
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param handleId The returned handle id of an operation’s asynchronous invocation used to request the current state of the operation’s execution (UTF8-BASE64-URL-encoded)
     * @returns BaseOperationResult Operation result object containing information that the 'executionState' is still 'Running'
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getOperationAsyncStatusAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        handleId: string,
    ): CancelablePromise<BaseOperationResult | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/operation-status/{handleId}',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
                'handleId': handleId,
            },
            errors: {
                302: `The target resource is available but at a different location.`,
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns the Operation result of an asynchronous invoked Operation
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param handleId The returned handle id of an operation’s asynchronous invocation used to request the current state of the operation’s execution (UTF8-BASE64-URL-encoded)
     * @returns OperationResult Operation result object
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getOperationAsyncResultAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        handleId: string,
    ): CancelablePromise<OperationResult | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/operation-results/{handleId}',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
                'handleId': handleId,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Returns the ValueOnly notation of the Operation result of an asynchronous invoked Operation
     * @param aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param submodelIdentifier The Submodel’s unique id (UTF8-BASE64-URL-encoded)
     * @param idShortPath IdShort path to the submodel element (dot-separated)
     * @param handleId The returned handle id of an operation’s asynchronous invocation used to request the current state of the operation’s execution (UTF8-BASE64-URL-encoded)
     * @returns OperationResultValueOnly Operation result object
     * @returns Result Default error handling for unmentioned status codes
     * @throws ApiError
     */
    public static getOperationAsyncResultValueOnlyAasRepository(
        aasIdentifier: string,
        submodelIdentifier: string,
        idShortPath: string,
        handleId: string,
    ): CancelablePromise<OperationResultValueOnly | Result> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/operation-results/{handleId}/$value',
            path: {
                'aasIdentifier': aasIdentifier,
                'submodelIdentifier': submodelIdentifier,
                'idShortPath': idShortPath,
                'handleId': handleId,
            },
            errors: {
                400: `Bad Request, e.g. the request parameters of the format of the request body is wrong.`,
                401: `Unauthorized, e.g. the server refused the authorization attempt.`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
}
