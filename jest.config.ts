module.exports = {
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    projects: [
        {
            displayName: 'unit-tests',
            preset: 'ts-jest',
            testEnvironment: 'node',
            testMatch: ['**/unit-tests/**/*.test.ts'],
            moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/src/$1',
            },
            moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
            transform: {
                '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
            },
            coveragePathIgnorePatterns: ['<rootDir>/src/generated/'],
            testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/', '<rootDir>/bundle/'],
        },
        {
            displayName: 'integration-tests',
            preset: 'ts-jest',
            testEnvironment: 'node',
            globalSetup: './ci/globalSetup.ts',
            globalTeardown: './ci/globalTeardown.ts',
            testMatch: ['**/integration-tests/**/*.test.ts'],
            moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/src/$1',
            },
            moduleFileExtensions: ['ts', 'js', 'json', 'node'],
            transform: {
                '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
            },
            coveragePathIgnorePatterns: ['<rootDir>/src/generated/'],
            testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/', '<rootDir>/bundle/'],
        },
    ],
};
