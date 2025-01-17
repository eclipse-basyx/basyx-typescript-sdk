/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DataTypeDefXsd } from './DataTypeDefXsd';
import type { ModelType } from './ModelType';
import type { Reference } from './Reference';
import type { SubmodelElementAttributes } from './SubmodelElementAttributes';
export type SubmodelElementListMetadata = (SubmodelElementAttributes & {
    orderRelevant?: boolean;
    semanticIdListElement?: Reference;
    typeValueListElement?: ModelType;
    valueTypeListElement?: DataTypeDefXsd;
});

