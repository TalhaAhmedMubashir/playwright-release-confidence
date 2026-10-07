import { read } from '../../src/api/client.ts';
import { Report, Rooms } from '../../src/api/schemas.ts';
import { issue } from '../../src/config.ts';
import { GUEST, ROOM_PREFIX, stay } from '../../src/data.ts';
import { expect, test } from '../../src/fixtures.ts';
import { ReservationPage } from '../../src/pages/reservation.ts';

// What the guest form showed when sent empty while exploring (flows.md, step 7): seven messages,
// "must not be empty" twice.
const EMPTY_GUEST_ERRORS = ['must not be empty', 'size must be between 3 and 30', 'size must be between 3 and 18', 'size must be between 11 and 21', 'Lastname should not be blank', 'Firstname should not be blank'];

test('UI-10 booking free dates confirms them, and the room then shows them as taken', { tag: ['@ui', '@smoke'] }, async ({ page, visitor, room }) => {
  const dates = stay();
  const reservation = new ReservationPage(page);
  await reservation.goto(room.roomid, dates);
  await reservation.book(GUEST);
  await expect(reservation.confirmation).toBeVisible();
  await expect(page.getByText(`${dates.checkin} - ${dates.checkout}`)).toBeVisible();
  expect((await read(await visitor.report(room.roomid), Report)).report).toContainEqual({ start: dates.checkin, end: dates.checkout, title: 'Unavailable' });
});

test('UI-11 the price summary is nights × room price + £25 cleaning + £15 service, for every room', { tag: '@ui' }, async ({ page, visitor }) => {
  // The app's own rooms, not ones other tests are making meanwhile.
  const rooms = (await read(await visitor.rooms(), Rooms)).rooms.filter((each) => !each.roomName.startsWith(ROOM_PREFIX));
  expect(rooms.length).toBeGreaterThan(0);
  const reservation = new ReservationPage(page);
  for (const room of rooms) {
    await reservation.goto(room.roomid, stay(3));
    await expect(reservation.summary).toContainText(`£${room.roomPrice} x 3 nights`);
    expect(await reservation.price(), `room ${room.roomName}`).toEqual({
      perNight: room.roomPrice,
      nights: 3,
      stay: 3 * room.roomPrice,
      cleaning: 25,
      service: 15,
      total: 3 * room.roomPrice + 25 + 15,
    });
  }
});

test('UI-12 sending the empty guest form lists the problems', { tag: '@ui' }, async ({ page, room }) => {
  const reservation = new ReservationPage(page);
  await reservation.goto(room.roomid, stay());
  await reservation.reserve.click();
  await reservation.reserve.click();
  await expect(reservation.errors).toHaveCount(7);
  for (const error of EMPTY_GUEST_ERRORS) await expect(reservation.errors.filter({ hasText: error }).first()).toBeVisible();
});

test.fail('UI-19 each problem with the guest form names its field', { tag: ['@ui', '@known-bug'], annotation: issue(7) }, async ({ page, room }) => {
  const reservation = new ReservationPage(page);
  await reservation.goto(room.roomid, stay());
  await reservation.reserve.click();
  await reservation.reserve.click();
  await expect(reservation.errors).toHaveCount(7);
  for (const item of await reservation.errors.all()) await expect(item).toHaveText(/first ?name|last ?name|email|phone/i);
});

test.fail('UI-13 booking dates that are already taken says so and leaves the page usable', { tag: ['@ui', '@known-bug'], annotation: issue(2) }, async ({ page, visitor, room }) => {
  const dates = stay();
  expect((await visitor.createBooking({ roomid: room.roomid, ...GUEST, bookingdates: dates })).status()).toBe(201);
  const reservation = new ReservationPage(page);
  await reservation.goto(room.roomid, dates);
  await reservation.book(GUEST);
  await expect(page.getByRole('alert').filter({ hasText: /\S/ }), 'a message about the dates').toBeVisible();
  await expect(reservation.reserve, 'the booking form, still there').toBeVisible();
});

test('UI-14 Cancel closes the guest form without booking', { tag: '@ui' }, async ({ page, visitor, room }) => {
  const reservation = new ReservationPage(page);
  await reservation.goto(room.roomid, stay());
  await reservation.reserve.click();
  await expect(reservation.field('Firstname')).toBeVisible();
  await reservation.cancel.click();
  await expect(reservation.field('Firstname')).toBeHidden();
  expect((await read(await visitor.report(room.roomid), Report)).report).toEqual([]);
});
