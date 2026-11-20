# HelloWorld BaSyx TypeScript Example

This tutorial demonstrates how to use **Eclipse BaSyx** to create and manage an **Asset Administration Shell (AAS)** in TypeScript. 

## Overview

In this tutorial you will learn how to:

1. Set up a local Eclipse BaSyx environment with Docker  
2. Configure the BaSyx AAS Environment  
3. Install and import the BaSyx TypeScript SDK  
4. Connect to AAS and Submodel repositories and registries  
5. Create an Asset Administration Shell (AAS)  
6. Upload and register an AAS in BaSyx  
7. Create semantic references for Submodels  
8. Create and upload a Submodel  
9. Link a Submodel to an AAS  
10. Create SubmodelElementCollections  
11. Add and update Properties inside Submodels  
12. Search Submodel Elements using utility functions  
13. Debug and inspect AAS structures  
14. Delete Submodels and AAS from BaSyx  

---

## Lifecycle Summary

>Start BaSyx Environment  
>↓  
>Connect to BaSyx Services  
>↓  
>Create AAS  
>↓  
>Upload & Register AAS  
>↓  
>Create Semantic Reference  
>↓  
>Create Submodel  
>↓  
>Upload & Register Submodel  
>↓  
>Link Submodel to AAS  
>↓  
>Create SubmodelElementCollection  
>↓  
>Add Properties & Elements  
>↓  
>Update Submodel  
>↓  
>Search / Read Elements  
>↓  
>Debug & Inspect Data  
>↓  
>Delete Submodel  
>↓  
>Delete AAS  

## Running BaSyx Services

Make sure the following services are running:

- AAS Repository  
- Submodel Repository  
- AAS Registry  
- Submodel Registry  

Default endpoints used:

```typescript
const aasRegistryBaseUrl = "http://localhost:8082";
const aasRepositoryBaseUrl = "http://localhost:8081";
const submodelRegistryBaseUrl = "http://localhost:8083";
const submodelRepositoryBaseUrl = "http://localhost:8081";
```

BaSyx provides Docker images for quick setup.


## Step 1 – BaSyx Docker Setup

Before starting the implementation, make sure your BaSyx environment is running via Docker.

>You can follow the official Quick Installation Guide here:  
>https://wiki.basyx.org/en/latest/content/introduction/quickstart.html

 

## Step 2 – Configure BaSyx Environment

Configure BaSyx by editing the file:

`basyx/aas-env.properties`

Use the following configuration:

```properties
server.port=8081
basyx.backend=InMemory
basyx.environment=file:aas
basyx.cors.allowed-origins=*
basyx.cors.allowed-methods=GET,POST,PATCH,DELETE,PUT,OPTIONS,HEAD
spring.servlet.multipart.max-file-size=500MB
spring.servlet.multipart.max-request-size=500MB
```

## Step 3 – BaSyx Library Imports

Add the required BaSyx and AAS4J TypeScript dependencies:

```shell
npm install basyx-typescript-sdk
npm install @aas-core-works/aas-core3.1-typescript
```

For browser-based debugging:

```shell
npm install vite
```

Import the required SDK classes and AAS model types:

```typescript
import {
    AasService,
    SubmodelService,
    Configuration,
    getSubmodelElementByIdShort
} from 'basyx-typescript-sdk';

import {
    AssetAdministrationShell,
    Submodel,
    SubmodelElementCollection,
    Property,
    Key,
    KeyTypes,
    ReferenceTypes,
    Reference,
    DataTypeDefXsd,
    AssetInformation,
    AssetKind
} from '@aas-core-works/aas-core3.1-typescript/types';
```

The TypeScript SDK provides:

- Service clients for repositories and registries
- Utility functions
- Full AAS v3 compliant object models


## Step 4 – Connect to BaSyx

Create service instances for AAS and Submodel access.

### AAS Service

```typescript
const helloAASService = new AasService({
    aasRegistryConfig: new Configuration({
        basePath: 'http://localhost:8082'
    }),
    aasRepositoryConfig: new Configuration({
        basePath: 'http://localhost:8081'
    }),
});
```

### Submodel Service

```typescript
const helloSMService = new SubmodelService({
    submodelRegistryConfig: new Configuration({
        basePath: 'http://localhost:8083'
    }),
    submodelRepositoryConfig: new Configuration({
        basePath: 'http://localhost:8081'
    }),
});
```

These services allow you to:
- Create AAS
- Create Submodels
- Update models
- Query repositories
- Delete resources

## Step 5 – Create an AAS

Create an Asset Administration Shell in the TypeScript object model.

```typescript
const helloAAS = new AssetAdministrationShell(
    "http://example.com/aas/helloWorld",
    new AssetInformation(AssetKind.Instance)
);

helloAAS.idShort = "HelloWorldAAS";
```

## Step 6 – Upload AAS to BaSyx

Push the AAS to the repository and register it.

```typescript
await helloAASService.createAas({
    shell: helloAAS,
    registerInRegistry: true
});
```

The AAS now exists in:

- AAS Repository
- AAS Registry


## Step 7 – Create a Semantic Reference

Submodels usually contain semantic references.

```typescript
const key = new Key(
    KeyTypes.Submodel,
    "http://example.com/aas/helloWorld/submodel"
);

const ref = new Reference(
    ReferenceTypes.ExternalReference,
    [key]
);
```

Semantic references help tools understand the meaning of the model structure.


## Step 8 – Create a Submodel

Create a Submodel object.

```typescript
const helloSubmodel = new Submodel(
    "http://example.com/aas/helloWorld/submodel"
);

helloSubmodel.idShort = "helloSubmodel";
helloSubmodel.semanticId = ref;
```

## Step 9 – Upload the Submodel

Push the Submodel to the server and register it.

```typescript
await helloSMService.createSubmodel({
    submodel: helloSubmodel,
    registerInRegistry: true
});

```


## Step 10 – Link Submodel to AAS

Retrieve the AAS and add the Submodel reference.

```typescript
const helloAAS_apiResult =
    await helloAASService.getAasById({
        aasIdentifier:
            'http://example.com/aas/helloWorld'
    });

if (helloAAS_apiResult.success) {

    const helloAAS = helloAAS_apiResult.data.shell;

    (helloAAS.submodels ??= []).push(
        helloSubmodel.semanticId
    );

    await helloAASService.updateAas({
        shell: helloAAS,
        updateInRegistry: false
    });
}
```

The AAS now references the Submodel.


## Step 11 – Create a SubmodelElementCollection

Create a collection that will contain Submodel elements.

```typescript
const helloCollection =
    new SubmodelElementCollection();

helloCollection.idShort = "helloSMCollection";
```


## Step 12 – Add Collection to Submodel

Load the Submodel from the server and append the collection.

```typescript
const helloSM_apiResult =
    await helloSMService.getSubmodelById({
        submodelIdentifier:
            "http://example.com/aas/helloWorld/submodel"
    });

if (helloSM_apiResult.success) {

    const helloSM =
        helloSM_apiResult.data.submodel;

    (helloSM.submodelElements ??= []).push(
        helloCollection
    );

    await helloSMService.updateSubmodel({
        submodel: helloSM,
        updateInRegistry: false
    });
}
```

## Step 13 – Find a Submodel Element

Search a Submodel element by its `idShort`.

```typescript
var helloSMC =
    getSubmodelElementByIdShort(
        "helloSMCollection",
        helloSM
    );
```

This utility function simplifies navigation inside nested Submodels.


## Step 14 – Create a Property

Create a simple Property element.

```typescript
const helloProperty =
    new Property(DataTypeDefXsd.String);

helloProperty.idShort = "helloProperty";
helloProperty.value = "h3ll0World!";
```

## Step 15 – Add Property to Collection

Insert the Property into the collection and update the Submodel.

```typescript
((helloSMC as SubmodelElementCollection)
    .value ??= []).push(helloProperty);


await helloSMService.updateSubmodel({
    submodel: helloSM,
    updateInRegistry: false
});

```

The Submodel now contains:

```typescript
helloSMCollection
 └── helloProperty = "h3ll0World!"
```

## Step 16 – Debug the Result

Pause execution at `debugger;` by adding a Breakpoint.
You can do this for example in Browser execution by pressing F12.

You can now inspect:
- AAS Repository
- Submodel Repository
- Browser console
- REST API responses


## Step 17 – Delete Submodel and AAS

### Delete Submodel

```typescript
 await helloSMService.deleteSubmodel({
        submodelIdentifier:
            helloSubmodel.id as string,
        deleteFromRegistry: true
    });
```

### Delete AAS

```typescript
  await helloAASService.deleteAas({
        aasIdentifier:
            helloAAS.id as string,
        deleteFromRegistry: true
    });
```