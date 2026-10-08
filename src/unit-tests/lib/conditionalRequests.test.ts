import {
    getConditionalErrorFields,
    getEtag,
    getNotModifiedResult,
    pickConditionalErrorFields,
} from '../../lib/conditionalRequests';

const ETAG = '"8123-5c1e7a0d-91d2c3a4b5c6d7e8"';

function responseError(status: number, headers: Record<string, string> = {}) {
    return { name: 'ResponseError', response: new Response(null, { status, headers }) };
}

describe('conditionalRequests', () => {
    describe('getEtag', () => {
        it('returns the ETag header unchanged', () => {
            expect(getEtag(new Response(null, { headers: { ETag: ETAG } }))).toBe(ETAG);
            expect(getEtag(new Response(null, { headers: { ETag: 'W/"weak"' } }))).toBe('W/"weak"');
        });

        it('returns undefined without an ETag header', () => {
            expect(getEtag(new Response(null))).toBeUndefined();
        });

        it('returns undefined for responses without headers', () => {
            expect(getEtag(undefined)).toBeUndefined();
            expect(getEtag({ status: 200 })).toBeUndefined();
        });
    });

    describe('getConditionalErrorFields', () => {
        it('flags 412 Precondition Failed', () => {
            expect(getConditionalErrorFields(responseError(412, { ETag: ETAG }))).toEqual({
                etag: ETAG,
                preconditionFailed: true,
            });
        });

        it('flags 428 Precondition Required', () => {
            expect(getConditionalErrorFields(responseError(428))).toEqual({ preconditionRequired: true });
        });

        it('returns no fields for other errors', () => {
            expect(getConditionalErrorFields(responseError(404))).toEqual({});
            expect(getConditionalErrorFields(new Error('network'))).toEqual({});
            expect(getConditionalErrorFields(undefined)).toEqual({});
        });
    });

    describe('pickConditionalErrorFields', () => {
        it('returns the conditional fields of a failed result', () => {
            expect(
                pickConditionalErrorFields({
                    success: false,
                    error: {},
                    statusCode: 412,
                    etag: ETAG,
                    preconditionFailed: true,
                })
            ).toEqual({ etag: ETAG, preconditionFailed: true });
            expect(
                pickConditionalErrorFields({ success: false, error: {}, statusCode: 428, preconditionRequired: true })
            ).toEqual({ preconditionRequired: true });
            expect(pickConditionalErrorFields({ success: false, error: {}, statusCode: 404 })).toEqual({});
        });
    });

    describe('getNotModifiedResult', () => {
        it('returns a not modified result for 304 when ifNoneMatch was sent', () => {
            expect(getNotModifiedResult(responseError(304, { ETag: ETAG }), ETAG)).toEqual({
                success: true,
                notModified: true,
                statusCode: 304,
                etag: ETAG,
            });
        });

        it('returns undefined without ifNoneMatch', () => {
            expect(getNotModifiedResult(responseError(304), undefined)).toBeUndefined();
            expect(getNotModifiedResult(responseError(304), '')).toBeUndefined();
        });

        it('returns undefined for other errors', () => {
            expect(getNotModifiedResult(responseError(412), ETAG)).toBeUndefined();
            expect(getNotModifiedResult(new Error('network'), ETAG)).toBeUndefined();
        });
    });
});
