import { read } from '../../src/api/client.ts';
import { Messages } from '../../src/api/schemas.ts';
import { ADMIN, ADMIN_STATE, BASE_URL, issue } from '../../src/config.ts';
import { GUEST, MESSAGE, ROOM_PREFIX, stay, uniqueName } from '../../src/data.ts';
import { deleteRoomsNamed, expect, findRoom, test } from '../../src/fixtures.ts';
import { changingSiteSettings } from '../../src/guard.ts';
import { AdminPage } from '../../src/pages/admin.ts';
import { HomePage } from '../../src/pages/home.ts';
import { ReservationPage } from '../../src/pages/reservation.ts';

test.describe('signing in and out', () => {
  // A fresh session each: signing out must never end the session the other admin tests share.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('ADM-01 the published login opens the rooms page, and Logout signs out', { tag: ['@ui', '@admin', '@smoke'] }, async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.gotoSignIn();
    await admin.signIn(ADMIN);
    await expect(page).toHaveURL(/\/admin\/rooms$/);
    await expect(admin.menuLink('Rooms')).toBeVisible();
    await admin.logout.click();
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await admin.gotoRooms();
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('ADM-02 a wrong password is refused with "Invalid credentials"', { tag: ['@ui', '@admin'] }, async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.gotoSignIn();
    await admin.signIn({ ...ADMIN, password: 'not-the-password' });
    await expect(admin.signInError).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(/\/admin$/);
  });

  test('ADM-09 signing out ends the session: the old sign-in stops working', { tag: ['@ui', '@admin', '@security'] }, async ({ page, context, playwright }) => {
    const admin = new AdminPage(page);
    await admin.gotoSignIn();
    await admin.signIn(ADMIN);
    await expect(page).toHaveURL(/\/admin\/rooms$/);
    const token = (await context.cookies()).find((cookie) => cookie.name === 'token')?.value ?? '';
    expect(token, 'a sign-in cookie').not.toBe('');

    // Checked from a separate client, so only the old token is sent.
    const api = await playwright.request.newContext({ baseURL: BASE_URL });
    // The all-rooms report needs a sign-in; the admin area itself reads it (seen while exploring).
    const withOldToken = () => api.get('/api/report', { headers: { cookie: `token=${token}` }, failOnStatusCode: false });
    expect((await withOldToken()).status(), 'before signing out').toBe(200);
    await admin.logout.click();
    await expect(page).toHaveURL(`${BASE_URL}/`);
    expect((await withOldToken()).status(), 'after signing out').toBe(401);
    expect(await (await api.post('/api/auth/validate', { data: { token } })).json(), 'the token, after signing out').toEqual({ valid: false });
    await api.dispose();
  });

  test.fail("ADM-10 the sign-in cookie can't be read by the page's scripts", { tag: ['@ui', '@admin', '@security', '@known-bug'], annotation: issue(18) }, async ({ page, context }) => {
    const admin = new AdminPage(page);
    await admin.gotoSignIn();
    await admin.signIn(ADMIN);
    await expect(page).toHaveURL(/\/admin\/rooms$/);
    expect((await context.cookies()).find((cookie) => cookie.name === 'token'), 'the token cookie').toMatchObject({ httpOnly: true });
  });
});

test.describe('the admin area', () => {
  test.use({ storageState: ADMIN_STATE });

  test('ADM-03 a room made in the admin area is listed with its details, and deleting it removes it', { tag: ['@ui', '@admin', '@smoke'] }, async ({ page, admin }) => {
    const name = uniqueName(ROOM_PREFIX);
    const adminPage = new AdminPage(page);
    try {
      await adminPage.gotoRooms();
      await adminPage.createRoom({ roomName: name, type: 'Family', accessible: true, roomPrice: 199, features: ['WiFi', 'Views'] });
      const row = adminPage.roomRows.filter({ hasText: name });
      await expect(row).toContainText('Family');
      await expect(row).toContainText('199');
      await expect(row).toContainText('WiFi, Views');
      // Whether visitors see it on the home page is UI-17 (issue #13).
      const room = await findRoom(admin, name);
      expect(room).toMatchObject({ type: 'Family', accessible: true, roomPrice: 199, features: ['WiFi', 'Views'] });

      await adminPage.deleteRoom(room.roomid);
      await expect(adminPage.roomRow(room.roomid)).toHaveCount(0);
      expect((await admin.room(room.roomid)).ok(), 'the deleted room, from the API').toBe(false);
    } finally {
      await deleteRoomsNamed(admin, name);
    }
  });

  test('ADM-04 a new price set in the admin area shows on the booking page', { tag: ['@ui', '@admin'] }, async ({ page, room }) => {
    const price = room.roomPrice + 7;
    await new AdminPage(page).gotoRoom(room.roomid);
    await new AdminPage(page).changePrice(price);
    const reservation = new ReservationPage(page);
    await reservation.goto(room.roomid, stay(1));
    await expect(reservation.summary).toContainText(`£${price} x 1 night`);
  });

  test.fail('ADM-05 creating a room with nothing filled in says what is missing', { tag: ['@ui', '@admin', '@known-bug'], annotation: issue(15) }, async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.gotoRooms();
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toBeVisible();
  });

  test("ADM-06 a visitor's message reaches the inbox; opening it shows the sender and marks it read", { tag: ['@ui', '@admin'] }, async ({ page, visitor, admin }) => {
    const subject = `Question ${uniqueName('')}`;
    expect((await visitor.createMessage({ ...MESSAGE, subject })).status()).toBe(200);
    const adminPage = new AdminPage(page);
    await adminPage.gotoMessages();
    await adminPage.messageRow(subject).click();
    await expect(adminPage.messageDialog).toContainText(`From: ${MESSAGE.name}`);
    await expect(adminPage.messageDialog).toContainText(`Phone: ${MESSAGE.phone}`);
    await expect(adminPage.messageDialog).toContainText(`Email: ${MESSAGE.email}`);
    await expect(adminPage.messageDialog).toContainText(MESSAGE.description);
    await expect
      .poll(async () => (await read(await admin.get('/message'), Messages)).messages.find((message) => message.subject === subject)?.read, { message: 'marked as read' })
      .toBe(true);
  });

  test.fail('ADM-06 the message dialog is named after the message', { tag: ['@ui', '@admin', '@a11y', '@known-bug'], annotation: issue(16) }, async ({ page, visitor }) => {
    const subject = `Question ${uniqueName('')}`;
    expect((await visitor.createMessage({ ...MESSAGE, subject })).status()).toBe(200);
    const admin = new AdminPage(page);
    await admin.gotoMessages();
    await admin.messageRow(subject).click();
    await expect(admin.messageDialog).toHaveAccessibleName(new RegExp(subject));
  });

  test.fail('ADM-07 a new B&B name shows on the public site, and the original comes back afterwards', { tag: ['@ui', '@admin', '@guard', '@known-bug'], annotation: issue(17) }, async ({ page, admin }) => {
    await changingSiteSettings(admin, async () => {
      const adminPage = new AdminPage(page);
      await adminPage.gotoBranding();
      await adminPage.brandingField('Enter B&B name').fill('Shady Meadows Test');
      await adminPage.saveBranding();
      await new HomePage(page).goto();
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Shady Meadows Test');
    });
  });

  test("ADM-08 a visitor's booking shows in the admin report with the guest's name and room", { tag: ['@ui', '@admin'] }, async ({ page, visitor, room }) => {
    const dates = stay();
    expect((await visitor.createBooking({ roomid: room.roomid, ...GUEST, bookingdates: dates })).status()).toBe(201);
    const admin = new AdminPage(page);
    await admin.gotoReport();
    // The calendar opens on this month; step forward to the month of the stay.
    const now = new Date();
    const months = (Number(dates.checkin.slice(0, 4)) - now.getUTCFullYear()) * 12 + Number(dates.checkin.slice(5, 7)) - 1 - now.getUTCMonth();
    for (let step = 0; step < months; step++) await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText(`${GUEST.firstname} ${GUEST.lastname} - Room: ${room.roomName}`)).toBeVisible();
  });
});
