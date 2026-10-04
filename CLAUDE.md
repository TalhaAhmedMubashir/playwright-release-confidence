# playwright-release-confidence

The flagship test project of Talha Ahmed's portfolio. The plan and its settled decisions live in
the site's repo, `TalhaAhmedMubashir/TalhaAhmedMubashir.github.io`, in `PLAN.md` (section "Flagship
scope"). Decisions made here are recorded in [DECISIONS.md](DECISIONS.md), each rule written down
before the measurement it judges.

- Separate project: it is never added to the owner's employer's repositories, and nothing is taken
  from them: no code, config, names, test names or tooling. Patterns are rebuilt from scratch here.
- The app under test runs from the pinned images in `docker-compose.yml`. Tests never point at
  someone else's live instance.
- The owner approves the test-case list before any test code is written.
- Selectors come only from what was observed in the running app, never guessed.
- Node runs from the project's `.venv` (excluded through `.git/info/exclude`, never committed).
