import resolve from '@rollup/plugin-node-resolve';
import { string } from 'rollup-plugin-string';

export default [
    // CommonJS build
    {
        input: 'dist/index.js',
        output: {
            file: 'bundle/index.cjs',
            format: 'cjs',
            sourcemap: true,
        },
        plugins: [
            string({
                include: '**/*.xml',
            }),
            resolve(),
        ],
        external: ['@aas-core-works/aas-core3.1-typescript', '@hey-api/client-fetch'],
    },
    // ES Module build
    {
        input: 'dist/index.js',
        output: {
            file: 'bundle/index.mjs',
            format: 'esm',
            sourcemap: true,
        },
        plugins: [
            string({
                include: '**/*.xml',
            }),
            resolve(),
        ],
        external: ['@aas-core-works/aas-core3.1-typescript', '@hey-api/client-fetch'],
    },
];
