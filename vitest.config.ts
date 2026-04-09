import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

function xmlStringPlugin() {
    return {
        name: 'xml-string-plugin',
        enforce: 'pre' as const,
        transform(code: string, id: string) {
            if (!id.endsWith('.xml')) {
                return null;
            }

            return {
                code: `export default ${JSON.stringify(code)};`,
                map: null,
            };
        },
    };
}

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [xmlStringPlugin()],
    resolve: {
        alias: {
            '@': path.resolve(rootDir, 'src'),
        },
    },
    test: {
        globals: true,
        environment: 'node',
        exclude: ['dist/**', 'node_modules/**', 'bundle/**'],
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit-tests',
                    include: ['src/unit-tests/**/*.test.ts'],
                },
            },
            {
                extends: true,
                test: {
                    name: 'integration-tests',
                    include: ['src/integration-tests/**/*.test.ts'],
                    globalSetup: ['./ci/vitestGlobalSetup.ts'],
                    fileParallelism: false,
                    maxConcurrency: 1,
                },
            },
        ],
        coverage: {
            provider: 'v8',
            reportsDirectory: 'coverage',
            reporter: ['json', 'lcov', 'text', 'clover'],
            exclude: ['src/generated/**'],
        },
    },
});
