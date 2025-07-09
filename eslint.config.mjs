import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import stylisticJs from '@stylistic/eslint-plugin-js';


const combinedGlobals = {
  ...globals.browser,
  ...globals.node,
}

export default defineConfig([
  globalIgnores([  'dist/**',            // ignore all files inside dist folder
      'client/dist/**',     // optionally be more specific
      'node_modules/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: combinedGlobals,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
     plugins: {
      '@stylistic/js': stylisticJs,
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      '@stylistic/js/indent': ['error', 2],
      '@stylistic/js/linebreak-style': ['error', 'unix'],
      '@stylistic/js/quotes': ['error', 'single'],
      '@stylistic/js/semi': ['error', 'never'],
      'no-trailing-spaces': 'error',
    }
  },
  {
    // Add this block for your test files to recognize vitest globals
    files: ['**/*.test.{js,jsx,mjs,mts}'],
    languageOptions: {
      globals: {
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  
])
