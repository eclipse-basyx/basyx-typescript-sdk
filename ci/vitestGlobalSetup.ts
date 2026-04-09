import globalSetup from './globalSetup';
import globalTeardown from './globalTeardown';

export default async function vitestGlobalSetup() {
    await globalSetup();

    return async () => {
        await globalTeardown();
    };
}
