import resolve from '@rollup/plugin-node-resolve';

export default [
    // CommonJS build
    {
        input: 'dist/index.js',
        output: {
            file: 'bundle/index.cjs',
            format: 'cjs',
            sourcemap: true,
        },
        plugins: [resolve()],
        external: ['@aas-core-works/aas-core3.0-typescript', '@hey-api/client-fetch'],
    },
    // ES Module build
    {
        input: 'dist/index.js',
        output: {
            file: 'bundle/index.mjs',
            format: 'esm',
            sourcemap: true,
        },
        plugins: [resolve()],
        external: ['@aas-core-works/aas-core3.0-typescript', '@hey-api/client-fetch'],
    },
];
