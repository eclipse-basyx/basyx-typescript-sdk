import { jsonization } from '@aas-core-works/aas-core3.0-typescript';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { AssetAdministrationShellRepositoryApiService } from '@/generated/aas-repository';

export class AasRepositoryClient {
    private api: AssetAdministrationShellRepositoryApiService;

    constructor() {
        this.api = new AssetAdministrationShellRepositoryApiService();
    }

    /**
     * Creates a new Asset Administration Shell
     * @param {AssetAdministrationShell} shell - The Asset Administration Shell object to create
     * @returns {Promise<AssetAdministrationShell>} - The created Asset Administration Shell
     * @throws {Error} - Throws an error if the creation fails
     */
    async createAssetAdministrationShell(shell: AssetAdministrationShell): Promise<AssetAdministrationShell> {
        try {
            // Convert the Asset Administration Shell to the correct format for the API
            const apiShell = shell as any;
            const response = await AssetAdministrationShellRepositoryApiService.postAssetAdministrationShell(apiShell);
            const jsonResponse = JSON.stringify(response);
            const instanceOrError = jsonization.assetAdministrationShellFromJsonable(jsonResponse);
            if (instanceOrError.error !== null) {
                throw instanceOrError.error;
            }
            const createdShell = instanceOrError.mustValue();
            return createdShell;
        } catch (error) {
            console.error('Error creating Asset Administration Shell:', error);
            throw error;
        }
    }

    /**
     *
     * @summary Returns a specific Asset Administration Shell
     * @param {string} aasIdentifier The Asset Administration Shell’s unique id (UTF8-BASE64-URL-encoded)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getAssetAdministrationShellById(aasIdentifier: string): Promise<AssetAdministrationShell> {
        try {
            const response =
                await AssetAdministrationShellRepositoryApiService.getAssetAdministrationShellById(aasIdentifier);
            const jsonResponse = JSON.stringify(response);
            const parsedJson = JSON.parse(jsonResponse);
            const instanceOrError = jsonization.assetAdministrationShellFromJsonable(parsedJson);
            if (instanceOrError.error !== null) {
                throw instanceOrError.error;
            }
            const receivedShell = instanceOrError.mustValue();
            return receivedShell;
        } catch (error) {
            console.error('Error fetching Asset Administration Shell:', error);
            throw error;
        }
    }
}
