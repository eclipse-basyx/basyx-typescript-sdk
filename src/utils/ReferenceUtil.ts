import type { KeyTypes, Reference } from '@aas-core-works/aas-core3.1-typescript/types';
//import {keyTypes} from '../utils/KeyTypesUtil';
/**
 * Extracts the ID (Key) from a Reference object based on the given Key Type.
 *
 * @param {Reference} reference - The Reference object containing ID/Key information.
 * @param {KeyTypes} keyType - The enum value of the key type.
 * @returns {string} The ID (Key) of the matching Key Type name if found, otherwise an empty string.
 */
export function extractId(reference: Reference, keyType: KeyTypes): string {
    const failResponse = '';

    if (!reference?.keys || reference.keys.length === 0) {
        return failResponse;
    }

    //keyType = keyType.trim();
    // if (!keyTypes.some((keyTypeOfKeyTypes) => keyTypeOfKeyTypes.type === keyType)) {
    //     return failResponse;
    // }

    const keys = reference.keys;
    // find the key based on the key type
    const key = keys.find((key) => key?.type === keyType);

    return key?.value?.trim() || failResponse;
}
