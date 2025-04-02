import globals from 'globals';
import pluginJs from '@eslint/js';
import ts from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default ts.config(
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...ts.configs.recommended,
  eslintPluginPrettierRecommended,
  // Custom config
  {
    ignores: [
      '**/build/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/.wrangler/**',
      'eslint.config.js',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parser: ts.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
        chrome: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'import-x/no-unresolved': 'off',
      'import-x/no-named-as-default-member': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      'prettier/prettier': 'off',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
);
