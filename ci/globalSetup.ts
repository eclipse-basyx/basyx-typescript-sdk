import { execSync } from 'child_process';
import path from 'path';

async function waitForContainer(containerName: string, timeoutMs = 300000, intervalMs = 1000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            const output = execSync(`docker inspect --format='{{json .State.Health.Status}}' ${containerName}`)
                .toString()
                .trim();
            if (output.includes('healthy')) {
                console.log(`${containerName} is healthy.`);
                return;
            }
        } catch {
            // Container might not be ready yet
            console.warn(`Waiting for ${containerName} to become healthy...`);
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error(`Timeout waiting for ${containerName} to become healthy.`);
}

export default async () => {
    try {
        const composeFilePath = path.join(process.cwd(), 'ci/docker-compose.yml');
        execSync(`docker-compose -f ${composeFilePath} up -d`, { stdio: 'inherit' });

        // Wait for the desired containers to be healthy.
        await waitForContainer('aas-registry');
        await waitForContainer('submodel-repository');
        await waitForContainer('cd-repository');
        await waitForContainer('aas-repository');
        await waitForContainer('sm-registry');
        await waitForContainer('aas-discovery');
        await waitForContainer('aasx-file-server');
    } catch (error) {
        console.error('Error starting Docker containers:', error);
        process.exit(1);
    }
};
