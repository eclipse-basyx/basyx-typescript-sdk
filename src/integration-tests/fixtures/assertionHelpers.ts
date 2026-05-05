type ApiErrorMessage = {
    code?: unknown;
    message?: unknown;
};

export type ApiResultLike = {
    success: boolean;
    statusCode?: number;
    data?: unknown;
    error?: unknown;
};

const MAX_FALLBACK_LENGTH = 400;

function asNonEmptyString(value: unknown): string | undefined {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    return undefined;
}

function compactUnique(values: string[]): string[] {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function stringifyFallback(value: unknown): string {
    try {
        const serialized = JSON.stringify(value);
        if (!serialized) {
            return 'unstructured error payload';
        }

        return serialized.length > MAX_FALLBACK_LENGTH ? `${serialized.slice(0, MAX_FALLBACK_LENGTH)}...` : serialized;
    } catch {
        return 'unstructured error payload';
    }
}

function extractMessages(error: unknown): ApiErrorMessage[] {
    if (!error || typeof error !== 'object') {
        const inlineMessage = asNonEmptyString(error);
        return inlineMessage ? [{ message: inlineMessage }] : [];
    }

    const payload = error as { messages?: unknown; code?: unknown; message?: unknown };
    if (Array.isArray(payload.messages)) {
        return payload.messages
            .map((entry) => {
                if (entry && typeof entry === 'object') {
                    return entry as ApiErrorMessage;
                }

                const inlineMessage = asNonEmptyString(entry);
                return inlineMessage ? ({ message: inlineMessage } as ApiErrorMessage) : undefined;
            })
            .filter((entry): entry is ApiErrorMessage => Boolean(entry));
    }

    if (payload.code !== undefined || payload.message !== undefined) {
        return [payload];
    }

    return [];
}

function summarizeError(error: unknown): { codes: string[]; messages: string[] } {
    const messageEntries = extractMessages(error);
    const codes = compactUnique(
        messageEntries
            .map((entry) => asNonEmptyString(entry.code))
            .filter((value): value is string => value !== undefined)
    );
    const messages = compactUnique(
        messageEntries
            .map((entry) => asNonEmptyString(entry.message))
            .filter((value): value is string => value !== undefined)
    );

    if (codes.length > 0 || messages.length > 0) {
        return { codes, messages };
    }

    return {
        codes: [],
        messages: [stringifyFallback(error)],
    };
}

function formatFailureContext(response: ApiResultLike): string {
    const { codes, messages } = summarizeError(response.error);
    const status = response.statusCode ?? 'n/a';
    const codeSummary = codes.length > 0 ? codes.join(', ') : 'none';
    const messageSummary = messages.length > 0 ? messages.join(' | ') : 'none';
    return `status=${status}; errorCodes=${codeSummary}; errorMessages=${messageSummary}`;
}

export function assertApiResult(response: ApiResultLike, context = 'API request'): void {
    if (typeof response.success !== 'boolean') {
        throw new Error(`${context} produced an invalid result: success flag is not a boolean.`);
    }

    if (!response.success) {
        throw new Error(`${context} failed: ${formatFailureContext(response)}`);
    }

    if (response.error !== undefined) {
        throw new Error(`${context} unexpectedly returned an error payload despite success.`);
    }
}

export function assertApiFailure(response: ApiResultLike, context = 'API request'): void {
    if (typeof response.success !== 'boolean') {
        throw new Error(`${context} produced an invalid result: success flag is not a boolean.`);
    }

    if (response.success) {
        throw new Error(`${context} unexpectedly succeeded while a failure was expected.`);
    }

    // Keep failure assertion resilient even when some backends return sparse payloads.
    if (response.error === undefined) {
        throw new Error(
            `${context} failed but did not return an error payload. status=${response.statusCode ?? 'n/a'}`
        );
    }
}

export function assertApiFailureCode(response: ApiResultLike, expectedCode: string, context = 'API request'): void {
    if (typeof response.success !== 'boolean') {
        throw new Error(`${context} produced an invalid result: success flag is not a boolean.`);
    }

    if (response.success) {
        throw new Error(`${context} unexpectedly succeeded while expecting error code ${expectedCode}.`);
    }

    const { codes } = summarizeError(response.error);
    if (!codes.includes(expectedCode)) {
        throw new Error(
            `${context} failed with unexpected error codes. Expected ${expectedCode}; received ${codes.join(', ') || 'none'}. ${formatFailureContext(response)}`
        );
    }
}
