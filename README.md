![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/eclipse-basyx/basyx-typescript-sdk/publish.yml)
![NPM Downloads](https://img.shields.io/npm/dw/basyx-typescript-sdk)
![NPM Version](https://img.shields.io/npm/v/basyx-typescript-sdk)
![GitHub License](https://img.shields.io/github/license/eclipse-basyx/basyx-typescript-sdk)

# basyx-typescript-sdk

BaSyx TypeScript SDK for developing applications and components for the Asset Administration Shell (AAS)

## Features

High-level orchestration services:
- **AasService**: Unified API for AAS operations across registry and repository
  - Create, read, update, delete AAS with automatic registry synchronization
  - Fetch AAS with their submodels in a single call
  - Automatic endpoint resolution and fallback handling
- **SubmodelService**: Unified API for Submodel operations across registry and repository
  - Create, read, update, delete Submodels with automatic registry synchronization
  - Flexible endpoint-based retrieval
  - Automatic fallback to repository when registry unavailable

Clients for the AAS API components:
- AAS Repository
- Submodel Repository
- Concept Description Repository
- AAS Registry
- Submodel Registry
- AAS Discovery Service
- AASX File Service

Utility functions for working with AAS data:
- Utils for Descriptors
- Utils for KeyTypes
- Utils for MultiLanguageProperties
- Utils for Referables
- Utils for References
- Utils for SemanticIds

## Installation

```bash
npm install basyx-typescript-sdk
# or
yarn add basyx-typescript-sdk
```

> See https://www.npmjs.com/package/basyx-typescript-sdk

---

> [!IMPORTANT]
> Make sure to also install `@aas-core-works/aas-core3.0-typescript` in your project:

```bash
npm install @aas-core-works/aas-core3.0-typescript
# or
yarn add @aas-core-works/aas-core3.0-typescript
```

## Import Styles

The SDK supports multiple import styles for flexibility:

### Direct Imports (Recommended for most use cases)

```typescript
// Import clients directly
import { AasRepositoryClient, AasRegistryClient, Configuration } from 'basyx-typescript-sdk';

// Import services directly
import { AasService } from 'basyx-typescript-sdk';

// Import utility functions directly
import { extractEndpointHref, getSubmodelElementByIdShort } from 'basyx-typescript-sdk';

// Import library functions directly
import { base64Encode, base64Decode } from 'basyx-typescript-sdk';
```

### Namespaced Imports (For organized code)

```typescript
// Import utilities as namespace
import { Utils, Lib } from 'basyx-typescript-sdk';

// Use with namespace
const endpoint = Utils.extractEndpointHref(descriptor, 'AAS-3.0');
const encoded = Lib.base64Encode('my-id');
```

### Mixed Style

```typescript
// Combine direct and namespaced imports
import { 
    AasService, 
    Configuration, 
    Utils,
    base64Encode 
} from 'basyx-typescript-sdk';

// Use directly imported functions
const id = base64Encode('my-id');

// Use namespaced utilities
const element = Utils.getSubmodelElementByIdShort(submodel, 'myElement');
```

## Usage Examples

### Basic Client Usage

```typescript
import { AasRepositoryClient, Configuration } from 'basyx-typescript-sdk';

async function getAllShells() {
    const client = new AasRepositoryClient();
    const configuration = new Configuration({
        basePath: 'http://localhost:8081',
    });

    const response = await client.getAllAssetAdministrationShells({ configuration });

    if (response.success) {
        console.log('Shells:', response.data.result);
    } else {
        console.error('Error:', response.error);
    }
}
```

### Using the AasService (High-level API)

```typescript
import { AasService, Configuration } from 'basyx-typescript-sdk';
import { AssetAdministrationShell, AssetInformation, AssetKind } from '@aas-core-works/aas-core3.0-typescript/types';

// Initialize service with both registry and repository
const service = new AasService({
    registryConfig: new Configuration({ basePath: 'http://localhost:8084' }),
    repositoryConfig: new Configuration({ basePath: 'http://localhost:8081' }),
    // Optional: Separate configs for submodel services (used when includeSubmodels is enabled)
    // If not provided, falls back to using registryConfig/repositoryConfig for submodels
    // In typical BaSyx deployments, submodel services run on different ports:
    submodelRegistryConfig: new Configuration({ basePath: 'http://localhost:8083' }),
    submodelRepositoryConfig: new Configuration({ basePath: 'http://localhost:8081' }),
    // Optional: Discovery service config (used for asset ID lookups)
    discoveryConfig: new Configuration({ basePath: 'http://localhost:8086' }),
});

// Create a new AAS (automatically registers in registry)
const shell = new AssetAdministrationShell(
    'https://example.com/ids/aas/my-aas',
    new AssetInformation(AssetKind.Instance)
);

const createResult = await service.createAas({ shell });
if (createResult.success) {
    console.log('Created AAS:', createResult.data.shell);
}

// Get AAS list from registry with automatic endpoint resolution
const listResult = await service.getAasList();
if (listResult.success) {
    console.log('All shells:', listResult.data.shells);
}

// Get AAS by ID (uses registry endpoint if available)
const getResult = await service.getAasById({ 
    aasIdentifier: 'https://example.com/ids/aas/my-aas' 
});

// Get AAS with its submodels in a single call
const withSubmodels = await service.getAasById({
    aasIdentifier: 'https://example.com/ids/aas/my-aas',
    includeSubmodels: true
});
if (withSubmodels.success) {
    console.log('Shell:', withSubmodels.data.shell);
    console.log('Submodels:', withSubmodels.data.submodels); // Array of submodels
}

// Get all AAS with their submodels
const allWithSubmodels = await service.getAasList({ includeSubmodels: true });
if (allWithSubmodels.success) {
    allWithSubmodels.data.shells.forEach((shell, index) => {
        console.log(`Shell ${index}:`, shell.id);
        console.log(`Submodels:`, allWithSubmodels.data.submodels?.[shell.id]);
    });
}

// Update AAS (updates both repository and registry)
shell.idShort = 'UpdatedName';
const updateResult = await service.updateAas({ shell });

// Get endpoint for an AAS
const endpointResult = await service.getAasEndpointById({
    aasIdentifier: 'https://example.com/ids/aas/my-aas'
});

// Get AAS directly by endpoint URL
const byEndpointResult = await service.getAasByEndpoint({
    endpoint: 'http://localhost:8081/shells/encoded-id'
});

// Delete AAS (removes from both registry and repository)
await service.deleteAas({ 
    aasIdentifier: 'https://example.com/ids/aas/my-aas' 
});

// Find AAS by asset IDs using discovery service
const assetIds = [
    { name: 'serialNumber', value: '12345' },
    { name: 'deviceId', value: 'device-001' },
];

const byAssetIdResult = await service.getAasByAssetId({ 
    assetIds,
    includeSubmodels: true  // Optionally include submodels
});
if (byAssetIdResult.success) {
    console.log('Found AAS IDs:', byAssetIdResult.data.aasIds);
    console.log('Found shells:', byAssetIdResult.data.shells);
    // If multiple AAS match the asset IDs, all are returned
}

// Fetch AAS with submodels and their concept descriptions
const serviceWithCD = new AasService({
    registryConfig: new Configuration({ basePath: 'http://localhost:8084' }),
    repositoryConfig: new Configuration({ basePath: 'http://localhost:8081' }),
    submodelRegistryConfig: new Configuration({ basePath: 'http://localhost:8085' }),
    submodelRepositoryConfig: new Configuration({ basePath: 'http://localhost:8082' }),
    conceptDescriptionRepositoryConfig: new Configuration({ basePath: 'http://localhost:8083' }),
});

const withConceptDescriptions = await serviceWithCD.getAasById({
    aasIdentifier: 'https://example.com/ids/aas/my-aas',
    includeSubmodels: true,
    includeConceptDescriptions: true,
});
if (withConceptDescriptions.success) {
    console.log('Shell:', withConceptDescriptions.data.shell);
    console.log('Submodels with CDs:', withConceptDescriptions.data.submodels);
    // Concept descriptions are fetched for all semantic IDs in submodels and their elements
}

// Fetch all AAS with submodels and concept descriptions
const allWithCD = await serviceWithCD.getAasList({
    includeSubmodels: true,
    includeConceptDescriptions: true,
});
if (allWithCD.success) {
    allWithCD.data.shells.forEach((shell) => {
        console.log('Shell:', shell.id);
        console.log('Submodels:', allWithCD.data.submodels?.[shell.id]);
        // Concept descriptions are available through the submodel service
    });
}
```

### Using the SubmodelService (High-level API)

```typescript
import { SubmodelService, Configuration } from 'basyx-typescript-sdk';
import { Submodel, ModellingKind } from '@aas-core-works/aas-core3.0-typescript/types';

// Initialize service with both registry and repository
const service = new SubmodelService({
    registryConfig: new Configuration({ basePath: 'http://localhost:8085' }),
    repositoryConfig: new Configuration({ basePath: 'http://localhost:8082' }),
});

// Create a new Submodel (automatically registers in registry)
const submodel = new Submodel(
    'https://example.com/ids/sm/my-submodel',
    null, // extensions
    null, // category
    'MySubmodel', // idShort
    null, // displayName
    null, // description
    null, // administration
    ModellingKind.Instance
);

const createResult = await service.createSubmodel({ submodel });
if (createResult.success) {
    console.log('Created Submodel:', createResult.data.submodel);
    console.log('Registry Descriptor:', createResult.data.descriptor);
}

// Get Submodel list from registry with automatic endpoint resolution
const listResult = await service.getSubmodelList({ preferRegistry: true });
if (listResult.success) {
    console.log('All submodels:', listResult.data.submodels);
    console.log('Fetched from:', listResult.data.source); // 'registry' or 'repository'
}

// Get Submodel by ID (uses registry endpoint if available)
const getResult = await service.getSubmodelById({
    submodelIdentifier: 'https://example.com/ids/sm/my-submodel',
    useRegistryEndpoint: true
});
if (getResult.success) {
    console.log('Submodel:', getResult.data.submodel);
    console.log('Descriptor:', getResult.data.descriptor);
}

// Update Submodel (updates both repository and registry)
submodel.idShort = 'UpdatedSubmodel';
const updateResult = await service.updateSubmodel({ submodel });

// Get endpoint for a Submodel
const endpointResult = await service.getSubmodelEndpointById({
    submodelIdentifier: 'https://example.com/ids/sm/my-submodel'
});
if (endpointResult.success) {
    console.log('Endpoint:', endpointResult.data);
}

// Get Submodel directly by endpoint URL
const byEndpointResult = await service.getSubmodelByEndpoint({
    endpoint: 'http://localhost:8082/submodels/encoded-id'
});

// Delete Submodel (removes from both registry and repository)
await service.deleteSubmodel({
    submodelIdentifier: 'https://example.com/ids/sm/my-submodel'
});

// Service works with only repository (no registry)
const repoOnlyService = new SubmodelService({
    repositoryConfig: new Configuration({ basePath: 'http://localhost:8082' })
});

const repoList = await repoOnlyService.getSubmodelList();
// Automatically falls back to repository when registry unavailable

// Fetch submodels with concept descriptions
const serviceWithCD = new SubmodelService({
    registryConfig: new Configuration({ basePath: 'http://localhost:8085' }),
    repositoryConfig: new Configuration({ basePath: 'http://localhost:8082' }),
    conceptDescriptionRepositoryConfig: new Configuration({ basePath: 'http://localhost:8083' }),
});

// Get submodel with its concept descriptions
const withCD = await serviceWithCD.getSubmodelById({
    submodelIdentifier: 'https://example.com/ids/sm/my-submodel',
    includeConceptDescriptions: true,
});
if (withCD.success) {
    console.log('Submodel:', withCD.data.submodel);
    console.log('Concept Descriptions:', withCD.data.conceptDescriptions);
    // conceptDescriptions array contains all unique CDs referenced by:
    // - The submodel's semanticId
    // - All submodel elements' semanticId properties (recursively through collections, lists, entities)
}

// Get all submodels with concept descriptions
const listWithCD = await serviceWithCD.getSubmodelList({
    preferRegistry: false,
    includeConceptDescriptions: true,
});
if (listWithCD.success) {
    console.log('Submodels:', listWithCD.data.submodels);
    console.log('All Concept Descriptions:', listWithCD.data.conceptDescriptions);
    // Concept descriptions are deduplicated across all submodels
}

// Get submodel by endpoint with concept descriptions
const byEndpointWithCD = await serviceWithCD.getSubmodelByEndpoint({
    endpoint: 'http://localhost:8082/submodels/encoded-id',
    includeConceptDescriptions: true,
});
```

### Using Utility Functions

```typescript
import { getSubmodelElementByIdShort, extractEndpointHref, base64Encode } from 'basyx-typescript-sdk';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

// Get a submodel element by its idShort
const element = getSubmodelElementByIdShort(submodel, 'MyProperty');

// Extract endpoint from descriptor
const endpoint = extractEndpointHref(descriptor, 'AAS-3.0');

// Encode/decode IDs from Identifiables
const encoded = base64Encode('https://example.com/ids/aas/my-aas');
// Use in URL: http://localhost:8081/shells/{encoded}
```
