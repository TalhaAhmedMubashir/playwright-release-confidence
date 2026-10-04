// Second exploration pass: tries what a visitor can do on our own copy of the app and records what
// happens: what each form says, the API calls the page makes and their answers, and which API
// endpoints refuse a visitor. Uses only made-up data at example.com, and never signs in.
// Writes exploration/flows/, including a Playwright trace of the visit.
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080';
const OUT = 'exploration/flows';
const VISITOR = { first: 'Test', last: 'Visitor', email: 'visitor@example.com', phone: '01234567890' };

/** A date n days from today, as yyyy-mm-dd. Far enough ahead to miss the app's sample bookings. */
const day = (n) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ baseURL: BASE_URL, viewport: { width: 1280, height: 800 } });
await context.tracing.start({ screenshots: true, snapshots: true });
const page = await context.newPage();

const steps = [];
const calls = [];
let current = '';

page.on('response', async (response) => {
  const url = new URL(response.url());
  if (!url.pathname.startsWith('/api/')) return;
  const body = await response.text().catch(() => null);
  calls.push({
    step: current,
    method: response.request().method(),
    path: url.pathname + url.search,
    status: response.status(),
    sent: response.request().postData(),
    answer: body?.slice(0, 1500) ?? null,
  });
});

/** Runs one action, then records the page's accessibility tree and a screenshot. */
async function step(name, action) {
  current = name;
  const entry = { name };
  try {
    entry.result = (await action()) ?? null;
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    entry.url = page.url().replace(BASE_URL, '');
    entry.aria = await page.locator('body').ariaSnapshot();
  } catch (error) {
    entry.error = error.message.split('\n')[0];
  }
  await page.screenshot({ path: `${OUT}/${String(steps.length + 1).padStart(2, '0')}-${slug(name)}.png`, fullPage: true });
  steps.push(entry);
  console.log(`${entry.error ? 'error' : 'ok'}: ${name}${entry.error ? ` (${entry.error})` : ''}`);
}

/** Fills each empty, visible text field with made-up visitor details, matched by its name or hint. */
async function fillGuestFields() {
  const filled = [];
  for (const field of await page.locator('input:visible, textarea:visible').all()) {
    if ((await field.inputValue()) !== '') continue;
    const hint = `${await field.getAttribute('name')} ${await field.getAttribute('placeholder')} ${await field.getAttribute('aria-label')}`.toLowerCase();
    const value = /first/.test(hint) ? VISITOR.first : /last|sur/.test(hint) ? VISITOR.last : /mail/.test(hint) ? VISITOR.email : /phone/.test(hint) ? VISITOR.phone : null;
    if (value) {
      await field.fill(value);
      filled.push(hint.trim());
    }
  }
  return { filled };
}

const contact = () => page.locator('form').filter({ has: page.getByRole('button', { name: 'Submit' }) });

await step('menu links: which section targets exist', async () => {
  await page.goto('/');
  return page.evaluate(() => Object.fromEntries(['rooms', 'booking', 'amenities', 'location', 'contact'].map((id) => [id, Boolean(document.getElementById(id))])));
});

await step('contact form: submit empty', async () => {
  await contact().getByRole('button', { name: 'Submit' }).click();
});

await step('contact form: values too short or malformed', async () => {
  await page.goto('/');
  await contact().getByRole('textbox', { name: 'Name' }).fill('A');
  await contact().getByRole('textbox', { name: 'Email' }).fill('not-an-email');
  await contact().getByRole('textbox', { name: 'Phone' }).fill('123');
  await contact().getByRole('textbox', { name: 'Subject' }).fill('Hi');
  await contact().locator('#description').fill('Short');
  await contact().getByRole('button', { name: 'Submit' }).click();
});

await step('contact form: valid message', async () => {
  await page.goto('/');
  await contact().getByRole('textbox', { name: 'Name' }).fill(`${VISITOR.first} ${VISITOR.last}`);
  await contact().getByRole('textbox', { name: 'Email' }).fill(VISITOR.email);
  await contact().getByRole('textbox', { name: 'Phone' }).fill(VISITOR.phone);
  await contact().getByRole('textbox', { name: 'Subject' }).fill('Question about rooms');
  await contact().locator('#description').fill('Is breakfast included with every room? Thank you for your help.');
  await contact().getByRole('button', { name: 'Submit' }).click();
});

await step('availability: search dates', async () => {
  await page.goto('/');
  const dates = page.locator('form').filter({ has: page.getByRole('button', { name: 'Check Availability' }) }).getByRole('textbox');
  const [checkIn, checkOut] = [day(40), day(42)].map((iso) => iso.split('-').reverse().join('/'));
  await dates.nth(0).fill(checkIn);
  await dates.nth(1).fill(checkOut);
  await page.getByRole('button', { name: 'Check Availability' }).click();
  return { checkIn, checkOut };
});

const reservation = `/reservation/1?checkin=${day(30)}&checkout=${day(32)}`;

await step('booking: open the guest form', async () => {
  await page.goto(reservation);
  await page.getByRole('button', { name: 'Reserve Now' }).click();
});

await step('booking: submit the guest form empty', async () => {
  await page.getByRole('button', { name: /reserve/i }).last().click();
});

await step('booking: valid guest details', async () => {
  const result = await fillGuestFields();
  await page.getByRole('button', { name: /reserve/i }).last().click();
  return result;
});

await step('booking: the same room and dates again', async () => {
  await page.goto(reservation);
  await page.getByRole('button', { name: 'Reserve Now' }).click();
  const result = await fillGuestFields();
  await page.getByRole('button', { name: /reserve/i }).last().click();
  return result;
});

await step('phone width: open the menu', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('navigation').getByRole('button').first().click();
});

await step('an address with no page', async () => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const response = await page.goto('/no-such-page');
  return { status: response?.status() ?? null };
});

// What a visitor gets from the API without signing in. Read-only, except for refused writes.
const api = [];
for (const [method, path, data] of [
  ['GET', '/api/message/'],
  ['GET', '/api/message/1'],
  ['GET', '/api/message/count'],
  ['GET', '/api/booking/'],
  ['GET', '/api/booking/1'],
  ['GET', `/api/booking/summary?roomid=1`],
  ['GET', `/api/booking/unavailable?checkin=${day(30)}&checkout=${day(32)}`],
  ['GET', '/api/report/'],
  ['GET', '/api/report/room/1'],
  ['GET', '/api/room/1'],
  ['POST', '/api/room/', {}],
  ['PUT', '/api/branding/', {}],
]) {
  const response = await context.request.fetch(path, { method, data, failOnStatusCode: false });
  api.push({ method, path, status: response.status(), answer: (await response.text()).slice(0, 1500) });
  console.log(`${response.status()} ${method} ${path}`);
}

await writeFile(`${OUT}/steps.json`, `${JSON.stringify(steps, null, 2)}\n`);
await writeFile(`${OUT}/calls.json`, `${JSON.stringify(calls, null, 2)}\n`);
await writeFile(`${OUT}/api-as-visitor.json`, `${JSON.stringify(api, null, 2)}\n`);
await context.tracing.stop({ path: `${OUT}/trace.zip` });
await browser.close();
