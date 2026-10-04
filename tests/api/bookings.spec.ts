import { type NewBooking, read } from '../../src/api/client.ts';
import { BookingErrors, CreatedBooking, DocumentedCreatedBooking, Report, Unavailable } from '../../src/api/schemas.ts';
import { day, GUEST, ofLength, stay } from '../../src/data.ts';
import { expect, test } from '../../src/fixtures.ts';

const booking = (roomid: number, overrides: Partial<NewBooking> = {}): NewBooking => ({ roomid, ...GUEST, bookingdates: stay(), ...overrides });

// API-04: each rule of a booking, at its limits. Each case books its own room; accepted cases also
// get their own dates. The error texts are the ones the API answered while exploring.
type Field = 'firstname' | 'lastname' | 'phone' | 'email';
const ACCEPTED: [Field, string][] = [
  ['firstname', ofLength(3)],
  ['firstname', ofLength(18)],
  ['lastname', ofLength(3)],
  ['lastname', ofLength(30)],
  ['phone', ofLength(11, '0')],
  ['phone', ofLength(21, '0')],
];
const REFUSED: [Field, string, string][] = [
  ['firstname', ofLength(2), 'size must be between 3 and 18'],
  ['firstname', ofLength(19), 'size must be between 3 and 18'],
  ['lastname', ofLength(2), 'size must be between 3 and 30'],
  ['lastname', ofLength(31), 'size must be between 3 and 30'],
  ['phone', ofLength(10, '0'), 'size must be between 11 and 21'],
  ['phone', ofLength(22, '0'), 'size must be between 11 and 21'],
  ['email', '', 'must not be empty'],
];
const described = (value: string) => (value === '' ? 'blank' : `of ${value.length} characters`);

for (const [field, value] of ACCEPTED) {
  test(`API-04 a booking with ${field} ${described(value)} is accepted`, { tag: '@api' }, async ({ visitor, room }) => {
    expect((await visitor.createBooking(booking(room.roomid, { [field]: value }))).status()).toBe(201);
  });
}

for (const [field, value, error] of REFUSED) {
  test(`API-04 a booking with ${field} ${described(value)} is refused`, { tag: '@api' }, async ({ visitor, room }) => {
    const response = await visitor.createBooking(booking(room.roomid, { [field]: value }));
    expect(response.status()).toBe(400);
    expect((await read(response, BookingErrors)).errors).toContain(error);
  });
}

test('API-04 a booking with email "not-an-email" is refused', { tag: '@api' }, async ({ visitor, room }) => {
  const response = await visitor.createBooking(booking(room.roomid, { email: 'not-an-email' }));
  expect(response.status()).toBe(400);
  // Not tried while exploring, so any stated reason will do; the schema requires at least one.
  expect((await read(response, BookingErrors)).errors.length).toBeGreaterThan(0);
});

test('API-05 a booking is made once; the same room and dates again are refused', { tag: ['@api', '@smoke'] }, async ({ visitor, room }) => {
  const request = booking(room.roomid);
  const created = await visitor.createBooking(request);
  expect(created.status()).toBe(201);
  expect(await read(created, CreatedBooking)).toMatchObject({
    roomid: room.roomid,
    firstname: GUEST.firstname,
    lastname: GUEST.lastname,
    bookingdates: request.bookingdates,
  });
  expect((await visitor.createBooking(request)).status()).toBe(409);
});

test('API-06 a check-out on or before the check-in is refused', { tag: '@api' }, async ({ visitor, room }) => {
  for (const [checkin, checkout] of [
    [day(40), day(40)],
    [day(42), day(40)],
  ] as const) {
    const status = (await visitor.createBooking(booking(room.roomid, { bookingdates: { checkin, checkout } }))).status();
    expect(status, `check-in ${checkin}, check-out ${checkout}`).toBeGreaterThanOrEqual(400);
    expect(status, `check-in ${checkin}, check-out ${checkout}`).toBeLessThan(500);
  }
});

test("API-07 a new booking's dates show as taken in the availability and report answers", { tag: '@api' }, async ({ visitor, room }) => {
  const dates = stay();
  expect((await visitor.createBooking(booking(room.roomid, { bookingdates: dates }))).status()).toBe(201);
  expect(await read(await visitor.unavailable(dates.checkin, dates.checkout), Unavailable)).toContainEqual({ roomid: room.roomid });
  expect((await read(await visitor.report(room.roomid), Report)).report).toContainEqual({ start: dates.checkin, end: dates.checkout, title: 'Unavailable' });
});

test('API-11 creating a booking answers as the API description says', { tag: '@api' }, async ({ visitor, room }) => {
  const response = await visitor.createBooking(booking(room.roomid));
  expect(response.status(), 'the status the description gives').toBe(200);
  expect((await read(response, DocumentedCreatedBooking)).booking.roomid).toBe(room.roomid);
});
