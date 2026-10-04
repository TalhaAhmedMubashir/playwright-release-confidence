// Lint for the whole repo, and the honest-signal rules for tests: a test that can't fail is worse
// than no test, because it reports confidence it hasn't earned.
import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/', '.venv/', 'test-results/', 'playwright-report/', 'exploration/', 'explore/'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: { parserOptions: { projectService: { allowDefaultProject: ['*.mjs', 'scripts/*.mjs'] }, tsconfigRootDir: import.meta.dirname } },
  },
  {
    // Plain JavaScript run by Node: its globals, and no type-aware rules (it has no types).
    files: ['**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', Buffer: 'readonly', fetch: 'readonly', performance: 'readonly', setTimeout: 'readonly', AbortSignal: 'readonly', URL: 'readonly' },
    },
  },
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Tests that can't fail
      'playwright/expect-expect': ['error', { assertFunctionPatterns: ['^expect[A-Z]', '^check[A-Z]'] }],
      'playwright/missing-playwright-await': 'error',
      'playwright/no-conditional-expect': 'error',
      'playwright/no-conditional-in-test': 'error',
      'playwright/no-useless-not': 'error',
      'playwright/valid-expect': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="expect"] > Literal.arguments:first-child',
          message: 'An assertion on a constant can never fail. Assert on what the app did.',
        },
      ],
      // Tests that don't run, or don't run alone
      'playwright/no-skipped-test': 'error',
      'playwright/no-focused-test': 'error',
      // Tests that pass by luck
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/prefer-web-first-assertions': 'error',
    },
  },
);
