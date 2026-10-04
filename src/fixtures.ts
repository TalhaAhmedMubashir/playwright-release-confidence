import { test as base, expect } from '@playwright/test';
import { Api, read, signIn } from './api/client.ts';
import { type Room, Rooms } from './api/schemas.ts';
import { ADMIN, BASE_URL } from './config.ts';
import { ROOM_PREFIX, uniqueName } from './data.ts';

interface TestFixtures {
  /** The API as a visitor who hasn't signed in. */
  visitor: Api;
  /** A room of this test's own, made through the API and deleted by name afterwards. */
  room: Room;
}

interface WorkerFixtures {
  /** The API signed in as the admin, once per worker, in a request context of its own. */
  admin: Api;
}

/** The room with this name; fails if there is none. */
export async function findRoom(api: Api, name: string): Promise<Room> {
  const room = (await read(await api.rooms(), Rooms)).rooms.find((each) => each.roomName === name);
  if (!room) throw new Error(`No room is named ${name}.`);
  return room;
}

/** Deletes every room with this name: clean-up by name finds what a test made, even if it failed halfway. */
export async function deleteRoomsNamed(admin: Api, name: string): Promise<void> {
  for (const room of (await read(await admin.rooms(), Rooms)).rooms.filter((each) => each.roomName === name)) {
    await admin.deleteRoom(room.roomid);
  }
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  admin: [
    async ({ playwright }, use) => {
      // Its own context, so the admin's cookies never reach requests made as a visitor.
      const request = await playwright.request.newContext({ baseURL: BASE_URL });
      await use(new Api(request, await signIn(request, ADMIN)));
      await request.dispose();
    },
    { scope: 'worker' },
  ],

  visitor: async ({ request }, use) => {
    await use(new Api(request));
  },

  room: async ({ admin }, use) => {
    const name = uniqueName(ROOM_PREFIX);
    const created = await admin.createRoom({ roomName: name, type: 'Double', accessible: true, roomPrice: 120, features: ['WiFi', 'TV'] });
    expect(created.ok(), `creating room ${name}`).toBe(true);
    await use(await findRoom(admin, name));
    await deleteRoomsNamed(admin, name);
  },
});

export { expect };
