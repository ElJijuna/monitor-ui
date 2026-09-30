import type { Config } from 'jest';
import jestConfig from 'super-configs/jest';

const config: Config = {
  ...jestConfig,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Replaces the shared ts-jest transform: the library compiles ESM + react-jsx for Vite,
  // while Jest needs CommonJS.
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'node',
          jsx: 'react-jsx',
          esModuleInterop: true,
          ignoreDeprecations: '6.0',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@gnome-ui/react/components/(.*)$': '<rootDir>/__mocks__/@gnome-ui/react-component-mock.ts',
    '^@gnome-ui/charts/components/(.*)$': '<rootDir>/__mocks__/@gnome-ui/charts-component-mock.ts',
    '^@gnome-ui/(.*)$': '<rootDir>/__mocks__/@gnome-ui/$1.ts',
    '^monitor-api/react$': '<rootDir>/__mocks__/monitor-api/react.ts',
    '^monitor-api$': '<rootDir>/__mocks__/monitor-api.ts',
    '\\.css$': '<rootDir>/__mocks__/fileMock.ts',
  },
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/index.ts',
    '!src/types/**',
    '!src/**/*.stories.*',
    '!src/stories/**',
    '!src/test-utils/**',
  ],
  coverageThreshold: {
    global: { lines: 70, functions: 70 },
  },
};

export default config;
