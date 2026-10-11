import { type APIResponse, expect, test } from '@playwright/test';
import { evaluate } from '../../scripts/gate.ts';
import type { Branding } from '../../src/api/schemas.ts';
import { type BrandingApi, restoreBranding } from '../../src/guard.ts';

// The guard behind ADM-07 and API-10 must be able to put the site back, and to fail when it can't.
// Neither test changes the branding today (issue #17 stops it from saving), so these prove the
// guard against a stand-in for the app's branding API.

const ORIGINAL: Branding = {
  name: 'Shady Meadows B&B',
  map: { latitude: 52.6351, longitude: 1.2733 },
  logoUrl: '/images/rbp-logo.jpg',
  description: 'Welcome to Shady Meadows, a delightful Bed & Breakfast.',
  directions: 'Follow the signs from the station.',
  contact: { name: 'Shady Meadows B&B', phone: '012345678901', email: 'fake@fakeemail.com' },
  address: { line1: 'Shady Meadows B&B', line2: 'Shadows valley', postTown: 'Newingtonfordburyshire', county: 'Dilbery', postCode: 'N1 1AA' },
};

const answer = (body: unknown) => ({ json: () => Promise.resolve(structuredClone(body)) }) as unknown as APIResponse;

/** The app's branding as the guard sees it: it saves what it is given, or, like the app today, refuses. */
class BrandingStandIn implements BrandingApi {
  updates = 0;
  current: Branding;
  private readonly saves: boolean;

  constructor(current: Branding, saves = true) {
    this.current = current;
    this.saves = saves;
  }

  branding = () => Promise.resolve(answer(this.current));

  updateBranding = (branding: Branding) => {
    this.updates++;
    if (this.saves) this.current = structuredClone(branding);
    return Promise.resolve(answer({}));
  };
}

const changedByATest = (): Branding => ({ ...ORIGINAL, name: 'Shady Meadows Test' });

test('SIG-05 the guard puts back branding a test left changed', { tag: '@meta' }, async () => {
  const app = new BrandingStandIn(changedByATest());
  await restoreBranding(app, ORIGINAL);
  expect(app.current).toEqual(ORIGINAL);
  expect(app.updates).toBe(1);
});

test('SIG-05 the guard leaves the branding alone when the test changed nothing', { tag: '@meta' }, async () => {
  const app = new BrandingStandIn(structuredClone(ORIGINAL));
  await restoreBranding(app, ORIGINAL);
  expect(app.updates).toBe(0);
});

test("SIG-05 the guard fails, naming itself, when it can't put the branding back", { tag: '@meta' }, async () => {
  await expect(restoreBranding(new BrandingStandIn(changedByATest(), false), ORIGINAL)).rejects.toThrow('site settings guard');
});

test("SIG-05 inside a known bug's test, the gate doesn't take the guard's failure for the bug", { tag: '@meta' }, async () => {
  const message = await restoreBranding(new BrandingStandIn(changedByATest(), false), ORIGINAL).then(
    () => '',
    (failure: Error) => failure.message,
  );
  expect(message).toContain('site settings guard');
  const verdict = evaluate(
    [{ area: 'Admin area', file: 'ui/admin.spec.ts', title: 'ADM-07 a new B&B name shows', project: 'chromium', status: 'expected', knownBug: true, issue: 17, ended: 'failed', errors: [message] }],
    ['Admin area'],
  );
  expect(verdict.pass).toBe(false);
  expect(verdict.areas[0]?.problems).toEqual(['known bug failed for another reason, not on its check for issue #17: ADM-07 a new B&B name shows [chromium]']);
});
