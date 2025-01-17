/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetKind } from './AssetKind';
import type { Resource } from './Resource';
import type { SpecificAssetId } from './SpecificAssetId';
export type AssetInformation = {
    assetKind: AssetKind;
    globalAssetId?: string;
    specificAssetIds?: Array<SpecificAssetId>;
    assetType?: string;
    defaultThumbnail?: Resource;
};

