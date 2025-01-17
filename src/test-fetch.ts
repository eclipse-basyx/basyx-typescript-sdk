import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { AasRepositoryClient } from './clients/AasRepositoryClient';

(async () => {
    const client = new AasRepositoryClient();
    const aasId = 'aas-123'; // Replace with a valid AAS ID

    try {
        const fetchedAAS: AssetAdministrationShell = await client.getAssetAdministrationShellById(aasId);
        console.log('Fetched Asset Administration Shell:', fetchedAAS);
    } catch (error) {
        console.error('Error fetching Asset Administration Shell:', error);
    }
})();
