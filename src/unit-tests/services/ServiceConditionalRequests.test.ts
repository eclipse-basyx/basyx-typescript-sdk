import {
    AssetAdministrationShell,
    AssetInformation,
    AssetKind,
    Submodel,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { Configuration } from '../../generated/runtime';
import { AasService } from '../../services/AasService';
import { SubmodelService } from '../../services/SubmodelService';

type RecordedCall = { method: string; url: string; headers: Record<string, string> };
type Route = { method: string; url: RegExp; respond: () => Response };

const ETAG = '"8123-5c1e7a0d-91d2c3a4b5c6d7e8"';
const CURRENT_ETAG = '"8124-5c1e7a0d"';
const REGISTRY = 'http://registry.local';
const REPOSITORY = 'http://repository.local';

function createServer(routes: Route[]) {
    const calls: RecordedCall[] = [];
    const fetchApi = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? 'GET';
        calls.push({ method, url, headers: (init?.headers ?? {}) as Record<string, string> });

        const route = routes.find((candidate) => candidate.method === method && candidate.url.test(url));
        if (!route) {
            throw new Error(`Unexpected request ${method} ${url}`);
        }
        return route.respond();
    });
    return { calls, fetchApi };
}

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

function noContent(): Response {
    return new Response(null, { status: 204 });
}

function preconditionFailed(): Response {
    return json(
        412,
        { messages: [{ code: '412', messageType: 'Error', text: 'Precondition Failed', timestamp: '0' }] },
        { ETag: CURRENT_ETAG }
    );
}

describe('Conditional requests in services', () => {
    describe('AasService', () => {
        const shell = new AssetAdministrationShell(
            'https://example.com/ids/aas/1',
            new AssetInformation(AssetKind.Instance)
        );

        function createService(routes: Route[]) {
            const server = createServer(routes);
            const service = new AasService({
                aasRegistryConfig: new Configuration({ basePath: REGISTRY, fetchApi: server.fetchApi }),
                aasRepositoryConfig: new Configuration({ basePath: REPOSITORY, fetchApi: server.fetchApi }),
            });
            return { ...server, service };
        }

        it('returns the ETag of the shell', async () => {
            const { service } = createService([
                {
                    method: 'GET',
                    url: /^http:\/\/repository\.local\/shells\/[^/]+$/,
                    respond: () =>
                        json(
                            200,
                            {
                                id: shell.id,
                                assetInformation: { assetKind: 'Instance' },
                                modelType: 'AssetAdministrationShell',
                            },
                            { ETag: ETAG }
                        ),
                },
            ]);

            const result = await service.getAasById({ aasIdentifier: shell.id, useRegistryEndpoint: false });

            expect(result.success).toBe(true);
            expect(result.etag).toBe(ETAG);
        });

        it('does not update the registry if the shell update fails its precondition', async () => {
            const { calls, service } = createService([
                { method: 'PUT', url: /^http:\/\/repository\.local\/shells\//, respond: preconditionFailed },
            ]);

            const result = await service.updateAas({ shell, ifMatch: ETAG });

            expect(result).toMatchObject({ success: false, preconditionFailed: true, etag: CURRENT_ETAG });
            expect(calls).toHaveLength(1);
            expect(calls[0].headers['If-Match']).toBe(ETAG);
        });

        it('keeps the descriptor if the conditional delete fails its precondition', async () => {
            const { calls, service } = createService([
                { method: 'DELETE', url: /^http:\/\/repository\.local\/shells\//, respond: preconditionFailed },
            ]);

            const result = await service.deleteAas({ aasIdentifier: shell.id, ifMatch: ETAG });

            expect(result).toMatchObject({ success: false, preconditionFailed: true });
            expect(calls.map((call) => call.url.startsWith(REGISTRY))).toEqual([false]);
            expect(calls[0].headers['If-Match']).toBe(ETAG);
        });

        it('deletes from the repository first with ifMatch', async () => {
            const { calls, service } = createService([
                { method: 'DELETE', url: /^http:\/\/repository\.local\/shells\//, respond: noContent },
                { method: 'DELETE', url: /^http:\/\/registry\.local\/shell-descriptors\//, respond: noContent },
            ]);

            const result = await service.deleteAas({ aasIdentifier: shell.id, ifMatch: ETAG });

            expect(result.success).toBe(true);
            expect(calls.map((call) => new URL(call.url).origin)).toEqual([REPOSITORY, REGISTRY]);
            expect(calls[1].headers['If-Match']).toBeUndefined();
        });

        it('deletes from the registry first without ifMatch', async () => {
            const { calls, service } = createService([
                { method: 'DELETE', url: /^http:\/\/repository\.local\/shells\//, respond: noContent },
                { method: 'DELETE', url: /^http:\/\/registry\.local\/shell-descriptors\//, respond: noContent },
            ]);

            const result = await service.deleteAas({ aasIdentifier: shell.id });

            expect(result.success).toBe(true);
            expect(calls.map((call) => new URL(call.url).origin)).toEqual([REGISTRY, REPOSITORY]);
            expect(calls.every((call) => call.headers['If-Match'] === undefined)).toBe(true);
        });
    });

    describe('SubmodelService', () => {
        const submodel = new Submodel('https://example.com/ids/sm/1');

        function createService(routes: Route[]) {
            const server = createServer(routes);
            const service = new SubmodelService({
                submodelRegistryConfig: new Configuration({ basePath: REGISTRY, fetchApi: server.fetchApi }),
                submodelRepositoryConfig: new Configuration({ basePath: REPOSITORY, fetchApi: server.fetchApi }),
            });
            return { ...server, service };
        }

        it('returns the ETag of the Submodel', async () => {
            const { service } = createService([
                {
                    method: 'GET',
                    url: /^http:\/\/repository\.local\/submodels\/[^/]+$/,
                    respond: () => json(200, { id: submodel.id, modelType: 'Submodel' }, { ETag: ETAG }),
                },
            ]);

            const result = await service.getSubmodelById({
                submodelIdentifier: submodel.id,
                useRegistryEndpoint: false,
            });

            expect(result.success).toBe(true);
            expect(result.etag).toBe(ETAG);
        });

        it('returns the ETag of the Submodel resolved through the registry', async () => {
            const { service } = createService([
                {
                    method: 'GET',
                    url: /^http:\/\/registry\.local\/submodel-descriptors\//,
                    respond: () =>
                        json(200, {
                            id: submodel.id,
                            endpoints: [
                                {
                                    interface: 'SUBMODEL-3.0',
                                    protocolInformation: { href: `${REPOSITORY}/submodels/c3VibW9kZWw` },
                                },
                            ],
                        }),
                },
                {
                    method: 'GET',
                    url: /^http:\/\/repository\.local\/submodels\/[^/]+$/,
                    respond: () => json(200, { id: submodel.id, modelType: 'Submodel' }, { ETag: ETAG }),
                },
            ]);

            const result = await service.getSubmodelById({ submodelIdentifier: submodel.id });

            expect(result.success).toBe(true);
            expect(result.etag).toBe(ETAG);
        });

        it('does not update the registry if the Submodel update fails its precondition', async () => {
            const { calls, service } = createService([
                { method: 'PUT', url: /^http:\/\/repository\.local\/submodels\//, respond: preconditionFailed },
            ]);

            const result = await service.updateSubmodel({ submodel, ifMatch: ETAG });

            expect(result).toMatchObject({ success: false, preconditionFailed: true, etag: CURRENT_ETAG });
            expect(calls).toHaveLength(1);
            expect(calls[0].headers['If-Match']).toBe(ETAG);
        });

        it('keeps the descriptor if the conditional delete fails its precondition', async () => {
            const { calls, service } = createService([
                { method: 'DELETE', url: /^http:\/\/repository\.local\/submodels\//, respond: preconditionFailed },
            ]);

            const result = await service.deleteSubmodel({ submodelIdentifier: submodel.id, ifMatch: ETAG });

            expect(result).toMatchObject({ success: false, preconditionFailed: true });
            expect(calls).toHaveLength(1);
            expect(calls[0].headers['If-Match']).toBe(ETAG);
        });

        it('deletes from the repository first with ifMatch', async () => {
            const { calls, service } = createService([
                { method: 'DELETE', url: /^http:\/\/repository\.local\/submodels\//, respond: noContent },
                { method: 'DELETE', url: /^http:\/\/registry\.local\/submodel-descriptors\//, respond: noContent },
            ]);

            const result = await service.deleteSubmodel({ submodelIdentifier: submodel.id, ifMatch: ETAG });

            expect(result.success).toBe(true);
            expect(calls.map((call) => new URL(call.url).origin)).toEqual([REPOSITORY, REGISTRY]);
        });
    });
});
