import baseConfig from "@unyx/eslint-config";

export default [
  ...baseConfig,
  {
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrors: "none" }],
    },
  },
];
