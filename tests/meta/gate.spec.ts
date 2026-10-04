import { expect, test } from '@playwright/test';
import { evaluate } from '../../scripts/gate.ts';
import type { Outcome } from '../../scripts/report.ts';

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

test("GATE-01 doesn't count a skipped test as passed", { tag: '@meta' }, () => {
  const verdict = evaluate([result(), result({ status: 'skipped' })], ['API']);
  expect(verdict.pass).toBe(false);
  expect(verdict.areas[0]?.problems).toEqual(['1 skipped']);
});

test('GATE-01 fails a flaky test', { tag: '@meta' }, () => {
  expect(evaluate([result({ status: 'flaky' })], ['API']).pass).toBe(false);
});
