import { Key, KeyTypes, Reference, ReferenceTypes } from '@aas-core-works/aas-core3.1-typescript/types';
import { AasRepositoryService, SubmodelRepositoryService } from '../../generated';

export function createAasRepositoryPayloadFixtures(submodelId: string): {
    submodelReference: Reference;
    submodelMetadataPatch: AasRepositoryService.SubmodelMetadata;
    submodelElementMetadataPatch: AasRepositoryService.SubmodelElementMetadata;
    operationRequestValueOnly: AasRepositoryService.OperationRequestValueOnly;
} {
    return {
        submodelReference: new Reference(ReferenceTypes.ModelReference, [new Key(KeyTypes.Submodel, submodelId)]),
        submodelMetadataPatch: {
            modelType: AasRepositoryService.ModelType.Submodel,
            id: submodelId,
        },
        submodelElementMetadataPatch: {
            modelType: AasRepositoryService.ModelType.Property,
        },
        operationRequestValueOnly: {
            inputArguments: {},
            inoutputArguments: {},
            clientTimeoutDuration: 'PT5S',
        },
    };
}

export function createSubmodelRepositoryPayloadFixtures(submodelId: string): {
    submodelMetadataPatch: SubmodelRepositoryService.SubmodelMetadata;
    submodelElementMetadataPatch: SubmodelRepositoryService.SubmodelElementMetadata;
    operationRequestValueOnly: SubmodelRepositoryService.OperationRequestValueOnly;
} {
    return {
        submodelMetadataPatch: {
            modelType: SubmodelRepositoryService.ModelType.Submodel,
            id: submodelId,
        },
        submodelElementMetadataPatch: {
            modelType: SubmodelRepositoryService.ModelType.Property,
        },
        operationRequestValueOnly: {
            inputArguments: {},
            inoutputArguments: {},
            clientTimeoutDuration: 'PT5S',
        },
    };
}
