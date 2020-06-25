module.exports = {
  root: true,
  parser: 'babel-eslint',
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  rules: {
    semi: [2, "always"],
    'space-before-function-paren': [0, "never"],
    'no-trailing-spaces': ["error", { "skipBlankLines": true }],
  },
  globals: {}
}
