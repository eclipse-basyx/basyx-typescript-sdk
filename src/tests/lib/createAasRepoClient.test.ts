import { createClient } from '@hey-api/client-fetch';
import { createCustomClient } from '../../lib/createCustomClient';

// Mock the createClient function from @hey-api/client-fetch
jest.mock('@hey-api/client-fetch', () => ({
    createClient: jest.fn(),
}));

describe('createCustomClient', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    it('should call createClient with the correct baseUrl and headers', () => {
        const baseURL = 'https://api.example.com';
        const headers = new Headers({
            Authorization: 'Bearer test-token',
        });

        // Mock return value of createClient
        const mockClient = { some: 'client' };
        (createClient as jest.Mock).mockReturnValue(mockClient);

        const client = createCustomClient(baseURL, headers);

        // Assert that createClient was called with the correct parameters
        expect(createClient).toHaveBeenCalledWith({
            baseUrl: baseURL,
            headers: headers,
        });

        // Assert that the function returns the mocked client
        expect(client).toBe(mockClient);
    });

    it('should use default headers if none are provided', () => {
        const baseURL = 'https://api.example.com';

        // Mock return value of createClient
        const mockClient = { some: 'client' };
        (createClient as jest.Mock).mockReturnValue(mockClient);

        const client = createCustomClient(baseURL);

        // Assert that createClient was called with the correct parameters
        expect(createClient).toHaveBeenCalledWith({
            baseUrl: baseURL,
            headers: new Headers(),
        });

        // Assert that the function returns the mocked client
        expect(client).toBe(mockClient);
    });
});
