import { read } from '../../src/api/client.ts';
import { MessageErrors } from '../../src/api/schemas.ts';
import { issue } from '../../src/config.ts';
import { MESSAGE, ofLength } from '../../src/data.ts';
import { expect, test } from '../../src/fixtures.ts';

// API-03: each rule of the contact form, at its limits. The error texts are the ones the API answered
// while exploring (docs/exploration/2026-10-04/flows.md, steps 2 and 3).
type Field = keyof typeof MESSAGE;
const ACCEPTED: [Field, string][] = [
  ['phone', ofLength(11, '0')],
  ['phone', ofLength(21, '0')],
  ['subject', ofLength(5)],
  ['subject', ofLength(100)],
  ['description', ofLength(20)],
  ['description', ofLength(2000)],
];
const REFUSED: [Field, string, string][] = [
  ['phone', ofLength(10, '0'), 'Phone must be between 11 and 21 characters.'],
  ['phone', ofLength(22, '0'), 'Phone must be between 11 and 21 characters.'],
  ['subject', ofLength(4), 'Subject must be between 5 and 100 characters.'],
  ['subject', ofLength(101), 'Subject must be between 5 and 100 characters.'],
  ['description', ofLength(19), 'Message must be between 20 and 2000 characters.'],
  ['description', ofLength(2001), 'Message must be between 20 and 2000 characters.'],
  ['email', 'not-an-email', 'must be a well-formed email address'],
  ['name', '', 'Name may not be blank'],
  ['email', '', 'Email may not be blank'],
  ['phone', '', 'Phone may not be blank'],
  ['subject', '', 'Subject may not be blank'],
  ['description', '', 'Message may not be blank'],
];
const described = (value: string) => (value === '' ? 'blank' : value.length > 25 ? `of ${value.length} characters` : `"${value}"`);

for (const [field, value] of ACCEPTED) {
  test(`API-03 a message with ${field} ${described(value)} is accepted`, { tag: '@api' }, async ({ visitor }) => {
    const response = await visitor.createMessage({ ...MESSAGE, [field]: value });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });
}

for (const [field, value, error] of REFUSED) {
  test(`API-03 a message with ${field} ${described(value)} is refused`, { tag: '@api' }, async ({ visitor }) => {
    const response = await visitor.createMessage({ ...MESSAGE, [field]: value });
    expect(response.status()).toBe(400);
    expect(await read(response, MessageErrors)).toContain(error);
  });
}

test.fail("API-09 contact messages can't be read without signing in", { tag: ['@api', '@security', '@known-bug'], annotation: issue(1) }, async ({ visitor }) => {
  expect([401, 403], 'reading the message list without signing in (#1)').toContain((await visitor.get('/message')).status());
  expect([401, 403], 'reading one message without signing in (#1)').toContain((await visitor.get('/message/1')).status());
});
