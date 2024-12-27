/* eslint-disable import-x/no-named-as-default-member */
import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import react from "@eslint-react/eslint-plugin";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import eslintPluginImportX from "eslint-plugin-import-x";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import regexPlugin from "eslint-plugin-regexp";
import security from "eslint-plugin-security";
import tailwind from "eslint-plugin-tailwindcss";
import * as tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const compat = new FlatCompat({
  baseDirectory: ".",
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".yarn/**",
      "next.config.mjs",
      "postcss.config.mjs",
      "coverage/**",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint,
      "simple-import-sort": simpleImportSort,
      "import-x": eslintPluginImportX,
      regexp: regexPlugin,
      security: security,
      tailwindcss: tailwind,
      "@eslint-comments": comments,
      react: react,
    },
    languageOptions: {
      ecmaVersion: 2017,
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
    },
    settings: {
      tailwindcss: {
        callees: ["classnames", "clsx", "ctl", "cn", "cva"],
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import-x/order": "off",
      // Add this to ignore path alias errors
      "import-x/no-unresolved": [
        "error",
        {
          ignore: ["geist", "@clerk/nextjs", "\\./.*", "\\.\\./.*", "^@/"], // Add ^@/ to ignore path aliases
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        { allowConstantLoopConditions: true },
      ],
      "@typescript-eslint/consistent-type-exports": [
        "error",
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
    },
  },
  prettierConfig,
];
