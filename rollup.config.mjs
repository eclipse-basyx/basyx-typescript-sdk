import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
    // Use your compiled entry point from the dist folder
    input: 'dist/index.js',
    output: {
        file: 'bundle/index.js',
        format: 'esm',
        sourcemap: true,
    },
    plugins: [
        resolve(), // helps Rollup find node_modules packages
        commonjs(), // converts CommonJS modules to ES6, so they can be included in a Rollup bundle
    ],
    // Externalize dependencies that shouldn't be bundled
    external: ['@aas-core-works/aas-core3.0-typescript', '@hey-api/client-fetch'],
};
