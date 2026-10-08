import {
    AssetAdministrationShell,
    AssetInformation,
    AssetKind,
    ConceptDescription,
    DataTypeDefXsd,
    LangStringTextType,
    Property,
    SpecificAssetId,
    Submodel,
} from '@aas-core-works/aas-core3.1-typescript/types';
import fs from 'node:fs';
import { AasDiscoveryClient } from '../clients/AasDiscoveryClient';
import { AasRegistryClient } from '../clients/AasRegistryClient';
import { AasRepositoryClient } from '../clients/AasRepositoryClient';
import { AasxFileClient } from '../clients/AasxFileClient';
import { ConceptDescriptionRepositoryClient } from '../clients/ConceptDescriptionRepositoryClient';
import { SubmodelRegistryClient } from '../clients/SubmodelRegistryClient';
import { SubmodelRepositoryClient } from '../clients/SubmodelRepositoryClient';
import { Configuration } from '../generated';
import { base64Decode, base64Encode } from '../lib/base64Url';
import { AssetAdministrationShellDescriptor, SubmodelDescriptor } from '../models/Descriptors';
import { assertApiResult } from './fixtures/assertionHelpers';
import { createPerTestCleanupRunner } from './fixtures/testCleanup';
import { getIntegrationBasePath } from './testEngineConfig';

/**
 * Conditional requests (RFC 9110) against BaSyx Go: entity tags on reads, `304 Not Modified` for `If-None-Match`,
 * and `412 Precondition Failed` for writes with an outdated `If-Match` or a create-only `If-None-Match: *`.
 */

type ResultLike = {
    success: boolean;
    statusCode?: number;
    etag?: string;
    data?: unknown;
    error?: unknown;
    notModified?: boolean;
    preconditionFailed?: boolean;
};

const uniqueSuffix = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Reads a resource, expects an entity tag and a `304` answer for a read with that tag, and returns the tag.
 */
async function expectConditionalRead(read: (ifNoneMatch?: string) => Promise<ResultLike>): Promise<string> {
    const response = await read();
    assertApiResult(response as ResultLike & { data: unknown }, 'Read resource');
    expect(response.etag).toEqual(expect.any(String));
    const etag = response.etag as string;

    const notModified = await read(etag);
    expect(notModified).toMatchObject({ success: true, notModified: true, statusCode: 304, etag });
    expect(notModified.data).toBeUndefined();

    return etag;
}

function expectPreconditionFailed(response: ResultLike): void {
    expect(response).toMatchObject({ success: false, statusCode: 412, preconditionFailed: true });
}

function expectSuccess<R extends ResultLike>(
    response: R,
    context: string
): asserts response is Extract<R, { success: true }> {
    assertApiResult(response as ResultLike & { data: unknown }, context);
}

describe('Conditional Requests Integration Tests', () => {
    const { track } = createPerTestCleanupRunner();

    describe('Submodel Repository', () => {
        const client = new SubmodelRepositoryClient();
        const configuration = new Configuration({ basePath: getIntegrationBasePath('submodelRepository') });

        function createSubmodel(): Submodel {
            const submodel = new Submodel(`https://example.com/ids/sm/conditional-${uniqueSuffix()}`);
            submodel.idShort = 'conditionalSubmodel';
            track(async () => {
                await client.deleteSubmodelById({ configuration, submodelIdentifier: submodel.id });
            });
            return submodel;
        }

        function createProperty(value: string): Property {
            const property = new Property(DataTypeDefXsd.Integer);
            property.idShort = 'counter';
            property.value = value;
            return property;
        }

        async function createSubmodelWithProperty(): Promise<Submodel> {
            const submodel = createSubmodel();
            expectSuccess(await client.postSubmodel({ configuration, submodel }), 'Create Submodel');
            expectSuccess(
                await client.postSubmodelElement({
                    configuration,
                    submodelIdentifier: submodel.id,
                    submodelElement: createProperty('1'),
                }),
                'Create Property'
            );
            return submodel;
        }

        test('returns entity tags and answers If-None-Match with notModified', async () => {
            const submodel = await createSubmodelWithProperty();
            const submodelIdentifier = submodel.id;

            await expectConditionalRead((ifNoneMatch) =>
                client.getSubmodelById({ configuration, submodelIdentifier, ifNoneMatch })
            );
            await expectConditionalRead((ifNoneMatch) =>
                client.getSubmodelByIdValueOnly({ configuration, submodelIdentifier, ifNoneMatch })
            );
            await expectConditionalRead((ifNoneMatch) =>
                client.getSubmodelElementByPath({
                    configuration,
                    submodelIdentifier,
                    idShortPath: 'counter',
                    ifNoneMatch,
                })
            );
            await expectConditionalRead((ifNoneMatch) =>
                client.getAllSubmodelElements({ configuration, submodelIdentifier, ifNoneMatch })
            );
        });

        test('returns a new entity tag after a change', async () => {
            const submodel = await createSubmodelWithProperty();
            const submodelIdentifier = submodel.id;
            const etag = await expectConditionalRead((ifNoneMatch) =>
                client.getSubmodelById({ configuration, submodelIdentifier, ifNoneMatch })
            );

            const patchResponse = await client.patchSubmodelElementByPathValueOnly({
                configuration,
                submodelIdentifier,
                idShortPath: 'counter',
                submodelElementValue: '2',
                ifMatch: etag,
            });
            expectSuccess(patchResponse, 'Conditional value update');
            expect(patchResponse.etag).toEqual(expect.any(String));
            expect(patchResponse.etag).not.toBe(etag);

            const changed = await client.getSubmodelById({ configuration, submodelIdentifier, ifNoneMatch: etag });
            expectSuccess(changed, 'Read changed Submodel');
            expect(changed.notModified).toBeFalsy();
            expect(changed.etag).not.toBe(etag);
        });

        test('rejects writes with an outdated entity tag', async () => {
            const submodel = await createSubmodelWithProperty();
            const submodelIdentifier = submodel.id;
            const staleEtag = await expectConditionalRead((ifNoneMatch) =>
                client.getSubmodelById({ configuration, submodelIdentifier, ifNoneMatch })
            );

            expectSuccess(
                await client.patchSubmodelElementByPathValueOnly({
                    configuration,
                    submodelIdentifier,
                    idShortPath: 'counter',
                    submodelElementValue: '2',
                }),
                'Concurrent value update'
            );

            expectPreconditionFailed(
                await client.patchSubmodelElementByPathValueOnly({
                    configuration,
                    submodelIdentifier,
                    idShortPath: 'counter',
                    submodelElementValue: '3',
                    ifMatch: staleEtag,
                })
            );
            expectPreconditionFailed(
                await client.putSubmodelById({ configuration, submodelIdentifier, submodel, ifMatch: staleEtag })
            );
            expectPreconditionFailed(
                await client.postSubmodelElement({
                    configuration,
                    submodelIdentifier,
                    submodelElement: Object.assign(createProperty('4'), { idShort: 'other' }),
                    ifMatch: staleEtag,
                })
            );
            expectPreconditionFailed(
                await client.deleteSubmodelElementByPath({
                    configuration,
                    submodelIdentifier,
                    idShortPath: 'counter',
                    ifMatch: staleEtag,
                })
            );

            const valueResponse = await client.getSubmodelElementByPathValueOnly({
                configuration,
                submodelIdentifier,
                idShortPath: 'counter',
            });
            expectSuccess(valueResponse, 'Read value after failed writes');
            expect(JSON.stringify(valueResponse.data)).toContain('2');
        });

        test('accepts the entity tag of a Submodel for writes to its elements', async () => {
            const submodel = await createSubmodelWithProperty();
            const submodelIdentifier = submodel.id;
            const etag = await expectConditionalRead((ifNoneMatch) =>
                client.getSubmodelById({ configuration, submodelIdentifier, ifNoneMatch })
            );

            expectSuccess(
                await client.putSubmodelElementByPath({
                    configuration,
                    submodelIdentifier,
                    idShortPath: 'counter',
                    submodelElement: createProperty('5'),
                    ifMatch: etag,
                }),
                'Conditional element replacement'
            );
        });

        test('only creates with If-None-Match: *', async () => {
            const submodel = createSubmodel();

            expectSuccess(
                await client.putSubmodelById({
                    configuration,
                    submodelIdentifier: submodel.id,
                    submodel,
                    ifNoneMatch: '*',
                }),
                'Create-only PUT'
            );
            expectPreconditionFailed(
                await client.putSubmodelById({
                    configuration,
                    submodelIdentifier: submodel.id,
                    submodel,
                    ifNoneMatch: '*',
                })
            );
        });

        test('deletes only with the current entity tag', async () => {
            const submodel = await createSubmodelWithProperty();
            const submodelIdentifier = submodel.id;
            const staleEtag = await expectConditionalRead((ifNoneMatch) =>
                client.getSubmodelById({ configuration, submodelIdentifier, ifNoneMatch })
            );
            expectSuccess(
                await client.patchSubmodelElementByPathValueOnly({
                    configuration,
                    submodelIdentifier,
                    idShortPath: 'counter',
                    submodelElementValue: '2',
                }),
                'Concurrent value update'
            );

            expectPreconditionFailed(
                await client.deleteSubmodelById({ configuration, submodelIdentifier, ifMatch: staleEtag })
            );

            const current = await client.getSubmodelById({ configuration, submodelIdentifier });
            expectSuccess(current, 'Read Submodel after failed delete');
            expectSuccess(
                await client.deleteSubmodelById({ configuration, submodelIdentifier, ifMatch: current.etag }),
                'Conditional delete'
            );
        });
    });

    describe('AAS Repository', () => {
        const client = new AasRepositoryClient();
        const configuration = new Configuration({ basePath: getIntegrationBasePath('aasRepository') });

        async function createShell(): Promise<AssetAdministrationShell> {
            const shell = new AssetAdministrationShell(
                `https://example.com/ids/aas/conditional-${uniqueSuffix()}`,
                new AssetInformation(AssetKind.Instance, `https://example.com/ids/asset/conditional-${uniqueSuffix()}`)
            );
            track(async () => {
                await client.deleteAssetAdministrationShellById({ configuration, aasIdentifier: shell.id });
            });
            expectSuccess(
                await client.postAssetAdministrationShell({ configuration, assetAdministrationShell: shell }),
                'Create shell'
            );
            return shell;
        }

        test('returns entity tags and answers If-None-Match with notModified', async () => {
            const shell = await createShell();

            await expectConditionalRead((ifNoneMatch) =>
                client.getAssetAdministrationShellById({ configuration, aasIdentifier: shell.id, ifNoneMatch })
            );
            await expectConditionalRead((ifNoneMatch) =>
                client.getAssetInformationAasRepository({ configuration, aasIdentifier: shell.id, ifNoneMatch })
            );
            await expectConditionalRead((ifNoneMatch) =>
                client.getAllSubmodelReferencesAasRepository({ configuration, aasIdentifier: shell.id, ifNoneMatch })
            );
        });

        test('rejects writes with an outdated entity tag', async () => {
            const shell = await createShell();
            const staleEtag = await expectConditionalRead((ifNoneMatch) =>
                client.getAssetAdministrationShellById({ configuration, aasIdentifier: shell.id, ifNoneMatch })
            );

            shell.idShort = 'changed';
            expectSuccess(
                await client.putAssetAdministrationShellById({
                    configuration,
                    aasIdentifier: shell.id,
                    assetAdministrationShell: shell,
                }),
                'Concurrent shell update'
            );

            expectPreconditionFailed(
                await client.putAssetInformationAasRepository({
                    configuration,
                    aasIdentifier: shell.id,
                    assetInformation: shell.assetInformation,
                    ifMatch: staleEtag,
                })
            );
            expectPreconditionFailed(
                await client.deleteAssetAdministrationShellById({
                    configuration,
                    aasIdentifier: shell.id,
                    ifMatch: staleEtag,
                })
            );

            const current = await client.getAssetAdministrationShellById({ configuration, aasIdentifier: shell.id });
            expectSuccess(current, 'Read shell after failed writes');
            expect(current.etag).not.toBe(staleEtag);
            expectSuccess(
                await client.putAssetAdministrationShellById({
                    configuration,
                    aasIdentifier: shell.id,
                    assetAdministrationShell: shell,
                    ifMatch: current.etag,
                }),
                'Conditional shell update'
            );
        });
    });

    describe('Concept Description Repository', () => {
        const client = new ConceptDescriptionRepositoryClient();
        const configuration = new Configuration({ basePath: getIntegrationBasePath('conceptDescriptionRepository') });

        test('supports conditional reads, writes and deletes', async () => {
            const conceptDescription = new ConceptDescription(
                `https://example.com/ids/cd/conditional-${uniqueSuffix()}`
            );
            const cdIdentifier = conceptDescription.id;
            track(async () => {
                await client.deleteConceptDescriptionById({ configuration, cdIdentifier });
            });
            expectSuccess(
                await client.postConceptDescription({ configuration, conceptDescription }),
                'Create concept description'
            );

            const staleEtag = await expectConditionalRead((ifNoneMatch) =>
                client.getConceptDescriptionById({ configuration, cdIdentifier, ifNoneMatch })
            );

            conceptDescription.description = [new LangStringTextType('en', 'changed')];
            expectSuccess(
                await client.putConceptDescriptionById({ configuration, cdIdentifier, conceptDescription }),
                'Concurrent update'
            );
            expectPreconditionFailed(
                await client.putConceptDescriptionById({
                    configuration,
                    cdIdentifier,
                    conceptDescription,
                    ifMatch: staleEtag,
                })
            );
            expectPreconditionFailed(
                await client.deleteConceptDescriptionById({ configuration, cdIdentifier, ifMatch: staleEtag })
            );

            const current = await client.getConceptDescriptionById({ configuration, cdIdentifier });
            expectSuccess(current, 'Read current concept description');
            expectSuccess(
                await client.deleteConceptDescriptionById({ configuration, cdIdentifier, ifMatch: current.etag }),
                'Conditional delete'
            );
        });
    });

    describe('AAS Registry', () => {
        const client = new AasRegistryClient();
        const configuration = new Configuration({ basePath: getIntegrationBasePath('aasRegistry') });

        test('supports conditional reads, writes and deletes', async () => {
            const descriptor = new AssetAdministrationShellDescriptor(
                `https://example.com/ids/aas-desc/conditional-${uniqueSuffix()}`
            );
            const aasIdentifier = descriptor.id;
            track(async () => {
                await client.deleteAssetAdministrationShellDescriptorById({ configuration, aasIdentifier });
            });
            expectSuccess(
                await client.postAssetAdministrationShellDescriptor({
                    configuration,
                    assetAdministrationShellDescriptor: descriptor,
                }),
                'Create shell descriptor'
            );

            const staleEtag = await expectConditionalRead((ifNoneMatch) =>
                client.getAssetAdministrationShellDescriptorById({ configuration, aasIdentifier, ifNoneMatch })
            );

            descriptor.idShort = 'changed';
            expectSuccess(
                await client.putAssetAdministrationShellDescriptorById({
                    configuration,
                    aasIdentifier,
                    assetAdministrationShellDescriptor: descriptor,
                }),
                'Concurrent update'
            );
            expectPreconditionFailed(
                await client.putAssetAdministrationShellDescriptorById({
                    configuration,
                    aasIdentifier,
                    assetAdministrationShellDescriptor: descriptor,
                    ifMatch: staleEtag,
                })
            );
            expectPreconditionFailed(
                await client.deleteAssetAdministrationShellDescriptorById({
                    configuration,
                    aasIdentifier,
                    ifMatch: staleEtag,
                })
            );

            const current = await client.getAssetAdministrationShellDescriptorById({ configuration, aasIdentifier });
            expectSuccess(current, 'Read current shell descriptor');
            expectSuccess(
                await client.deleteAssetAdministrationShellDescriptorById({
                    configuration,
                    aasIdentifier,
                    ifMatch: current.etag,
                }),
                'Conditional delete'
            );
        });
    });

    describe('Submodel Registry', () => {
        const client = new SubmodelRegistryClient();
        const configuration = new Configuration({ basePath: getIntegrationBasePath('submodelRegistry') });

        test('supports conditional reads, writes and deletes', async () => {
            const submodelIdentifier = `https://example.com/ids/sm-desc/conditional-${uniqueSuffix()}`;
            const descriptor = new SubmodelDescriptor(submodelIdentifier, [
                {
                    _interface: 'SUBMODEL-3.0',
                    protocolInformation: {
                        href: `http://localhost:8082/submodels/${base64Encode(submodelIdentifier)}`,
                        endpointProtocol: null,
                        endpointProtocolVersion: null,
                        subprotocol: null,
                        subprotocolBody: null,
                        subprotocolBodyEncoding: null,
                        securityAttributes: null,
                    },
                },
            ]);
            track(async () => {
                await client.deleteSubmodelDescriptorById({ configuration, submodelIdentifier });
            });
            expectSuccess(
                await client.postSubmodelDescriptor({ configuration, submodelDescriptor: descriptor }),
                'Create Submodel descriptor'
            );

            const staleEtag = await expectConditionalRead((ifNoneMatch) =>
                client.getSubmodelDescriptorById({ configuration, submodelIdentifier, ifNoneMatch })
            );

            descriptor.idShort = 'changed';
            expectSuccess(
                await client.putSubmodelDescriptorById({
                    configuration,
                    submodelIdentifier,
                    submodelDescriptor: descriptor,
                }),
                'Concurrent update'
            );
            expectPreconditionFailed(
                await client.putSubmodelDescriptorById({
                    configuration,
                    submodelIdentifier,
                    submodelDescriptor: descriptor,
                    ifMatch: staleEtag,
                })
            );

            const current = await client.getSubmodelDescriptorById({ configuration, submodelIdentifier });
            expectSuccess(current, 'Read current Submodel descriptor');
            expectSuccess(
                await client.deleteSubmodelDescriptorById({ configuration, submodelIdentifier, ifMatch: current.etag }),
                'Conditional delete'
            );
        });
    });

    describe('AAS Discovery', () => {
        const client = new AasDiscoveryClient();
        const configuration = new Configuration({ basePath: getIntegrationBasePath('aasDiscovery') });

        test('supports conditional reads, writes and deletes of asset links', async () => {
            const aasIdentifier = `https://example.com/ids/aas/conditional-${uniqueSuffix()}`;
            track(async () => {
                await client.deleteAllAssetLinksById({ configuration, aasIdentifier });
            });
            expectSuccess(
                await client.postAllAssetLinksById({
                    configuration,
                    aasIdentifier,
                    specificAssetId: [new SpecificAssetId('serialNumber', `conditional-${uniqueSuffix()}`)],
                }),
                'Create asset links'
            );

            const staleEtag = await expectConditionalRead((ifNoneMatch) =>
                client.getAllAssetLinksById({ configuration, aasIdentifier, ifNoneMatch })
            );

            expectSuccess(
                await client.postAllAssetLinksById({
                    configuration,
                    aasIdentifier,
                    specificAssetId: [new SpecificAssetId('serialNumber', `conditional-${uniqueSuffix()}`)],
                }),
                'Concurrent update'
            );
            expectPreconditionFailed(
                await client.deleteAllAssetLinksById({ configuration, aasIdentifier, ifMatch: staleEtag })
            );

            const current = await client.getAllAssetLinksById({ configuration, aasIdentifier });
            expectSuccess(current, 'Read current asset links');
            expectSuccess(
                await client.deleteAllAssetLinksById({ configuration, aasIdentifier, ifMatch: current.etag }),
                'Conditional delete'
            );
        });
    });

    describe('AASX File Server', () => {
        const client = new AasxFileClient();
        const configuration = new Configuration({ basePath: getIntegrationBasePath('aasxFileServer') });
        const createPackageFile = (): Blob =>
            new Blob([fs.readFileSync('test-data/sample.aasx')], {
                type: 'application/asset-administration-shell-package',
            });

        test('supports conditional reads, writes and deletes of packages', async () => {
            const aasIds = [`https://example.com/ids/aas/conditional-${uniqueSuffix()}`];
            const createResponse = await client.postAASXPackage({
                configuration,
                aasIds,
                fileName: `conditional-${uniqueSuffix()}.aasx`,
                file: createPackageFile(),
            });
            expectSuccess(createResponse, 'Create package');
            const rawPackageId = createResponse.data.packageId as string;
            let packageId = rawPackageId;
            try {
                const decoded = base64Decode(rawPackageId);
                packageId = decoded && base64Encode(decoded) === rawPackageId ? decoded : rawPackageId;
            } catch {
                // The package id is not Base64URL-encoded
            }
            track(async () => {
                await client.deleteAASXByPackageId({ configuration, packageId });
            });

            const staleEtag = await expectConditionalRead((ifNoneMatch) =>
                client.getAASXByPackageId({ configuration, packageId, ifNoneMatch })
            );

            expectSuccess(
                await client.putAASXByPackageId({
                    configuration,
                    packageId,
                    aasIds,
                    fileName: `conditional-${uniqueSuffix()}.aasx`,
                    file: createPackageFile(),
                }),
                'Concurrent update'
            );
            expectPreconditionFailed(
                await client.putAASXByPackageId({
                    configuration,
                    packageId,
                    aasIds,
                    fileName: `conditional-${uniqueSuffix()}.aasx`,
                    file: createPackageFile(),
                    ifMatch: staleEtag,
                })
            );
            expectPreconditionFailed(
                await client.deleteAASXByPackageId({ configuration, packageId, ifMatch: staleEtag })
            );

            const current = await client.getAASXByPackageId({ configuration, packageId });
            expectSuccess(current, 'Read current package');
            expectSuccess(
                await client.deleteAASXByPackageId({ configuration, packageId, ifMatch: current.etag }),
                'Conditional delete'
            );
        });
    });
});
