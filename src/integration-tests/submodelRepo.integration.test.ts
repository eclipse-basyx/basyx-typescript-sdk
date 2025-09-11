import { SubmodelRepositoryClient } from '../clients/SubmodelRepositoryClient';
//import { Configuration } from '../generated';
import { Configuration } from '../generated';
import {
    createDescription,
    createNewSubmodelElement,
    createTestSubmodel,
    createTestSubmodelElement,
    createTestSubmodelElementCollection,
    createValue,
} from './fixtures/submodelFixtures';

describe('Submodel Repository Integration Tests', () => {
    const client = new SubmodelRepositoryClient();
    const testSubmodel = createTestSubmodel();
    const testSubmodelElement = createTestSubmodelElement();
    const newSubmodelElement = createNewSubmodelElement();
    const testSubmodelElementCollection = createTestSubmodelElementCollection();
    //const OPERATION_REQUEST = createTestOperationRequest();
    //const OPERATION_RESULT = createTestOperationResult();
    //const testOperationSubmodelElement = createTestOperationElement();
    const configuration = new Configuration({
        basePath: 'http://localhost:8082',
    });

    test('should create a new Submodel', async () => {
        const response = await client.postSubmodel({
            configuration,
            submodel: testSubmodel,
        });

        // Log the error details if the request failed
        if (!response.success && response.error) {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testSubmodel);
        }
    });

    test('should fetch a Submodel by ID', async () => {
        const response = await client.getSubmodelById({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testSubmodel);
        }
    });

    test('should fetch a Submodel by non-existing ID', async () => {
        const nonExistingId = 'non-existing-id';
        const response = await client.getSubmodelById({
            configuration,
            submodelIdentifier: nonExistingId,
        });
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error).toBeDefined();
            console.log('Error:', response.error);
        }
    });

    test('should fetch all Submodels', async () => {
        const response = await client.getAllSubmodels({
            configuration,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(testSubmodel);
        }
    });

    test('should create a new SubmodelElement', async () => {
        const response = await client.postSubmodelElement({
            configuration,
            submodelIdentifier: testSubmodel.id,
            submodelElement: testSubmodelElement,
        });

        // Log the error details if the request failed
        if (!response.success && response.error) {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(testSubmodelElement);
        }
    });

    test('should update a Submodel', async () => {
        const updatedSubmodel = testSubmodel;
        //const description = createDescription();

        //updatedSubmodel.description = [description];
        updatedSubmodel.submodelElements = [testSubmodelElement, testSubmodelElementCollection, newSubmodelElement];

        const updateResponse = await client.putSubmodelById({
            configuration,
            submodelIdentifier: testSubmodel.id,
            submodel: updatedSubmodel,
        });

        console.log('Updated submodel Response:', updateResponse);

        expect(updateResponse.success).toBe(true);

        const fetchResponse = await client.getSubmodelById({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedSubmodel);
        }
    });

    test('should fetch all SubmodelElements', async () => {
        const response = await client.getAllSubmodelElements({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.result.length).toBeGreaterThan(0);
            expect(response.data.result).toContainEqual(testSubmodelElement);
        }
    });

    test('should fetch SubmodelElement by the path', async () => {
        const response = await client.getSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort!,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            //expect(response.data.idShort).toBe('testProperty');
            expect(response.data).toEqual(testSubmodelElement);
            //expect(response.data.result.length).toBeGreaterThan(0);
            //expect(response.data.result).toContainEqual(testSubmodelElement);
        }
    });
    test('should create a new SubmodelElement at a specified path within submodel elements hierarchy', async () => {
        const response = await client.postSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: newSubmodelElement.idShort!,
            submodelElement: newSubmodelElement,
        });

        // Log the error details if the request failed
        if (!response.success && response.error) {
            console.error('API Error:', JSON.stringify(response.error, null, 2));
        }
        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            //expect(response.data.idShort).toBe('newProperty');
            expect(response.data).toEqual(newSubmodelElement);
        }
    });

    test('should update the submodel element at the specified path ', async () => {
        const updatedSubmodelElement = testSubmodelElement;
        const description = createDescription();
        updatedSubmodelElement.description = [description];
        //updatedSubmodelElement.submodelElements = [testSubmodelElement];

        const updateResponse = await client.putSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort!,
            submodelElement: updatedSubmodelElement,
        });

        console.log('Updated submodel element Response:', updateResponse);

        expect(updateResponse.success).toBe(true);

        const fetchResponse = await client.getSubmodelElementByPath({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort!,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedSubmodelElement);
        }
    });

    test('should fetch Submodel metadata by ID', async () => {
        const response = await client.getSubmodelByIdMetadata({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            expect(response.data).toBeDefined();
            expect(response.data.id).toEqual(testSubmodel.id);
            expect(response.data.idShort).toEqual(testSubmodel.idShort);
        }
    });

    test('should fetch Submodel in the ValueOnly representation', async () => {
        const response = await client.getSubmodelByIdValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            console.log(' submodel valueOnly Response:', JSON.stringify(response.data, null, 2));
            expect(response.data).toBeDefined();
            expect(typeof response.data).toBe('object');
            expect(Object.keys(response.data).length).toBeGreaterThan(0);
            //expect((response.data as any)[testSubmodelElement.idShort!]).toBe(testSubmodelElement.value);
            //expect(response.data).toEqual(testSubmodel.submodelElements);
        }
    });

    // To be tested later
    // test('should update Submodel in the ValueOnly representation', async () => {
    //     const updatedSubmodel = testSubmodel;

    //     // updatedSubmodel.submodelElements = [testSubmodelElement];
    //     //const idShort = updatedSubmodel.submodelElements![0].idShort!;
    //     //const plainValue = (updatedSubmodel.submodelElements![0] as any).value;
    //    // const originalValue = { [idShort]: plainValue };
    //     //const idShort = testSubmodelElement.idShort!;
    //     //const originalValue = (testSubmodelElement as any).value;
    //     const updatedValue = '9999';
    //     //(testSubmodelElement as any).value = updatedValue;
    //    // const valueOnlyPayload = { [idShort]: updatedValue };

    //     const submodelElement = updatedSubmodel.submodelElements![0];
    //     const idShort = submodelElement.idShort!;
    //     const originalValue = (submodelElement as any).value;
    //     const valueOnlyPayload = { [idShort]: updatedValue };
    //     const updateResponse = await client.patchSubmodelByIdValueOnly({
    //         configuration,
    //         submodelIdentifier: testSubmodel.id,
    //         body: valueOnlyPayload,
    //         //level: SubmodelRepositoryService.PatchSubmodelByIdValueOnlyLevelEnum.Core,
    //     });

    //     console.log('Updated submodel value-only Response:', updateResponse);

    //     expect(updateResponse.success).toBe(true);

    //     const fetchResponse = await client.getSubmodelByIdValueOnly({
    //         configuration,
    //         submodelIdentifier: testSubmodel.id,
    //     });

    //     expect(fetchResponse.success).toBe(true);
    //     if (fetchResponse.success) {
    //         // const responseData = fetchResponse.data as Record<string, any>;
    //         // console.log('Fetched updated submodel valueOnly:', responseData);
    //         // expect(responseData).toBeDefined();
    //         // expect(responseData[idShort]).toEqual(updatedValue);

    //         // console.log('Fetched updated submodel valueOnly:', fetchResponse.data);

    //         expect(fetchResponse.data).toBeDefined();
    //         const responseData = fetchResponse.data as Record<string, any>;
    //         expect(responseData[idShort]).toBe(updatedValue);
    //         //expect(fetchResponse.data[idShort]).toBe(valueOnlyPayload);
    //         // expect((fetchResponse.data as any)[idShort]).toEqual(updatedValue);
    //         //expect(fetchResponse.data).toEqual(valueOnlyPayload);
    //     }
    // });

    test('should fetch SubmodelElement by path in the ValueOnly representation', async () => {
        const response = await client.getSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: newSubmodelElement.idShort!,
        });

        expect(response.success).toBe(true);
        if (response.success) {
            console.log('Element ValueOnly response:', JSON.stringify(response.data, null, 2));

            expect(response.data).toBeDefined();
            expect(response.data).toEqual((newSubmodelElement as any).value);
            //expect(response.data).toEqual((testSubmodelElement as Property).value);
        }
    });

    test('should update SubmodelElement in the ValueOnly representation', async () => {
        //const updatedValue = (testSubmodelElement as any).value;
        const updatedPropertyValue = createValue();
        //const updatedValue = (testSubmodelElement as any).updatedPropertyValue;
        const updatedSubmodelElement = testSubmodelElement;
        (updatedSubmodelElement as any).value = updatedPropertyValue;
        // const updatedSubmodel = testSubmodel;
        // const description = createDescription();

        // updatedSubmodel.description = [description];
        // updatedSubmodel.submodelElements = [testSubmodelElement];

        const updateResponse = await client.patchSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort!,
            submodelElementValue: updatedPropertyValue,
        });

        console.log('Updated submodel Response:', updateResponse);

        expect(updateResponse.success).toBe(true);

        const fetchResponse = await client.getSubmodelElementByPathValueOnly({
            configuration,
            submodelIdentifier: testSubmodel.id,
            idShortPath: testSubmodelElement.idShort!,
        });

        expect(fetchResponse.success).toBe(true);
        if (fetchResponse.success) {
            console.log('Updated Value:', fetchResponse.data);
            expect(fetchResponse.data).toBeDefined();
            expect(fetchResponse.data).toEqual(updatedPropertyValue);
        }
    });

    // To be tested later
    // test('should invoke an Operation at a specified path', async () => {
    //     const response = await client.postInvokeOperationSubmodelRepo({
    //         configuration,
    //         submodelIdentifier: testSubmodel.id,
    //         idShortPath: testOperationSubmodelElement.idShort!,
    //         operationRequest: OPERATION_REQUEST,
    //     });

    //     // Log the error details if the request failed
    //     if (!response.success && response.error) {
    //         console.error('API Error:', JSON.stringify(response.error, null, 2));
    //     }
    //     expect(response.success).toBe(true);
    //     if (response.success) {
    //         expect(response.data).toBeDefined();
    //         expect(response.data).toEqual(OPERATION_RESULT);
    //     }
    // });
});
