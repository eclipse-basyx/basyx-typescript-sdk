import { vi } from 'vitest';
import { BaseAPI, Configuration, type FetchAPI, type HTTPHeaders } from '../../generated/runtime';

class TestApi extends BaseAPI {
    async ping(headers: HTTPHeaders = {}) {
        return this.request({
            path: '/ping',
            method: 'GET',
            headers,
        });
    }
}

describe('Generated Runtime Access Token Handling', () => {
    test('should add Authorization header when accessToken is configured as string', async () => {
        const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
        const api = new TestApi(
            new Configuration({
                basePath: 'http://localhost:1234',
                accessToken: 'test-token',
                fetchApi: fetchMock as unknown as FetchAPI,
            })
        );

        await api.ping();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const requestInit = (fetchMock.mock.calls[0] as unknown as [RequestInfo | URL, RequestInit])[1];
        const headers = requestInit.headers as HTTPHeaders;
        expect(headers.Authorization).toBe('Bearer test-token');
    });

    test('should resolve token from accessToken function and set Authorization header', async () => {
        const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
        const tokenProvider = vi.fn().mockResolvedValue('dynamic-token');
        const api = new TestApi(
            new Configuration({
                basePath: 'http://localhost:1234',
                accessToken: tokenProvider,
                fetchApi: fetchMock as unknown as FetchAPI,
            })
        );

        await api.ping();

        expect(tokenProvider).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const requestInit = (fetchMock.mock.calls[0] as unknown as [RequestInfo | URL, RequestInit])[1];
        const headers = requestInit.headers as HTTPHeaders;
        expect(headers.Authorization).toBe('Bearer dynamic-token');
    });

    test('should not overwrite an existing Authorization header', async () => {
        const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
        const api = new TestApi(
            new Configuration({
                basePath: 'http://localhost:1234',
                accessToken: 'new-token',
                fetchApi: fetchMock as unknown as FetchAPI,
            })
        );

        await api.ping({ Authorization: 'Basic existing-token' });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const requestInit = (fetchMock.mock.calls[0] as unknown as [RequestInfo | URL, RequestInit])[1];
        const headers = requestInit.headers as HTTPHeaders;
        expect(headers.Authorization).toBe('Basic existing-token');
    });

    test('should not add Authorization header when accessToken resolves to empty value', async () => {
        const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
        const api = new TestApi(
            new Configuration({
                basePath: 'http://localhost:1234',
                accessToken: async () => '',
                fetchApi: fetchMock as unknown as FetchAPI,
            })
        );

        await api.ping();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const requestInit = (fetchMock.mock.calls[0] as unknown as [RequestInfo | URL, RequestInit])[1];
        const headers = requestInit.headers as HTTPHeaders;
        expect(headers.Authorization).toBeUndefined();
    });
});
