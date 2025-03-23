import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import ts from 'typescript-eslint';

export default [
    {
        ignores: ['node_modules', 'dist', 'src/generated', 'bundle', 'coverage', 'docs'],
    },

    {
        languageOptions: {
            ecmaVersion: 'latest',
            globals: {
                process: 'readonly',
            },
        },
    },

    // js
    js.configs.recommended,

    // ts
    ...ts.configs.recommended,

    // Sort imports
    {
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        [
                            '^\\u0000', // all side effects (0 at start)
                            '^[^/\\.].*\u0000$', // external types (0 at end)
                            '^\\..*\u0000$', // internal types (0 at end)
                            '^@?\\w', // Starts with @
                            '^[^.]', // any
                            '^\\.', // local
                        ],
                    ],
                },
            ],
            'simple-import-sort/exports': 'error',
            '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
        },
    },

    // Prettier
    {
        plugins: {
            prettier,
        },
        rules: {
            'prettier/prettier': 'error',
        },
    },

    // Disable rules that conflict with Prettier
    eslintConfigPrettier,
];
