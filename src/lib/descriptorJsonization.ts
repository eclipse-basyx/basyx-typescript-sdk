import { common } from '@aas-core-works/aas-core3.1-typescript';
import {
    administrativeInformationFromJsonable,
    assetKindFromJsonable,
    DeserializationError,
    extensionFromJsonable,
    JsonValue,
    langStringNameTypeFromJsonable,
    langStringTextTypeFromJsonable,
    referenceFromJsonable,
    specificAssetIdFromJsonable,
    toJsonable,
} from '@aas-core-works/aas-core3.1-typescript/jsonization';
import { AssetKind } from '@aas-core-works/aas-core3.1-typescript/types';
//import { AasRegistryService } from '../generated';
import {
    AssetAdministrationShellDescriptor,
    Endpoint,
    ProtocolInformation,
    ProtocolInformationSecurityAttributes,
    SubmodelDescriptor,
} from '../models/Descriptors';

/**
 * Convert AssetKind enum to its JSON string representation.
 * The Core library uses numeric enums (e.g., Instance = 1), but the API expects strings.
 */
function assetKindToJsonable(assetKind: AssetKind): string {
    switch (assetKind) {
        case AssetKind.Instance:
            return 'Instance';
        case AssetKind.Type:
            return 'Type';
        case AssetKind.NotApplicable:
            return 'NotApplicable';
        default:
            throw new Error(`Unknown AssetKind value: ${assetKind}`);
    }
}

export function assetAdministrationShellDescriptorFromJsonable(
    json: JsonValue
): common.Either<AssetAdministrationShellDescriptor, DeserializationError> {
    if (json === null) {
        return new common.Either<AssetAdministrationShellDescriptor, DeserializationError>(
            null,
            new DeserializationError('Expected a JSON object, but got null')
        );
    }
    if (Array.isArray(json)) {
        return new common.Either<AssetAdministrationShellDescriptor, DeserializationError>(
            null,
            new DeserializationError('Expected a JSON object, but got a JSON array')
        );
    }
    if (typeof json !== 'object') {
        return new common.Either<AssetAdministrationShellDescriptor, DeserializationError>(
            null,
            new DeserializationError(`Expected a JSON object, but got: ${typeof json}`)
        );
    }

    const obj = json as Record<string, JsonValue>;

    try {
        const displayName = obj.displayName
            ? (obj.displayName as any[]).map((e) => langStringNameTypeFromJsonable(e).mustValue())
            : null;

        const description = obj.description
            ? (obj.description as any[]).map((e) => langStringTextTypeFromJsonable(e).mustValue())
            : null;

        const extensions = obj.extensions
            ? (obj.extensions as any[]).map((e) => extensionFromJsonable(e).mustValue())
            : null;

        const administration = obj.administration
            ? administrativeInformationFromJsonable(obj.administration).mustValue()
            : null;

        const assetKind = obj.assetKind ? assetKindFromJsonable(obj.assetKind).mustValue() : null;

        const specificAssetIds = obj.specificAssetIds
            ? (obj.specificAssetIds as any[]).map((e) => specificAssetIdFromJsonable(e).mustValue())
            : null;

        const submodelDescriptors = obj.submodelDescriptors
            ? (obj.submodelDescriptors as any[]).map((e) => submodelDescriptorFromJsonable(e).mustValue())
            : null;

        const endpoints = obj.endpoints ? (obj.endpoints as any[]).map(endpointFromJsonable) : null;

        return new common.Either<AssetAdministrationShellDescriptor, DeserializationError>(
            new AssetAdministrationShellDescriptor(
                obj.id as string,
                displayName,
                description,
                extensions,
                administration,
                (obj.idShort as string) ?? null,
                assetKind,
                (obj.assetType as string) ?? null,
                (obj.globalAssetId as string) ?? null,
                specificAssetIds,
                submodelDescriptors,
                endpoints
            ),
            null
        );
    } catch (err) {
        return new common.Either<AssetAdministrationShellDescriptor, DeserializationError>(
            null,
            new DeserializationError((err as Error).message)
        );
    }
}

export function submodelDescriptorFromJsonable(
    json: JsonValue
): common.Either<SubmodelDescriptor, DeserializationError> {
    if (json === null) {
        return new common.Either<SubmodelDescriptor, DeserializationError>(
            null,
            new DeserializationError('Expected a JSON object, but got null')
        );
    }
    if (Array.isArray(json)) {
        return new common.Either<SubmodelDescriptor, DeserializationError>(
            null,
            new DeserializationError('Expected a JSON object, but got a JSON array')
        );
    }
    if (typeof json !== 'object') {
        return new common.Either<SubmodelDescriptor, DeserializationError>(
            null,
            new DeserializationError(`Expected a JSON object, but got: ${typeof json}`)
        );
    }

    const obj = json as Record<string, JsonValue>;

    try {
        const displayName = obj.displayName
            ? (obj.displayName as any[]).map((e) => langStringNameTypeFromJsonable(e).mustValue())
            : null;

        const description = obj.description
            ? (obj.description as any[]).map((e) => langStringTextTypeFromJsonable(e).mustValue())
            : null;

        const extensions = obj.extensions
            ? (obj.extensions as any[]).map((e) => extensionFromJsonable(e).mustValue())
            : null;

        const semanticId = obj.semanticId ? referenceFromJsonable(obj.semanticId).mustValue() : null;

        const administration = obj.administration
            ? administrativeInformationFromJsonable(obj.administration).mustValue()
            : null;

        const supplementalSemanticIds = obj.supplementalSemanticIds
            ? (obj.supplementalSemanticIds as any[]).map((e) => referenceFromJsonable(e).mustValue())
            : null;

        //const endpoints = json.endpoints?.map(endpointFromJsonable);

        const endpoints = (obj.endpoints as any[]).map(endpointFromJsonable);

        return new common.Either<SubmodelDescriptor, DeserializationError>(
            new SubmodelDescriptor(
                obj.id as string,
                endpoints,
                administration,
                (obj.idShort as string) ?? null,
                semanticId,
                supplementalSemanticIds,
                displayName,
                description,
                extensions
            ),
            null
        );
    } catch (err) {
        return new common.Either<SubmodelDescriptor, DeserializationError>(
            null,
            new DeserializationError((err as Error).message)
        );
    }
}

export function endpointFromJsonable(json: any): Endpoint {
    return {
        //_interface: json._interface,
        _interface: json.interface,
        protocolInformation: protocolInformationFromJsonable(json.protocolInformation),
    };
}

export function protocolInformationFromJsonable(json: any): ProtocolInformation {
    return {
        href: json.href,
        endpointProtocol: json.endpointProtocol ?? null,
        endpointProtocolVersion: json.endpointProtocolVersion ?? null,
        subprotocol: json.subprotocol ?? null,
        subprotocolBody: json.subprotocolBody ?? null,
        subprotocolBodyEncoding: json.subprotocolBodyEncoding ?? null,
        securityAttributes: json.securityAttributes ?? null,
    };
}

export function toJsonableAssetAdministrationShellDescriptor(
    descriptor: AssetAdministrationShellDescriptor
): Record<string, JsonValue> {
    return {
        id: descriptor.id,
        ...(descriptor.idShort !== null && { idShort: descriptor.idShort }),
        ...(descriptor.description !== null && {
            description: descriptor.description.map(toJsonable),
        }),
        ...(descriptor.displayName !== null && {
            displayName: descriptor.displayName.map(toJsonable),
        }),
        ...(descriptor.extensions !== null && {
            extensions: descriptor.extensions.map(toJsonable),
        }),
        ...(descriptor.administration !== null && { administration: toJsonable(descriptor.administration) }),
        ...(descriptor.assetKind !== null && {
            assetKind: assetKindToJsonable(descriptor.assetKind),
        }),
        ...(descriptor.assetType !== null && { assetType: descriptor.assetType }),
        ...(descriptor.globalAssetId !== null && { globalAssetId: descriptor.globalAssetId }),
        ...(descriptor.specificAssetIds !== null && {
            specificAssetIds: descriptor.specificAssetIds.map(toJsonable),
        }),
        ...(descriptor.submodelDescriptors !== null && {
            submodelDescriptors: descriptor.submodelDescriptors.map(toJsonableSubmodelDescriptor),
        }),
        ...(descriptor.endpoints !== null && {
            endpoints: descriptor.endpoints.map(toJsonableEndpoint),
        }),
    };
}

export function toJsonableSubmodelDescriptor(descriptor: SubmodelDescriptor): Record<string, JsonValue> {
    return {
        id: descriptor.id,
        endpoints: descriptor.endpoints.map(toJsonableEndpoint),
        ...(descriptor.idShort !== null && { idShort: descriptor.idShort }),
        ...(descriptor.administration !== null && { administration: toJsonable(descriptor.administration) }),
        ...(descriptor.semanticId !== null && { semanticId: toJsonable(descriptor.semanticId) }),
        ...(descriptor.supplementalSemanticIds !== null && {
            supplementalSemanticIds: descriptor.supplementalSemanticIds.map(toJsonable),
        }),
        ...(descriptor.displayName !== null && {
            displayName: descriptor.displayName.map(toJsonable),
        }),
        ...(descriptor.description !== null && {
            description: descriptor.description.map(toJsonable),
        }),
        ...(descriptor.extensions !== null && {
            extensions: descriptor.extensions.map(toJsonable),
        }),
    };
}

export function toJsonableEndpoint(endpoint: Endpoint): Record<string, JsonValue> {
    return {
        //_interface: endpoint._interface,
        interface: endpoint._interface,
        protocolInformation: toJsonableProtocolInformation(endpoint.protocolInformation),
    };
}

export function toJsonableProtocolInformation(info: ProtocolInformation): Record<string, JsonValue> {
    return {
        href: info.href,
        ...(info.endpointProtocol !== null && { endpointProtocol: info.endpointProtocol }),
        ...(info.endpointProtocolVersion !== null && { endpointProtocolVersion: info.endpointProtocolVersion }),
        ...(info.subprotocol !== null && { subprotocol: info.subprotocol }),
        ...(info.subprotocolBody !== null && { subprotocolBody: info.subprotocolBody }),
        ...(info.subprotocolBodyEncoding !== null && { subprotocolBodyEncoding: info.subprotocolBodyEncoding }),
        ...(info.securityAttributes !== null && {
            securityAttributes: info.securityAttributes.map(toJsonableSecurityAttribute),
        }),
    };
}

export function toJsonableSecurityAttribute(attr: ProtocolInformationSecurityAttributes): Record<string, JsonValue> {
    return {
        type: attr.type,
        key: attr.key,
        value: attr.value,
    };
}
