![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/eclipse-basyx/basyx-typescript-sdk/publish.yml)
![NPM Downloads](https://img.shields.io/npm/dw/basyx-typescript-sdk)
![NPM Version](https://img.shields.io/npm/v/basyx-typescript-sdk)
![GitHub License](https://img.shields.io/github/license/eclipse-basyx/basyx-typescript-sdk)

# basyx-typescript-sdk

BaSyx TypeScript SDK for developing applications and components for the Asset Administration Shell (AAS)

## Features

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
```

### Using Utility Functions

```typescript
import { getSubmodelElementByIdShort, extractEndpointHref, base64Encode } from 'basyx-typescript-sdk';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

// Get a submodel element by its idShort
const element = getSubmodelElementByIdShort(submodel, 'MyProperty');

// Extract endpoint from descriptor
const endpoint = extractEndpointHref(descriptor, 'AAS-3.0');

// Encode/decode IDs for BaSyx URLs
const encoded = base64Encode('https://example.com/ids/aas/my-aas');
// Use in URL: http://localhost:8081/shells/{encoded}
```
