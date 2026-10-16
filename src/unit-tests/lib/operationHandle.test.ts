import { getOperationHandle } from '../../lib/operationHandle';

const HANDLE_ID = '6f2a1c34-0d8e-4b7a-9f51-2c3d4e5f6a7b';
const STATUS_PATH = '/submodels/c20/submodel-elements/calculate/operation-status';

function accepted(location?: string): Response {
    return new Response(null, { status: 202, headers: location === undefined ? {} : { Location: location } });
}

describe('getOperationHandle', () => {
    it('returns the handle id and the Location header of a relative location', () => {
        const location = `${STATUS_PATH}/${HANDLE_ID}`;
        expect(getOperationHandle(accepted(location))).toEqual({ handleId: HANDLE_ID, location });
    });

    it('returns the handle id and the Location header of an absolute location', () => {
        const location = `http://localhost:8081${STATUS_PATH}/${HANDLE_ID}`;
        expect(getOperationHandle(accepted(location))).toEqual({ handleId: HANDLE_ID, location });
    });

    it('ignores a trailing slash, query and fragment', () => {
        expect(getOperationHandle(accepted(`${STATUS_PATH}/${HANDLE_ID}/`))?.handleId).toBe(HANDLE_ID);
        expect(getOperationHandle(accepted(`${STATUS_PATH}/${HANDLE_ID}?level=core`))?.handleId).toBe(HANDLE_ID);
        expect(getOperationHandle(accepted(`${STATUS_PATH}/${HANDLE_ID}#top`))?.handleId).toBe(HANDLE_ID);
    });

    it('URL-decodes the handle id', () => {
        expect(getOperationHandle(accepted(`${STATUS_PATH}/a%20b%2Fc`))?.handleId).toBe('a b/c');
    });

    it('keeps a handle id that is not valid percent-encoding', () => {
        expect(getOperationHandle(accepted(`${STATUS_PATH}/50%`))?.handleId).toBe('50%');
    });

    it('returns undefined without a Location header', () => {
        expect(getOperationHandle(accepted())).toBeUndefined();
    });

    it('returns undefined for a Location header without an operation-status segment', () => {
        expect(getOperationHandle(accepted('/submodels/c20/submodel-elements/calculate'))).toBeUndefined();
        expect(getOperationHandle(accepted(`${STATUS_PATH}/`))).toBeUndefined();
    });

    it('returns undefined for responses without headers', () => {
        expect(getOperationHandle(undefined)).toBeUndefined();
        expect(getOperationHandle({ status: 202 })).toBeUndefined();
    });
});
