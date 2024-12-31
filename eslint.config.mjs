import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import react from "@eslint-react/eslint-plugin";
import nextPlugin from "@next/eslint-plugin-next";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import eslintPluginImportX from "eslint-plugin-import-x";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import regexPlugin from "eslint-plugin-regexp";
import security from "eslint-plugin-security";
import tailwind from "eslint-plugin-tailwindcss";
import * as tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".yarn/**",
      "next.config.mjs",
      "postcss.config.mjs",
      "coverage/**",
      "public/**",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint,
      "simple-import-sort": simpleImportSort,
      "import-x": eslintPluginImportX,
      regexp: regexPlugin,
      security,
      tailwindcss: tailwind,
      "@eslint-comments": comments,
      react,
      next: nextPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      next: {
        rootDir: ".",
      },
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import-x/order": "off",
      "import-x/no-named-as-default-member": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "next/no-html-link-for-pages": "off",
    },
  },
  prettierConfig,
];
