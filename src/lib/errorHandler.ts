//import { FetchError, Message, RequiredError, ResponseError, Result } from '../generated';
import { AasRepositoryService, ConceptDescriptionRepositoryService, SubmodelRepositoryService,
    AasRegistryService
 } from '../generated';
/**
 * Processes errors from API calls and standardizes them to a Result object
 * with a consistent messages array following the API spec guidelines.
 *
 * @param err The error thrown during an API call
 * @returns A standardized Result object containing error messages
 */
export async function handleApiError(
    err: unknown
): Promise<
    AasRepositoryService.Result | SubmodelRepositoryService.Result 
    | ConceptDescriptionRepositoryService.Result
    | AasRegistryService.Result
> {
    try {
        // Check if the error already has the expected format with messages array
        const errorAny = err as any;
        if (errorAny?.messages && Array.isArray(errorAny.messages)) {
            return { messages: errorAny.messages };
        }

        // Get current timestamp with millisecond precision as a string
        const timestamp = (new Date().getTime() / 1000).toString();

        let message:
            | AasRepositoryService.Message
            | SubmodelRepositoryService.Message
            | ConceptDescriptionRepositoryService.Message 
            | AasRegistryService.Message = {
            code: '500',
            messageType: 'Exception',
            timestamp: timestamp,
            text: 'Unknown error',
        };

        // Handle different error types
        if (
            err instanceof AasRepositoryService.RequiredError ||
            err instanceof SubmodelRepositoryService.RequiredError ||
            err instanceof ConceptDescriptionRepositoryService.RequiredError ||
            err instanceof AasRegistryService.RequiredError
        ) {
            message = {
                code: '400',
                messageType: 'Exception',
                text: err.message || `Required parameter missing: ${err.field}`,
                timestamp: timestamp,
            };
        } else if (
            err instanceof AasRepositoryService.ResponseError ||
            err instanceof SubmodelRepositoryService.ResponseError ||
            err instanceof ConceptDescriptionRepositoryService.ResponseError ||
            err instanceof AasRegistryService.ResponseError
        ) {
            // Try to parse response body for messages
            const responseBody = err.response;

            try {
                // Check if the response already contains a messages array
                const responseData = responseBody && responseBody.json ? await responseBody.json() : null;

                if (responseData?.messages && Array.isArray(responseData.messages)) {
                    return { messages: responseData.messages };
                }

                // Otherwise, create a message with the status code
                message = {
                    code: err.response.status.toString(),
                    messageType: 'Exception',
                    text: err.message || `HTTP ${err.response.status} - Response returned an error code`,
                    timestamp: timestamp,
                };
            } catch {
                // If we can't parse the body, create a basic message
                message = {
                    code: err.response.status.toString(),
                    messageType: 'Exception',
                    text: `HTTP ${err.response.status} - Response returned an error code`,
                    timestamp: timestamp,
                };
            }
        } else if (
            err instanceof AasRepositoryService.FetchError ||
            err instanceof SubmodelRepositoryService.FetchError ||
            err instanceof ConceptDescriptionRepositoryService.FetchError ||
            err instanceof AasRegistryService.FetchError
        ) {
            message = {
                code: '0',
                messageType: 'Exception',
                text: err.message || 'Network request failed',
                timestamp: timestamp,
            };
        } else if (err instanceof Error) {
            message = {
                code: '500',
                messageType: 'Exception',
                text: err.message || 'Unknown error occurred',
                timestamp: timestamp,
            };
        }

        return { messages: [message] };
    } catch (handlerError) {
        // If our error handler throws an error, capture that and return a fallback error
        console.error('Error in error handler:', handlerError);

        // Get current timestamp with millisecond precision as a string for the fallback error
        const timestamp = (new Date().getTime() / 1000).toString();

        return {
            messages: [
                {
                    code: '500',
                    messageType: 'Exception',
                    text: 'An error occurred while processing another error',
                    timestamp: timestamp,
                },
            ],
        };
    }
}
