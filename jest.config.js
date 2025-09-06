export default {
  preset: "ts-jest",
  testEnvironment: 'node',
  transform: { 
    '^.+\\.tsx?$': ['ts-jest', { 
      tsconfig: 'tsconfig.json', 
      useESM: true 
    }] 
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@db/(.*)\\.js$': '<rootDir>/src/db/$1.ts',
    '^@repos/(.*)\\.js$': '<rootDir>/src/repos/$1.ts',
    '^@types\\.js$': '<rootDir>/src/types.ts'
  },
  testMatch: ['<rootDir>/src/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts']
};
