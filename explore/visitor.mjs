// Explores the running app as a visitor and records what is there, without submitting anything:
// each page's accessibility tree at desktop and phone width, screenshots, forms, links, console
// errors and failed requests, plus the services' API descriptions. Tests take their selectors from
// these records, never from guesses. Writes exploration/, including a Playwright trace of the visit.
// The admin area needs a sign-in and is left out of this pass.
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080';
const OUT = 'exploration';
const MAX_PAGES = 25;
const SKIP = [/^\/admin/];
const SERVICES = ['booking', 'room', 'branding', 'message', 'report'];
const DESKTOP = { width: 1280, height: 800 };
const PHONE = { width: 390, height: 844 };

const slug = (path) => path.replace(/^\/$/, 'home').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';

await mkdir(`${OUT}/pages`, { recursive: true });
await mkdir(`${OUT}/api`, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ baseURL: BASE_URL, viewport: DESKTOP });
await context.tracing.start({ screenshots: true, snapshots: true });
const page = await context.newPage();

const visited = [];
const external = new Set();
const queue = ['/'];
const seen = new Set(queue);

/** Records one page at both widths and queues the pages it links to. */
async function record(path, consoleErrors, failedRequests) {
  const response = await page.goto(path, { waitUntil: 'networkidle' });
  const name = slug(path);
  await writeFile(`${OUT}/pages/${name}.desktop.aria.yml`, await page.locator('body').ariaSnapshot());
  await page.screenshot({ path: `${OUT}/pages/${name}.desktop.png`, fullPage: true });
  await page.setViewportSize(PHONE);
  await writeFile(`${OUT}/pages/${name}.phone.aria.yml`, await page.locator('body').ariaSnapshot());
  await page.screenshot({ path: `${OUT}/pages/${name}.phone.png`, fullPage: true });
  await page.setViewportSize(DESKTOP);

  const forms = await page.locator('form').evaluateAll((elements) =>
    elements.map((form) => ({
      id: form.id || null,
      fields: [...form.querySelectorAll('input, select, textarea')].map((field) => ({
        tag: field.tagName.toLowerCase(),
        type: field.getAttribute('type'),
        name: field.getAttribute('name'),
        id: field.id || null,
        label: (field.labels?.[0]?.textContent ?? field.getAttribute('aria-label') ?? field.getAttribute('placeholder') ?? '').trim(),
        required: field.hasAttribute('required'),
        constraints: Object.fromEntries(
          ['pattern', 'min', 'max', 'minlength', 'maxlength'].filter((key) => field.hasAttribute(key)).map((key) => [key, field.getAttribute(key)]),
        ),
      })),
      buttons: [...form.querySelectorAll('button, input[type="submit"]')].map((button) => (button.textContent || button.getAttribute('value') || '').trim()),
    })),
  );
  const links = await page.locator('a[href]').evaluateAll((elements) =>
    elements.map((link) => ({ text: (link.textContent ?? '').trim().replace(/\s+/g, ' '), href: link.getAttribute('href') })),
  );
  for (const { href } of links) {
    const url = new URL(href, page.url());
    if (url.origin !== new URL(BASE_URL).origin) {
      if (url.protocol.startsWith('http')) external.add(url.href);
      continue;
    }
    const next = url.pathname + url.search;
    if (!seen.has(next) && !SKIP.some((pattern) => pattern.test(url.pathname))) {
      seen.add(next);
      queue.push(next);
    }
  }

  visited.push({ path, status: response?.status() ?? null, title: await page.title(), forms, links, consoleErrors, failedRequests });
  console.log(`${response?.status() ?? '-'} ${path}: ${forms.length} form(s), ${links.length} link(s), ${consoleErrors.length} console error(s)`);
}

while (queue.length > 0 && visited.length < MAX_PAGES) {
  const path = queue.shift();
  const consoleErrors = [];
  const failedRequests = [];
  const onConsole = (message) => message.type() === 'error' && consoleErrors.push(message.text());
  const onResponse = (response) =>
    response.status() >= 400 && failedRequests.push(`${response.status()} ${response.request().method()} ${response.url()}`);
  const onFailed = (request) => failedRequests.push(`failed ${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
  page.on('console', onConsole);
  page.on('response', onResponse);
  page.on('requestfailed', onFailed);
  try {
    await record(path, consoleErrors, failedRequests);
  } catch (error) {
    // One page that can't be recorded is itself a finding; carry on with the rest.
    visited.push({ path, error: error.message.split('\n')[0], consoleErrors, failedRequests });
    console.log(`error ${path}: ${error.message.split('\n')[0]}`);
  }
  page.off('console', onConsole);
  page.off('response', onResponse);
  page.off('requestfailed', onFailed);
}

await writeFile(`${OUT}/pages.json`, `${JSON.stringify({ visited, notVisited: queue, external: [...external].sort() }, null, 2)}\n`);

for (const service of SERVICES) {
  const response = await context.request.get(`${BASE_URL}/api/${service}/v3/api-docs`);
  const body = response.ok() ? JSON.stringify(await response.json(), null, 2) : `HTTP ${response.status()}`;
  await writeFile(`${OUT}/api/${service}.json`, `${body}\n`);
  console.log(`API description for ${service}: HTTP ${response.status()}`);
}

await context.tracing.stop({ path: `${OUT}/trace.zip` });
await browser.close();
