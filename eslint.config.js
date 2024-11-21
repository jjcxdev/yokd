import comments from '@eslint-community/eslint-plugin-eslint-comments/configs'
import react from '@eslint-react/eslint-plugin'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import eslintPluginImportX from 'eslint-plugin-import-x'
import regexPlugin from 'eslint-plugin-regexp'
import security from 'eslint-plugin-security'
import tailwind from 'eslint-plugin-tailwindcss'
// import globals from 'globals'
import tseslint from 'typescript-eslint'

const compat = new FlatCompat({
  baseDirectory: '.',
})

const config = tseslint.config(
  {
    ignores: [
      '.next',
      'node_modules',
      '.yarn',
      'eslint.config.mjs',
      'next.config.mjs',
      'postcss.config.mjs',
      'coverage',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: '.',
        project: '@typescript-eslint/parser',
        ecmaVersion: 2017,
      },
    },
  },
  // Base
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  // ...tseslint.configs.stylisticTypeChecked,
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.typescript,
  comments.recommended,
  regexPlugin.configs['flat/recommended'],
  security.configs.recommended,

  // Next.js / React
  ...compat.extends('plugin:@next/next/recommended'),
  ...compat.extends('plugin:react-hooks/recommended'),
  ...compat.plugins('react-compiler'),
  react.configs['recommended-type-checked'],

  // Tailwind
  ...tailwind.configs['flat/recommended'],

  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      ecmaVersion: 2017,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: '.',
        ecmaFeatures: {
          jsx: true,
        },
      },
      // globals: {
      //   ...globals.browser,
      //   ...globals.node,
      // },
    },
    settings: {
      tailwindcss: {
        callees: ['classnames', 'clsx', 'ctl', 'cn', 'cva'],
      },
    },
    rules: {
      '@/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        {
          allowConstantLoopConditions: true,
        },
      ],
      '@typescript-eslint/consistent-type-exports': [
        'error',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      'import-x/no-unresolved': ['error', { ignore: ['geist'] }],
      'react-compiler/react-compiler': 'error',
    },
  },
  {
    files: ['**/*.cjs', '**/*.cts'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },

  prettierConfig,
)

export default config