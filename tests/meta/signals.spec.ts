import { execFile } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';
import { ESLint } from 'eslint';
import { uncollected } from '../../scripts/check-collected.ts';
import { END, numbers, START, withNumbers } from '../../scripts/readme-numbers.ts';
import type { Outcome } from '../../scripts/report.ts';

// Each honest-signal check must be able to fail, or a green run proves nothing.

const exec = promisify(execFile);

test('SIG-01 a test file the runner never collects is reported', { tag: '@meta' }, () => {
  expect(uncollected(['api/rooms.spec.ts', 'ui\\home.spec.ts', 'ui/typo.spec.ts'], ['api/rooms.spec.ts', 'ui/home.spec.ts'])).toEqual(['ui/typo.spec.ts']);
});

test('SIG-01 the real check fails on a test file outside every project', { tag: '@meta' }, async () => {
  test.setTimeout(120_000);
  await mkdir('tests/stray', { recursive: true });
  await writeFile('tests/stray/never.spec.ts', "import { expect, test } from '@playwright/test';\ntest('never runs', () => { expect(1 + 1).toBe(2); });\n");
  try {
    const run = await exec(process.execPath, ['scripts/check-collected.ts']).then(
      () => ({ failed: false, output: '' }),
      (error: { stderr?: string }) => ({ failed: true, output: error.stderr ?? '' }),
    );
    expect(run.failed).toBe(true);
    expect(run.output).toContain('tests/stray/never.spec.ts');
  } finally {
    await rm('tests/stray', { recursive: true, force: true });
  }
});

const listed = (overrides: Partial<Outcome>): Outcome => ({ area: 'API', file: 'api/rooms.spec.ts', title: 'a', project: 'api', status: 'expected', knownBug: false, ...overrides });

test('SIG-03 the README numbers come from the tests, and a stale README is spotted', { tag: '@meta' }, () => {
  const block = numbers([listed({}), listed({ title: 'b', knownBug: true }), listed({ area: 'Booking', file: 'ui/booking.spec.ts', project: 'chromium' })]);
  expect(block).toContain('| API | 2 | 1 | api |');
  expect(block).toContain('| Booking | 1 | 0 | chromium |');
  const readme = `# Title\n\n${START}\nold numbers\n${END}\n`;
  expect(withNumbers(readme, block)).not.toBe(readme);
  expect(withNumbers(withNumbers(readme, block), block)).toBe(withNumbers(readme, block));
});

// Lint with the repo's own config, on planted code linted as if it were a test file.
const eslint = new ESLint();
async function rulesBrokenBy(body: string): Promise<string[]> {
  const code = `import { expect, test } from '@playwright/test';\n\n${body}\n`;
  const [result] = await eslint.lintText(code, { filePath: 'tests/meta/signals.spec.ts' });
  return (result?.messages ?? []).map((message) => message.ruleId ?? message.message);
}

const PLANTED: [what: string, code: string, rule: string][] = [
  ['a test with no assertion', "test('t', async ({ page }) => { await page.goto('/'); });", 'playwright/expect-expect'],
  ['an assertion that is never awaited', "test('t', async ({ page }) => { expect(page.getByText('x')).toBeVisible(); });", 'playwright/missing-playwright-await'],
  ['an assertion on a constant', "test('t', async () => { expect(true).toBe(true); });", 'no-restricted-syntax'],
  ['an assertion that may never run', "test('t', async ({ page }) => { if (page.url()) { await expect(page).toHaveTitle('x'); } });", 'playwright/no-conditional-in-test'],
  ['a skipped test', "test.skip('t', async ({ page }) => { await expect(page).toHaveTitle('x'); });", 'playwright/no-skipped-test'],
  ['a focused test', "test.only('t', async ({ page }) => { await expect(page).toHaveTitle('x'); });", 'playwright/no-focused-test'],
  ['a fixed wait', "test('t', async ({ page }) => { await page.waitForTimeout(1000); await expect(page).toHaveTitle('x'); });", 'playwright/no-wait-for-timeout'],
];

for (const [what, code, rule] of PLANTED) {
  test(`SIG-02 lint stops ${what}`, { tag: '@meta' }, async () => {
    expect(await rulesBrokenBy(code)).toContain(rule);
  });
}

test('SIG-02 lint passes a test that checks what the app did', { tag: '@meta' }, async () => {
  expect(await rulesBrokenBy("test('t', async ({ page }) => { await page.goto('/'); await expect(page.getByRole('heading')).toBeVisible(); });")).toEqual([]);
});
