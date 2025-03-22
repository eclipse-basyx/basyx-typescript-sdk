module.exports = {
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
};
