import type { ApiResult, NotModifiedResult } from '../../models/api';
import {
    AssetAdministrationShell,
    AssetInformation,
    AssetKind,
    ConceptDescription,
    DataTypeDefXsd,
    Key,
    KeyTypes,
    Property,
    Reference,
    ReferenceTypes,
    SpecificAssetId,
    Submodel,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { AasDiscoveryClient } from '../../clients/AasDiscoveryClient';
import { AasRegistryClient } from '../../clients/AasRegistryClient';
import { AasRepositoryClient } from '../../clients/AasRepositoryClient';
import { AasxFileClient } from '../../clients/AasxFileClient';
import { ConceptDescriptionRepositoryClient } from '../../clients/ConceptDescriptionRepositoryClient';
import { SubmodelRegistryClient } from '../../clients/SubmodelRegistryClient';
import { SubmodelRepositoryClient } from '../../clients/SubmodelRepositoryClient';
import { SubmodelRepositoryService } from '../../generated';
import { Configuration } from '../../generated/runtime';
import { AssetAdministrationShellDescriptor, SubmodelDescriptor } from '../../models/Descriptors';

type FetchCall = { url: string; init: RequestInit };
type ResultLike = {
    success: boolean;
    statusCode?: number;
    etag?: string;
    notModified?: boolean;
    preconditionFailed?: boolean;
    preconditionRequired?: boolean;
};
type ClientMethod = (options: object) => Promise<ResultLike>;

const ETAG = '"8123-5c1e7a0d-91d2c3a4b5c6d7e8"';
const CURRENT_ETAG = '"8124-5c1e7a0d"';

function createFetchMock(response: () => Response) {
    const calls: FetchCall[] = [];
    const fetchApi = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
        calls.push({ url: String(url), init: init ?? {} });
        return response();
    });
    return { calls, fetchApi };
}

function createConfiguration(fetchApi: typeof fetch, headers?: Record<string, string>): Configuration {
    return new Configuration({ basePath: 'http://localhost:8080', fetchApi, headers });
}

function sentHeaders(call: FetchCall): Record<string, string> {
    return (call.init.headers ?? {}) as Record<string, string>;
}

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...headers },
    });
}

function preconditionFailedResponse(): Response {
    return jsonResponse(
        412,
        { messages: [{ code: '412', messageType: 'Error', text: 'Precondition Failed', timestamp: '0' }] },
        { ETag: CURRENT_ETAG }
    );
}

function createArguments(configuration: Configuration): Record<string, unknown> {
    const property = new Property(DataTypeDefXsd.String);
    property.idShort = 'temperature';
    property.value = '21.5';

    const submodel = new Submodel('https://example.com/ids/sm/1');
    submodel.idShort = 'submodel';

    const reference = new Reference(ReferenceTypes.ModelReference, [new Key(KeyTypes.Submodel, submodel.id)]);

    return {
        configuration,
        aasIdentifier: 'https://example.com/ids/aas/1',
        submodelIdentifier: submodel.id,
        cdIdentifier: 'https://example.com/ids/cd/1',
        packageId: 'package-1',
        idShortPath: 'temperature',
        assetAdministrationShell: new AssetAdministrationShell(
            'https://example.com/ids/aas/1',
            new AssetInformation(AssetKind.Instance)
        ),
        assetInformation: new AssetInformation(AssetKind.Instance),
        submodel,
        submodelElement: property,
        submodelReference: reference,
        conceptDescription: new ConceptDescription('https://example.com/ids/cd/1'),
        assetAdministrationShellDescriptor: new AssetAdministrationShellDescriptor('https://example.com/ids/aas/1'),
        submodelDescriptor: new SubmodelDescriptor(submodel.id, [
            {
                _interface: 'SUBMODEL-3.0',
                protocolInformation: {
                    href: 'http://localhost:8080/submodels/c20',
                    endpointProtocol: null,
                    endpointProtocolVersion: null,
                    subprotocol: null,
                    subprotocolBody: null,
                    subprotocolBodyEncoding: null,
                    securityAttributes: null,
                },
            },
        ]),
        specificAssetId: [new SpecificAssetId('serialNumber', '1234')],
        submodelMetadata: { idShort: 'submodel' },
        submodelElementMetadata: { idShort: 'temperature', modelType: 'Property' },
        submodelElementValue: '22.0',
        body: { temperature: '22.0' },
        operationRequest: { inputArguments: [], clientTimeoutDuration: 'PT1M' },
        operationRequestValueOnly: { inputArguments: {}, clientTimeoutDuration: 'PT1M' },
        fileName: 'file.txt',
        file: new Blob(['content'], { type: 'text/plain' }),
    };
}

type ClientCase = {
    name: string;
    create: () => object;
    reads: string[];
    writes: string[];
    puts: string[];
};

const CLIENT_CASES: ClientCase[] = [
    {
        name: 'AasRepositoryClient',
        create: () => new AasRepositoryClient(),
        reads: [
            'getAssetAdministrationShellById',
            'getAssetAdministrationShellByIdReferenceAasRepository',
            'getAssetInformationAasRepository',
            'getAssetInformation',
            'getThumbnailAasRepository',
            'getThumbnail',
            'getAllSubmodelReferencesAasRepository',
            'getAllSubmodelReferences',
            'getSubmodelByIdAasRepository',
            'getSubmodelByIdMetadataAasRepository',
            'getSubmodelByIdValueOnlyAasRepository',
            'getSubmodelByIdReferenceAasRepository',
            'getSubmodelByIdPathAasRepository',
            'getAllSubmodelElementsAasRepository',
            'getAllSubmodelElementsMetadataAasRepository',
            'getAllSubmodelElementsValueOnlyAasRepository',
            'getAllSubmodelElementsReferenceAasRepository',
            'getAllSubmodelElementsPathAasRepository',
            'getSubmodelElementByPathAasRepository',
            'getSubmodelElementByPathMetadataAasRepository',
            'getSubmodelElementByPathValueOnlyAasRepository',
            'getSubmodelElementByPathReferenceAasRepository',
            'getSubmodelElementByPathPathAasRepository',
            'getFileByPathAasRepository',
        ],
        writes: [
            'deleteAssetAdministrationShellById',
            'deleteThumbnailAasRepository',
            'deleteThumbnail',
            'postSubmodelReferenceAasRepository',
            'postSubmodelReference',
            'deleteSubmodelReferenceAasRepository',
            'deleteSubmodelReferenceById',
            'deleteSubmodelByIdAasRepository',
            'patchSubmodelAasRepository',
            'patchSubmodelByIdMetadataAasRepository',
            'patchSubmodelByIdValueOnlyAasRepository',
            'postSubmodelElementAasRepository',
            'postSubmodelElementByPathAasRepository',
            'deleteSubmodelElementByPathAasRepository',
            'patchSubmodelElementValueByPathAasRepository',
            'patchSubmodelElementValueByPathMetadata',
            'patchSubmodelElementValueByPathValueOnly',
            'deleteFileByPathAasRepository',
            'invokeOperationAasRepository',
            'invokeOperationValueOnlyAasRepository',
            'invokeOperationAsyncAasRepository',
            'invokeOperationAsyncValueOnlyAasRepository',
        ],
        puts: [
            'putAssetAdministrationShellById',
            'putAssetInformationAasRepository',
            'putAssetInformation',
            'putThumbnailAasRepository',
            'putThumbnail',
            'putSubmodelByIdAasRepository',
            'putSubmodelElementByPathAasRepository',
            'putFileByPathAasRepository',
        ],
    },
    {
        name: 'SubmodelRepositoryClient',
        create: () => new SubmodelRepositoryClient(),
        reads: [
            'getSubmodelById',
            'getSubmodelByIdReference',
            'getSubmodelByIdPath',
            'getSubmodelByIdMetadata',
            'getSubmodelByIdValueOnly',
            'getAllSubmodelElements',
            'getAllSubmodelElementsMetadata',
            'getAllSubmodelElementsValueOnly',
            'getAllSubmodelElementsReference',
            'getAllSubmodelElementsPath',
            'getSubmodelElementByPath',
            'getSubmodelElementByPathMetadata',
            'getSubmodelElementByPathReference',
            'getSubmodelElementByPathPath',
            'getSubmodelElementByPathValueOnly',
            'getFileByPath',
        ],
        writes: [
            'deleteSubmodelById',
            'patchSubmodelById',
            'patchSubmodelByIdMetadata',
            'patchSubmodelByIdValueOnly',
            'postSubmodelElement',
            'postSubmodelElementByPath',
            'deleteSubmodelElementByPath',
            'patchSubmodelElementByPath',
            'patchSubmodelElementByPathValueOnly',
            'patchSubmodelElementByPathMetadata',
            'deleteFileByPath',
            'postInvokeOperationSubmodelRepo',
            'postInvokeOperationValueOnly',
            'postInvokeOperationAsync',
            'postInvokeOperationAsyncValueOnly',
        ],
        puts: ['putSubmodelById', 'putSubmodelElementByPath', 'putFileByPath'],
    },
    {
        name: 'ConceptDescriptionRepositoryClient',
        create: () => new ConceptDescriptionRepositoryClient(),
        reads: ['getConceptDescriptionById'],
        writes: ['deleteConceptDescriptionById'],
        puts: ['putConceptDescriptionById'],
    },
    {
        name: 'AasRegistryClient',
        create: () => new AasRegistryClient(),
        reads: [
            'getAssetAdministrationShellDescriptorById',
            'getAllSubmodelDescriptorsThroughSuperpath',
            'getSubmodelDescriptorByIdThroughSuperpath',
        ],
        writes: [
            'deleteAssetAdministrationShellDescriptorById',
            'postSubmodelDescriptorThroughSuperpath',
            'deleteSubmodelDescriptorByIdThroughSuperpath',
        ],
        puts: ['putAssetAdministrationShellDescriptorById', 'putSubmodelDescriptorByIdThroughSuperpath'],
    },
    {
        name: 'SubmodelRegistryClient',
        create: () => new SubmodelRegistryClient(),
        reads: ['getSubmodelDescriptorById'],
        writes: ['deleteSubmodelDescriptorById'],
        puts: ['putSubmodelDescriptorById'],
    },
    {
        name: 'AasDiscoveryClient',
        create: () => new AasDiscoveryClient(),
        reads: ['getAllAssetLinksById'],
        writes: ['postAllAssetLinksById', 'deleteAllAssetLinksById'],
        puts: [],
    },
    {
        name: 'AasxFileClient',
        create: () => new AasxFileClient(),
        reads: ['getAASXByPackageId'],
        writes: ['deleteAASXByPackageId'],
        puts: ['putAASXByPackageId'],
    },
];

function getMethod(client: object, methodName: string): ClientMethod {
    const method = (client as Record<string, unknown>)[methodName];
    if (typeof method !== 'function') {
        throw new Error(`Missing client method ${methodName}`);
    }
    return (method as ClientMethod).bind(client);
}

describe('Conditional requests', () => {
    describe.each(CLIENT_CASES)('$name', ({ create, reads, writes, puts }) => {
        it.each(reads)('%s sends If-None-Match and returns notModified for 304', async (methodName) => {
            const { calls, fetchApi } = createFetchMock(
                () => new Response(null, { status: 304, headers: { ETag: ETAG } })
            );

            const result = await getMethod(
                create(),
                methodName
            )({
                ...createArguments(createConfiguration(fetchApi)),
                ifNoneMatch: ETAG,
            });

            expect(calls).toHaveLength(1);
            expect(sentHeaders(calls[0])['If-None-Match']).toBe(ETAG);
            expect(sentHeaders(calls[0])['If-Match']).toBeUndefined();
            expect(result).toEqual({ success: true, notModified: true, statusCode: 304, etag: ETAG });
        });

        it.each(writes)('%s sends If-Match and reports a failed precondition', async (methodName) => {
            const { calls, fetchApi } = createFetchMock(preconditionFailedResponse);

            const result = await getMethod(
                create(),
                methodName
            )({
                ...createArguments(createConfiguration(fetchApi)),
                ifMatch: ETAG,
            });

            expect(calls).toHaveLength(1);
            expect(sentHeaders(calls[0])['If-Match']).toBe(ETAG);
            expect(sentHeaders(calls[0])['If-None-Match']).toBeUndefined();
            expect(result).toMatchObject({
                success: false,
                statusCode: 412,
                etag: CURRENT_ETAG,
                preconditionFailed: true,
            });
            expect(result.preconditionRequired).toBeUndefined();
        });

        it.each(puts)('%s sends If-Match and If-None-Match and reports a failed precondition', async (methodName) => {
            const { calls, fetchApi } = createFetchMock(preconditionFailedResponse);

            const result = await getMethod(
                create(),
                methodName
            )({
                ...createArguments(createConfiguration(fetchApi)),
                ifMatch: ETAG,
                ifNoneMatch: '*',
            });

            expect(calls).toHaveLength(1);
            expect(sentHeaders(calls[0])['If-Match']).toBe(ETAG);
            expect(sentHeaders(calls[0])['If-None-Match']).toBe('*');
            expect(result).toMatchObject({ success: false, statusCode: 412, preconditionFailed: true });
        });

        it.each([...reads, ...writes, ...puts])('%s sends no conditional headers by default', async (methodName) => {
            const { calls, fetchApi } = createFetchMock(preconditionFailedResponse);

            await getMethod(create(), methodName)(createArguments(createConfiguration(fetchApi)));

            expect(calls).toHaveLength(1);
            expect(sentHeaders(calls[0])['If-Match']).toBeUndefined();
            expect(sentHeaders(calls[0])['If-None-Match']).toBeUndefined();
        });
    });

    it('returns the ETag of a successful read', async () => {
        const { fetchApi } = createFetchMock(() =>
            jsonResponse(200, { id: 'https://example.com/ids/sm/1', modelType: 'Submodel' }, { ETag: ETAG })
        );

        const result = await new SubmodelRepositoryClient().getSubmodelById({
            configuration: createConfiguration(fetchApi),
            submodelIdentifier: 'https://example.com/ids/sm/1',
        });

        expect(result.success).toBe(true);
        expect(result.etag).toBe(ETAG);
    });

    it('returns the ETag of a successful write', async () => {
        const { fetchApi } = createFetchMock(
            () => new Response(null, { status: 204, headers: { ETag: CURRENT_ETAG } })
        );

        const result = await new SubmodelRepositoryClient().patchSubmodelElementByPathValueOnly({
            configuration: createConfiguration(fetchApi),
            submodelIdentifier: 'https://example.com/ids/sm/1',
            idShortPath: 'temperature',
            submodelElementValue: '21.5',
            ifMatch: ETAG,
        });

        expect(result).toEqual({ success: true, data: undefined, statusCode: 204, etag: CURRENT_ETAG });
    });

    it('leaves the ETag undefined if the server sends none', async () => {
        const { fetchApi } = createFetchMock(() =>
            jsonResponse(200, { id: 'https://example.com/ids/sm/1', modelType: 'Submodel' })
        );

        const result = await new SubmodelRepositoryClient().getSubmodelById({
            configuration: createConfiguration(fetchApi),
            submodelIdentifier: 'https://example.com/ids/sm/1',
        });

        expect(result.success).toBe(true);
        expect(result.etag).toBeUndefined();
    });

    it('reports a required precondition', async () => {
        const { fetchApi } = createFetchMock(() =>
            jsonResponse(428, {
                messages: [{ code: '428', messageType: 'Error', text: 'Precondition Required', timestamp: '0' }],
            })
        );

        const result = await new SubmodelRepositoryClient().deleteSubmodelById({
            configuration: createConfiguration(fetchApi),
            submodelIdentifier: 'https://example.com/ids/sm/1',
        });

        expect(result).toMatchObject({ success: false, statusCode: 428, preconditionRequired: true });
        expect(result.success === false && result.preconditionFailed).toBeFalsy();
    });

    it('does not flag other errors', async () => {
        const { fetchApi } = createFetchMock(() =>
            jsonResponse(404, { messages: [{ code: '404', messageType: 'Error', text: 'Not Found', timestamp: '0' }] })
        );

        const result = await new SubmodelRepositoryClient().deleteSubmodelById({
            configuration: createConfiguration(fetchApi),
            submodelIdentifier: 'https://example.com/ids/sm/1',
            ifMatch: ETAG,
        });

        expect(result).toEqual({
            success: false,
            statusCode: 404,
            error: { messages: [{ code: '404', messageType: 'Error', text: 'Not Found', timestamp: '0' }] },
        });
    });

    it('does not treat 304 as not modified without ifNoneMatch', async () => {
        const { fetchApi } = createFetchMock(() => new Response(null, { status: 304 }));

        const result = await new SubmodelRepositoryClient().getSubmodelById({
            configuration: createConfiguration(fetchApi),
            submodelIdentifier: 'https://example.com/ids/sm/1',
        });

        expect(result).toMatchObject({ success: false, statusCode: 304 });
    });

    it('replaces a configured conditional header and keeps the others', async () => {
        const { calls, fetchApi } = createFetchMock(preconditionFailedResponse);
        const configuration = createConfiguration(fetchApi, { 'if-match': '"stale"', 'X-Custom': 'value' });

        await new SubmodelRepositoryClient().deleteSubmodelById({
            configuration,
            submodelIdentifier: 'https://example.com/ids/sm/1',
            ifMatch: ETAG,
        });

        expect(sentHeaders(calls[0])).toMatchObject({ 'If-Match': ETAG, 'X-Custom': 'value' });
        expect(sentHeaders(calls[0])['if-match']).toBeUndefined();
        expect(configuration.headers).toEqual({ 'if-match': '"stale"', 'X-Custom': 'value' });
    });

    it('adds NotModifiedResult to the result type only when ifNoneMatch is passed', async () => {
        const { fetchApi } = createFetchMock(() => new Response(null, { status: 304 }));
        const client = new SubmodelRepositoryClient();
        const configuration = createConfiguration(fetchApi);
        const submodelIdentifier = 'https://example.com/ids/sm/1';
        const maybeEtag = undefined as string | undefined;

        const plain = await client.getSubmodelById({ configuration, submodelIdentifier });
        const conditional = await client.getSubmodelById({ configuration, submodelIdentifier, ifNoneMatch: ETAG });
        const optional = await client.getSubmodelById({ configuration, submodelIdentifier, ifNoneMatch: maybeEtag });

        type Plain = ApiResult<Submodel, SubmodelRepositoryService.Result>;
        expectTypeOf(plain).toEqualTypeOf<Plain>();
        expectTypeOf(conditional).toEqualTypeOf<Plain | NotModifiedResult>();
        expectTypeOf(optional).toEqualTypeOf<Plain | NotModifiedResult>();

        if (conditional.success && !conditional.notModified) {
            expectTypeOf(conditional.data).toEqualTypeOf<Submodel>();
        }
    });
});
