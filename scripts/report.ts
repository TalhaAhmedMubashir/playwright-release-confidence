// Reading Playwright's JSON report, shared by the gate and the README numbers.
import type { JSONReport, JSONReportSuite } from '@playwright/test/reporter';

export interface Outcome {
  area: string;
  file: string;
  title: string;
  project: string;
  status: 'expected' | 'unexpected' | 'flaky' | 'skipped';
  knownBug: boolean;
  /** The issue a known bug's test links, from its "issue" annotation. */
  issue?: number;
  /** How its last run ended ("passed", "failed", "timedOut"…); absent in a --list. */
  ended?: string;
  /** The error messages of its last run, without colour codes; absent in a --list. */
  errors?: string[];
}

const NAMED_FILES: Record<string, string> = { home: 'Home page', contact: 'Contact form', booking: 'Booking', admin: 'Admin area' };

/** The terminal colour codes Playwright puts in error messages. */
// eslint-disable-next-line no-control-regex
const COLOUR = /\u001b\[[0-9;]*m/g;

/** The part of the app a test file covers, from its folder and name. */
export function areaOf(file: string): string {
  const path = file.replaceAll('\\', '/');
  if (/(^|\/)api\//.test(path)) return 'API';
  if (/(^|\/)a11y\//.test(path)) return 'Accessibility';
  if (/(^|\/)meta\//.test(path)) return 'Honest signals';
  if (/(^|\/)setup\//.test(path)) return 'Setup';
  const name = /([\w-]+)\.spec\.ts$/.exec(path)?.[1] ?? 'other';
  return NAMED_FILES[name] ?? name;
}

/** Every test in a report (or a --list), once per project it runs in. */
export function outcomes(report: JSONReport): Outcome[] {
  const found: Outcome[] = [];
  const walk = (suite: JSONReportSuite) => {
    for (const spec of suite.specs) {
      for (const test of spec.tests) {
        const issue = /\/issues\/(\d+)$/.exec(test.annotations?.find((annotation) => annotation.type === 'issue')?.description ?? '')?.[1];
        const last = test.results?.at(-1);
        found.push({
          area: areaOf(spec.file),
          file: spec.file,
          title: spec.title,
          project: test.projectName,
          status: test.status,
          knownBug: spec.tags.some((tag) => tag.replace(/^@/, '') === 'known-bug'),
          ...(issue ? { issue: Number(issue) } : {}),
          ...(last ? { ended: last.status, errors: (last.errors ?? []).map((error) => (error.message ?? '').replace(COLOUR, '')) } : {}),
        });
      }
    }
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const suite of report.suites) walk(suite);
  return found;
}
