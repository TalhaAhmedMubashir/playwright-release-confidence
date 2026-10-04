// Made-up test data. Names are unique per test, so tests never collide and clean-up can find
// exactly what a test made; addresses are at example.com.

/** Every room a test makes is named with this prefix, so clean-up can find them by name. */
export const ROOM_PREFIX = 'qa-';

let counter = 0;
/** A short name no other test in this run uses. */
export const uniqueName = (prefix: string) => `${prefix}${process.pid.toString(36)}${(counter++).toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;

/** A date n days from today, as yyyy-mm-dd (UTC, like the browser in these tests). */
export const day = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

/** A stay of the given length, a month from now. Tests that book use their own room, so dates never clash. */
export const stay = (nights = 2, from = 30) => ({ checkin: day(from), checkout: day(from + nights) });

export const GUEST = { firstname: 'Test', lastname: 'Visitor', email: 'visitor@example.com', phone: '01234567890' };

export const MESSAGE = {
  name: 'Test Visitor',
  email: 'visitor@example.com',
  phone: '01234567890',
  subject: 'Question about rooms',
  description: 'Is breakfast included with every room? Thank you for your help.',
};

/** A string of the given length, for testing length limits. */
export const ofLength = (length: number, char = 'a') => char.repeat(length);
