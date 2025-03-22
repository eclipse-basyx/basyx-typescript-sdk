import { execSync } from 'child_process';
import path from 'path';

export default async () => {
    const composeFilePath = path.join(process.cwd(), 'ci/docker-compose.yml');
    execSync(`docker-compose -f ${composeFilePath} down`, { stdio: 'inherit' });
};
