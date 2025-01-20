import type {
    AssetAdministrationShell as ApiAssetAdministrationShell,
    AssetInformation as ApiAssetInformation,
} from '@/generated/aas-repository/types.gen';
import type {
    AssetAdministrationShell as CoreAssetAdministrationShell,
    AssetInformation as CoreAssetInformation,
} from '@aas-core-works/aas-core3.0-typescript/types';
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

export function convertApiAssetInformationToCoreAssetInformation(
    assetInformation: ApiAssetInformation
): CoreAssetInformation {
    // first stringify
    let asset = JSON.stringify(assetInformation);
    // then parse
    asset = JSON.parse(asset);
    // then jsonize
    const instanceOrError = jsonization.assetInformationFromJsonable(asset);
    if (instanceOrError.error !== null) {
        throw instanceOrError.error;
    }
    return instanceOrError.mustValue();
}

export function convertCoreAssetInformationToApiAssetInformation(
    assetInformation: CoreAssetInformation
): ApiAssetInformation {
    // first jsonize
    const jsonableAsset = jsonization.toJsonable(assetInformation);
    // then stringify
    const asset = JSON.stringify(jsonableAsset);
    // then parse
    return JSON.parse(asset) as ApiAssetInformation;
}
