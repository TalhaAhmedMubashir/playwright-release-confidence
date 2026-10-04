# Decisions

Each decision records the options, the rule used to choose, and the result. Rules are written down
before the measurement they judge.

## 1. The app under test (2026-10-04)

**Question:** which app do the tests run against?

**Options:**

- **Restful-Booker-Platform (RBP):** open source (GPL-3.0), made for testing practice: a booking
  site, an admin area and REST APIs, split across 7 services. Runs from published images.
- **Toolshop (practice-software-testing):** ruled out. Its licence allows only private, internal,
  non-commercial use.
- **A small app of our own:** full control, but an app built to be tested proves less.

**Rule, set before the first run:** keep RBP if all 3 CI runs end with a working app and the
slowest takes 180 seconds or less, from the first image pull until every service answers. "Working"
means every service's health check passes, and the home page and the room list load through the
front end. Otherwise, fall back to a small app of our own.

**How it is measured:** `scripts/start-app.mjs`, run 3 times in parallel by
`.github/workflows/app-start.yml`, each on a fresh GitHub-hosted machine. `scripts/trial-verdict.mjs`
applies the rule.

**Result (2026-10-04): keep RBP.** All 3 runs ended with a working app; the slowest took 85.3 s,
under half the limit. Measured in
[run 37192478114](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/actions/runs/37192478114):

| Run | Pull the images (s) | Start until every service answers (s) | Total (s) |
|---|---|---|---|
| 1 | 36.2 | 37.1 | 73.3 |
| 2 | 30.7 | 54.6 | 85.3 |
| 3 | 23.6 | 58.2 | 81.8 |

- Machines: GitHub-hosted Ubuntu 24.04 with 2 CPUs and 8 GB, the size given to private repos.
  Public repos get larger machines, per GitHub's documentation (not measured here).
- The front end answered within 5 s; the six Java services took 28 to 58 s, starting together on
  2 CPUs. Start-up, not the download, is the larger and more variable part.
- No Docker Hub rate limit was hit, without signing in to Docker Hub.

**What it costs:** about 1.5 minutes of start-up in every CI job that needs the app.

**When to look again:** a new app version is a new decision. The trial re-runs whenever
`docker-compose.yml` or the start script changes, and its last job applies the same rule.

## 2. One runner for API and UI tests (2026-10-04)

**Choice:** Playwright Test for everything: API tests through its request client, UI tests in three
browsers, accessibility scans and the suite's own self-tests.

**Why:** one language, one report and one release gate. A separate API tool (Postman, REST Assured)
would mean two reports to reconcile and two places for test data to drift.

## 3. Schemas from the app's own API descriptions (2026-10-04)

**Choice:** each answer is checked against a strict Zod schema built from the app's own API
descriptions (`/api/{service}/v3/api-docs`), and compared with what the app answered while
exploring. Where the two disagree, the app's real answer is the test's reference and the mismatch
gets a test of its own (API-11).

**Why:** a strict schema notices a field that appears, disappears or changes type, which a check of
a few fields would miss.

## 4. A room of its own for each booking test (2026-10-04)

**Choice:** every test that books first makes a room through the API, and deletes it by name
afterwards.

**Rejected:** booking the app's sample rooms on random dates. Random dates clash once in a while,
and a clash would look like a booking bug.

**Why:** fixed dates, no clashes between tests running in parallel, and clean-up that finds exactly
what a test made, even after a failure.

## 5. A release gate per area, every mark at 100% (2026-10-04)

**Choice:** the gate gives each area (API, home page, contact form, booking, admin area,
accessibility) its own verdict. Every test that ran must end as expected, a skipped test counts as
not passed, and an area where no test ran fails.

**Rejected:** pass marks below 100%. A release candidate with a failing check isn't one; a real
defect that can't be fixed yet is marked as a known bug instead, so it stays visible.

**Why per area:** it shows where a run failed, and it stops an area from passing in silence because
its tests didn't run.

## 6. Known bugs as expected failures, not skipped tests (2026-10-04)

**Choice:** a real defect gets a test that asserts the right behaviour, marked `test.fail()` and
linked to its issue.

**Rejected:** skipping the test until the bug is fixed. A skipped test says nothing, and nobody
notices when the bug is fixed (or gets worse).

**Why:** the suite stays green while the bug is known, and the gate turns red the day the bug is
fixed, so the mark comes off.

## 7. Pull requests run the core; the night runs everything (2026-10-04)

**Choice:** a pull request runs all API tests and the UI smoke tests in Chromium; the nightly run
covers every test in three browsers, with the accessibility checks.

**Why:** a pull request should finish in minutes, and every area's core path is still covered
before merging. The nightly run catches what only breadth finds, and its result is what the
portfolio's status panel shows.
