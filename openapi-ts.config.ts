import { defaultPlugins, defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: './openapi/Plattform_i40-Entire-API-Collection-V3.0.3-resolved.yaml',
    output: {
        format: 'prettier',
        lint: 'eslint',
        path: './src/generated',
    },
    plugins: [
        ...defaultPlugins,
        '@hey-api/schemas',
        {
            name: '@hey-api/sdk',
            transformer: true,
        },
    ],
});
