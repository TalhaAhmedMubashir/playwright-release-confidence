# playwright-release-confidence

Playwright and TypeScript tests for
[Restful-Booker-Platform](https://github.com/mwinteringham/restful-booker-platform) (RBP), a
bed-and-breakfast booking app made for testing practice. Work in progress.

## Where it stands

1. **Start-up trial: done.** RBP starts in CI in under 90 s, so it stays as the app under test.
   The rule, written before the first run, and the numbers: [DECISIONS.md](DECISIONS.md), decision 1.
2. **Exploration of the visitor side: done.** The app was explored in CI
   (`.github/workflows/explore.yml`), and the records are in
   [docs/exploration/2026-10-04](docs/exploration/2026-10-04). Tests take their selectors only from
   records like these. It found 9 defects, among them a privacy leak and a crash, each tracked as an
   [issue](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues?q=label%3Aknown-bug).
3. **Test-case list: waiting for approval.** [TEST-CASES.md](TEST-CASES.md). No test code is
   written before it is approved.

## How the app runs

- `docker-compose.yml` runs RBP release 2.2 from its published images, pinned by digest.
- `scripts/start-app.mjs` pulls the images, starts them, and times each service until it answers.
  Then it checks that the home page and the room list load through the front end.
- CI (`.github/workflows/app-start.yml`) re-runs the start-up trial 3 times whenever the app's
  version or the start script changes, and applies the same rule.

## Run the app on your machine

Needs Docker with the compose plugin, and Node 24.

```sh
node scripts/start-app.mjs   # start and time it; the app is then at http://localhost:8080
docker compose down          # stop it
```
