import { ConceptDescription as CoreConceptDescription } from '@aas-core-works/aas-core3.0-typescript/types';
import { ConceptDescriptionRepositoryClient } from '../../clients/ConceptDescriptionRepositoryClient';
import { ConceptDescriptionRepositoryService } from '../../generated';
import { Configuration } from '../../generated/runtime';
import { base64Encode } from '../../lib/base64Url';
import { convertApiCDToCoreCD, convertCoreCDToApiCD } from '../../lib/convertConceptDescriptionTypes';
import { handleApiError } from '../../lib/errorHandler';

// Mock the dependencies
jest.mock('../../generated');
jest.mock('../../lib/convertConceptDescriptionTypes');
jest.mock('../../lib/base64Url');
jest.mock('../../lib/errorHandler');

// Define mock constants

const ID_SHORT = 'conceptDescriptionIdShort';
const LIMIT = 10;
const CURSOR = 'cursor123';
const DATA_SPECIFICATION_REF = JSON.stringify({
    type: 'ExternalReference',
    keys: [
        {
            type: 'GlobalReference',
            value: 'https://example.com/ids/cd/1234',
        },
    ],
});
const IS_CASE_OF = JSON.stringify({
    type: 'ExternalReference',
    keys: [
        {
            type: 'ConceptDescription',
            value: 'https://example.com/ids/cd/1234',
        },
    ],
});
const API_CD1: ConceptDescriptionRepositoryService.ConceptDescription = {
    id: 'https://example.com/ids/cd/1234',
    modelType: 'ConceptDescription',
};
const API_CD2: ConceptDescriptionRepositoryService.ConceptDescription = {
    id: 'https://example.com/ids/cd/5678',
    modelType: 'ConceptDescription',
};
const CORE_CD1: CoreConceptDescription = new CoreConceptDescription('https://example.com/ids/cd/1234');
const CORE_CD2: CoreConceptDescription = new CoreConceptDescription('https://example.com/ids/cd/5678');
const TEST_CONFIGURATION = new Configuration({
    basePath: 'http://localhost:8083',
    fetchApi: globalThis.fetch,
});

describe('ConceptDescriptionRepositoryClient', () => {
    // Create mock for ConceptDescriptionRepositoryAPIApi
    const mockApiInstance = {
        getAllConceptDescriptions: jest.fn(),
        postConceptDescription: jest.fn(),
        deleteConceptDescriptionById: jest.fn(),
        getConceptDescriptionById: jest.fn(),
        putConceptDescriptionById: jest.fn(),
    };

    // Mock constructor
    const MockCDRepository = jest.fn(() => mockApiInstance);

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup mock for base64Encode
        (base64Encode as jest.Mock).mockImplementation((input) => `encoded_${input}`);
        // Setup mock for constructor
        (
            jest.requireMock('../../generated').ConceptDescriptionRepositoryService
                .ConceptDescriptionRepositoryAPIApi as jest.Mock
        ).mockImplementation(MockCDRepository);
        // Setup mocks for conversion functions
        (convertApiCDToCoreCD as jest.Mock).mockImplementation((conceptDescription) => {
            if (conceptDescription.id === API_CD1.id) return CORE_CD1;
            if (conceptDescription.id === API_CD2.id) return CORE_CD2;
            return null;
        });
        (convertCoreCDToApiCD as jest.Mock).mockImplementation((conceptDescription) => {
            if (conceptDescription.id === CORE_CD1.id) return API_CD1;
            if (conceptDescription.id === CORE_CD2.id) return API_CD2;
            return null;
        });

        // Mock the error handler to return a standardized Result
        (handleApiError as jest.Mock).mockImplementation(async (err) => {
            // If the error already has messages, return it as is
            if (err?.messages) return err;

            // Create a standard Result with messages
            const timestamp = (1744752054.63186).toString();
            const message: ConceptDescriptionRepositoryService.Message = {
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

    it('should return Concept Descriptions on successful response', async () => {
        // Arrange
        const pagedResult: ConceptDescriptionRepositoryService.PagedResultPagingMetadata = {
            cursor: CURSOR,
        };
        mockApiInstance.getAllConceptDescriptions.mockResolvedValue({
            pagingMetadata: pagedResult,
            result: [API_CD1, API_CD2],
        });

        const client = new ConceptDescriptionRepositoryClient();

        // Act
        const response = await client.getAllConceptDescriptions({
            configuration: TEST_CONFIGURATION,
            idShort: ID_SHORT,
            isCaseOf: IS_CASE_OF,
            dataSpecificationRef: DATA_SPECIFICATION_REF,
            limit: LIMIT,
            cursor: CURSOR,
        });

        // Assert
        expect(MockCDRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(mockApiInstance.getAllConceptDescriptions).toHaveBeenCalledWith({
            idShort: ID_SHORT,
            isCaseOf: `encoded_${JSON.stringify(IS_CASE_OF)}`,
            dataSpecificationRef: `encoded_${JSON.stringify(DATA_SPECIFICATION_REF)}`,
            limit: LIMIT,
            cursor: CURSOR,
        });
        expect(convertApiCDToCoreCD).toHaveBeenCalledTimes(2);
        expect(response.success).toBe(true);

        if (response.success) {
            expect(response.data.pagedResult).toBe(pagedResult);
            expect(response.data.result).toEqual([CORE_CD1, CORE_CD2]);
        }
    });

    it('should handle errors when fetching Concept Descriptions', async () => {
        // Arrange
        const errorResult: ConceptDescriptionRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getAllConceptDescriptions.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new ConceptDescriptionRepositoryClient();

        // Act
        const response = await client.getAllConceptDescriptions({
            configuration: TEST_CONFIGURATION,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should create a new Concept Description', async () => {
        // Arrange
        mockApiInstance.postConceptDescription.mockResolvedValue(API_CD1);

        const client = new ConceptDescriptionRepositoryClient();

        // Act
        const response = await client.postConceptDescription({
            configuration: TEST_CONFIGURATION,
            conceptDescription: CORE_CD1,
        });

        // Assert
        expect(MockCDRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(mockApiInstance.postConceptDescription).toHaveBeenCalledWith({
            conceptDescription: API_CD1,
        });
        expect(convertCoreCDToApiCD).toHaveBeenCalledWith(CORE_CD1);
        expect(convertApiCDToCoreCD).toHaveBeenCalledWith(API_CD1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_CD1);
        }
    });

    it('should handle errors when creating a Concept Description', async () => {
        // Arrange
        const errorResult: ConceptDescriptionRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.postConceptDescription.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new ConceptDescriptionRepositoryClient();

        // Act
        const response = await client.postConceptDescription({
            configuration: TEST_CONFIGURATION,
            conceptDescription: CORE_CD1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should delete a ConceptDescription', async () => {
        // Arrange
        mockApiInstance.deleteConceptDescriptionById.mockResolvedValue(undefined);

        const client = new ConceptDescriptionRepositoryClient();

        // Act
        const response = await client.deleteConceptDescriptionById({
            configuration: TEST_CONFIGURATION,
            cdIdentifier: CORE_CD1.id,
        });

        // Assert
        expect(MockCDRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_CD1.id);
        expect(mockApiInstance.deleteConceptDescriptionById).toHaveBeenCalledWith({
            cdIdentifier: `encoded_${CORE_CD1.id}`,
        });
        expect(response.success).toBe(true);
    });

    it('should handle errors when deleting a Concept Description', async () => {
        // Arrange
        const errorResult: ConceptDescriptionRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.deleteConceptDescriptionById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new ConceptDescriptionRepositoryClient();

        // Act
        const response = await client.deleteConceptDescriptionById({
            configuration: TEST_CONFIGURATION,
            cdIdentifier: CORE_CD1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should get a Concept Description by ID', async () => {
        // Arrange
        mockApiInstance.getConceptDescriptionById.mockResolvedValue(API_CD1);

        const client = new ConceptDescriptionRepositoryClient();

        // Act
        const response = await client.getConceptDescriptionById({
            configuration: TEST_CONFIGURATION,
            cdIdentifier: CORE_CD1.id,
        });

        // Assert
        expect(MockCDRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_CD1.id);
        expect(mockApiInstance.getConceptDescriptionById).toHaveBeenCalledWith({
            cdIdentifier: `encoded_${CORE_CD1.id}`,
        });
        expect(convertApiCDToCoreCD).toHaveBeenCalledWith(API_CD1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_CD1);
        }
    });

    it('should handle errors when getting a Concept Description by ID', async () => {
        // Arrange
        const errorResult: ConceptDescriptionRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.getConceptDescriptionById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new ConceptDescriptionRepositoryClient();

        // Act
        const response = await client.getConceptDescriptionById({
            configuration: TEST_CONFIGURATION,
            cdIdentifier: CORE_CD1.id,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });

    it('should update a Concept Description', async () => {
        // Arrange
        mockApiInstance.putConceptDescriptionById.mockResolvedValue(undefined);

        const client = new ConceptDescriptionRepositoryClient();

        // Act
        const response = await client.putConceptDescriptionById({
            configuration: TEST_CONFIGURATION,
            cdIdentifier: CORE_CD1.id,
            conceptDescription: CORE_CD1,
        });

        // Assert
        expect(MockCDRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_CD1.id);
        expect(mockApiInstance.putConceptDescriptionById).toHaveBeenCalledWith({
            cdIdentifier: `encoded_${CORE_CD1.id}`,
            conceptDescription: API_CD1,
        });
        expect(convertCoreCDToApiCD).toHaveBeenCalledWith(CORE_CD1);
        expect(response.success).toBe(true);
    });

    it('should create a new Concept Description during update', async () => {
        // Arrange
        mockApiInstance.putConceptDescriptionById.mockResolvedValue(API_CD1);

        const client = new ConceptDescriptionRepositoryClient();

        // Act
        const response = await client.putConceptDescriptionById({
            configuration: TEST_CONFIGURATION,
            cdIdentifier: CORE_CD1.id,
            conceptDescription: CORE_CD1,
        });

        // Assert
        expect(MockCDRepository).toHaveBeenCalledWith(TEST_CONFIGURATION);
        expect(base64Encode).toHaveBeenCalledWith(CORE_CD1.id);
        expect(mockApiInstance.putConceptDescriptionById).toHaveBeenCalledWith({
            cdIdentifier: `encoded_${CORE_CD1.id}`,
            conceptDescription: API_CD1,
        });
        expect(convertCoreCDToApiCD).toHaveBeenCalledWith(CORE_CD1);
        expect(convertApiCDToCoreCD).toHaveBeenCalledWith(API_CD1);
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toEqual(CORE_CD1); // After conversion
        }
    });

    it('should handle errors when updating a Concept Description', async () => {
        // Arrange
        const errorResult: ConceptDescriptionRepositoryService.Result = {
            messages: [
                {
                    code: '400',
                    messageType: 'Exception',
                    text: 'Required parameter missing',
                    timestamp: '1744752054.63186',
                },
            ],
        };
        mockApiInstance.putConceptDescriptionById.mockRejectedValue(new Error('Required parameter missing'));
        (handleApiError as jest.Mock).mockResolvedValue(errorResult);

        const client = new ConceptDescriptionRepositoryClient();

        // Act
        const response = await client.putConceptDescriptionById({
            configuration: TEST_CONFIGURATION,
            cdIdentifier: CORE_CD1.id,
            conceptDescription: CORE_CD1,
        });

        // Assert
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toEqual(errorResult);
        }
    });
});
