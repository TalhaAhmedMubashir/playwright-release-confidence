// Second admin pass, on our own copy only: tries what the admin area lets you do and records what
// happens, with each control's attributes (ids, names, test ids, classes), so the tests' selectors
// come from observation. It tries a wrong password, signs in, creates, edits and deletes a room,
// opens a message, changes the branding and restores it, opens the report, signs out, and then
// checks whether the old sign-in still works. The password and the token never reach the records.
// Writes exploration/admin-flows/.
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080';
if (!['localhost', '127.0.0.1'].includes(new URL(BASE_URL).hostname)) {
  throw new Error(`Refusing to sign in at ${BASE_URL}: the admin exploration runs on our own copy only.`);
}
// The app's published default login (its README). Our copy starts with it.
const USER = process.env.RBP_ADMIN_USER ?? 'admin';
const PASSWORD = process.env.RBP_ADMIN_PASSWORD ?? 'password';
const OUT = 'exploration/admin-flows';
const ROOM = String(900 + Math.floor(Math.random() * 99));

let token = null; // read from the app's own requests to test signing out; never written
const redact = (text) => {
  let safe = (text ?? '').replace(/("password"\s*:\s*")[^"]*"/g, '$1<password>"');
  if (token) safe = safe.replaceAll(token, '<token>');
  return safe.replace(/("token"\s*:\s*")[^"]+"/g, '$1<token>"').replace(/(token=)[^;&\s"]+/g, '$1<token>');
};

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ baseURL: BASE_URL, viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

const calls = [];
const steps = [];
let current = 'start';
page.on('request', (request) => {
  const body = request.postData();
  if (request.url().includes('/api/auth/validate') && body) token = JSON.parse(body).token ?? token;
});
page.on('response', async (response) => {
  const url = new URL(response.url());
  if (!url.pathname.startsWith('/api/')) return;
  try {
    const headers = await response.allHeaders();
    calls.push({
      step: current,
      method: response.request().method(),
      path: url.pathname + url.search,
      status: response.status(),
      sent: redact(response.request().postData()),
      answer: redact(await response.text().catch(() => null)).slice(0, 1500),
      setsCookie: headers['set-cookie'] ? redact(headers['set-cookie']) : null,
    });
  } catch {}
});

/** Every visible control on the page, with the attributes a selector could use. */
const controls = () =>
  page.locator('input, select, textarea, button, a, [role="button"], [data-testid], [class*="delete" i], [class*="Delete"]').evaluateAll((elements) =>
    elements
      .filter((element) => element.getClientRects().length > 0)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        type: element.getAttribute('type') ?? undefined,
        id: element.id || undefined,
        name: element.getAttribute('name') ?? undefined,
        testid: element.getAttribute('data-testid') ?? undefined,
        class: element.getAttribute('class') ?? undefined,
        aria: element.getAttribute('aria-label') ?? undefined,
        placeholder: element.getAttribute('placeholder') ?? undefined,
        text: (element.textContent ?? '').trim().slice(0, 60) || undefined,
      })),
  );

/** Runs one action, then records the page's accessibility tree, its controls and a screenshot. */
async function step(name, action, { withControls = false } = {}) {
  current = name;
  const entry = { name };
  try {
    entry.result = (await action()) ?? null;
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(700);
    entry.url = page.url().replace(BASE_URL, '');
    entry.aria = redact(await page.locator('body').ariaSnapshot());
    if (withControls) entry.controls = await controls();
  } catch (error) {
    entry.error = error.message.split('\n')[0];
  }
  await page.screenshot({ path: `${OUT}/${String(steps.length + 1).padStart(2, '0')}-${name.replace(/[^a-z0-9]+/gi, '-')}.png`, fullPage: true });
  steps.push(entry);
  console.log(`${entry.error ? 'error' : 'ok'}: ${name}${entry.error ? ` (${entry.error})` : ''}`);
}

const signInForm = async (password) => {
  await page.getByRole('textbox', { name: 'Username' }).fill(USER);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
};

await step('sign-in page controls', () => page.goto('/admin'), { withControls: true });
await step('wrong password', () => signInForm('not-the-password'));
await step('sign in', async () => {
  await page.goto('/admin');
  await signInForm(PASSWORD);
  await page.waitForURL('**/admin/rooms');
  // Where the sign-in lives: names and flags only, never values.
  const cookies = (await context.cookies()).map(({ name, httpOnly, secure, sameSite, path }) => ({ name, httpOnly, secure, sameSite, path }));
  const storage = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  return { cookies, storage };
}, { withControls: true });

await step('rooms: create a room', async () => {
  const textboxes = page.getByRole('textbox');
  const lists = page.getByRole('combobox');
  await textboxes.nth(0).fill(ROOM);
  await lists.nth(0).selectOption('Double');
  await lists.nth(1).selectOption('true');
  await textboxes.nth(1).fill('123');
  await page.getByRole('checkbox', { name: 'WiFi' }).check();
  await page.getByRole('checkbox', { name: 'Safe' }).check();
  await page.getByRole('button', { name: 'Create' }).click();
  return { room: ROOM };
}, { withControls: true });

await step('rooms: create with nothing filled in', () => page.getByRole('button', { name: 'Create' }).click());

await step('room: open the new room', () => page.getByText(ROOM, { exact: true }).first().click(), { withControls: true });

await step('room: edit the price', async () => {
  await page.getByRole('button', { name: 'Edit' }).click();
  const price = page.locator('#roomPrice, input[name="roomPrice"]').or(page.getByRole('textbox', { name: /price/i })).first();
  await price.fill('124');
  await page.getByRole('button', { name: /update/i }).click();
}, { withControls: true });

await step('rooms: delete the new room', async () => {
  await page.goto('/admin/rooms');
  const row = page.locator('div, li, tr').filter({ has: page.getByText(ROOM, { exact: true }) }).last();
  const remove = row.locator('[class*="delete" i], [class*="Delete"], [aria-label*="delete" i], button').first();
  const html = await row.evaluate((element) => element.outerHTML.slice(0, 1500));
  await remove.click();
  return { rowHtml: html };
});

await step('messages: open the first message', async () => {
  await page.goto('/admin/message');
  await page.getByText('Booking enquiry').first().click();
}, { withControls: true });

await step('messages: close it', () => page.getByRole('button', { name: /close/i }).first().click());

await step('branding: change the name, then put it back', async () => {
  await page.goto('/admin/branding');
  const name = page.getByRole('textbox', { name: 'Enter B&B name' });
  const original = await name.inputValue();
  await name.fill('Shady Meadows Test');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForTimeout(1000);
  const afterChange = redact(await page.locator('body').ariaSnapshot());
  const publicName = await (await context.request.get('/api/branding')).json();
  await page.getByRole('button', { name: /close/i }).first().click().catch(() => {});
  await name.fill(original);
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForTimeout(1000);
  const restored = await (await context.request.get('/api/branding')).json();
  return { original, publicNameAfterChange: publicName.name, restoredName: restored.name, afterChange };
}, { withControls: true });

await step('report: open the calendar', () => page.goto('/admin/report'), { withControls: true });

await step('sign out, then try the old sign-in', async () => {
  const before = token;
  await page.goto('/admin/rooms');
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/admin/rooms'));
  if (!before) return { checked: false, reason: 'no token was seen' };
  const validate = await context.request.post('/api/auth/validate', { data: { token: before } });
  const bookings = await context.request.get('/api/booking/', { headers: { cookie: `token=${before}` } });
  return { checked: true, validateStatus: validate.status(), validateAnswer: redact(await validate.text()), bookingsWithOldToken: bookings.status() };
});

await writeFile(`${OUT}/steps.json`, `${JSON.stringify(steps, null, 2)}\n`);
await writeFile(`${OUT}/calls.json`, `${JSON.stringify(calls, null, 2)}\n`);
await browser.close();
