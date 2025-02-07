import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'dist/index.js',
    output: {
        file: 'bundle/index.js',
        format: 'esm',
        sourcemap: true,
    },
    plugins: [resolve()],
    external: ['@aas-core-works/aas-core3.0-typescript', '@hey-api/client-fetch'],
};
