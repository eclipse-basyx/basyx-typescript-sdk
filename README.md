![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/eclipse-basyx/basyx-typescript-sdk/publish.yml)
![NPM Downloads](https://img.shields.io/npm/dw/basyx-typescript-sdk)
![NPM Version](https://img.shields.io/npm/v/basyx-typescript-sdk)
![GitHub License](https://img.shields.io/github/license/eclipse-basyx/basyx-typescript-sdk)

# basyx-typescript-sdk

BaSyx TypeScript SDK for developing applications and components for the Asset Administration Shell (AAS)

## Features

Clients for the AAS API components:
- AAS Repository
- Submodel Repository (coming soon)
- Concept Description Repository (coming soon)
- AAS Registry (coming soon)
- Submodel Registry (coming soon)
- AAS Discovery Service (coming soon)
- AASX File Service (coming soon)

Utility functions for working with AAS data:
- Coming soon

## Installation

```bash
npm install basyx-typescript-sdk
# or
yarn add basyx-typescript-sdk
```

> See https://www.npmjs.com/package/basyx-typescript-sdk

---

> [!IMPORTANT]
> Make sure to install `@aas-core-works/aas-core3.0-typescript` in your project:

```bash
npm install @aas-core-works/aas-core3.0-typescript
# or
yarn add @aas-core-works/aas-core3.0-typescript
```

## Usage

```typescript
import { AasRepositoryClient, AasRepositoryService } from 'basyx-typescript-sdk';

async function getAllShells() {
    const client = new AasRepositoryClient();
    const configuration = new AasRepositoryService.Configuration({
        basePath: 'http://localhost:8081',
    });

    try {
        const response = await client.getAllAssetAdministrationShells({ configuration });
        console.log('Asset Administration Shells fetched successfully:', response);
        // You can now use the response as needed
    } catch (error) {
        console.error('Error fetching Asset Administration Shells:', error);
    }
}

getAllShells();
```
