import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';
import { ADMIN_STATE, issue } from '../../src/config.ts';
import { GUEST, MESSAGE, stay } from '../../src/data.ts';
import { expect, test } from '../../src/fixtures.ts';
import { AdminPage } from '../../src/pages/admin.ts';
import { HomePage } from '../../src/pages/home.ts';
import { ReservationPage } from '../../src/pages/reservation.ts';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Problems already known, each tracked as an issue: the axe rule, the findings it covers (a pattern
 * over "where: rule element"), and the part of the app they belong to. Filled in from the scans'
 * own findings (pull request #10), never guessed. Anything else fails the scan; so does a known
 * problem that is no longer found, so its issue gets closed.
 */
const KNOWN: { rule: string; finding: RegExp; scope: 'visitor' | 'admin'; issue: number }[] = [
  // #4: the home page's date fields and message box have no name, and neither do the footer's icon links.
  { rule: 'label', finding: /^home[^:]*: label (input\[value=|#description$)/, scope: 'visitor', issue: 4 },
  { rule: 'link-name', finding: /: link-name .*btn-outline-light/, scope: 'visitor', issue: 4 },
  // #19: the footer's links and the booking page's breadcrumb have too little contrast.
  { rule: 'color-contrast', finding: /: color-contrast (small > a|a\[href\$=|\.text-decoration-none\[href=|\.breadcrumb-item)/, scope: 'visitor', issue: 19 },
  // #19: so do the admin area's buttons and the report calendar's days outside the month.
  { rule: 'color-contrast', finding: /^admin [a-z]+: color-contrast (\.btn|\.rbc-off-range)/, scope: 'admin', issue: 19 },
  // #20: admin form fields with no name.
  { rule: 'label', finding: /^admin (rooms: label #room(Name|Price)|branding: label #(description|directions))$/, scope: 'admin', issue: 20 },
  { rule: 'select-name', finding: /^admin rooms: select-name #(type|accessible)$/, scope: 'admin', issue: 20 },
];

/** Every WCAG 2.2 AA problem axe finds on the page as it is now, as "where: rule element". */
async function scan(page: Page, where: string): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  return violations.flatMap((violation) => violation.nodes.map((node) => `${where}: ${violation.id} ${node.target.join(' ')}`));
}

const covers = (known: (typeof KNOWN)[number], finding: string) => finding.includes(`: ${known.rule} `) && known.finding.test(finding);
const isKnown = (finding: string) => KNOWN.some((known) => covers(known, finding));
/** Known problems of this part of the app that the scans no longer find. */
const noLongerFound = (scope: 'visitor' | 'admin', found: string[]) =>
  KNOWN.filter((known) => known.scope === scope && !found.some((finding) => covers(known, finding))).map((known) => `#${known.issue} ${known.rule} ${known.finding}`);

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

test('A11Y-01 the visitor pages have no accessibility problem beyond the known ones', { tag: '@a11y', annotation: [issue(4), issue(19)] }, async ({ page, room }) => {
  const found = await scanVisitorPages(page, room.roomid);
  expect.soft(found.filter((finding) => !isKnown(finding)), 'problems not known yet').toEqual([]);
  expect(noLongerFound('visitor', found), 'known problems no longer found: close their issues and remove them from KNOWN').toEqual([]);
});

test.describe('signed in', () => {
  test.use({ storageState: ADMIN_STATE });

  test('A11Y-03 the admin pages have no accessibility problem beyond the known ones', { tag: ['@a11y', '@admin'], annotation: [issue(19), issue(20)] }, async ({ page }) => {
    const admin = new AdminPage(page);
    const found: string[] = [];
    // Each admin page shows its menu first and asks the API for its content after, so the scan waits
    // for that answer (the calls are in docs/exploration/2026-10-04/admin/visited.md). Waiting for the
    // menu alone scanned the branding page before its form came (nightly run of 2026-10-06).
    for (const [where, open, content] of [
      ['admin rooms', admin.gotoRooms, '/api/room'],
      ['admin report', admin.gotoReport, '/api/report'],
      ['admin branding', admin.gotoBranding, '/api/branding'],
      ['admin messages', admin.gotoMessages, '/api/message'],
    ] as const) {
      const answered = page.waitForResponse((response) => new URL(response.url()).pathname === content);
      await open();
      await expect(admin.logout).toBeVisible();
      await (await answered).finished();
      found.push(...(await scan(page, where)));
    }
    expect.soft(found.filter((finding) => !isKnown(finding)), 'problems not known yet').toEqual([]);
    expect(noLongerFound('admin', found), 'known problems no longer found: close their issues and remove them from KNOWN').toEqual([]);
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
