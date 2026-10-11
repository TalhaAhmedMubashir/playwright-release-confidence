import { expect, test } from '@playwright/test';
import { type Api, read } from './api/client.ts';
import { Branding } from './api/schemas.ts';
import { ALLOW_SITE_SETTINGS_CHANGES } from './config.ts';

/** What the guard needs of the admin's API: read the branding, and write it back. */
export type BrandingApi = Pick<Api, 'branding' | 'updateBranding'>;

/**
 * Puts the public branding back if a test left it changed, then checks that it is exactly what it
 * was. Its failure names the guard and no issue, so inside a known bug's test the release gate
 * can't take it for the bug (scripts/gate.ts). Proved by SIG-05 (tests/meta/guard.spec.ts).
 */
export async function restoreBranding(admin: BrandingApi, before: Branding): Promise<void> {
  const after = await read(await admin.branding(), Branding);
  if (JSON.stringify(after) !== JSON.stringify(before)) await admin.updateBranding(before);
  expect(await read(await admin.branding(), Branding), 'site settings guard: the public branding after the test').toEqual(before);
}

/**
 * Wraps a test that changes the B&B's branding, which every visitor sees. It runs only when
 * ALLOW_SITE_SETTINGS_CHANGES=1 is set, and afterwards the public branding must be exactly what it
 * was before: the guard puts it back if the test didn't, and fails the test if it can't.
 */
export async function changingSiteSettings(admin: Api, body: () => Promise<void>): Promise<void> {
  test.skip(!ALLOW_SITE_SETTINGS_CHANGES, 'Changes what every visitor sees: set ALLOW_SITE_SETTINGS_CHANGES=1 to run it.');
  const before = await read(await admin.branding(), Branding);
  try {
    await body();
  } finally {
    await restoreBranding(admin, before);
  }
}
