// Reading Playwright's JSON report, shared by the gate and the README numbers.
import type { JSONReport, JSONReportSuite } from '@playwright/test/reporter';

export interface Outcome {
  area: string;
  file: string;
  title: string;
  project: string;
  status: 'expected' | 'unexpected' | 'flaky' | 'skipped';
  knownBug: boolean;
}

const NAMED_FILES: Record<string, string> = { home: 'Home page', contact: 'Contact form', booking: 'Booking', admin: 'Admin area' };

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
        found.push({
          area: areaOf(spec.file),
          file: spec.file,
          title: spec.title,
          project: test.projectName,
          status: test.status,
          knownBug: spec.tags.some((tag) => tag.replace(/^@/, '') === 'known-bug'),
        });
      }
    }
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const suite of report.suites) walk(suite);
  return found;
}
