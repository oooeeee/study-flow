import { createRequire } from 'module'
import { resolve } from 'path'

const requireFromFrontend = createRequire(
  resolve(process.cwd(), 'frontend/package.json'),
)

const tsParser = requireFromFrontend('@typescript-eslint/parser')
const tsPlugin = requireFromFrontend('@typescript-eslint/eslint-plugin')
const prettierConfig = requireFromFrontend('eslint-config-prettier')

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
  {
    files: ['frontend/src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs['recommended'].rules,
    },
  },
  prettierConfig,
]
