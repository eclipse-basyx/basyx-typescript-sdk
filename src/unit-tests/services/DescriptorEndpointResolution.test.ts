import type { EndpointConfigurationResolver } from '../../lib/endpointConfiguration';
import { vi } from 'vitest';
import { Configuration, type FetchAPI } from '../../generated/runtime';
import { base64Encode } from '../../lib/base64Url';
import { AasService } from '../../services/AasService';
import { SubmodelService } from '../../services/SubmodelService';

// These tests use real clients with a fake fetch, so they cover the full request path from the registry
// response to the request sent to the descriptor endpoint.

const REGISTRY = 'http://registry.test';
const REPOSITORY = 'http://repository.test';
const ENDPOINT_HOST = 'http://endpoint.test/aas-env';

const AAS_ID = 'https://example.com/ids/aas/1';
const SM_ID = 'https://example.com/ids/sm/1';

const SHELL_JSON = { modelType: 'AssetAdministrationShell', id: AAS_ID, assetInformation: { assetKind: 'Instance' } };
const SUBMODEL_JSON = { modelType: 'Submodel', id: SM_ID };

type Kind = 'AAS' | 'SUBMODEL';

const kinds = {
    AAS: { collection: 'shells', registryPath: 'shell-descriptors', id: AAS_ID, body: SHELL_JSON },
    SUBMODEL: { collection: 'submodels', registryPath: 'submodel-descriptors', id: SM_ID, body: SUBMODEL_JSON },
} as const;

function resourceHref(kind: Kind, base = ENDPOINT_HOST): string {
    return `${base}/${kinds[kind].collection}/${base64Encode(kinds[kind].id)}`;
}

function endpoint(_interface: string, href: string) {
    return { interface: _interface, protocolInformation: { href } };
}

function descriptor(kind: Kind, endpoints: ReturnType<typeof endpoint>[]) {
    return { id: kinds[kind].id, endpoints };
}

/**
 * Creates a fake fetch that serves the given descriptor from the registry and the resource from any other host.
 * Every request is recorded.
 */
function createFetch(kind: Kind, descriptorJson: object) {
    const json = (body: unknown, status = 200) =>
        new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

    return vi.fn<FetchAPI>(async (input) => {
        const url = String(input);
        const { registryPath, collection, id, body } = kinds[kind];
        if (url.startsWith(`${REGISTRY}/${registryPath}/`)) return json(descriptorJson);
        if (url.startsWith(`${REGISTRY}/${registryPath}`))
            return json({ paging_metadata: {}, result: [descriptorJson] });
        if (url.endsWith(`/${collection}/${base64Encode(id)}`)) return json(body);
        if (url.startsWith(`${REPOSITORY}/${collection}`)) return json({ paging_metadata: {}, result: [body] });
        return json({ messages: [{ text: 'not found' }] }, 404);
    });
}

function requestedUrls(fetchApi: ReturnType<typeof createFetch>): string[] {
    return fetchApi.mock.calls.map(([input]) => String(input));
}

function createService(
    kind: Kind,
    options: { fetchApi: FetchAPI; withRepository?: boolean; hook?: EndpointConfigurationResolver }
) {
    const registryConfig = new Configuration({ basePath: REGISTRY, fetchApi: options.fetchApi });
    const repositoryConfig =
        (options.withRepository ?? true)
            ? new Configuration({ basePath: REPOSITORY, fetchApi: options.fetchApi })
            : undefined;

    if (kind === 'AAS') {
        const service = new AasService({
            aasRegistryConfig: registryConfig,
            aasRepositoryConfig: repositoryConfig,
            endpointConfiguration: options.hook,
        });
        return {
            list: () => service.getAasList(),
            byId: () => service.getAasById({ aasIdentifier: AAS_ID }),
            endpointById: () => service.getAasEndpointById({ aasIdentifier: AAS_ID }),
            byEndpoint: (href: string) => service.getAasByEndpoint({ endpoint: href }),
            items: (data: { shells: unknown[] }) => data.shells,
        };
    }

    const service = new SubmodelService({
        submodelRegistryConfig: registryConfig,
        submodelRepositoryConfig: repositoryConfig,
        endpointConfiguration: options.hook,
    });
    return {
        list: () => service.getSubmodelList(),
        byId: () => service.getSubmodelById({ submodelIdentifier: SM_ID }),
        endpointById: () => service.getSubmodelEndpointById({ submodelIdentifier: SM_ID }),
        byEndpoint: (href: string) => service.getSubmodelByEndpoint({ endpoint: href }),
        items: (data: { submodels: unknown[] }) => data.submodels,
    };
}

describe.each<Kind>(['AAS', 'SUBMODEL'])('Descriptor endpoint resolution (%s)', (kind) => {
    const href = resourceHref(kind);
    const repositoryInterface = `${kind}-REPOSITORY`;

    describe.each(['3.0', '3.1', '3.2'])(`${kind}-%s endpoint`, (version) => {
        const descriptorJson = descriptor(kind, [endpoint(`${kind}-${version}`, href)]);

        it('resolves the list from the descriptor endpoint', async () => {
            const fetchApi = createFetch(kind, descriptorJson);
            const result = await createService(kind, { fetchApi }).list();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.source).toBe('registry');
                expect(createService(kind, { fetchApi }).items(result.data)).toHaveLength(1);
                expect(result.data.warnings).toBeUndefined();
            }
            expect(requestedUrls(fetchApi)).toContain(href);
        });

        it('resolves by id from the descriptor endpoint', async () => {
            const fetchApi = createFetch(kind, descriptorJson);
            const result = await createService(kind, { fetchApi }).byId();

            expect(result.success).toBe(true);
            if (result.success) expect(result.data.descriptor).toBeDefined();
            expect(requestedUrls(fetchApi)).toContain(href);
        });

        it('returns the descriptor endpoint', async () => {
            const fetchApi = createFetch(kind, descriptorJson);
            const result = await createService(kind, { fetchApi }).endpointById();

            expect(result).toEqual({ success: true, data: href });
        });
    });

    describe('repository interface endpoint', () => {
        const descriptorJson = descriptor(kind, [endpoint(`${repositoryInterface}-3.2`, `${ENDPOINT_HOST}/`)]);

        it('resolves the resource below the repository base path', async () => {
            const fetchApi = createFetch(kind, descriptorJson);
            const service = createService(kind, { fetchApi });

            const listResult = await service.list();
            expect(listResult.success).toBe(true);
            if (listResult.success) expect(service.items(listResult.data)).toHaveLength(1);
            expect(requestedUrls(fetchApi)).toContain(href);

            expect(await service.endpointById()).toEqual({ success: true, data: href });
        });
    });

    describe('mixed endpoint lists', () => {
        it('prefers the direct interface over other interfaces listed first', async () => {
            const descriptorJson = descriptor(kind, [
                endpoint('DESCRIPTION-3.2', 'http://description.test/description'),
                endpoint(`${repositoryInterface}-3.2`, 'http://other-repository.test'),
                endpoint(`${kind}-3.2`, href),
            ]);
            const fetchApi = createFetch(kind, descriptorJson);
            const result = await createService(kind, { fetchApi }).byId();

            expect(result.success).toBe(true);
            expect(requestedUrls(fetchApi)).toContain(href);
            expect(requestedUrls(fetchApi).some((url) => url.includes('other-repository.test'))).toBe(false);
            expect(requestedUrls(fetchApi).some((url) => url.includes('description.test'))).toBe(false);
        });

        it('prefers the exact match over other 3.x versions', async () => {
            const exactHref = resourceHref(kind, 'http://exact.test');
            const descriptorJson = descriptor(kind, [
                endpoint(`${kind}-3.2`, href),
                endpoint(`${kind}-3.0`, exactHref),
            ]);
            const fetchApi = createFetch(kind, descriptorJson);

            expect(await createService(kind, { fetchApi }).endpointById()).toEqual({
                success: true,
                data: exactHref,
            });
        });

        it('ignores endpoints of other major versions', async () => {
            const descriptorJson = descriptor(kind, [endpoint(`${kind}-4.0`, href)]);
            const fetchApi = createFetch(kind, descriptorJson);
            const result = await createService(kind, { fetchApi }).list();

            expect(result.success).toBe(true);
            if (result.success) expect(result.data.warnings?.[0].errorType).toBe('MissingEndpoint');
        });
    });

    describe('no matching endpoint', () => {
        const descriptorJson = descriptor(kind, [endpoint('DESCRIPTION-3.2', 'http://description.test/description')]);

        it('reports a warning for the list without contacting other endpoints', async () => {
            const fetchApi = createFetch(kind, descriptorJson);
            const result = await createService(kind, { fetchApi, withRepository: false }).list();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.warnings).toHaveLength(1);
                expect(result.data.warnings?.[0].errorType).toBe('MissingEndpoint');
            }
            expect(requestedUrls(fetchApi).every((url) => url.startsWith(REGISTRY))).toBe(true);
        });

        it('falls back to the repository for the list', async () => {
            const fetchApi = createFetch(kind, descriptorJson);
            const result = await createService(kind, { fetchApi }).list();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.source).toBe('repository');
                expect(result.data.warnings?.[0].errorType).toBe('MissingEndpoint');
            }
            expect(requestedUrls(fetchApi).some((url) => url.includes('description.test'))).toBe(false);
        });

        it('falls back to the repository for getById', async () => {
            const fetchApi = createFetch(kind, descriptorJson);
            const result = await createService(kind, { fetchApi }).byId();

            expect(result.success).toBe(true);
            if (result.success) expect(result.data.descriptor).toBeUndefined();
            expect(requestedUrls(fetchApi)).toContain(resourceHref(kind, REPOSITORY));
        });
    });

    describe('endpointConfiguration hook', () => {
        const descriptorJson = descriptor(kind, [endpoint(`${kind}-3.2`, href)]);

        it('uses the configuration of the hook without repository configuration', async () => {
            const registryFetch = createFetch(kind, descriptorJson);
            const endpointFetch = createFetch(kind, descriptorJson);
            const hook = vi.fn(
                (endpointHref: string) =>
                    new Configuration({
                        basePath: 'http://ignored.test',
                        fetchApi: endpointFetch,
                        accessToken: async () => `token-for-${new URL(endpointHref).host}`,
                        headers: { 'X-Tenant': 'tenant-1' },
                        credentials: 'include',
                    })
            );
            const result = await createService(kind, { fetchApi: registryFetch, withRepository: false, hook }).list();

            expect(result.success).toBe(true);
            expect(hook).toHaveBeenCalledWith(href);
            expect(requestedUrls(registryFetch).every((url) => url.startsWith(REGISTRY))).toBe(true);
            expect(requestedUrls(endpointFetch)).toEqual([href]);

            const init = endpointFetch.mock.calls[0][1] as RequestInit;
            const headers = init.headers as Record<string, string>;
            expect(headers.Authorization).toBe('Bearer token-for-endpoint.test');
            expect(headers['X-Tenant']).toBe('tenant-1');
            expect(init.credentials).toBe('include');
        });

        it('applies the hook to getByEndpoint', async () => {
            const endpointFetch = createFetch(kind, descriptorJson);
            const hook = vi.fn(async () => new Configuration({ fetchApi: endpointFetch }));
            const result = await createService(kind, {
                fetchApi: vi.fn<FetchAPI>(),
                withRepository: false,
                hook,
            }).byEndpoint(href);

            expect(result.success).toBe(true);
            expect(requestedUrls(endpointFetch)).toEqual([href]);
        });

        it.each([
            ['returning null', () => null],
            [
                'throwing',
                () => {
                    throw new Error('unknown host');
                },
            ],
        ])('does not contact an endpoint rejected by %s', async (_, rejection) => {
            const fetchApi = createFetch(kind, descriptorJson);
            const hook = vi.fn(rejection);
            const service = createService(kind, { fetchApi, withRepository: false, hook });

            const listResult = await service.list();
            expect(listResult.success).toBe(true);
            if (listResult.success) {
                expect(service.items(listResult.data)).toHaveLength(0);
                expect(listResult.data.warnings?.[0]).toMatchObject({ endpoint: href, errorType: 'EndpointRejected' });
            }

            const byEndpointResult = await service.byEndpoint(href);
            expect(byEndpointResult.success).toBe(false);
            if (!byEndpointResult.success) expect(byEndpointResult.error.errorType).toBe('EndpointRejected');

            expect(requestedUrls(fetchApi).every((url) => url.startsWith(REGISTRY))).toBe(true);
        });

        it('falls back to the repository for getById if the endpoint is rejected', async () => {
            const fetchApi = createFetch(kind, descriptorJson);
            const result = await createService(kind, { fetchApi, hook: () => null }).byId();

            expect(result.success).toBe(true);
            expect(requestedUrls(fetchApi)).not.toContain(href);
            expect(requestedUrls(fetchApi)).toContain(resourceHref(kind, REPOSITORY));
        });
    });
});
