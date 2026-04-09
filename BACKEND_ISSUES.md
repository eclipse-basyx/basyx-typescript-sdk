# Backend Issues (Go Services)

This file tracks known backend behavior gaps that currently block integration tests.

Policy:

- No SDK compatibility workarounds are added for backend defects.
- Only affected integration tests are skipped.
- Unit tests remain strict and fully enabled.

## AAS Repository (port 8081)

### Attachment endpoint contract mismatches (AAS superpath)

- Endpoint: `GET /shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/attachment`
- Observed: Returns success with an empty payload for a file that was just uploaded.
- Expected: Uploaded payload bytes should be returned.
- Affected tests:
  - `src/integration-tests/aasRepo.integration.test.ts` (`should download uploaded file by path through AAS repository superpath`)

- Endpoint: `PUT /shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/attachment`
- Observed: Returns success when targeting a non-File submodel element path.
- Expected: `405 Method Not Allowed` according to API contract.
- Affected tests:
  - `src/integration-tests/aasRepo.integration.test.ts` (`should reject file upload on non-File submodel element through AAS repository superpath with 405`)

- Endpoint: `GET /shells/{aasIdentifier}/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/attachment`
- Observed: Returns success for missing submodel-element path and after delete.
- Expected: `404 Not Found` for missing path / deleted file content.
- Affected tests:
  - `src/integration-tests/aasRepo.integration.test.ts` (`should reject file download for missing submodel element through AAS repository superpath with 404`)
  - `src/integration-tests/aasRepo.integration.test.ts` (`should return not found when downloading a deleted file through AAS repository superpath`)

### Serialization endpoint instability (AAS Repository)

- Endpoint: `GET /serialization`
- Observed: Unsuccessful response in current integration environment.
- Expected: Serialization payload.
- Affected tests:
  - `src/integration-tests/aasRepo.integration.test.ts` (`should generate serialization by IDs`)

## Submodel Repository (port 8082)

### Attachment endpoint contract mismatches

- Endpoint: `GET /submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/attachment`
- Observed: Returns `400` for a non-File submodel element path.
- Expected: `405 Method Not Allowed` according to API contract.
- Affected tests:
  - `src/integration-tests/submodelRepo.integration.test.ts` (`should reject file download on non-File submodel element with 405`)

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
