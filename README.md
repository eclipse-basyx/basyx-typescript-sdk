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
```

## Usage

```typescript
import { AasRepositoryClient } from 'basyx-typescript-sdk';

async function getAllShells() {
    const baseURL = 'http://localhost:8081';
    const client = new AasRepositoryClient();

    try {
        const response = await client.getAllAssetAdministrationShells(baseURL);
        console.log('Asset Administration Shells fetched successfully:', response);
        // You can now use the response as needed
    } catch (error) {
        console.error('Error fetching Asset Administration Shells:', error);
    }
}

getAllShells();
```
