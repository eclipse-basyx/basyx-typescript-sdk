import type {
    AdministrativeInformation,
    AssetKind,
    Extension,
    LangStringNameType,
    LangStringTextType,
    Reference,
    SpecificAssetId,
} from '@aas-core-works/aas-core3.1-typescript/types';
export class AssetAdministrationShellDescriptor {
    constructor(
        public id: string,
        public displayName: Array<LangStringNameType> | null = null,
        public description: Array<LangStringTextType> | null = null,
        public extensions: Array<Extension> | null = null,
        public administration: AdministrativeInformation | null = null,
        public idShort: string | null = null,
        public assetKind: AssetKind | null = null,
        public assetType: string | null = null,
        public globalAssetId: string | null = null,
        public specificAssetIds: Array<SpecificAssetId> | null = null,
        public submodelDescriptors: Array<SubmodelDescriptor> | null = null,
        public endpoints: Array<Endpoint> | null = null
    ) {}
}

export class SubmodelDescriptor {
    constructor(
        public id: string,
        public endpoints: Array<Endpoint>,
        public administration: AdministrativeInformation | null = null,
        public idShort: string | null = null,
        public semanticId: Reference | null = null,
        public supplementalSemanticIds: Array<Reference> | null = null,
        public displayName: Array<LangStringNameType> | null = null,
        public description: Array<LangStringTextType> | null = null,
        public extensions: Array<Extension> | null = null
    ) {}
}
export interface Endpoint {
    _interface: string;
    protocolInformation: ProtocolInformation;
}
export interface ProtocolInformation {
    href: string;
    endpointProtocol: string | null;
    endpointProtocolVersion: Array<string> | null;
    subprotocol: string | null;
    subprotocolBody: string | null;
    subprotocolBodyEncoding: string | null;
    securityAttributes: Array<ProtocolInformationSecurityAttributes> | null;
}
export interface ProtocolInformationSecurityAttributes {
    type: ProtocolInformationSecurityAttributesTypeEnum;
    key: string;
    value: string;
}
export enum ProtocolInformationSecurityAttributesTypeEnum {
    None = 0,
    RfcTlsa = 1,
    W3CDid = 2,
}
