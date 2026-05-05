import { execSync } from 'child_process';
import path from 'path';

export default async () => {
    if (process.env.BASYX_TEST_ENGINE_MODE === 'true' || process.env.BASYX_SKIP_DOCKER_SETUP === 'true') {
        console.log('Skipping docker teardown for test engine mode.');
        return;
    }

    const composeFilePath = path.join(process.cwd(), 'ci/docker-compose.yml');
    execSync(`docker-compose -f ${composeFilePath} down`, { stdio: 'inherit' });
};
