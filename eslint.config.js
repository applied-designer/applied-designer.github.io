import react from 'eslint-plugin-react';

export default [
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: {
      react,
    },
    ignores: ['src/test/**', 'src/tests/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'indent': ['error', 4, {
        SwitchCase: 1
      }],
      'react/jsx-indent': ['error', 4],
      'react/jsx-indent-props': ['error', 4],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
