# playwright-release-confidence

Playwright and TypeScript tests for
[Restful-Booker-Platform](https://github.com/mwinteringham/restful-booker-platform) (RBP), a
bed-and-breakfast booking app made for testing practice. Work in progress.

## Where it stands

1. **Start-up trial: done.** RBP starts in CI in under 90 s, so it stays as the app under test.
   The rule, written before the first run, and the numbers: [DECISIONS.md](DECISIONS.md), decision 1.
2. **Exploration: in progress.** The app is explored as a visitor in CI
   (`.github/workflows/explore.yml`); tests take their selectors only from what was observed.
3. **Test-case list:** written next, and approved before any test code.

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
