import { expect, test } from '@playwright/test';
import type { JSONReport } from '@playwright/test/reporter';
import { evaluate } from '../../scripts/gate.ts';
import { type Outcome, outcomes } from '../../scripts/report.ts';

// The gate decides whether a run is good enough; these prove it can say no.

const result = (overrides: Partial<Outcome> = {}): Outcome => ({
  area: 'API',
  file: 'api/rooms.spec.ts',
  title: 'a test',
  project: 'api',
  status: 'expected',
  knownBug: false,
  ...overrides,
});

test('GATE-01 passes when every area ran and every test ended as expected', { tag: '@meta' }, () => {
  expect(evaluate([result(), result({ area: 'Booking' })], ['API', 'Booking']).pass).toBe(true);
});

test('GATE-01 fails an area where no test ran', { tag: '@meta' }, () => {
  const verdict = evaluate([result()], ['API', 'Booking']);
  expect(verdict.pass).toBe(false);
  expect(verdict.areas.find((area) => area.area === 'Booking')?.problems).toEqual(['no tests ran']);
});

test('GATE-01 fails a failed test, naming it', { tag: '@meta' }, () => {
  const verdict = evaluate([result(), result({ status: 'unexpected', title: 'rooms match their schema' })], ['API']);
  expect(verdict.pass).toBe(false);
  expect(verdict.areas[0]?.problems).toEqual(['failed: rooms match their schema [api]']);
});

test('GATE-01 counts a known bug that still fails as expected, and fails one that starts passing', { tag: '@meta' }, () => {
  expect(evaluate([result({ knownBug: true })], ['API']).pass).toBe(true);
  const fixed = evaluate([result({ knownBug: true, status: 'unexpected', title: 'messages need a sign-in' })], ['API']);
  expect(fixed.pass).toBe(false);
  expect(fixed.areas[0]?.problems).toEqual(['known bug now passes (remove its mark): messages need a sign-in [api]']);
});

// A test expected to fail passes whatever made it fail, so a broken control check, a fixture or the
// settings guard could pass as the bug. The bug's own check names its issue; the gate looks for it.
test('GATE-01 counts a known bug only when its test fails on the check that names its issue', { tag: '@meta' }, () => {
  const known = { knownBug: true, issue: 13, ended: 'failed', title: 'a new room appears on the home page' };
  expect(evaluate([result({ ...known, errors: ['Error: the new room on the home page (#13)\n\nexpect(locator).toBeVisible() failed'] })], ['API']).pass).toBe(true);
  const elsewhere = evaluate([result({ ...known, errors: ['Error: creating the room\n\nexpect(received).toBe(expected)'] })], ['API']);
  expect(elsewhere.pass).toBe(false);
  expect(elsewhere.areas[0]?.problems).toEqual(['known bug failed for another reason, not on its check for issue #13: a new room appears on the home page [api]']);
  // "#1" is not "#13".
  expect(evaluate([result({ ...known, errors: ['Error: reading the messages (#1)'] })], ['API']).pass).toBe(false);
});

test('GATE-01 names a known bug whose test timed out, instead of calling it fixed', { tag: '@meta' }, () => {
  const verdict = evaluate([result({ knownBug: true, issue: 2, status: 'unexpected', ended: 'timedOut', title: 'taken dates' })], ['API']);
  expect(verdict.pass).toBe(false);
  expect(verdict.areas[0]?.problems).toEqual(['known bug test ended timedOut, not on its own check: taken dates [api]']);
});

test("GATE-01 reads each test's issue, and how its last run ended and why, from the report", { tag: '@meta' }, () => {
  const report = {
    suites: [
      {
        title: 'ui/home.spec.ts',
        file: 'ui/home.spec.ts',
        specs: [
          {
            title: 'UI-17 a newly added room appears on the home page',
            file: 'ui/home.spec.ts',
            tags: ['ui', 'known-bug'],
            tests: [
              {
                projectName: 'chromium',
                status: 'expected',
                annotations: [{ type: 'issue', description: 'https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/13' }],
                results: [{ status: 'failed', errors: [{ message: '\u001b[31mError: the new room on the home page (#13)\u001b[39m' }] }],
              },
            ],
          },
        ],
      },
    ],
  } as unknown as JSONReport;
  expect(outcomes(report)).toEqual([
    expect.objectContaining({ area: 'Home page', knownBug: true, issue: 13, ended: 'failed', errors: ['Error: the new room on the home page (#13)'] }),
  ]);
});

test("GATE-01 doesn't count a skipped test as passed", { tag: '@meta' }, () => {
  const verdict = evaluate([result(), result({ status: 'skipped' })], ['API']);
  expect(verdict.pass).toBe(false);
  expect(verdict.areas[0]?.problems).toEqual(['1 skipped']);
});

test('GATE-01 fails a flaky test', { tag: '@meta' }, () => {
  expect(evaluate([result({ status: 'flaky' })], ['API']).pass).toBe(false);
});
