import { execSync } from 'child_process';
import path from 'path';

function getSkipDockerLifecycleReasons(): string[] {
    const reasons: string[] = [];
    if (process.env.BASYX_TEST_ENGINE_MODE === 'true') {
        reasons.push('BASYX_TEST_ENGINE_MODE=true');
    }
    if (process.env.BASYX_SKIP_DOCKER_SETUP === 'true') {
        reasons.push('BASYX_SKIP_DOCKER_SETUP=true');
    }
    return reasons;
}

export default async () => {
    if (process.env.BASYX_TEST_ENGINE_MODE === 'true' || process.env.BASYX_SKIP_DOCKER_SETUP === 'true') {
        const reasons = getSkipDockerLifecycleReasons();
        console.log(`Skipping docker teardown (${reasons.join(', ') || 'no explicit reason'}).`);
        return;
    }

    const composeFilePath = path.join(process.cwd(), 'ci/docker-compose.yml');
    execSync(`docker-compose -f ${composeFilePath} down`, { stdio: 'inherit' });
};
