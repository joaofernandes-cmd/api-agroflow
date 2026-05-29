/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/backend/tests/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/backend/tests/jest.setup.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/backend/tests/**/*.spec.ts'],
  clearMocks: true,
}

module.exports = config
