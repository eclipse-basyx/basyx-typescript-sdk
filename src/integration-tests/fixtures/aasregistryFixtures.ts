import { LangStringTextType } from '@aas-core-works/aas-core3.0-typescript/types';
import { AssetAdministrationShellDescriptor } from '../../models/Descriptors';

export function createTestShellDescriptor(): AssetAdministrationShellDescriptor {
    const demoAasDescriptor = new AssetAdministrationShellDescriptor(
        'https://example.com/ids/aas-desc/1234'
        // new AssetInformation(AssetKind.Instance)
    );
    return demoAasDescriptor;
}

export function createDescription(): LangStringTextType {
    return new LangStringTextType('en', 'AAS Descriptor Test Description');
}
