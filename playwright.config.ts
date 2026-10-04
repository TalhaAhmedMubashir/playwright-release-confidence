import { defineConfig, devices } from '@playwright/test';
import { BASE_URL } from './src/config.ts';

// Projects:
//   setup     signs in once through the real sign-in page; the admin UI tests reuse the session
//   api       the REST API, no browser
//   chromium, firefox, webkit   the UI, in each browser (pull requests run chromium only)
//   a11y      accessibility scans and the keyboard check, in Chromium
//   meta      the honest-signal checks on the suite itself; needs neither app nor browser

const ci = Boolean(process.env['CI']);

export default defineConfig({
  testDir: 'tests',
  forbidOnly: ci,
  // A flaky test gets fixed, not retried; the gate fails a flaky result anyway.
  retries: 0,
  workers: ci ? 2 : undefined,
  reporter: ci
    ? [['list'], ['github'], ['blob'], ['json', { outputFile: 'test-results/results.json' }], ['html', { open: 'never' }]]
    : [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: BASE_URL,
    // The app shows prices in pounds and dates by the browser's clock: fix both.
    locale: 'en-GB',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testDir: 'tests/setup', testMatch: /\.setup\.ts$/, use: { ...devices['Desktop Chrome'] } },
    { name: 'api', testDir: 'tests/api' },
    { name: 'chromium', testDir: 'tests/ui', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
    { name: 'firefox', testDir: 'tests/ui', use: { ...devices['Desktop Firefox'] }, dependencies: ['setup'] },
    { name: 'webkit', testDir: 'tests/ui', use: { ...devices['Desktop Safari'] }, dependencies: ['setup'] },
    { name: 'a11y', testDir: 'tests/a11y', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
    { name: 'meta', testDir: 'tests/meta' },
  ],
});
