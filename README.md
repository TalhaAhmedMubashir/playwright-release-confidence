# playwright-release-confidence

Playwright and TypeScript tests for
[Restful-Booker-Platform](https://github.com/mwinteringham/restful-booker-platform) (RBP), a
bed-and-breakfast booking app made for testing practice. Work in progress.

## Current step: start-up trial

Before any test is written, this repo answers one question: does RBP start inside CI quickly enough
to be tested on every pull request?

- `docker-compose.yml` runs RBP release 2.2 from its published images, pinned by digest.
- `scripts/start-app.mjs` pulls the images, starts them, and times each service until it answers.
  Then it checks that the home page and the room list load through the front end.
- CI (`.github/workflows/app-start.yml`) runs that 3 times in parallel, each on a fresh machine,
  and applies the rule written down before the first run.

The rule and the result: [DECISIONS.md](DECISIONS.md), decision 1.

## Run the app on your machine

Needs Docker with the compose plugin, and Node 24.

```sh
node scripts/start-app.mjs   # start and time it; the app is then at http://localhost:8080
docker compose down          # stop it
```
