import { LangStringNameType, LangStringTextType } from '@aas-core-works/aas-core3.0-typescript/types';
import { AssetAdministrationShellDescriptor, SubmodelDescriptor } from '../../models/Descriptors';

export function createTestShellDescriptor(): AssetAdministrationShellDescriptor {
    const demoAasDescriptor = new AssetAdministrationShellDescriptor('https://example.com/ids/aas-desc/1234');
    return demoAasDescriptor;
}

export function createTestSubmodelDescriptor(): SubmodelDescriptor {
    const demoSubmodelDescriptor = new SubmodelDescriptor('https://example.com/ids/sm-desc/5678', [
        {
            _interface: 'SUBMODEL-3.X',
            protocolInformation: {
                href: 'http://localhost:8085/submodels/xyz',
                endpointProtocol: null,
                endpointProtocolVersion: null,
                subprotocol: null,
                subprotocolBody: null,
                subprotocolBodyEncoding: null,
                securityAttributes: null,
            },
        },
    ]);
    return demoSubmodelDescriptor;
}

export function createDisplayName(): LangStringNameType {
    return new LangStringNameType('en', 'Submodel Descriptor Test DisplayName');
}
export function createDescription(): LangStringTextType {
    return new LangStringTextType('en', 'AAS Descriptor Test Description');
}
