/**
 * Represents an asset identifier.
 *
 * @remarks
 * The "name" property can either be "globalAssetId" to denote a global identifier, or any other string representing a custom identifier type.
 * The "value" property contains the actual identifier.
 */
export type AssetId = {
    name: string;
    value: string;
};
