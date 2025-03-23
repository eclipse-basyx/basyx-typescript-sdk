import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: './openapi/Plattform_i40-Entire-API-Collection-V3.0.3-resolved.yaml',
    output: {
        format: 'prettier',
        lint: 'eslint',
        path: './src/generated',
    },
    plugins: ['legacy/fetch'],
});
