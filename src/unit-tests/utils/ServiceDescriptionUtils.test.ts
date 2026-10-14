import { getQueryEndpoints, supportsQuery } from '../../utils/ServiceDescriptionUtils';

// Profiles advertised by the BaSyx Go AAS repository
const AAS_REPOSITORY = {
    profiles: [
        'https://admin-shell.io/aas/API/3/2/AssetAdministrationShellRepositoryServiceSpecification/SSP-001',
        'https://admin-shell.io/aas/API/3/2/AssetAdministrationShellRepositoryServiceSpecification/SSP-003',
        'https://basyx.org/aas/API/3/2/AssetAdministrationShellRepositoryServiceSpecification/SSP-001',
    ],
};

describe('getQueryEndpoints', () => {
    it('returns the endpoint of an advertised query profile', () => {
        expect(getQueryEndpoints(AAS_REPOSITORY)).toEqual(['shells']);
    });

    it.each([
        ['https://admin-shell.io/aas/API/3/1/SubmodelRepositoryServiceSpecification/SSP-005', 'submodels'],
        [
            'https://basyx.org/aas/API/3/2/AssetAdministrationShellRegistryServiceSpecification/SSP-004',
            'shell-descriptors',
        ],
        ['https://admin-shell.io/aas/API/3/2/SubmodelRegistryServiceSpecification/SSP-004', 'submodel-descriptors'],
        [
            'https://admin-shell.io/aas/API/3/2/ConceptDescriptionRepositoryServiceSpecification/SSP-002',
            'concept-descriptions',
        ],
    ])('matches %s regardless of host and version', (profile, endpoint) => {
        expect(getQueryEndpoints({ profiles: [profile] })).toEqual([endpoint]);
    });

    it('returns all endpoints of an environment that advertises several services', () => {
        const environment = {
            profiles: [
                'https://admin-shell.io/aas/API/3/2/SubmodelRepositoryServiceSpecification/SSP-005',
                'https://admin-shell.io/aas/API/3/2/AssetAdministrationShellRepositoryServiceSpecification/SSP-003',
            ],
        };

        expect(getQueryEndpoints(environment)).toEqual(['shells', 'submodels']);
    });

    it.each([
        // Bulk profile of the registry, not the query profile
        'https://admin-shell.io/aas/API/3/2/AssetAdministrationShellRegistryServiceSpecification/SSP-003',
        // Query profile number of another service
        'https://admin-shell.io/aas/API/3/2/SubmodelRepositoryServiceSpecification/SSP-003',
        'https://basyx.org/aas/API/3/2/SubmodelRepositoryService/1.0',
        'https://admin-shell.io/aas/API/3/0/SubmodelRepositoryServiceSpecification/SSP-005-extra',
    ])('ignores %s', (profile) => {
        expect(getQueryEndpoints({ profiles: [profile] })).toEqual([]);
    });

    it.each([undefined, null, {}, { profiles: null }])('returns no endpoints for %s', (serviceDescription) => {
        expect(getQueryEndpoints(serviceDescription)).toEqual([]);
    });
});

describe('supportsQuery', () => {
    it('checks a single endpoint', () => {
        expect(supportsQuery(AAS_REPOSITORY, 'shells')).toBe(true);
        expect(supportsQuery(AAS_REPOSITORY, 'submodels')).toBe(false);
    });

    it('checks for any query endpoint without an endpoint', () => {
        expect(supportsQuery(AAS_REPOSITORY)).toBe(true);
        expect(supportsQuery({ profiles: [AAS_REPOSITORY.profiles[0]] })).toBe(false);
    });
});
