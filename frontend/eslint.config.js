// ESLint 9.x flat config for Next.js
// Using direct imports from eslint-config-next

const nextConfig = require("eslint-config-next");

const eslintConfig = [
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**"],
  },
  ...nextConfig,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

module.exports = eslintConfig;