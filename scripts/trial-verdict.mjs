// Applies the start-up trial's rule, set before the first run (see DECISIONS.md): keep the app if
// all 3 runs end with a working app and the slowest takes 180 s or less from the first image pull
// until every service answers. Reads the runs' timings.json files from the folder given.
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const RUNS = 3;
const LIMIT_S = 180;
const folder = process.argv[2] ?? 'timings';

const runs = Array.from({ length: RUNS }, (_, index) => {
  const file = join(folder, `timings-${index + 1}`, 'timings.json');
  if (!existsSync(file)) return { run: String(index + 1), ok: false, error: 'no timings: the run stopped early' };
  return JSON.parse(readFileSync(file, 'utf8'));
});

const working = runs.filter((run) => run.ok);
const slowest = working.length > 0 ? Math.max(...working.map((run) => run.total_s)) : undefined;
const keep = working.length === RUNS && slowest <= LIMIT_S;

const verdict = keep
  ? `Keep the app: ${RUNS} of ${RUNS} runs worked; the slowest took ${slowest} s (limit ${LIMIT_S} s).`
  : `Fall back: ${working.length} of ${RUNS} runs worked; the slowest working run took ${slowest ?? '-'} s (limit ${LIMIT_S} s).`;

const report = [
  `## ${verdict}`,
  '',
  '| Run | Result | Pull (s) | Start (s) | Total (s) | Machine |',
  '|---|---|---|---|---|---|',
  ...runs.map((run) =>
    [
      run.run,
      run.ok ? 'working app' : `failed: ${run.error}`,
      run.pull_s ?? '-',
      run.start_s ?? '-',
      run.total_s ?? '-',
      run.cpus ? `${run.cpus} CPUs, ${run.memory_gb} GB` : '-',
    ].join(' | ').replace(/^/, '| ').concat(' |'),
  ),
  '',
].join('\n');

console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
if (!keep) process.exitCode = 1;
