import fs from 'node:fs';

const ENGINE_MODE_ENV = 'BASYX_TEST_ENGINE_MODE';
const TRACE_FILE_ENV = 'BASYX_TEST_ENGINE_REQUEST_TRACE_FILE';
const PATCH_FLAG = '__basyxTestEngineFetchPatched';
const MAX_SNIPPET_LENGTH = 800;
const REDACTED_HEADER_KEYS = new Set([
    'authorization',
    'proxy-authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
    'x-auth-token',
]);

type HeaderRecord = Record<string, string>;

type RequestResponseTraceEvent = {
    timestamp: string;
    testName: string;
    method: string;
    url: string;
    endpoint: string;
    requestHeaders: HeaderRecord;
    requestBodySummary: string;
    responseStatus: number;
    responseBodySnippet: string;
    responseContentType?: string;
    curlCommand: string;
};

type PatchedGlobal = typeof globalThis & {
    [PATCH_FLAG]?: boolean;
};

type BodySummary = {
    summary: string;
    curlArgs: string[];
};

function getTraceFilePath(): string | undefined {
    if (process.env[ENGINE_MODE_ENV] !== 'true') {
        return undefined;
    }

    const value = process.env[TRACE_FILE_ENV];
    if (!value || value.trim().length === 0) {
        return undefined;
    }

    return value;
}

function truncateSnippet(value: string, maxLength = MAX_SNIPPET_LENGTH): string {
    const compact = value.replace(/\s+/g, ' ').trim();
    if (compact.length <= maxLength) {
        return compact;
    }

    return `${compact.slice(0, maxLength)}...`;
}

function toShellQuoted(value: string): string {
    return `'${value.replace(/'/g, `'"'"'`)}'`;
}

function toEndpoint(urlValue: string): string {
    try {
        const parsed = new URL(urlValue);
        return `${parsed.pathname}${parsed.search}`;
    } catch {
        return urlValue;
    }
}

function toHeaderEntries(headers: HeadersInit | undefined): Array<[string, string]> {
    if (!headers) {
        return [];
    }

    if (headers instanceof Headers) {
        return [...headers.entries()];
    }

    if (Array.isArray(headers)) {
        return headers.map(([key, value]) => [String(key), String(value)]);
    }

    return Object.entries(headers)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]);
}

function sanitizeHeaders(headers: HeadersInit | undefined): HeaderRecord {
    const sanitized: HeaderRecord = {};

    for (const [rawKey, rawValue] of toHeaderEntries(headers)) {
        const key = rawKey.toLowerCase();
        const value = REDACTED_HEADER_KEYS.has(key) ? '[redacted]' : rawValue;
        sanitized[rawKey] = truncateSnippet(value, 256);
    }

    return sanitized;
}

function shouldIncludeHeaderInCurl(headerKey: string): boolean {
    const key = headerKey.toLowerCase();
    return key !== 'content-length' && key !== 'host';
}

function summarizeFormFieldString(key: string, value: string): { summary: string; curlArg: string } {
    return {
        summary: `${key}=<string:${truncateSnippet(value, 80)}>`,
        curlArg: `-F ${toShellQuoted(`${key}=${value}`)}`,
    };
}

function summarizeFormFieldBinary(key: string, value: Blob): { summary: string; curlArg: string } {
    const fallbackPath = '<path-to-file>';
    let candidatePath = fallbackPath;

    if (typeof File !== 'undefined' && value instanceof File && value.name) {
        candidatePath = value.name;
    }

    const contentTypeSuffix = value.type ? `;type=${value.type}` : '';
    return {
        summary: `${key}=<binary:${candidatePath};type=${value.type || 'application/octet-stream'};size=${value.size}>`,
        curlArg: `-F ${toShellQuoted(`${key}=@${candidatePath}${contentTypeSuffix}`)}`,
    };
}

async function summarizeRequestBody(body: unknown): Promise<BodySummary> {
    if (body === undefined || body === null) {
        return {
            summary: '(none)',
            curlArgs: [],
        };
    }

    if (typeof body === 'string') {
        const snippet = truncateSnippet(body);
        return {
            summary: snippet || '(empty string)',
            curlArgs: body.length > 0 ? [`--data-raw ${toShellQuoted(body)}`] : [],
        };
    }

    if (body instanceof URLSearchParams) {
        const serialized = body.toString();
        return {
            summary: truncateSnippet(serialized),
            curlArgs: serialized.length > 0 ? [`--data-raw ${toShellQuoted(serialized)}`] : [],
        };
    }

    if (typeof FormData !== 'undefined' && body instanceof FormData) {
        const summaryParts: string[] = [];
        const curlArgs: string[] = [];

        for (const [key, value] of body.entries()) {
            if (typeof value === 'string') {
                const field = summarizeFormFieldString(key, value);
                summaryParts.push(field.summary);
                curlArgs.push(field.curlArg);
                continue;
            }

            const field = summarizeFormFieldBinary(key, value);
            summaryParts.push(field.summary);
            curlArgs.push(field.curlArg);
        }

        return {
            summary: summaryParts.join('; ') || '(empty multipart/form-data)',
            curlArgs,
        };
    }

    if (typeof Blob !== 'undefined' && body instanceof Blob) {
        return {
            summary: `<binary:blob;type=${body.type || 'application/octet-stream'};size=${body.size}>`,
            curlArgs: [`--data-binary ${toShellQuoted('@<path-to-binary>')}`],
        };
    }

    if (typeof body === 'object') {
        try {
            const serialized = JSON.stringify(body);
            if (!serialized) {
                return { summary: '(empty object)', curlArgs: [] };
            }

            return {
                summary: truncateSnippet(serialized),
                curlArgs: [`--data-raw ${toShellQuoted(serialized)}`],
            };
        } catch {
            return {
                summary: '[unserializable object body]',
                curlArgs: [],
            };
        }
    }

    return {
        summary: truncateSnippet(String(body)),
        curlArgs: [],
    };
}

async function summarizeResponseBody(response: Response): Promise<{ snippet: string; contentType?: string }> {
    const contentType = response.headers.get('content-type') || undefined;
    const lowered = (contentType || '').toLowerCase();
    const isTextLike =
        lowered.includes('application/json') ||
        lowered.includes('application/problem+json') ||
        lowered.startsWith('text/') ||
        lowered.includes('xml') ||
        lowered.includes('yaml') ||
        lowered.includes('javascript');

    if (!isTextLike && lowered) {
        return {
            snippet: `[non-text response body: ${contentType}]`,
            contentType,
        };
    }

    try {
        const text = await response.clone().text();
        return {
            snippet: truncateSnippet(text || '(empty response body)'),
            contentType,
        };
    } catch {
        return {
            snippet: '[unable to read response body snippet]',
            contentType,
        };
    }
}

function resolveRequestUrl(input: RequestInfo | URL): string {
    if (typeof input === 'string') {
        return input;
    }

    if (input instanceof URL) {
        return input.toString();
    }

    if (typeof Request !== 'undefined' && input instanceof Request) {
        return input.url;
    }

    return String(input);
}

function resolveRequestMethod(input: RequestInfo | URL, init: RequestInit | undefined): string {
    if (init?.method) {
        return init.method.toUpperCase();
    }

    if (typeof Request !== 'undefined' && input instanceof Request && input.method) {
        return input.method.toUpperCase();
    }

    return 'GET';
}

function resolveRequestHeaders(input: RequestInfo | URL, init: RequestInit | undefined): HeadersInit | undefined {
    if (init?.headers) {
        return init.headers;
    }

    if (typeof Request !== 'undefined' && input instanceof Request) {
        return input.headers;
    }

    return undefined;
}

function resolveCurrentTestName(): string {
    const maybeExpect = (
        globalThis as {
            expect?: {
                getState?: () => { currentTestName?: string };
            };
        }
    ).expect;

    return maybeExpect?.getState?.().currentTestName || '(unknown-test)';
}

function appendTraceEvent(traceFilePath: string, event: RequestResponseTraceEvent): void {
    try {
        fs.appendFileSync(traceFilePath, `${JSON.stringify(event)}\n`, 'utf8');
    } catch {
        // Ignore trace write errors to keep test execution unaffected.
    }
}

function buildCurlCommand(method: string, url: string, requestHeaders: HeaderRecord, bodySummary: BodySummary): string {
    const curlSegments = [`curl -X ${method}`, toShellQuoted(url)];

    for (const [key, value] of Object.entries(requestHeaders)) {
        if (!shouldIncludeHeaderInCurl(key)) {
            continue;
        }

        curlSegments.push(`-H ${toShellQuoted(`${key}: ${value}`)}`);
    }

    curlSegments.push(...bodySummary.curlArgs);

    return curlSegments.join(' ');
}

(function installTestEngineFetchTrace() {
    const traceFilePath = getTraceFilePath();
    if (!traceFilePath) {
        return;
    }

    const globalWithPatch = globalThis as PatchedGlobal;
    if (globalWithPatch[PATCH_FLAG]) {
        return;
    }

    const originalFetch = globalThis.fetch?.bind(globalThis);
    if (!originalFetch) {
        return;
    }

    globalWithPatch[PATCH_FLAG] = true;

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = resolveRequestUrl(input);
        const method = resolveRequestMethod(input, init);
        const headers = sanitizeHeaders(resolveRequestHeaders(input, init));
        const bodySummary = await summarizeRequestBody(init?.body);
        const testName = resolveCurrentTestName();
        const curlCommand = buildCurlCommand(method, url, headers, bodySummary);

        try {
            const response = await originalFetch(input, init);
            const responseSummary = await summarizeResponseBody(response);

            appendTraceEvent(traceFilePath, {
                timestamp: new Date().toISOString(),
                testName,
                method,
                url,
                endpoint: toEndpoint(url),
                requestHeaders: headers,
                requestBodySummary: bodySummary.summary,
                responseStatus: response.status,
                responseBodySnippet: responseSummary.snippet,
                responseContentType: responseSummary.contentType,
                curlCommand,
            });

            return response;
        } catch (error) {
            appendTraceEvent(traceFilePath, {
                timestamp: new Date().toISOString(),
                testName,
                method,
                url,
                endpoint: toEndpoint(url),
                requestHeaders: headers,
                requestBodySummary: bodySummary.summary,
                responseStatus: 0,
                responseBodySnippet: truncateSnippet(error instanceof Error ? error.message : String(error)),
                curlCommand,
            });

            throw error;
        }
    };
})();
