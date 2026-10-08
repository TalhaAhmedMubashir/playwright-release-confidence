import { execFile } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';
import { ESLint } from 'eslint';
import { uncollected } from '../../scripts/check-collected.ts';
import { type Listed, mismatches } from '../../scripts/check-test-cases.ts';
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

// A test-case list, a finding and a risk that agree with two tests; each drift below breaks one thing.
const tested = (title: string, overrides: Partial<Listed> = {}): Listed => ({ file: 'api/rooms.spec.ts', title, tags: ['api'], issues: [], onPullRequest: true, ...overrides });
const CHECK = tested('API-01 a');
const ITS_BUG = tested('API-02 b', { tags: ['api', 'known-bug'], issues: [1] });
const row = (id: string, runs: string, tags: string) => `| ${id} | a check | ${runs} | ${tags} |`;
const caseList = (rows: string[], findingTest = 'API-02') =>
  ['| ID | Check | Runs | Tags |', '|---|---|---|---|', ...rows, '', '| # | What happens | Issue | Test |', '|---|---|---|---|', `| F1 | b | [#1](x) | ${findingTest} |`].join('\n');
const ROWS = [row('API-01', 'PR', '`@api`'), row('API-02', 'PR', '`@api` `@known-bug`')];
const risks = (covered: string) => `| Risk | Why it matters | Covered by |\n|---|---|---|\n| r | w | ${covered} |\n`;

test('SIG-04 the test-case check passes a list that says what the tests do', { tag: '@meta' }, () => {
  expect(mismatches([CHECK, ITS_BUG], caseList(ROWS), risks('API-01 to API-02'))).toEqual([]);
  expect(mismatches([CHECK, ITS_BUG], caseList(ROWS).replaceAll('\n', '\r\n'), risks('API-01 to API-02')), 'with Windows line endings').toEqual([]);
});

test('SIG-04 the test-case check spots each way the list can drift from the tests', { tag: '@meta' }, () => {
  const RISKS = risks('API-01 to API-02');
  expect.soft(mismatches([CHECK, ITS_BUG, tested('no ID here')], caseList(ROWS), RISKS)).toContain('A test has no ID: "no ID here".');
  expect.soft(mismatches([CHECK, ITS_BUG, tested('API-03 c')], caseList(ROWS), RISKS)).toContain('API-03 has tests but no row in TEST-CASES.md.');
  expect.soft(mismatches([CHECK, ITS_BUG], caseList([...ROWS, row('LOAD-01', 'Nightly', '')]), RISKS)).toContain('LOAD-01 has a row in TEST-CASES.md but no test.');
  expect.soft(mismatches([CHECK, ITS_BUG, tested('API-01 its known bug', { tags: ['api', 'known-bug'] })], caseList(ROWS), RISKS)).toContainEqual(expect.stringContaining('API-01 names tests with different tags'));
  expect.soft(mismatches([CHECK, ITS_BUG], caseList([row('API-01', 'PR', '`@api` `@regression`'), ...ROWS.slice(1)]), RISKS)).toContain("API-01: its row's tags are @api @regression, its tests' are @api.");
  expect.soft(mismatches([CHECK, ITS_BUG], caseList([row('API-01', 'Nightly', '`@api`'), ...ROWS.slice(1)]), RISKS)).toContain('API-01: its row says it runs Nightly, its tests run PR.');
  expect.soft(mismatches([CHECK, ITS_BUG], caseList(ROWS, 'API-01'), RISKS)).toContain('F1 (issue #1) names API-01; the tests that link #1 are API-02.');
  expect.soft(mismatches([tested('API-01 a', { issues: [2] }), ITS_BUG], caseList(ROWS), RISKS)).toContain('Issue #2 is linked by a test but has no finding in TEST-CASES.md.');
  expect.soft(mismatches([CHECK, ITS_BUG], caseList(ROWS), risks('API-01'))).toContain('API-02 is under no risk in STRATEGY.md.');
  expect.soft(mismatches([CHECK, ITS_BUG], caseList(ROWS), risks('API-01 to API-03'))).toContain('STRATEGY.md names API-03, which has no test.');
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
