import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "node_modules/**",
    "next-env.d.ts",
    "server/**",        // server is compiled separately via tsconfig.server.json
    "prisma/**",
    "public/**",
  ]),
  {
    rules: {
      // Allow unused vars prefixed with _
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // We intentionally use any in a few spots with eslint-disable comments
      "@typescript-eslint/no-explicit-any": "off",
      // Allow empty catch blocks
      "@typescript-eslint/no-empty-object-type": "off",
      // React unescaped entities
      "react/no-unescaped-entities": "off",
      // img element — we use next/image where needed
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
