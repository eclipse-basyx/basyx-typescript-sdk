import { jsonization } from '@aas-core-works/aas-core3.0-typescript';
import { Submodel as CoreSubmodel, 
        ISubmodelElement as CoreSubmodelElement,
        SubmodelElementList as CoreSubmodelElementList
} from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelRepositoryService } from '../generated';

/**
 * Convert an API Submodel to a Core Works Submodel
 *
 * @function convertApiSubmodelToCoreSubmodel
 * @param {ApiSubmodel} submodel - The API Submodel to convert
 * @returns {CoreSubmodel} The Core Works Submodel
 */
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

/**
 * Convert a Core Works Submodel to an API Submodel
 *
 * @function convertCoreSubmodelToApiSubmodel
 * @param {CoreSubmodel} submodel - The Core Works Submodel to convert
 * @returns {ApiSubmodel} The API Submodel
 */
export function convertCoreSubmodelToApiSubmodel(submodel: CoreSubmodel): SubmodelRepositoryService.Submodel {
    // first jsonize
    const jsonableSubmodel = jsonization.toJsonable(submodel);
    // then stringify
    const submodelStr = JSON.stringify(jsonableSubmodel);
    // then parse
    return JSON.parse(submodelStr) as SubmodelRepositoryService.Submodel;
}

/**
 * Convert an API SubmodelElement to a Core Works SubmodelElement
 *
 * @function convertApiSubmodelElementToCoreSubmodelElement
 * @param {ApiSubmodelElement} submodelElement - The API SubmodelElement to convert
 * @returns {CoreSubmodelElement} The Core Works SubmodelElement
 */
export function convertApiSubmodelElementToCoreSubmodelElement(submodelElement: SubmodelRepositoryService.SubmodelElement): CoreSubmodelElement {
    let submodelElementStr = JSON.stringify(submodelElement);
    const submodelElementObj = JSON.parse(submodelElementStr);
    //submodelElementStr = JSON.parse(submodelElementStr);
    const instanceOrError = jsonization.submodelElementFromJsonable(submodelElementObj);
    if (instanceOrError.error !== null) {
        throw instanceOrError.error;
    }
    const instance = instanceOrError.mustValue();
    //Object.setPrototypeOf(instance, CoreSubmodelElement.prototype);
    return instance;
}

/**
 * Convert a Core Works SubmodelElement to an API SubmodelElement
 *
 * @function convertCoreSubmodelElementToApiSubmodelElement
 * @param {CoreSubmodelElement} submodelElement - The Core Works SubmodelElement to convert
 * @returns {ApiSubmodelElement} The API SubmodelElement
 */
export function convertCoreSubmodelElementToApiSubmodelElement(submodelElement: CoreSubmodelElement): SubmodelRepositoryService.SubmodelElement {
    // first jsonize
    const jsonableSubmodelElement = jsonization.toJsonable(submodelElement);
    // then stringify
    const submodelElementStr = JSON.stringify(jsonableSubmodelElement);
    // then parse
    return JSON.parse(submodelElementStr) as SubmodelRepositoryService.SubmodelElement;
}
