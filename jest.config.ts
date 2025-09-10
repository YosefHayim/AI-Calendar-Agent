import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.json" }],
  },
  resetMocks: true,
  restoreMocks: true,
  clearMocks: true,
};
export default config;
