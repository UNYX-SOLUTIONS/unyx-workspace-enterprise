import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export const baseConfig = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
];

export const tsConfig = [
  ...baseConfig,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrors: "none", ignoreRestSiblings: true },
      ],
    },
  },
];

export default tsConfig;
