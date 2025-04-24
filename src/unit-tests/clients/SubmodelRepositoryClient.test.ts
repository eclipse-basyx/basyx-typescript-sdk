// Import necessary types
//import type { PagedResultPagingMetadata, Result } from '../../generated';
import { Submodel as CoreSubmodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelRepositoryClient } from '../../clients/SubmodelRepositoryClient';
import { SubmodelRepositoryService } from '../../index';
import { base64Encode } from '../../lib/base64Url';
import { convertApiSubmodelToCoreSubmodel, convertCoreSubmodelToApiSubmodel } from '../../lib/convertSubmodelTypes';
import { handleApiError } from '../../lib/errorHandler';

// Mock the dependencies
//jest.mock('../../generated');
jest.mock('../../index');
jest.mock('../../lib/convertSubmodelTypes');
jest.mock('../../lib/base64Url');
jest.mock('../../lib/errorHandler');

// Define mock constants

const SEMANTIC_ID = JSON.stringify({
    type: 'ExternalReference',
    keys: [
        {
            type: 'GlobalReference',
            value: 'https://example.com/ids/submodel/123',
        },
    ],
});
const ID_SHORT = 'submodelIdShort';
const LIMIT = 10;
const CURSOR = 'cursor123';
const LEVEL = SubmodelRepositoryService.GetAllSubmodelsLevelEnum.Deep;
const EXTENT = SubmodelRepositoryService.GetAllSubmodelsExtentEnum.WithBlobValue;
const API_SUBMODEL1: SubmodelRepositoryService.Submodel = {
    id: 'https://example.com/ids/submodel/123',
    modelType: 'Submodel',
};
const API_SUBMODEL2: SubmodelRepositoryService.Submodel = {
    id: 'https://example.com/ids/submodel/234',
    modelType: 'Submodel',
};

const CORE_SUBMODEL1: CoreSubmodel = new CoreSubmodel('https://example.com/ids/submodel/123');
const CORE_SUBMODEL2: CoreSubmodel = new CoreSubmodel('https://example.com/ids/submodel/234');

const TEST_CONFIGURATION = new SubmodelRepositoryService.Configuration({
    basePath: 'http://localhost:8082',
    fetchApi: globalThis.fetch,
});

describe('SubmodelRepositoryClient', () => {
    // Create mock for SubmodelRepositoryAPIApi
    const mockApiInstance = {
        getAllSubmodels: jest.fn(),
        postSubmodel: jest.fn(),
        deleteSubmodelById: jest.fn(),
        getSubmodelById: jest.fn(),
        putSubmodelById: jest.fn(),
        patchSubmodelById: jest.fn(),
    };

    // Mock constructor
    const MockSubmodelRepository = jest.fn(() => mockApiInstance);

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup mock for base64Encode
        (base64Encode as jest.Mock).mockImplementation((input) => `encoded_${input}`);
        // Setup mock for constructor
        (
            jest.requireMock('../../index').SubmodelRepositoryService.SubmodelRepositoryAPIApi as jest.Mock
        ).mockImplementation(MockSubmodelRepository);
        // Setup mocks for conversion functions
        (convertApiSubmodelToCoreSubmodel as jest.Mock).mockImplementation((submodel) => {
            if (submodel.id === API_SUBMODEL1.id) return CORE_SUBMODEL1;
            if (submodel.id === API_SUBMODEL2.id) return CORE_SUBMODEL2;
            return null;
        });
        (convertCoreSubmodelToApiSubmodel as jest.Mock).mockImplementation((submodel) => {
            if (submodel.id === CORE_SUBMODEL1.id) return API_SUBMODEL1;
            if (submodel.id === CORE_SUBMODEL2.id) return API_SUBMODEL2;
            return null;
        });

        // Mock the error handler to return a standardized Result
        (handleApiError as jest.Mock).mockImplementation(async (err) => {
            // If the error already has messages, return it as is
            if (err?.messages) return err;

            // Create a standard Result with messages
            const timestamp = (1744752054.63186).toString();
            const message: SubmodelRepositoryService.Message = {
                code: '400',
                messageType: 'Exception',
                text: err.message || 'Error occurred',
                timestamp: timestamp,
            };

            return { messages: [message] };
        });
    });
    // Mock console.error to prevent logging during tests
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        (console.error as jest.Mock).mockRestore();
    });

    it('should return Submodels on successful response', async () => {
        // Arrange
        const pagedResult: SubmodelRepositoryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllSubmodels.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: [API_SUBMODEL1, API_SUBMODEL2],
        });

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getAllSubmodels({
            configuration: TEST_CONFIGURATION,
            semanticId: SEMANTIC_ID,
            idShort: ID_SHORT,
            limit: LIMIT,
            cursor: CURSOR,
            level: LEVEL,
            extent: EXTENT,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(mockApiInstance.getAllSubmodels).toHaveBeenCalledWith({
            semanticId: `encoded_${JSON.stringify(SEMANTIC_ID)}`,
            idShort: ID_SHORT,
            limit: LIMIT,
            cursor: CURSOR,
            level: LEVEL,
            extent: EXTENT,
        });
        expect(convertApiSubmodelToCoreSubmodel).toHaveBeenCalledTimes(2);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual([CORE_SUBMODEL1, CORE_SUBMODEL2]);
        }
    });

    it('should handle errors when fetching Submodels', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllSubmodels.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getAllSubmodels({
            configuration: TEST_CONFIGURATION,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should create a new Submodel', async () => {
        // Arrange
        mockApiInstance.postSubmodel.mockResolvedValue(API_SUBMODEL1);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postSubmodel({
            configuration: TEST_CONFIGURATION,
            submodel: CORE_SUBMODEL1,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(mockApiInstance.postSubmodel).toHaveBeenCalledWith({
            submodel: API_SUBMODEL1,
        });
        expect(convertCoreSubmodelToApiSubmodel).toHaveBeenCalledWith(CORE_SUBMODEL1);
        expect(convertApiSubmodelToCoreSubmodel).toHaveBeenCalledWith(API_SUBMODEL1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODEL1);
        }
    });

    it('should handle errors when creating a Submodel', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.postSubmodel.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.postSubmodel({
            configuration: TEST_CONFIGURATION,
            submodel: CORE_SUBMODEL1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should delete a submodel', async () => {
        // Arrange
        mockApiInstance.deleteSubmodelById.mockResolvedValue(undefined);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.deleteSubmodelById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.deleteSubmodelById).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when deleting a submodel', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.deleteSubmodelById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.deleteSubmodelById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get a Submodel by ID', async () => {
        // Arrange
        mockApiInstance.getSubmodelById.mockResolvedValue(API_SUBMODEL1);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getSubmodelById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            level: LEVEL,
            extent: EXTENT,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.getSubmodelById).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            level: LEVEL,
            extent: EXTENT,
        });
        expect(convertApiSubmodelToCoreSubmodel).toHaveBeenCalledWith(API_SUBMODEL1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_SUBMODEL1);
        }
    });

    it('should handle errors when getting a Submodel by ID', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getSubmodelById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.getSubmodelById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update a Submodel', async () => {
        // Arrange
        mockApiInstance.putSubmodelById.mockResolvedValue(undefined);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.putSubmodelById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodel: CORE_SUBMODEL1,
        });

        // Assert
        expect(MockSubmodelRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_SUBMODEL1.id);
        expect(mockApiInstance.putSubmodelById).toHaveBeenCalledWith({
            submodelIdentifier: `encoded_${CORE_SUBMODEL1.id}`,
            submodel: API_SUBMODEL1,
        });
        expect(convertCoreSubmodelToApiSubmodel).toHaveBeenCalledWith(CORE_SUBMODEL1);
        expect(response.success).toBe(true);
    });

    it('should handle errors when updating a Submodel', async () => {
        // Arrange
        const errorResult: SubmodelRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.putSubmodelById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new SubmodelRepositoryClient();

        // Act
        const response = await client.putSubmodelById({
            configuration: TEST_CONFIGURATION,
            submodelIdentifier: CORE_SUBMODEL1.id,
            submodel: CORE_SUBMODEL1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });
});
