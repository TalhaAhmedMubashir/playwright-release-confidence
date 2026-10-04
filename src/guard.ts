import { expect, test } from '@playwright/test';
import { type Api, read } from './api/client.ts';
import { Branding } from './api/schemas.ts';
import { ALLOW_SITE_SETTINGS_CHANGES } from './config.ts';

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
    const after = await read(await admin.branding(), Branding);
    if (JSON.stringify(after) !== JSON.stringify(before)) await admin.updateBranding(before);
    expect(await read(await admin.branding(), Branding), 'the public branding after the test').toEqual(before);
  }
}
