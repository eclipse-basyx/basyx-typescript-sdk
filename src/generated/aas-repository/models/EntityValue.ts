/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EntityType } from './EntityType';
import type { SpecificAssetIdValue } from './SpecificAssetIdValue';
import type { ValueOnly } from './ValueOnly';
export type EntityValue = {
    entityType: EntityType;
    globalAssetId?: string;
    specificAssetIds?: Array<SpecificAssetIdValue>;
    statements?: Array<ValueOnly>;
};

