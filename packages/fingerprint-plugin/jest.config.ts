import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/src/$1',
  },
  preset: 'ts-jest',
  roots: ['<rootDir>/src/'],
}

export default config
