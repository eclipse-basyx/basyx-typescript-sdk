/**
 * The query endpoints of the AAS API.
 */
export type QueryEndpoint =
    | 'shells'
    | 'submodels'
    | 'shell-descriptors'
    | 'submodel-descriptors'
    | 'concept-descriptions';

// The service specification profile that adds each query endpoint, the same in API versions 3.1 and 3.2.
const QUERY_PROFILES: Record<QueryEndpoint, { specification: string; profile: string }> = {
    shells: { specification: 'AssetAdministrationShellRepositoryServiceSpecification', profile: 'SSP-003' },
    submodels: { specification: 'SubmodelRepositoryServiceSpecification', profile: 'SSP-005' },
    'shell-descriptors': { specification: 'AssetAdministrationShellRegistryServiceSpecification', profile: 'SSP-004' },
    'submodel-descriptors': { specification: 'SubmodelRegistryServiceSpecification', profile: 'SSP-004' },
    'concept-descriptions': { specification: 'ConceptDescriptionRepositoryServiceSpecification', profile: 'SSP-002' },
};

// e.g. https://admin-shell.io/aas/API/3/1/SubmodelRepositoryServiceSpecification/SSP-005
const PROFILE_PATTERN = /\/aas\/API\/3\/\d+\/([A-Za-z]+)\/(SSP-\d+)$/;

/**
 * Returns the query endpoints whose query profile a service advertises in its `ServiceDescription`.
 *
 * Profiles are matched by service specification and profile number, regardless of host and API version (both
 * `https://admin-shell.io/aas/API/3/2/...` and `https://basyx.org/aas/API/3/2/...`). This is a best-effort hint: a
 * server can serve query endpoints without advertising their profile, so an empty result does not prove that queries
 * are unsupported.
 *
 * @param serviceDescription The result of `getSelfDescription`
 * @returns The query endpoints with an advertised profile
 */
export function getQueryEndpoints(
    serviceDescription: { profiles?: Array<string> | null } | null | undefined
): QueryEndpoint[] {
    const profiles = serviceDescription?.profiles ?? [];

    return (Object.keys(QUERY_PROFILES) as QueryEndpoint[]).filter((endpoint) =>
        profiles.some((profile) => {
            const match = PROFILE_PATTERN.exec(profile);
            return (
                match !== null &&
                match[1] === QUERY_PROFILES[endpoint].specification &&
                match[2] === QUERY_PROFILES[endpoint].profile
            );
        })
    );
}

/**
 * Checks whether a service advertises the query profile for an endpoint, or for any query endpoint if none is given.
 *
 * This is a best-effort hint, see {@link getQueryEndpoints}.
 *
 * @param serviceDescription The result of `getSelfDescription`
 * @param endpoint The query endpoint, e.g. `'shells'` for `/query/shells`
 * @returns `true` if the matching query profile is advertised
 */
export function supportsQuery(
    serviceDescription: { profiles?: Array<string> | null } | null | undefined,
    endpoint?: QueryEndpoint
): boolean {
    const endpoints = getQueryEndpoints(serviceDescription);
    return endpoint === undefined ? endpoints.length > 0 : endpoints.includes(endpoint);
}
