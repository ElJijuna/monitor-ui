import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        module: 'CommonJS',
        moduleResolution: 'node',
        jsx: 'react-jsx',
      },
    }],
  },
  moduleNameMapper: {
    '^@gnome-ui/react/components/(.*)$': '<rootDir>/__mocks__/@gnome-ui/react-component-mock.ts',
    '^@gnome-ui/charts/components/(.*)$': '<rootDir>/__mocks__/@gnome-ui/charts-component-mock.ts',
    '^@gnome-ui/(.*)$': '<rootDir>/__mocks__/@gnome-ui/$1.ts',
    '\\.css$': '<rootDir>/__mocks__/fileMock.ts',
  },
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/index.ts',
    '!src/types/**',
    '!src/**/*.stories.*',
  ],
  coverageThreshold: {
    global: { lines: 70, functions: 70 },
  },
}

export default config
