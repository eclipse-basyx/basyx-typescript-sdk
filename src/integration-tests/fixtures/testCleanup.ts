import { afterEach, beforeEach } from 'vitest';

export type CleanupTask = () => Promise<void> | void;

export function createPerTestCleanupRunner() {
    let tasks: CleanupTask[] = [];

    beforeEach(() => {
        tasks = [];
    });

    afterEach(async () => {
        const pendingTasks = [...tasks].reverse();
        tasks = [];
        const cleanupErrors: Error[] = [];

        for (const task of pendingTasks) {
            try {
                await task();
            } catch (error) {
                cleanupErrors.push(error instanceof Error ? error : new Error(String(error)));
            }
        }

        if (cleanupErrors.length > 0) {
            throw new AggregateError(cleanupErrors, 'One or more cleanup tasks failed');
        }
    });

    return {
        track(task: CleanupTask): void {
            tasks.push(task);
        },
    };
}
