import { AssetAdministrationShell, AssetInformation, AssetKind } from '@aas-core-works/aas-core3.0-typescript/types';

export function createTestShell(): AssetAdministrationShell {
    const demoAas = new AssetAdministrationShell(
        'https://example.com/ids/aas/7600_5912_3951_6917',
        new AssetInformation(AssetKind.Instance)
    );
    return demoAas;
}
