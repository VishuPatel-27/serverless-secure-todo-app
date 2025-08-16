/**
 * This tells Babel to transpile modern JS for the current Node environment 
 * and allow Jest to handle ES modules properly.
 */

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        modules: 'auto',
      },
    ],
  ],
};
