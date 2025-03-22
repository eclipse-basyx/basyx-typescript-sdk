module.exports = {
    projects: [
        {
            displayName: 'unit-tests',
            preset: 'ts-jest',
            testEnvironment: 'node',
            moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/src/$1',
            },
            moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
            transform: {
                '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
            },
            collectCoverage: true,
            coverageDirectory: 'coverage',
            coverageReporters: ['json', 'lcov', 'text', 'clover'],
            coveragePathIgnorePatterns: ['<rootDir>/src/generated/'],
            testPathIgnorePatterns: [
                '<rootDir>/dist/',
                '<rootDir>/node_modules/',
                '<rootDir>/bundle/',
                '<rootDir>/src/integration-tests/', // Ignore integration tests in unit test runs
            ],
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
            collectCoverage: false, // Disable coverage for integration tests
            coverageDirectory: 'coverage',
            coverageReporters: ['json', 'lcov', 'text', 'clover'],
            coveragePathIgnorePatterns: ['<rootDir>/src/generated/'],
            testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/', '<rootDir>/bundle/'],
        },
    ],
};
