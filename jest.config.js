const config = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    coveragePathIgnorePatterns: ['src/test-utils'],
    coverageThreshold: {
        global: {
            statements: 85,
            lines: 85,
            branches: 80,
            functions: 75,
        },
    },
}

module.exports = config
