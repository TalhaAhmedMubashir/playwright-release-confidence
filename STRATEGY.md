# Test strategy

Risk decides what is tested and at which level; the level decides where it runs.

## Risks, highest first

| Risk | Why it matters | Covered by |
|---|---|---|
| Personal data reaches the wrong person | Contact messages and bookings hold names, emails and phone numbers | API-08, API-09, ADM-09, ADM-10 |
| A booking fails, or the same dates are sold twice | The business's income, and a guest without a bed | API-04 to API-07, UI-10, UI-13, A11Y-02 |
| A wrong price | Money, and trust | UI-11, ADM-04 |
| A visitor can't find or use a page | Lost bookings and messages | UI-01 to UI-09, UI-15, UI-16 |
| An admin change doesn't reach the site, or can't be undone | The public site shows the wrong thing | ADM-03, ADM-04, ADM-07 and the guard |
| A visitor with a disability is shut out | WCAG 2.2 AA, and the keyboard | A11Y-01 to A11Y-03, UI-09 |

## Levels

- **API first.** Rules at their limits, access control and contracts are fastest and most precise
  through the API: no page to load, and every answer can be checked exactly.
- **UI for what only a browser shows.** That the page shows what the API sent, flows across pages,
  errors as a visitor sees them, and the admin area.
- **Accessibility.** An axe scan of every page and state worth scanning, and one booking made with
  the keyboard alone.

## What runs where

| When | What runs | Why |
|---|---|---|
| Every pull request | Lint, types, honest-signal checks, secret and banned-word scans; all API tests; the UI smoke tests in Chromium; the release gate | Fast enough to wait for, and covers each area's core path |
| Every night | Everything, in Chromium, Firefox and WebKit, with the accessibility checks; one merged report; the release gate | Breadth, without slowing pull requests down |

## Data and safety

- The app runs on this machine only; any other address stops the run (`src/config.ts`).
- Each test makes the data it needs through the API and deletes it by name.
- A test that changes what every visitor sees runs only with `ALLOW_SITE_SETTINGS_CHANGES=1`, and
  the guard fails it if the site isn't left as it was (`src/guard.ts`).
- Signing in uses the app's published default login, on our own copy only.

## What a result means

- **A failed test** fails its area in the release gate, and the change doesn't merge.
- **A known bug** is a test marked as expected to fail, linked to its issue. While the bug is
  there, the area still passes; the day it's fixed, the test passes, the gate fails, and the mark
  comes off.
- **A skipped test** counts as not passed, and **an area where nothing ran** fails: silence is not
  success.
