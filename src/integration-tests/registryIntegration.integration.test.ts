import { Key, KeyTypes, Reference, ReferenceTypes } from '@aas-core-works/aas-core3.1-typescript/types';
import { vi } from 'vitest';
import { AasRegistryClient } from '../clients/AasRegistryClient';
import { AasRepositoryClient } from '../clients/AasRepositoryClient';
import { SubmodelRepositoryClient } from '../clients/SubmodelRepositoryClient';
import { Configuration, type FetchAPI } from '../generated';
import { AasService } from '../services/AasService';
import { SubmodelService } from '../services/SubmodelService';
import { createGlobalAssetIdFromAasId, createTestShell } from './fixtures/aasFixtures';
import { assertApiFailure, assertApiResult } from './fixtures/assertionHelpers';
import { createTestSubmodel } from './fixtures/submodelFixtures';

// The AAS Environment at port 8089 has registry integration enabled. It registers descriptors with
// `AAS-3.2` / `SUBMODEL-3.2` endpoints in the registries at ports 8084 and 8085.
describe('Registry integration of BaSyx Go (AAS-3.2 / SUBMODEL-3.2 descriptors)', () => {
    const environmentBasePath = 'http://localhost:8089';
    const environmentConfig = new Configuration({ basePath: environmentBasePath });
    const aasRegistryConfig = new Configuration({ basePath: 'http://localhost:8084' });
    const submodelRegistryConfig = new Configuration({ basePath: 'http://localhost:8085' });

    const aasRepositoryClient = new AasRepositoryClient();
    const submodelRepositoryClient = new SubmodelRepositoryClient();
    const aasRegistryClient = new AasRegistryClient();

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const shell = createTestShell();
    shell.id = `https://example.com/ids/aas/registry-sync-${uniqueSuffix}`;
    shell.assetInformation.globalAssetId = createGlobalAssetIdFromAasId(shell.id);
    const submodel = createTestSubmodel();
    submodel.id = `https://example.com/ids/sm/registry-sync-${uniqueSuffix}`;
    shell.submodels = [new Reference(ReferenceTypes.ModelReference, [new Key(KeyTypes.Submodel, submodel.id)])];

    /** Creates a service with registry configurations only; descriptor endpoints are reached through the hook. */
    function createRegistryOnlyService(allowEnvironment: boolean) {
        const endpointFetch = vi.fn<FetchAPI>((input, init) => fetch(input, init));
        const endpointConfiguration = vi.fn((href: string) =>
            allowEnvironment && href.startsWith(`${environmentBasePath}/`)
                ? new Configuration({ fetchApi: endpointFetch, headers: { 'X-Test': 'registry-sync' } })
                : null
        );
        const service = new AasService({ aasRegistryConfig, submodelRegistryConfig, endpointConfiguration });
        const submodelService = new SubmodelService({ submodelRegistryConfig, endpointConfiguration });
        return { service, submodelService, endpointFetch, endpointConfiguration };
    }

    beforeAll(async () => {
        const submodelResult = await submodelRepositoryClient.postSubmodel({
            configuration: environmentConfig,
            submodel,
        });
        assertApiResult(submodelResult, 'Creating the Submodel in the AAS Environment');

        const shellResult = await aasRepositoryClient.postAssetAdministrationShell({
            configuration: environmentConfig,
            assetAdministrationShell: shell,
        });
        assertApiResult(shellResult, 'Creating the AAS in the AAS Environment');
    });

    afterAll(async () => {
        await aasRepositoryClient.deleteAssetAdministrationShellById({
            configuration: environmentConfig,
            aasIdentifier: shell.id,
        });
        await submodelRepositoryClient.deleteSubmodelById({
            configuration: environmentConfig,
            submodelIdentifier: submodel.id,
        });
    });

    test('registers the AAS with an AAS-3.2 endpoint', async () => {
        const descriptorResult = await aasRegistryClient.getAssetAdministrationShellDescriptorById({
            configuration: aasRegistryConfig,
            aasIdentifier: shell.id,
        });
        assertApiResult(descriptorResult, 'Reading the synchronized AAS descriptor');
        expect(descriptorResult.data.endpoints?.map((endpoint) => endpoint._interface)).toContain('AAS-3.2');
    });

    test('resolves the AAS and its Submodels through the registry without repository configuration', async () => {
        const { service, submodelService, endpointFetch, endpointConfiguration } = createRegistryOnlyService(true);

        const result = await service.getAasById({ aasIdentifier: shell.id });
        assertApiResult(result, 'Resolving the AAS through the registry');
        expect(result.data.shell.id).toBe(shell.id);
        expect(result.data.descriptor?.id).toBe(shell.id);

        const submodelResult = await submodelService.getSubmodelById({ submodelIdentifier: submodel.id });
        assertApiResult(submodelResult, 'Resolving the Submodel through the registry');
        expect(submodelResult.data.submodel.id).toBe(submodel.id);

        expect(endpointConfiguration).toHaveBeenCalled();
        const requestedUrls = endpointFetch.mock.calls.map(([input]) => String(input));
        expect(requestedUrls.length).toBe(2);
        expect(requestedUrls.every((url) => url.startsWith(`${environmentBasePath}/`))).toBe(true);
        const headers = endpointFetch.mock.calls[0][1]?.headers as Record<string, string>;
        expect(headers['X-Test']).toBe('registry-sync');
    });

    test('lists the AAS through the registry', async () => {
        const { service } = createRegistryOnlyService(true);

        const result = await service.getAasList({ limit: 1000 });
        assertApiResult(result, 'Listing AAS through the registry');
        expect(result.data.source).toBe('registry');
        expect(result.data.shells.map((listedShell) => listedShell.id)).toContain(shell.id);
        expect(result.data.warnings?.find((warning) => warning.descriptorId === shell.id)).toBeUndefined();
    });

    test('returns the AAS-3.2 endpoint of the descriptor', async () => {
        const { service } = createRegistryOnlyService(true);

        const result = await service.getAasEndpointById({ aasIdentifier: shell.id });
        assertApiResult(result, 'Getting the AAS endpoint');
        expect(result.data.startsWith(`${environmentBasePath}/shells/`)).toBe(true);
    });

    test('does not contact a rejected endpoint', async () => {
        const { service, endpointFetch, endpointConfiguration } = createRegistryOnlyService(false);

        const result = await service.getAasById({ aasIdentifier: shell.id });
        assertApiFailure(result, 'Resolving the AAS through a rejected endpoint');
        expect(endpointConfiguration).toHaveBeenCalled();
        expect(endpointFetch).not.toHaveBeenCalled();
    });
});
