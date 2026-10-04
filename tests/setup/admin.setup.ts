import { expect, test as setup } from '@playwright/test';
import { ADMIN, ADMIN_STATE } from '../../src/config.ts';
import { AdminPage } from '../../src/pages/admin.ts';

// Signs in once, through the real sign-in page, and keeps the browser session for the admin UI tests.
setup('sign in as the admin and keep the session', { tag: '@setup' }, async ({ page }) => {
  const admin = new AdminPage(page);
  await admin.gotoSignIn();
  await admin.signIn(ADMIN);
  await expect(page).toHaveURL(/\/admin\/rooms$/);
  await page.context().storageState({ path: ADMIN_STATE });
});
