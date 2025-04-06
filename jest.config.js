export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
    }],
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
}; 