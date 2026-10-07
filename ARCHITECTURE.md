# Architecture

How the suite is laid out, and why.

## The app under test

Restful-Booker-Platform 2.2 is seven services: booking, room, branding, auth, report and message,
plus a Next.js front end that serves the pages and forwards `/api/{service}/` to the services.

- `docker-compose.yml` runs them from images pinned by digest. Their ports listen on this machine
  only, and Honeycomb tracing is off, so the app sends nothing to a third party.
- `scripts/start-app.mjs` starts them, waits until each service's health check answers, then checks
  that the home page and the room list load through the front end.

## Layout

| Path | What it holds |
|---|---|
| `src/config.ts` | Where tests may run (this machine only), the app's published login, the settings-change flag, issue links |
| `src/api/client.ts` | The API client, as a visitor or as the signed-in admin, and sign-in |
| `src/api/schemas.ts` | Zod schemas, from the app's own API descriptions |
| `src/pages/` | Page objects for the home page, the booking page and the admin area |
| `src/fixtures.ts` | `visitor` and `admin` API clients, and a `room` of the test's own |
| `src/guard.ts` | The guard for tests that change what every visitor sees |
| `src/data.ts` | Made-up test data, unique names and dates |
| `tests/api/` | API tests, no browser |
| `tests/ui/` | UI tests for the home page, contact form, booking and admin area, in three browsers |
| `tests/a11y/` | Accessibility scans and the keyboard check |
| `tests/setup/` | Signs in once; the admin UI tests reuse the session |
| `tests/meta/` | Self-tests of the honest-signal checks and the release gate |
| `scripts/` | Starting the app, the release gate, the collected check, the README numbers, the test-case check, the banned-words scan |
| `explore/` | The exploration scripts; their records are in `docs/exploration/` |

## Choices

- **One client, two roles.** The visitor client never carries a token. The admin client signs in
  in a request context of its own, so its cookie can't reach a call made as a visitor.
- **A room per booking test.** Each test that books makes its own room through the API, so its
  dates can be fixed, tests run in parallel without clashing, and clean-up deletes the room by
  name, even when the test failed halfway.
- **Selectors.** Roles and accessible names where the app has them. Where it doesn't (the admin's
  create-room fields, the delete icon, the contact form's message box), the ids seen while
  exploring, each marked in the code with the issue that explains why.
- **Known bugs.** `test.fail()` with the `@known-bug` tag and an `issue` annotation linking the
  issue.
- **Tags.** `@smoke` (pull requests), `@api`, `@ui`, `@admin`, `@a11y`, `@security`, `@known-bug`,
  `@guard`, `@setup`, `@meta`.
- **Scripts in TypeScript, run by Node.** `erasableSyntaxOnly` keeps every TypeScript file
  runnable by Node's own type stripping, so the scripts need no build step.
