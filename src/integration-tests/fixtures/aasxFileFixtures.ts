import { AssetAdministrationShell, AssetInformation, AssetKind } from '@aas-core-works/aas-core3.1-typescript/types';
import { PackageDescription } from '../../generated/AasxFileService';

export function createTestShell(): AssetAdministrationShell {
    const demoAas = new AssetAdministrationShell(
        'https://example.com/ids/aas/7600_5912_3951_6917',
        new AssetInformation(AssetKind.Instance)
    );
    return demoAas;
}

export function createTestPackageDescription(): PackageDescription {
    return {
        aasIds: ['https://example.com/ids/aas/7600_5912_3951_6917', 'https://example.com/ids/aas/7600_5912_3951_6918'],
        packageId: 'aasx-package-01',
    };
}
