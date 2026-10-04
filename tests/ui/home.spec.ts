import { read } from '../../src/api/client.ts';
import { Branding, Rooms } from '../../src/api/schemas.ts';
import { issue } from '../../src/config.ts';
import { day, GUEST, stay } from '../../src/data.ts';
import { expect, test } from '../../src/fixtures.ts';
import { HomePage } from '../../src/pages/home.ts';

test("UI-01 the home page shows the B&B's name, description and contact details", { tag: ['@ui', '@smoke'] }, async ({ page, visitor }) => {
  const branding = await read(await visitor.branding(), Branding);
  await new HomePage(page).goto();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(branding.name);
  await expect(page.getByText(branding.description).first()).toBeVisible();
  await expect(page.getByText(branding.contact.phone).first()).toBeVisible();
  await expect(page.getByText(branding.contact.email).first()).toBeVisible();
});

test('UI-02 every room the page receives is shown with its type, price and features, and a link to book it for tonight', { tag: ['@ui', '@smoke'] }, async ({ page }) => {
  const home = new HomePage(page);
  // Compared with the answer the page itself received, so rooms other tests add or remove meanwhile don't matter.
  const answer = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/room' && response.request().method() === 'GET');
  await home.goto();
  const { rooms } = Rooms.parse(await (await answer).json());
  expect(rooms.length).toBeGreaterThan(0);
  for (const room of rooms) {
    const card = home.roomCard(room.roomid);
    await expect(card.getByRole('heading', { level: 5 })).toHaveText(room.type);
    await expect(card).toContainText(`£${room.roomPrice} per night`);
    for (const feature of room.features) await expect(card).toContainText(feature);
    await expect(home.bookLink(room.roomid)).toHaveAttribute('href', `/reservation/${room.roomid}?checkin=${day(0)}&checkout=${day(1)}`);
  }
});

const SECTIONS = [
  ['Rooms', 'rooms'],
  ['Booking', 'booking'],
  ['Location', 'location'],
  ['Contact', 'contact'],
] as const;

test('UI-03 the menu links Rooms, Booking, Location and Contact go to their sections', { tag: '@ui' }, async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  for (const [name, section] of SECTIONS) {
    await home.menu.getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${section}$`));
    await expect(page.locator(`#${section}`)).toBeInViewport();
  }
});

test.fail('UI-04 the menu link Amenities goes to an amenities section', { tag: ['@ui', '@known-bug'], annotation: issue(3) }, async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await home.menu.getByRole('link', { name: 'Amenities' }).click();
  await expect(page.locator('#amenities')).toBeInViewport();
});

test('UI-05 at phone width the menu opens from its button and shows the same links', { tag: '@ui' }, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const home = new HomePage(page);
  await home.goto();
  await expect(home.menu.getByRole('link', { name: 'Rooms', exact: true })).toBeHidden();
  await home.menuButton.click();
  for (const name of ['Rooms', 'Booking', 'Amenities', 'Location', 'Contact', 'Admin']) {
    await expect(home.menu.getByRole('link', { name, exact: true })).toBeVisible();
  }
});

test("UI-06 the availability search doesn't offer a room that is booked for the chosen dates", { tag: '@ui' }, async ({ page, visitor, room }) => {
  const dates = stay();
  expect((await visitor.createBooking({ roomid: room.roomid, ...GUEST, bookingdates: dates })).status()).toBe(201);
  const home = new HomePage(page);
  await home.goto();
  await expect(home.bookLink(room.roomid), 'offered before the search').toBeVisible();
  const searched = page.waitForResponse((response) => response.url().includes(`/api/room?checkin=${dates.checkin}`));
  await home.searchAvailability(dates.checkin, dates.checkout);
  await searched;
  await expect(home.bookLink(room.roomid), 'offered after searching its booked dates').toHaveCount(0);
});

test.fail("UI-15 the footer's quick links go to their pages or sections", { tag: ['@ui', '@known-bug'], annotation: issue(6) }, async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  for (const name of ['Home', 'Rooms', 'Booking', 'Contact']) {
    await expect(home.footer.getByRole('link', { name, exact: true })).not.toHaveAttribute('href', '#');
  }
});

test.fail('UI-16 every page has its own title', { tag: ['@ui', '@known-bug'], annotation: issue(9) }, async ({ page }) => {
  const titles = new Set<string>();
  for (const path of ['/', `/reservation/1?checkin=${day(30)}&checkout=${day(31)}`, '/cookie', '/privacy']) {
    await page.goto(path);
    titles.add(await page.title());
  }
  expect(titles.size, [...titles].join(' | ')).toBe(4);
});
