import { type Api, read } from '../../src/api/client.ts';
import { Branding, CreatedBooking, Room } from '../../src/api/schemas.ts';
import { issue } from '../../src/config.ts';
import { GUEST, stay } from '../../src/data.ts';
import { expect, test } from '../../src/fixtures.ts';
import { changingSiteSettings } from '../../src/guard.ts';

type Attempt = [method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, data?: unknown];
const attempt = (api: Api, [method, path, data]: Attempt) =>
  method === 'GET' ? api.get(path) : method === 'POST' ? api.post(path, data) : method === 'PUT' ? api.put(path, data) : api.delete(path);

test('API-08 everything that changes data or reads private data refuses a visitor', { tag: ['@api', '@security', '@smoke'] }, async ({ visitor, room }) => {
  const { bookingid } = await read(await visitor.createBooking({ roomid: room.roomid, ...GUEST, bookingdates: stay() }), CreatedBooking);
  const attempts: Attempt[] = [
    ['GET', '/booking'],
    ['GET', `/booking/${bookingid}`],
    ['GET', `/booking/summary?roomid=${room.roomid}`],
    ['GET', '/report'],
    ['POST', '/room', { roomName: 'not-allowed', type: 'Single', accessible: false, roomPrice: 1, features: [] }],
    ['PUT', `/room/${room.roomid}`, { ...room, roomPrice: 1 }],
    ['DELETE', `/room/${room.roomid}`],
    ['PUT', '/branding', {}],
    ['DELETE', `/booking/${bookingid}`],
    ['PUT', '/message/1/read'],
    ['DELETE', '/message/1'],
  ];
  for (const each of attempts) {
    expect([401, 403], `${each[0]} ${each[1]}`).toContain((await attempt(visitor, each)).status());
  }
  // And nothing changed: the room is still there, as it was.
  expect(await read(await visitor.room(room.roomid), Room)).toEqual(room);
});

/** An answer's status and the names of its top-level fields: two refusals alike look the same here. */
const shapeOf = async (response: Awaited<ReturnType<Api['get']>>) => {
  const text = await response.text();
  return `${response.status()} ${text ? Object.keys(JSON.parse(text) as object).join(',') : '(empty body)'}`;
};

test.fail('API-13 every refusal answers with the same status and the same shape', { tag: ['@api', '@known-bug'], annotation: issue(8) }, async ({ visitor }) => {
  const answers = [await visitor.get('/booking'), await visitor.get('/booking/1'), await visitor.get('/report'), await visitor.post('/room', {})];
  expect(new Set(await Promise.all(answers.map(shapeOf)))).toHaveProperty('size', 1);
});

test.fail("API-10 an error answer doesn't reveal the app's internal code", { tag: ['@api', '@security', '@known-bug'], annotation: issue(12) }, async ({ admin }) => {
  await changingSiteSettings(admin, async () => {
    const current = await read(await admin.branding(), Branding);
    const response = await admin.updateBranding({ ...current, logoUrl: 'not a web address' });
    expect(response.status()).toBe(400);
    expect(await response.text()).not.toMatch(/com\.automationintesting|java\.|springframework|Exception/);
  });
});
