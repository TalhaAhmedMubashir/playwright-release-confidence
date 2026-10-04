import { read } from '../../src/api/client.ts';
import { Branding, Room, Rooms } from '../../src/api/schemas.ts';
import { ROOM_PREFIX } from '../../src/data.ts';
import { expect, test } from '../../src/fixtures.ts';

test("API-01 the room list and each of the app's own rooms match their schema", { tag: ['@api', '@smoke'] }, async ({ visitor }) => {
  const list = await visitor.rooms();
  expect(list.status()).toBe(200);
  // The app's own rooms: rooms other tests make can be deleted while this one runs.
  const own = (await read(list, Rooms)).rooms.filter((room) => !room.roomName.startsWith(ROOM_PREFIX));
  expect(own.length).toBeGreaterThan(0);
  for (const room of own) {
    const one = await visitor.room(room.roomid);
    expect(one.status(), `room ${room.roomid}`).toBe(200);
    expect(await read(one, Room)).toEqual(room);
  }
});

test('API-02 the branding matches its schema', { tag: '@api' }, async ({ visitor }) => {
  const response = await visitor.branding();
  expect(response.status()).toBe(200);
  expect((await read(response, Branding)).name.length).toBeGreaterThan(0);
});

test("API-12 a room that doesn't exist answers 404", { tag: '@api' }, async ({ visitor }) => {
  expect((await visitor.room(999_999)).status()).toBe(404);
});
