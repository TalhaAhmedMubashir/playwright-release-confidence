// The release gate. Each area of the app gets its own verdict from Playwright's JSON report:
// - every test that ran ended as expected (a known bug counts while it still fails, and fails the
//   gate the day it starts passing, so its mark gets removed);
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
        .map((result) => `${result.knownBug ? 'known bug now passes (remove its mark)' : result.status === 'flaky' ? 'flaky' : 'failed'}: ${result.title} [${result.project}]`),
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
