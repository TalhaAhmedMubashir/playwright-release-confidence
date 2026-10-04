// Starts the app in docker-compose.yml, times how long each service takes to answer, then checks
// that the app works through its front end, as a visitor would use it. Writes the numbers to
// timings.json and, in GitHub Actions, to the job summary. Needs Docker with the compose plugin.
import { execFileSync } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
import { availableParallelism, totalmem } from 'node:os';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080';
const TIMEOUT_S = Number(process.env.APP_START_TIMEOUT ?? 600);

// Each service is a Spring Boot app with a health endpoint; the front end answers on /.
const SERVICES = {
  booking: 'http://localhost:3000/booking/actuator/health',
  room: 'http://localhost:3001/room/actuator/health',
  branding: 'http://localhost:3002/branding/actuator/health',
  auth: 'http://localhost:3004/auth/actuator/health',
  report: 'http://localhost:3005/report/actuator/health',
  message: 'http://localhost:3006/message/actuator/health',
  frontend: `${BASE_URL}/`,
};

const since = (start) => Math.round((performance.now() - start) / 100) / 10;
const compose = (...args) => execFileSync('docker', ['compose', ...args], { stdio: 'inherit' });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function get(url) {
  try {
    return await fetch(url, { signal: AbortSignal.timeout(5000) });
  } catch {
    return undefined;
  }
}

function expectOk(response, what) {
  if (!response?.ok) throw new Error(`${what} failed: ${response ? `HTTP ${response.status}` : 'no answer'}`);
}

const result = {
  run: process.env.TRIAL_RUN ?? '1',
  ok: false,
  cpus: availableParallelism(),
  memory_gb: Math.round(totalmem() / 2 ** 30),
  docker: execFileSync('docker', ['version', '--format', '{{.Server.Version}}']).toString().trim(),
  services: {},
};

try {
  const start = performance.now();
  compose('pull', '--quiet');
  result.pull_s = since(start);
  console.log(`Pulled the images in ${result.pull_s} s`);

  const up = performance.now();
  compose('up', '--detach', '--no-build');
  const waiting = new Set(Object.keys(SERVICES));
  while (waiting.size > 0) {
    if (since(up) > TIMEOUT_S) throw new Error(`still waiting after ${TIMEOUT_S} s for: ${[...waiting].join(', ')}`);
    await Promise.all(
      [...waiting].map(async (name) => {
        if ((await get(SERVICES[name]))?.ok) {
          result.services[name] = since(up);
          waiting.delete(name);
          console.log(`${name} answered after ${result.services[name]} s`);
        }
      }),
    );
    if (waiting.size > 0) await sleep(1000);
  }
  result.start_s = since(up);
  result.total_s = since(start);

  // Started is not the same as working: load the home page and the room list through the front end.
  const home = await get(`${BASE_URL}/`);
  expectOk(home, 'The home page');
  const rooms = await get(`${BASE_URL}/api/room`);
  expectOk(rooms, 'The room list');
  console.log(`Room list: ${JSON.stringify(await rooms.json()).slice(0, 400)}`);
  result.ok = true;
} catch (error) {
  result.error = error.message;
  process.exitCode = 1;
  console.error(`::error::${error.message}`);
} finally {
  writeFileSync('timings.json', `${JSON.stringify(result, null, 2)}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary(result));
}

function summary(r) {
  return [
    `### Run ${r.run}: ${r.ok ? 'working app' : `failed (${r.error})`}`,
    '',
    `Machine: ${r.cpus} CPUs, ${r.memory_gb} GB memory, Docker ${r.docker}.`,
    '',
    '| Step | Seconds |',
    '|---|---|',
    `| Pull the images | ${r.pull_s ?? '-'} |`,
    `| Start until every service answers | ${r.start_s ?? '-'} |`,
    `| **Total** | **${r.total_s ?? '-'}** |`,
    '',
    '| Service | Answered after (s) |',
    '|---|---|',
    ...Object.entries(r.services).map(([name, seconds]) => `| ${name} | ${seconds} |`),
    '',
  ].join('\n');
}
