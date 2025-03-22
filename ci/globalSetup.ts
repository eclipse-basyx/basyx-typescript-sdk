import { execSync } from 'child_process';
import path from 'path';

export default async () => {
    try {
        const composeFilePath = path.join(process.cwd(), 'ci/docker-compose.yml');
        execSync(`docker-compose -f ${composeFilePath} up -d`, { stdio: 'inherit' });
    } catch (error) {
        console.error('Error starting Docker containers:', error);
        process.exit(1);
    }

    // Optionally replace the fixed timeout with a health check poll.
    await new Promise((resolve) => setTimeout(resolve, 15000));
};
