const path = require('path');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack'); // Import webpack itself

module.exports = {
  // Set mode to 'development' for easier debugging, 'production' for optimized builds
  mode: 'development', // or 'production'

  // Explicitly set target for browser environment. This helps Webpack
  // understand that it's bundling for a web browser, not Node.js.
  target: 'web',

  // The entry point for your application. Webpack starts bundling from here.
  entry: './frontend-src/main.js',

  // The output configuration for the bundled files.
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true, // Clean the output directory before emit.
  },

  // Define how modules are resolved.
  resolve: {
    // Allows you to import modules without specifying their extensions.
    extensions: ['.js', '.json', '.mjs'], // Added .mjs here for explicit resolution
    // Crucial: Add 'browser' to mainFields to prioritize browser-specific entry points
    mainFields: ['browser', 'module', 'main'],
    fallback: {
      // Node.js polyfills for browser environment.
      // These are necessary for libraries that might depend on Node.js built-ins.
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "util": require.resolve("util/"),
      "assert": require.resolve("assert/"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "url": require.resolve("url/"),
      // Explicitly map 'process' to its browser polyfill.
      // This is often more reliable than relying solely on ProvidePlugin for direct imports.
      "process": require.resolve("process/browser.js")
    },
    // REMOVED: The explicit 'alias' for 'process'.
    // The 'fallback' combined with 'ProvidePlugin' should be sufficient
    // and the alias was causing over-resolution.
  },

  plugins: [
    // Loads environment variables from a .env file into process.env
    new Dotenv({
      path: './.env',
      safe: true,
      allowEmptyValues: true,
      systemvars: true,
      silent: true,
      defaults: false
    }),
    // Provides polyfills for Node.js global variables like 'process' and 'Buffer'.
    // This makes 'process' and 'Buffer' available globally within your bundled code,
    // and also helps when modules expect these globals.
    new webpack.ProvidePlugin({
      process: 'process/browser.js', // Maps 'process' to 'process/browser'
      Buffer: ['buffer', 'Buffer'], // Maps 'Buffer' to the Buffer export from 'buffer' package
    }),
  ],

  module: {
    rules: [
      // Rule to handle .mjs files. This is important for modern ES Modules
      // that might be used by Amplify or its dependencies.
      {
        test: /\.mjs$/,
        include: /node_modules/, // Only apply to .mjs files within node_modules
        type: 'javascript/auto', // Treat as standard JavaScript module
      },
    ],
  },
};
