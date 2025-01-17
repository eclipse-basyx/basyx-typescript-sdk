import { jsonization } from '@aas-core-works/aas-core3.0-typescript';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { getAssetAdministrationShellById } from '@/generated/aas-repository';
import { createCustomClient } from '@/lib/createAasRepoClient';

export class AasRepositoryClient {
    /**
     * Returns a specific Asset Administration Shell
     *
     * @param aasIdentifier The AAS’s unique id
     * @param baseURL       The API base URL
     * @param headers       Optional request headers
     */
    async getAssetAdministrationShellById(
        aasIdentifier: string,
        baseURL: string,
        headers: Headers = new Headers()
    ): Promise<AssetAdministrationShell> {
        try {
            // 1) Create the custom client
            const client = createCustomClient(baseURL, headers);

            // 2) Call the generated function with:
            //    - client
            //    - path parameter: { aasIdentifier }
            const { data, error } = await getAssetAdministrationShellById({
                client,
                // The route is /shells/{aasIdentifier}, so we must set path:
                path: { aasIdentifier },
                // Optionally: throwOnError: false or true
            });

            if (error) {
                // The library returns an `error` if there's a server or client error
                console.error('Error from server:', error);
                throw new Error(JSON.stringify(error.messages));
            }

            // 3) Data is presumably the raw object from the response
            let aas = JSON.stringify(data);
            aas = JSON.parse(aas);
            const instanceOrError = jsonization.assetAdministrationShellFromJsonable(aas);
            if (instanceOrError.error !== null) {
                throw instanceOrError.error;
            }

            return instanceOrError.mustValue();
        } catch (error) {
            console.error('Error fetching Asset Administration Shell:', error);
            throw error;
        }
    }
}
