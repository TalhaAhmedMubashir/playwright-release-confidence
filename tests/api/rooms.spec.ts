import { read } from '../../src/api/client.ts';
import { Branding, Room, Rooms } from '../../src/api/schemas.ts';
import { expect, test } from '../../src/fixtures.ts';

test('API-01 the room list and each room match their schema', { tag: ['@api', '@smoke'] }, async ({ visitor }) => {
  const list = await visitor.rooms();
  expect(list.status()).toBe(200);
  const { rooms } = await read(list, Rooms);
  expect(rooms.length).toBeGreaterThan(0);
  for (const room of rooms) {
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
