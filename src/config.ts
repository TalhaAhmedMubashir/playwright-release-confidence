// Where the tests run, and what they may do there.

/** Our own copy of the app, started from docker-compose.yml. */
export const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:8080';

// Test data, sign-ins and setting changes go only to our own copy, never to someone else's live
// site: a mistyped address must stop the run, not reach the public demo.
const host = new URL(BASE_URL).hostname;
if (host !== 'localhost' && host !== '127.0.0.1') {
  throw new Error(`BASE_URL is ${BASE_URL}. These tests only run against our own copy of the app, on this machine.`);
}

/** Where the setup project keeps the admin's signed-in browser session for the admin UI tests. */
export const ADMIN_STATE = '.auth/admin.json';

/** The app's published default login (its README). Our copy starts with it. */
export const ADMIN = {
  username: process.env['RBP_ADMIN_USER'] ?? 'admin',
  password: process.env['RBP_ADMIN_PASSWORD'] ?? 'password',
} as const;

/**
 * Tests that change what every visitor sees (the B&B's branding) run only when this flag is set,
 * and always put the original back. See src/guard.ts.
 */
export const ALLOW_SITE_SETTINGS_CHANGES = process.env['ALLOW_SITE_SETTINGS_CHANGES'] === '1';

/** The flagship's issues, where each known bug is tracked. */
export const issue = (number: number) => ({ type: 'issue', description: `https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/${number}` });
