// Honest signal: TEST-CASES.md is the test-case list the owner approved, so it must say what the
// tests do, and STRATEGY.md must put every test case under a risk. CI fails when they drift apart:
//   - a test without an ID, an ID without a row, or a row without a test;
//   - one ID naming tests with different tags, such as a passing check and its known bug;
//   - a row whose Runs or Tags column differs from the code;
//   - a finding whose Test column differs from the tests that link its issue;
//   - a test case under no risk in STRATEGY.md, or a risk naming a test that doesn't exist.
// Usage: node scripts/check-test-cases.ts
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import type { JSONReport, JSONReportSuite } from '@playwright/test/reporter';
import { areaOf } from './report.ts';

/** A test as the runner lists it, once however many projects run it. */
export interface Listed {
  file: string;
  title: string;
  /** Its tags, without the @. */
  tags: string[];
  /** The issues its annotations link. */
  issues: number[];
  /** Whether every pull request runs it. */
  onPullRequest: boolean;
}

interface Table {
  columns: string[];
  rows: Record<string, string>[];
}

const ID = /^([A-Z][A-Z0-9]*-\d{2})\s/;

/** Every table in a Markdown text. */
export function tables(markdown: string): Table[] {
  const lines = markdown.split(/\r?\n/);
  const cells = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
  const found: Table[] = [];
  let index = 0;
  while (index < lines.length) {
    const header = lines[index] ?? '';
    if (header.startsWith('|') && /^\|[\s|:-]+\|$/.test((lines[index + 1] ?? '').trim())) {
      const columns = cells(header);
      const rows: Record<string, string>[] = [];
      for (index += 2; (lines[index] ?? '').startsWith('|'); index++) {
        const values = cells(lines[index] ?? '');
        rows.push(Object.fromEntries(columns.map((column, at) => [column, values[at] ?? ''])));
      }
      found.push({ columns, rows });
    } else {
      index++;
    }
  }
  return found;
}

/** The test IDs a text names, with ranges like "UI-01 to UI-09" written out. */
export function idsIn(text: string): string[] {
  const written = text.replace(/\b([A-Z][A-Z0-9]*)-(\d{2}) to \1-(\d{2})\b/g, (_range, prefix: string, from: string, to: string) =>
    Array.from({ length: Number(to) - Number(from) + 1 }, (_each, step) => `${prefix}-${String(Number(from) + step).padStart(2, '0')}`).join(', '),
  );
  return written.match(/\b[A-Z][A-Z0-9]*-\d{2}\b/g) ?? [];
}

const tagsIn = (text: string) => (text.match(/@[\w-]+/g) ?? []).map((tag) => tag.slice(1));
const same = (a: Iterable<string>, b: Iterable<string>) => [...new Set(a)].sort().join(' ') === [...new Set(b)].sort().join(' ');
const shown = (tags: Iterable<string>) => [...new Set(tags)].sort().map((tag) => `@${tag}`).join(' ') || 'none';

/** Every way TEST-CASES.md (and STRATEGY.md's risks) fail to say what the tests do. */
export function mismatches(tests: Listed[], testCases: string, strategy: string): string[] {
  const problems: string[] = [];

  const byId = new Map<string, Listed[]>();
  for (const test of tests) {
    if (areaOf(test.file) === 'Setup') continue;
    const id = ID.exec(test.title)?.[1];
    if (id) byId.set(id, [...(byId.get(id) ?? []), test]);
    else problems.push(`A test has no ID: "${test.title}".`);
  }

  const listTables = tables(testCases);
  const caseRows = listTables.filter((table) => table.columns[0] === 'ID').flatMap((table) => table.rows);
  const rowOf = new Map<string, Record<string, string>>();
  for (const row of caseRows) {
    const id = row['ID'] ?? '';
    if (rowOf.has(id)) problems.push(`${id} has more than one row in TEST-CASES.md; an ID gets one row.`);
    rowOf.set(id, row);
  }

  for (const [id, mine] of byId) {
    const kinds = new Set(mine.map((test) => shown(test.tags)));
    if (kinds.size > 1) problems.push(`${id} names tests with different tags (${[...kinds].join('; ')}), so they can't share one expected result. Give each its own ID.`);
    const runs = new Set<string>(mine.map((test) => (test.onPullRequest ? 'PR' : 'Nightly')));
    if (runs.size > 1) problems.push(`${id} names tests that run at different times (${[...runs].join(', ')}).`);

    const row = rowOf.get(id);
    if (!row) {
      problems.push(`${id} has tests but no row in TEST-CASES.md.`);
      continue;
    }
    const tags = mine.flatMap((test) => test.tags);
    if ('Tags' in row && !same(tagsIn(row['Tags'] ?? ''), tags)) problems.push(`${id}: its row's tags are ${shown(tagsIn(row['Tags'] ?? ''))}, its tests' are ${shown(tags)}.`);
    if ('Runs' in row && runs.size === 1 && !runs.has(row['Runs'] ?? '')) problems.push(`${id}: its row says it runs ${row['Runs'] ?? ''}, its tests run ${[...runs].join('')}.`);
  }
  for (const id of rowOf.keys()) if (!byId.has(id)) problems.push(`${id} has a row in TEST-CASES.md but no test.`);

  const findings = listTables.filter((table) => table.columns.includes('Issue') && table.columns.includes('Test')).flatMap((table) => table.rows);
  const linked = new Set(tests.flatMap((test) => test.issues));
  const named = new Set<number>();
  for (const finding of findings) {
    const issue = Number(/#(\d+)/.exec(finding['Issue'] ?? '')?.[1]);
    named.add(issue);
    const linking = [...byId].filter(([, mine]) => mine.some((test) => test.issues.includes(issue))).map(([id]) => id);
    const written = idsIn(finding['Test'] ?? '');
    if (!same(written, linking)) problems.push(`${finding['#'] ?? '?'} (issue #${issue}) names ${written.join(', ') || 'no test'}; the tests that link #${issue} are ${linking.join(', ') || 'none'}.`);
  }
  for (const issue of linked) if (!named.has(issue)) problems.push(`Issue #${issue} is linked by a test but has no finding in TEST-CASES.md.`);

  const covered = new Set(tables(strategy).filter((table) => table.columns.includes('Covered by')).flatMap((table) => table.rows.flatMap((row) => idsIn(row['Covered by'] ?? ''))));
  for (const [id, mine] of byId) {
    // The suite's self-tests guard the suite itself, not a risk to the app.
    if (mine.every((test) => areaOf(test.file) === 'Honest signals')) continue;
    if (!covered.has(id)) problems.push(`${id} is under no risk in STRATEGY.md.`);
  }
  for (const id of covered) if (!byId.has(id)) problems.push(`STRATEGY.md names ${id}, which has no test.`);

  return problems;
}

/** Runs `playwright test --list` with the given arguments, and answers each test it lists once. */
function list(args: string[]): Map<string, Omit<Listed, 'onPullRequest'>> {
  const output = execFileSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '--list', '--reporter=json', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const found = new Map<string, Omit<Listed, 'onPullRequest'>>();
  const walk = (suite: JSONReportSuite) => {
    for (const spec of suite.specs) {
      const issues = spec.tests.flatMap((test) => test.annotations).flatMap((note) => (note.type === 'issue' ? [Number(/\/issues\/(\d+)$/.exec(note.description ?? '')?.[1])] : []));
      found.set(`${spec.file} ${spec.title}`, { file: spec.file, title: spec.title, tags: spec.tags.map((tag) => tag.replace(/^@/, '')), issues: [...new Set(issues)] });
    }
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const suite of (JSON.parse(output) as JSONReport).suites) walk(suite);
  return found;
}

/** The arguments an npm script passes to `playwright test`. */
function argumentsOf(script: string): string[] {
  const command = (JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> }).scripts[script] ?? '';
  return (command.match(/"[^"]*"|\S+/g) ?? []).slice(2).map((word) => word.replace(/^"|"$/g, ''));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  // CI runs both of these on every pull request (ci.yml).
  const onPullRequest = new Set([...list(argumentsOf('test:pr')).keys(), ...list(argumentsOf('test:meta')).keys()]);
  const tests = [...list([])].map(([key, test]) => ({ ...test, onPullRequest: onPullRequest.has(key) }));
  const problems = mismatches(tests, readFileSync('TEST-CASES.md', 'utf8'), readFileSync('STRATEGY.md', 'utf8'));
  if (problems.length > 0) {
    console.error(`TEST-CASES.md no longer says what the tests do:\n${problems.map((problem) => `  ${problem}`).join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log(`TEST-CASES.md matches the tests (${tests.length} tests), and every test case is under a risk in STRATEGY.md.`);
  }
}
