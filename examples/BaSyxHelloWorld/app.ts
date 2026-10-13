import { AasService, SubmodelService, Configuration, getSubmodelElementByIdShort} from 'basyx-typescript-sdk';
import { AssetAdministrationShell, Submodel, SubmodelElementCollection, Property, Key, KeyTypes, ReferenceTypes, Reference, DataTypeDefXsd, AbstractTransformer, AbstractTransformerWithContext, AbstractVisitor, AbstractVisitorWithContext, Class, EmbeddedDataSpecification, Extension, LangStringNameType, LangStringTextType, ModelType, AssetInformation, SpecificAssetId, AssetKind } from '@aas-core-works/aas-core3.1-typescript/types';

/// BaSyx Library Setup:
/// Run "npm install basyx-typescript-sdk" and "npm install @aas-core-works/aas-core3.1-typescript" from your Typescript project folder with Administrator rights.
/// THIS CODE NEEDS BASYX [AAS REPOSITORY] , [SUBMODEL REPOSITORY] , [AAS REGISTRY] and [SUBMODEL REGISTRY] RUNNING

// Recommendation: Run this example with "npm install vite" and "npm run dev --host", then open Browser on "http://localhost:5173/" and Press F12 for Debug/Sources to Debug Code

async function main(): Promise<void> {

    //Connect to AAS Environment (BaSyx Servers)
    const helloAASService = new AasService({
        aasRegistryConfig: new Configuration({ basePath: 'http://localhost:8082' }),
        aasRepositoryConfig: new Configuration({ basePath: 'http://localhost:8081' }),
    });

    const helloSMService = new SubmodelService({
        submodelRegistryConfig: new Configuration({ basePath: 'http://localhost:8083' }),
        submodelRepositoryConfig: new Configuration({ basePath: 'http://localhost:8081' }),
    });

    //Create AAS in TypeScript Object Model
    const helloAAS = new AssetAdministrationShell(
        "http://example.com/aas/helloWorld",
        new AssetInformation(AssetKind.Instance)
    );
    helloAAS.idShort = "HelloWorldAAS";

    //Push AAS from TypeScript to BaSyx AAS-Repository and register in AAS-Registry
    await helloAASService.createAas({ shell: helloAAS as AssetAdministrationShell, registerInRegistry: true }); 

    //Create SemanticId for Submodel
    const key = new Key(KeyTypes.Submodel, "http://example.com/aas/helloWorld/submodel");
    const ref = new Reference(ReferenceTypes.ExternalReference, [key])

    //Create empty Submodel in TypeScript Object Model
    const helloSubmodel = new Submodel("http://example.com/aas/helloWorld/submodel");
    helloSubmodel.idShort = "helloSubmodel";
    helloSubmodel.semanticId = ref;

    //Create empty Submodel in TypeScript Object Model
    await helloSMService.createSubmodel({ submodel: helloSubmodel as Submodel, registerInRegistry: true });

    //Get AAS from BaSyx Server and embed new Submodel. Update AAS to Server.
    const helloAAS_apiResult = await helloAASService.getAasById({ aasIdentifier: 'http://example.com/aas/helloWorld' });
    if (helloAAS_apiResult.success) {
        const helloAAS = helloAAS_apiResult.data.shell;
        (helloAAS.submodels ??= []).push(helloSubmodel.semanticId as Reference);
        await helloAASService.updateAas({ shell: helloAAS, updateInRegistry: false });
    }

    //Create new SubmodelElementCollection (SMC) in TypeScript Object Model
    const helloCollection = new SubmodelElementCollection();
    helloCollection.idShort = "helloSMCollection";


    //Get Submodel Element from Submodel Service (Submodel Server) and add a Property to the SMC (Update), then re-push it to the Server    
    const helloSM_apiResult = await helloSMService.getSubmodelById({ submodelIdentifier: "http://example.com/aas/helloWorld/submodel" });
    if (helloSM_apiResult.success) {

        //Load Submodel from API Result
        const helloSM = helloSM_apiResult.data.submodel;

        //Push SMC to Submodel and update Submodel on Server
        (helloSM.submodelElements ??= []).push(helloCollection as SubmodelElementCollection);
        await helloSMService.updateSubmodel({ submodel: helloSM, updateInRegistry: false }) //Problem:With Registry it does not work

        // Find a SubmodelElement inside a Submodel or SubmodelElement by its idShort
        var helloSMC = getSubmodelElementByIdShort("helloSMCollection", helloSM);

        //Create new Property in TypeScript Object Model
        const helloProperty = new Property(DataTypeDefXsd.String);
        helloProperty.idShort = "helloProperty";
        helloProperty.value = "h3ll0World!";

        //Add a Property to the SMC (Update), then update the whole Submodel to the Server
        ((helloSMC as SubmodelElementCollection).value ??= []).push(helloProperty as Property);
        await helloSMService.updateSubmodel({ submodel: helloSM, updateInRegistry: false }); //Problem:With Registry it does not work
    }

    //STOP EXECUTION HERE TO SEE RESULTS
    debugger;
    //REST OF EXAMPLE CODE WILL DELETE EVERYTHING CREATED

    // Delete Submodel
    await helloSMService.deleteSubmodel({ submodelIdentifier: helloSubmodel.id as string, deleteFromRegistry: true });

    // Delete AAS
    await helloAASService.deleteAas({ aasIdentifier: helloAAS.id as string, deleteFromRegistry: true });

}

// Run
main().catch(console.error);