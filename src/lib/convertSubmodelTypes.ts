import { jsonization } from '@aas-core-works/aas-core3.0-typescript';
import { Submodel as CoreSubmodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelRepositoryService } from '../index';

export function convertApiSubmodelToCoreSubmodel(submodel: SubmodelRepositoryService.Submodel): CoreSubmodel {
    let submodelStr = JSON.stringify(submodel);
    submodelStr = JSON.parse(submodelStr);
    const instanceOrError = jsonization.submodelFromJsonable(submodelStr);
    if (instanceOrError.error !== null) {
        throw instanceOrError.error;
    }
    const instance = instanceOrError.mustValue();
    Object.setPrototypeOf(instance, CoreSubmodel.prototype);
    return instance;
}

export function convertCoreSubmodelToApiSubmodel(submodel: CoreSubmodel): SubmodelRepositoryService.Submodel {
    // first jsonize
    const jsonableAas = jsonization.toJsonable(submodel);
    // then stringify
    const shell = JSON.stringify(jsonableAas);
    // then parse
    return JSON.parse(shell) as SubmodelRepositoryService.Submodel;
}
