import { AasRepositoryClient } from '../../clients/AasRepositoryClient';
import { SubmodelRepositoryClient } from '../../clients/SubmodelRepositoryClient';
import { Configuration } from '../../generated/runtime';
import { base64Encode } from '../../lib/base64Url';

type FetchCall = { url: string; init: RequestInit };

const BASE_PATH = 'http://localhost:8080';
const AAS_ID = 'https://example.com/ids/aas/1';
const SUBMODEL_ID = 'https://example.com/ids/sm/1';
const ID_SHORT_PATH = 'calculate';
const HANDLE_ID = '6f2a1c34-0d8e-4b7a-9f51-2c3d4e5f6a7b';
const SUBMODEL_PATH = `/submodels/${base64Encode(SUBMODEL_ID)}/submodel-elements/${ID_SHORT_PATH}`;
const SHELL_SUBMODEL_PATH = `/shells/${base64Encode(AAS_ID)}${SUBMODEL_PATH}`;
const OPERATION_REQUEST = { inputArguments: [], clientTimeoutDuration: 'PT1M' };
const OPERATION_REQUEST_VALUE_ONLY = { inputArguments: {}, clientTimeoutDuration: 'PT1M' };

function createFetchMock(response: () => Response) {
    const calls: FetchCall[] = [];
    const fetchApi = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
        calls.push({ url: String(url), init: init ?? {} });
        return response();
    });
    return { calls, fetchApi, configuration: new Configuration({ basePath: BASE_PATH, fetchApi }) };
}

function acceptedResponse(location?: string): Response {
    return new Response(null, { status: 202, headers: location === undefined ? {} : { Location: location } });
}

function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('Asynchronous operation invocation', () => {
    describe('SubmodelRepositoryClient', () => {
        const client = new SubmodelRepositoryClient();

        it('postInvokeOperationAsync returns the handle from the Location header', async () => {
            const location = `${SUBMODEL_PATH}/operation-status/${HANDLE_ID}`;
            const { calls, configuration } = createFetchMock(() => acceptedResponse(location));

            const result = await client.postInvokeOperationAsync({
                configuration,
                submodelIdentifier: SUBMODEL_ID,
                idShortPath: ID_SHORT_PATH,
                operationRequest: OPERATION_REQUEST,
            });

            expect(calls[0].url).toBe(`${BASE_PATH}${SUBMODEL_PATH}/invoke-async`);
            expect(result).toEqual({
                success: true,
                data: { handleId: HANDLE_ID, location },
                statusCode: 202,
                etag: undefined,
            });
        });

        it('postInvokeOperationAsyncValueOnly needs no AAS identifier and returns the handle', async () => {
            const location = `${BASE_PATH}${SUBMODEL_PATH}/operation-status/${HANDLE_ID}`;
            const { calls, configuration } = createFetchMock(() => acceptedResponse(location));

            const result = await client.postInvokeOperationAsyncValueOnly({
                configuration,
                submodelIdentifier: SUBMODEL_ID,
                idShortPath: ID_SHORT_PATH,
                operationRequestValueOnly: OPERATION_REQUEST_VALUE_ONLY,
            });

            expect(calls[0].url).toBe(`${BASE_PATH}${SUBMODEL_PATH}/invoke-async/$value`);
            expect(result).toMatchObject({
                success: true,
                data: { handleId: HANDLE_ID, location },
                statusCode: 202,
            });
        });

        it('postInvokeOperationValueOnly needs no AAS identifier', async () => {
            const { calls, configuration } = createFetchMock(() =>
                jsonResponse(200, { executionState: 'Completed', success: true, outputArguments: {} })
            );

            const result = await client.postInvokeOperationValueOnly({
                configuration,
                submodelIdentifier: SUBMODEL_ID,
                idShortPath: ID_SHORT_PATH,
                operationRequestValueOnly: OPERATION_REQUEST_VALUE_ONLY,
            });

            expect(calls[0].url).toBe(`${BASE_PATH}${SUBMODEL_PATH}/invoke/$value`);
            expect(result).toMatchObject({ success: true, statusCode: 200 });
        });

        it('returns the handle of a path-relative Location header', async () => {
            const location = `operation-status/${HANDLE_ID}`;
            const { configuration } = createFetchMock(() => acceptedResponse(location));

            const result = await client.postInvokeOperationAsync({
                configuration,
                submodelIdentifier: SUBMODEL_ID,
                idShortPath: ID_SHORT_PATH,
                operationRequest: OPERATION_REQUEST,
            });

            expect(result).toMatchObject({ success: true, data: { handleId: HANDLE_ID, location }, statusCode: 202 });
        });

        it('returns no handle when the server sends no Location header', async () => {
            const { configuration } = createFetchMock(() => acceptedResponse());

            const result = await client.postInvokeOperationAsync({
                configuration,
                submodelIdentifier: SUBMODEL_ID,
                idShortPath: ID_SHORT_PATH,
                operationRequest: OPERATION_REQUEST,
            });

            expect(result).toMatchObject({ success: true, data: undefined, statusCode: 202 });
        });

        it('passes the returned handle to the status and result requests unchanged', async () => {
            const handleId = 'handle with/slash';
            const location = `${SUBMODEL_PATH}/operation-status/${encodeURIComponent(handleId)}`;
            const invocation = createFetchMock(() => acceptedResponse(location));

            const result = await client.postInvokeOperationAsync({
                configuration: invocation.configuration,
                submodelIdentifier: SUBMODEL_ID,
                idShortPath: ID_SHORT_PATH,
                operationRequest: OPERATION_REQUEST,
            });
            if (!result.success || result.data === undefined) {
                throw new Error('Expected a handle');
            }
            expect(result.data.handleId).toBe(handleId);

            const status = createFetchMock(() => jsonResponse(200, { executionState: 'Running' }));
            await client.getOperationAsyncStatus({
                configuration: status.configuration,
                submodelIdentifier: SUBMODEL_ID,
                idShortPath: ID_SHORT_PATH,
                handleId: result.data.handleId,
            });

            expect(status.calls[0].url).toBe(`${BASE_PATH}${location}`);
        });
    });

    describe('AasRepositoryClient', () => {
        const client = new AasRepositoryClient();

        it('invokeOperationAsyncAasRepository returns the handle from the Location header', async () => {
            const location = `${SHELL_SUBMODEL_PATH}/operation-status/${HANDLE_ID}`;
            const { calls, configuration } = createFetchMock(() => acceptedResponse(location));

            const result = await client.invokeOperationAsyncAasRepository({
                configuration,
                aasIdentifier: AAS_ID,
                submodelIdentifier: SUBMODEL_ID,
                idShortPath: ID_SHORT_PATH,
                operationRequest: OPERATION_REQUEST,
            });

            expect(calls[0].url).toBe(`${BASE_PATH}${SHELL_SUBMODEL_PATH}/invoke-async`);
            expect(result).toMatchObject({
                success: true,
                data: { handleId: HANDLE_ID, location },
                statusCode: 202,
            });
        });

        it('invokeOperationAsyncValueOnlyAasRepository returns the handle from the Location header', async () => {
            const location = `${SHELL_SUBMODEL_PATH}/operation-status/${HANDLE_ID}`;
            const { calls, configuration } = createFetchMock(() => acceptedResponse(location));

            const result = await client.invokeOperationAsyncValueOnlyAasRepository({
                configuration,
                aasIdentifier: AAS_ID,
                submodelIdentifier: SUBMODEL_ID,
                idShortPath: ID_SHORT_PATH,
                operationRequestValueOnly: OPERATION_REQUEST_VALUE_ONLY,
            });

            expect(calls[0].url).toBe(`${BASE_PATH}${SHELL_SUBMODEL_PATH}/invoke-async/$value`);
            expect(result).toMatchObject({
                success: true,
                data: { handleId: HANDLE_ID, location },
                statusCode: 202,
            });
        });
    });
});
