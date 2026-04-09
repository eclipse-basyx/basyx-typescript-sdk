# Backend Issues (Go Services)

This file tracks known backend behavior gaps that currently block integration tests.

Policy:

- No SDK compatibility workarounds are added for backend defects.
- Only affected integration tests are skipped.
- Unit tests remain strict and fully enabled.

## AAS Repository (port 8081)

### Serialization endpoint instability (AAS Repository)

- Endpoint: `GET /serialization`
- Observed: Unsuccessful response in current integration environment.
- Expected: Serialization payload.
- Affected tests:
  - `src/integration-tests/aasRepo.integration.test.ts` (`should generate serialization by IDs`)

## Submodel Repository (port 8082)

### Metadata/path variants failing

- Endpoint: `GET /submodels/$path`
- Observed: Error response in current integration environment.
- Expected: Path representation payload.
- Affected tests:
  - `src/integration-tests/submodelRepo.integration.test.ts` (`should fetch paths of all Submodels`)

- Endpoint: `GET /submodels/{submodelIdentifier}/$path`
- Observed: Error response in current integration environment.
- Expected: Path representation payload.
- Affected tests:
  - `src/integration-tests/submodelRepo.integration.test.ts` (`should fetch Submodel by ID in path representation`)

- Endpoint: `GET /submodels/{submodelIdentifier}/submodel-elements/$metadata`
- Observed: Error response in current integration environment.
- Expected: Submodel element metadata list payload.
- Affected tests:
  - `src/integration-tests/submodelRepo.integration.test.ts` (`should fetch all SubmodelElements in metadata representation`)

- Endpoint: `GET /submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/$metadata`
- Observed: Error response in current integration environment.
- Expected: Submodel element metadata payload.
- Affected tests:
  - `src/integration-tests/submodelRepo.integration.test.ts` (`should fetch SubmodelElement metadata by path`)

### Serialization endpoint instability (Submodel Repository)

- Endpoint: `GET /serialization`
- Observed: Unsuccessful response in current integration environment.
- Expected: Serialization payload.
- Affected tests:
  - `src/integration-tests/submodelRepo.integration.test.ts` (`should generate serialization by IDs`)

## Concept Description Repository (port 8083)

### Serialization endpoint instability (Concept Description Repository)

- Endpoint: `GET /serialization`
- Observed: Unsuccessful response in current integration environment.
- Expected: Serialization payload.
- Affected tests:
  - `src/integration-tests/conceptDescriptionRepo.integration.test.ts` (`should generate serialization by IDs`)
