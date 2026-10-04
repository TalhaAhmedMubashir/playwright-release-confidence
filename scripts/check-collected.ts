// Honest signal: every test file runs. A file the runner never collects (a typo in its name, a
// folder outside every project, a file with no tests) passes silently forever, so CI checks each
// file on disk against what `playwright test --list` collects.
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import type { JSONReport } from '@playwright/test/reporter';
import { outcomes } from './report.ts';

/** Test files on disk (relative to tests/) that the runner didn't collect. */
export function uncollected(onDisk: string[], collected: string[]): string[] {
  const seen = new Set(collected.map((file) => file.replaceAll('\\', '/')));
  return onDisk.map((file) => file.replaceAll('\\', '/')).filter((file) => !seen.has(file));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const onDisk = readdirSync('tests', { recursive: true, encoding: 'utf8' }).filter((file) => /\.(spec|setup)\.ts$/.test(file));
  const list = execFileSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '--list', '--reporter=json'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const missing = uncollected(onDisk, outcomes(JSON.parse(list) as JSONReport).map((outcome) => outcome.file));
  if (missing.length > 0) {
    console.error(`Test files the runner never collects:\n${missing.map((file) => `  tests/${file}`).join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log(`Every test file is collected: ${onDisk.length} files.`);
  }
}
