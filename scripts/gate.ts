// The release gate. Each area of the app gets its own verdict from Playwright's JSON report:
// - every test that ran ended as expected (a known bug counts while it still fails, and fails the
//   gate the day it starts passing, so its mark gets removed);
// - a known bug counts only when its test fails on its own check, the one whose message names its
//   issue: a failure anywhere else (a broken control check, a fixture, the settings guard) would
//   otherwise pass as the bug;
// - a skipped test is not a passed one;
// - an area where no test ran fails: silence is not success.
// Usage: node scripts/gate.ts <report.json> [--require "API,Home page,..."]
import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import type { JSONReport } from '@playwright/test/reporter';
import { type Outcome, outcomes } from './report.ts';

export interface AreaVerdict {
  area: string;
  ran: number;
  knownBugs: number;
  skipped: number;
  problems: string[];
  pass: boolean;
}

/**
 * Whether a known bug's test failed on its own check: one of its errors names its issue ("#13",
 * never the "#1" inside "#13"). A result with no issue or no errors to read (a --list) can't say.
 */
export function failedOnItsOwnCheck(result: Outcome): boolean {
  if (result.issue === undefined || result.errors === undefined) return true;
  const mark = new RegExp(`#${result.issue}(?!\\d)`);
  return result.errors.some((message) => mark.test(message));
}

/** What went wrong with a test that didn't end as expected. */
function problem(result: Outcome): string {
  if (!result.knownBug) return result.status === 'flaky' ? 'flaky' : 'failed';
  if (result.ended === undefined || result.ended === 'passed') return 'known bug now passes (remove its mark)';
  return `known bug test ended ${result.ended}, not on its own check`;
}

export function evaluate(results: Outcome[], required: string[]): { areas: AreaVerdict[]; pass: boolean } {
  const names = [...new Set([...required, ...results.map((result) => result.area)])];
  const areas = names.map((area) => {
    const mine = results.filter((result) => result.area === area);
    const ran = mine.filter((result) => result.status !== 'skipped');
    const skipped = mine.length - ran.length;
    const problems = [
      ...(ran.length === 0 ? ['no tests ran'] : []),
      ...(skipped > 0 ? [`${skipped} skipped`] : []),
      ...mine
        .filter((result) => result.status === 'unexpected' || result.status === 'flaky')
        .map((result) => `${problem(result)}: ${result.title} [${result.project}]`),
      ...mine
        .filter((result) => result.knownBug && result.status === 'expected' && !failedOnItsOwnCheck(result))
        .map((result) => `known bug failed for another reason, not on its check for issue #${result.issue}: ${result.title} [${result.project}]`),
    ];
    return { area, ran: ran.length, knownBugs: ran.filter((result) => result.knownBug).length, skipped, problems, pass: problems.length === 0 };
  });
  return { areas, pass: areas.every((area) => area.pass) };
}

export function summary({ areas, pass }: ReturnType<typeof evaluate>): string {
  return [
    `## Release gate: ${pass ? 'pass' : 'fail'}`,
    '',
    '| Area | Tests run | Known bugs (expected to fail) | Verdict |',
    '|---|---|---|---|',
    ...areas.map((area) => `| ${area.area} | ${area.ran} | ${area.knownBugs} | ${area.pass ? 'pass' : `**fail**: ${area.problems.join('; ')}`} |`),
    '',
  ].join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [file = 'test-results/results.json', flag, list = ''] = process.argv.slice(2);
  const required = flag === '--require' ? list.split(',').map((area) => area.trim()).filter(Boolean) : [];
  const verdict = evaluate(outcomes(JSON.parse(readFileSync(file, 'utf8')) as JSONReport), required);
  const text = summary(verdict);
  console.log(text);
  if (process.env['GITHUB_STEP_SUMMARY']) appendFileSync(process.env['GITHUB_STEP_SUMMARY'], text);
  process.exitCode = verdict.pass ? 0 : 1;
}
