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

        for (const task of pendingTasks) {
            await task();
        }
    });

    return {
        track(task: CleanupTask): void {
            tasks.push(task);
        },
    };
}
