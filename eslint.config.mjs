import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default defineConfig(
  [
    { files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], plugins: { js }, extends: ['js/recommended'] },
    { files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], languageOptions: { globals: globals.browser } },
    tseslint.configs.recommended,
  ],
  {
    rules: {
      'no-unused-vars': 'error',
      'eslint no-unassigned-vars': 'error',
      'eslint no-template-curly-in-string': 'error',
      'prefer-const': 'warn',
      'keyword-spacing': ['error', { before: true, after: true }],
    },
  },
);
