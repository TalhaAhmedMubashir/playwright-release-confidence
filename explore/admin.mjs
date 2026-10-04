// Explores the admin area of our own copy of the app, signed in with the app's published default
// login, and records what is there: each admin page's accessibility tree, a screenshot, its forms,
// and the API calls the pages make (they show how signing in works). It refuses any address other
// than this machine, so it can never sign in to someone else's copy. The password and the sign-in
// token are blanked out of everything it writes. Writes exploration/admin/.
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080';
if (!['localhost', '127.0.0.1'].includes(new URL(BASE_URL).hostname)) {
  throw new Error(`Refusing to sign in at ${BASE_URL}: the admin exploration runs on our own copy only.`);
}
// The app's published default login (its README). Our copy starts with it.
const USER = process.env.RBP_ADMIN_USER ?? 'admin';
const PASSWORD = process.env.RBP_ADMIN_PASSWORD ?? 'password';
const OUT = 'exploration/admin';
const MAX_PAGES = 20;

const slug = (path) => path.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/-$/, '') || 'root';
const redact = (text) =>
  (text ?? '')
    .replaceAll(PASSWORD, '<password>')
    .replace(/("token"\s*:\s*")[^"]+"/g, '$1<token>"')
    .replace(/(token=)[^;&\s"]+/g, '$1<token>');

await mkdir(`${OUT}/pages`, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ baseURL: BASE_URL, viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

const calls = [];
let current = 'start';
page.on('response', async (response) => {
  const url = new URL(response.url());
  if (!url.pathname.startsWith('/api/')) return;
  const answer = await response.text().catch(() => null);
  calls.push({
    step: current,
    method: response.request().method(),
    path: url.pathname + url.search,
    status: response.status(),
    sent: redact(response.request().postData()),
    answer: redact(answer).slice(0, 1500),
    setsCookie: (await response.allHeaders())['set-cookie'] ? redact((await response.allHeaders())['set-cookie']) : null,
  });
});

const visited = [];
/** Records the page that is open now. */
async function record(name) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await writeFile(`${OUT}/pages/${name}.aria.yml`, await page.locator('body').ariaSnapshot());
  await page.screenshot({ path: `${OUT}/pages/${name}.png`, fullPage: true });
  const forms = await page.locator('form').evaluateAll((elements) =>
    elements.map((form) => ({
      fields: [...form.querySelectorAll('input, select, textarea')].map((field) => ({
        tag: field.tagName.toLowerCase(),
        type: field.getAttribute('type'),
        id: field.id || null,
        name: field.getAttribute('name'),
        label: (field.labels?.[0]?.textContent ?? field.getAttribute('aria-label') ?? field.getAttribute('placeholder') ?? '').trim(),
        required: field.hasAttribute('required'),
      })),
      buttons: [...form.querySelectorAll('button, input[type="submit"]')].map((button) => (button.textContent || button.getAttribute('value') || '').trim()),
    })),
  );
  const links = await page.locator('a[href]').evaluateAll((elements) => elements.map((link) => ({ text: (link.textContent ?? '').trim(), href: link.getAttribute('href') })));
  const buttons = await page.getByRole('button').evaluateAll((elements) => elements.map((button) => (button.textContent ?? '').trim() || button.getAttribute('aria-label') || '(no name)'));
  visited.push({ name, url: page.url().replace(BASE_URL, ''), title: await page.title(), forms, links, buttons });
  console.log(`recorded ${name}: ${page.url().replace(BASE_URL, '')}, ${forms.length} form(s), ${links.length} link(s)`);
  return links;
}

// 1. The sign-in page, before signing in.
current = 'sign-in page';
await page.goto('/admin');
await record('sign-in');

// 2. Sign in: the form's text field and password field, then its button.
current = 'sign in';
const form = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
await form.locator('input:not([type="password"]):not([type="hidden"]):not([type="checkbox"])').first().fill(USER);
await form.locator('input[type="password"]').fill(PASSWORD);
await form.locator('button, input[type="submit"]').first().click();
const cookies = (await context.cookies()).map(({ name, httpOnly, secure, sameSite, path }) => ({ name, httpOnly, secure, sameSite, path }));
const firstLinks = await record('signed-in');

// 3. Every admin page reachable by a link, signed in.
const seen = new Set([new URL(page.url()).pathname]);
const queue = firstLinks.map(({ href }) => new URL(href ?? '', page.url())).filter((url) => url.origin === new URL(BASE_URL).origin && url.pathname.startsWith('/admin'));
while (queue.length > 0 && visited.length < MAX_PAGES) {
  const url = queue.shift();
  if (seen.has(url.pathname)) continue;
  seen.add(url.pathname);
  current = `page ${url.pathname}`;
  await page.goto(url.pathname + url.search);
  for (const { href } of await record(slug(url.pathname))) {
    const next = new URL(href ?? '', page.url());
    if (next.origin === new URL(BASE_URL).origin && next.pathname.startsWith('/admin') && !seen.has(next.pathname)) queue.push(next);
  }
}

// 4. Sign out, from the first page that offers it.
current = 'sign out';
await page.goto('/admin');
const signOut = page.getByRole('button', { name: /log ?out|sign ?out/i }).or(page.getByRole('link', { name: /log ?out|sign ?out/i })).first();
if (await signOut.count()) {
  await signOut.click();
  await record('signed-out');
}

await writeFile(`${OUT}/visited.json`, `${JSON.stringify({ cookies, visited }, null, 2)}\n`);
await writeFile(`${OUT}/calls.json`, `${JSON.stringify(calls, null, 2)}\n`);
await browser.close();
