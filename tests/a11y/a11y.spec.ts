import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';
import { ADMIN_STATE } from '../../src/config.ts';
import { GUEST, MESSAGE, stay } from '../../src/data.ts';
import { expect, test } from '../../src/fixtures.ts';
import { AdminPage } from '../../src/pages/admin.ts';
import { HomePage } from '../../src/pages/home.ts';
import { ReservationPage } from '../../src/pages/reservation.ts';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Problems already known, each tracked as an issue: an axe rule and the elements it flagged. Anything
 * else the scan finds fails the test. Filled in from the scans' own findings, never guessed.
 */
const KNOWN: { rule: string; target: RegExp; issue: number }[] = [];

/** Every WCAG 2.2 AA problem axe finds on the page as it is now, as "where: rule element". */
async function scan(page: Page, where: string): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  return violations.flatMap((violation) => violation.nodes.map((node) => `${where}: ${violation.id} ${node.target.join(' ')}`));
}

const isKnown = (finding: string) => KNOWN.some(({ rule, target }) => finding.includes(`: ${rule} `) && target.test(finding));

/** Visits every visitor page and state worth scanning, and answers what the scans found. */
async function scanVisitorPages(page: Page, roomId: number): Promise<string[]> {
  const home = new HomePage(page);
  const reservation = new ReservationPage(page);
  const found: string[] = [];
  await home.goto();
  found.push(...(await scan(page, 'home')));
  await home.contactForm.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Name may not be blank', { exact: true })).toBeVisible();
  found.push(...(await scan(page, 'home, contact errors')));
  await home.goto();
  await home.sendMessage(MESSAGE);
  await expect(page.getByRole('heading', { name: /Thanks for getting in touch/ })).toBeVisible();
  found.push(...(await scan(page, 'home, message sent')));
  await reservation.goto(roomId, stay());
  await reservation.reserve.click();
  await reservation.reserve.click();
  await expect(reservation.errors.first()).toBeVisible();
  found.push(...(await scan(page, 'booking page, guest form errors')));
  await reservation.fillGuest(GUEST);
  await reservation.reserve.click();
  await expect(reservation.confirmation).toBeVisible();
  found.push(...(await scan(page, 'booking page, confirmed')));
  for (const [where, path] of [
    ['cookie policy', '/cookie'],
    ['privacy policy', '/privacy'],
    ['missing page', '/no-such-page'],
  ] as const) {
    await page.goto(path);
    found.push(...(await scan(page, where)));
  }
  return found;
}

test('A11Y-01 the visitor pages have no accessibility problem beyond the known ones', { tag: '@a11y' }, async ({ page, room }) => {
  const found = await scanVisitorPages(page, room.roomid);
  expect(found.filter((finding) => !isKnown(finding))).toEqual([]);
});

test.describe('signed in', () => {
  test.use({ storageState: ADMIN_STATE });

  test('A11Y-03 the admin pages have no accessibility problem beyond the known ones', { tag: ['@a11y', '@admin'] }, async ({ page }) => {
    const admin = new AdminPage(page);
    const found: string[] = [];
    for (const [where, open] of [
      ['admin rooms', admin.gotoRooms],
      ['admin report', admin.gotoReport],
      ['admin branding', admin.gotoBranding],
      ['admin messages', admin.gotoMessages],
    ] as const) {
      await open();
      await expect(admin.logout).toBeVisible();
      found.push(...(await scan(page, where)));
    }
    expect(found.filter((finding) => !isKnown(finding))).toEqual([]);
  });
});

/** Presses Tab until the target has the focus, as a keyboard user would. */
async function tabTo(page: Page, target: Locator, limit = 150): Promise<void> {
  for (let presses = 0; presses < limit; presses++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error(`${limit} presses of Tab never reached ${target.toString()}`);
}

test('A11Y-02 a room can be booked with the keyboard alone', { tag: '@a11y' }, async ({ page, room }) => {
  const reservation = new ReservationPage(page);
  await reservation.goto(room.roomid, stay());
  await tabTo(page, reservation.reserve);
  await page.keyboard.press('Enter');
  for (const [field, value] of [
    ['Firstname', GUEST.firstname],
    ['Lastname', GUEST.lastname],
    ['Email', GUEST.email],
    ['Phone', GUEST.phone],
  ] as const) {
    await tabTo(page, reservation.field(field));
    await page.keyboard.type(value);
  }
  await tabTo(page, reservation.reserve);
  await page.keyboard.press('Enter');
  await expect(reservation.confirmation).toBeVisible();
});
