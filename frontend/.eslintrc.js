module.exports = {
  parser: 'babel-eslint',
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    indent: [
      'warn',
      2,
      {
        SwitchCase: 1,
      },
    ],
    'linebreak-style': ['error', 'unix'],
    quotes: ['warn', 'single'],
    semi: ['warn', 'never'],
  },
  settings: {
    react: {
      createClass: 'createReactClass',
      pragma: 'React',
      version: '16.7.0',
      flowVersion: '0.53',
    },
  },
}
