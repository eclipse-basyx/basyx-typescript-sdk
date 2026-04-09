function xmlStringPlugin() {
    return {
        name: 'xml-string-plugin',
        transform(code, id) {
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

export default [
    {
        input: 'dist/index.js',
        output: {
            file: 'bundle/index.cjs',
            format: 'cjs',
            sourcemap: true,
        },
        plugins: [xmlStringPlugin()],
        external: ['@hey-api/client-fetch'],
    },
    {
        input: 'dist/index.js',
        output: {
            file: 'bundle/index.mjs',
            format: 'esm',
            sourcemap: true,
        },
        plugins: [xmlStringPlugin()],
        external: ['@hey-api/client-fetch'],
    },
];
