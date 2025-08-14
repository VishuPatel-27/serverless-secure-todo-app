/**
 * ESLint configuration for a Node.js project using CommonJS modules.
 * This configuration includes plugins for Node.js best practices, promise handling,
 * security, and secret detection.
 * It is tailored for a backend application, ignoring certain directories like node_modules and .aws-sam.
 * The configuration also sets up specific rules for test files located in the tests directory.
 */
const js = require('@eslint/js');
const nodePlugin = require('eslint-plugin-node');
const promisePlugin = require('eslint-plugin-promise');
const securityPlugin = require('eslint-plugin-security');
const noSecretsPlugin = require('eslint-plugin-no-secrets');
const globals = require('globals');

module.exports = [

  // Ignore specific directories
  {
    ignores: [
      'node_modules/**',
      '.aws-sam/**',
      'venv/**',
    ],
  },
  // Base config from ESLint
  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
        process: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      }
    },
    settings: {
      node: {
        tryExtensions: ['.js', '.json', '.node']
      },
    },
    plugins: {
      node: nodePlugin,
      promise: promisePlugin,
      security: securityPlugin,
      noSecrets: noSecretsPlugin,
    },
    rules: {
      /**
       * Custom rules
       * These rules are set based on common best practices for Node.js applications,
       * focusing on code quality, security, and maintainability.
       * Adjust the severity levels (off, warn, error) as needed for your project.
       */
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'radix': 'error', // Enforce the use of radix parameter with parseInt
      'no-implied-eval': 'error', // Avoid setTimeout/setInterval with string arguments
      eqeqeq: ['error', 'always'], // Enforce strict equality

      // Promise plugin rules
      'promise/no-nesting': 'warn',
      'promise/always-return': 'off',

      // evaluation and security
      'no-eval': 'error',
      'no-new-func': 'error',

      // Security plugin rules
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-require': 'warn',
      'security/detect-child-process': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-buffer-noassert': 'error',

      // Secrets detection plugin
      'noSecrets/no-secrets': ['error', { tolerance: 4.2 }],
    },
  },

  // Override for test files
  {
    files: ['tests/**/*.js'],
    rules: {
      // Relax certain rules for test files
      'no-unused-expressions': 'off',
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
];
