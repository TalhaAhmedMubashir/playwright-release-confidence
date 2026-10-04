# Limitations

What this suite does not prove.

- **One version of the app.** RBP 2.2, from pinned images. A new version is a new decision
  ([DECISIONS.md](DECISIONS.md), decision 1).
- **Our copy, not a live site.** The tests never touch the public demo, so they say nothing about
  how a live copy behaves under real traffic or with real data.
- **Fresh data every run.** Each run starts from the app's sample data. Problems that only show up
  after months of data aren't covered.
- **No load testing yet.** An optional k6 smoke test of the room and booking APIs is planned
  (LOAD-01 in [TEST-CASES.md](TEST-CASES.md)).
- **Desktop browsers.** Chromium, Firefox and WebKit at desktop size; phone width is checked in one
  test (UI-05), not on real phones.
- **Accessibility, partly.** Automated scans catch only part of what WCAG covers. One keyboard path
  is tested, and there is no screen-reader testing.
- **Security, partly.** Access control and a few hardening checks; this is not a penetration test.
- **Dates in UTC.** The browser runs in UTC. A run that crosses midnight UTC could disagree with the
  page about which day is "tonight".
- **Known bugs keep the suite green.** That is by design: each is marked, linked to its issue and
  counted per area by the release gate, which fails the day one is fixed.
