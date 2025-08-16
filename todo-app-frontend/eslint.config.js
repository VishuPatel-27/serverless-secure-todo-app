/**
 * ESLint configuration for the todo-app-frontend project.
 * This configuration extends recommended rules and includes plugins for security and code quality.
 */
import js from "@eslint/js";
import globals from "globals";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import noSecrets from "eslint-plugin-no-secrets";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["node_modules/**", "__mocks__/**", "dist/**"],
    files: ["**/*.{js,mjs,cjs}"],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        process: "readonly",
        __dirname: "readonly",
        import: "readonly",
        module: "readonly",
        exports: "readonly"
      }
    },

    plugins: {
      security,
      sonarjs,
      "no-secrets": noSecrets
    },

    rules: {
      ...js.configs.recommended.rules,
      ...security.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,

      // your custom rule
      "no-secrets/no-secrets": "error"
    }
  }
]);
