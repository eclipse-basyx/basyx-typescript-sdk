import {
    AssetAdministrationShell,
    AssetInformation,
    AssetKind,
    LangStringTextType,
} from '@aas-core-works/aas-core3.1-typescript/types';

export function createTestShell(): AssetAdministrationShell {
    const demoAas = new AssetAdministrationShell(
        'https://example.com/ids/aas/7600_5912_3951_6917',
        new AssetInformation(AssetKind.Instance)
    );
    return demoAas;
}

export function createDescription(): LangStringTextType {
    return new LangStringTextType('en', 'Test Description');
}

export function createGlobalAssetId(): string {
    return 'https://example.com/ids/asset/7600_5912_3951_6917';
}
