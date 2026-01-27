import {
    AssetAdministrationShell,
    AssetInformation,
    AssetKind,
    SpecificAssetId,
} from '@aas-core-works/aas-core3.1-typescript/types';

export function createTestSpecificAssetId1(): SpecificAssetId {
    const demoId = new SpecificAssetId('globalAssetId', 'https://example.com/ids/asset/7600_5912_3951_6917');
    return demoId;
}

export function createTestSpecificAssetId2(): SpecificAssetId {
    const demoId = new SpecificAssetId('globalAssetId', 'https://example.com/ids/asset/7600_5912_3951_6918');
    return demoId;
}

export function createTestShell(): AssetAdministrationShell {
    const demoAas = new AssetAdministrationShell(
        'https://example.com/ids/aas/7600_5912_3951_6917',
        new AssetInformation(AssetKind.Instance)
    );
    return demoAas;
}
