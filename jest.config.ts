// jest.config.ts
import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  modulePaths: [compilerOptions.baseUrl || '<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' }),
  },
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.json' }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(@openai/agents|@openai/agents-core)/)'],
  resetMocks: true,
  restoreMocks: true,
  clearMocks: true,
};

export default config;
