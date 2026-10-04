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

**Result:** pending.
