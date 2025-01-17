import type { AssetAdministrationShell as ApiAssetAdministrationShell } from '@/generated/aas-repository/types.gen';
import type { AssetAdministrationShell as CoreAssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { jsonization } from '@aas-core-works/aas-core3.0-typescript';

export function convertApiAasToCoreAas(aas: ApiAssetAdministrationShell): CoreAssetAdministrationShell {
    // first stringify
    let shell = JSON.stringify(aas);
    // then parse
    shell = JSON.parse(shell);
    // then jsonize
    const instanceOrError = jsonization.assetAdministrationShellFromJsonable(shell);
    if (instanceOrError.error !== null) {
        throw instanceOrError.error;
    }
    return instanceOrError.mustValue();
}

export function convertCoreAasToApiAas(aas: CoreAssetAdministrationShell): ApiAssetAdministrationShell {
    // first jsonize
    const jsonableAas = jsonization.toJsonable(aas);
    // then stringify
    const shell = JSON.stringify(jsonableAas);
    // then parse
    return JSON.parse(shell) as ApiAssetAdministrationShell;
}
