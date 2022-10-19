import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/src/$1',
  },
  preset: 'ts-jest',
  roots: ['<rootDir>/src/'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

export default config
