# Test cases

**Status: approved by the owner on 2026-10-04, as written.** The owner also allowed signing in on
our own copy that day; the admin cases and the two API cases marked *added* come from that
exploration and follow the outline the owner approved.

Everything below was observed in Restful-Booker-Platform (RBP) 2.2, running on our own copy in
CI, on 2026-10-04. The records are in [docs/exploration/2026-10-04](docs/exploration/2026-10-04).

## How to read this

- **Level:** *API* calls the services directly; *UI* drives a real browser.
- **Runs:** *PR* on every pull request (fast, and must pass to merge); *Nightly* in the full
  nightly run on Chromium, Firefox and WebKit.
- **Tags:** `@smoke`, `@regression`, `@api`, `@ui`, `@a11y`, `@security`, `@known-bug`.
- **Known bug:** a real defect seen while exploring. Its test asserts the correct behaviour and is
  marked as expected to fail (`test.fail()`), with a link to its issue. The suite stays green while
  the bug is visible, and turns red when the bug is fixed, so the mark gets removed. Bugs are never
  invented.
- **Test data:** made-up, at example.com. Each test that books a room uses its own dates far in the
  future, so tests never collide and can run in parallel. Every CI job starts the app fresh, so
  nothing needs cleaning up there.
- **To confirm:** a case whose expected result exploration hasn't seen yet. The first run of its test
  shows whether it is a pass or a new finding.

## Findings from exploration

F1 to F9 were seen while exploring; F10 to F21 by the suite's first full runs on pull request #10 (2026-10-04), in all three browsers. Each has an issue in this repo, with steps, expected and actual results and
evidence, and each becomes a known-bug test once this list is approved. RBP is built for testing
practice, so some may be deliberate. The suite reports them either way.

| # | What happens | Where | Severity | Issue | Test |
|---|---|---|---|---|---|
| F1 | Anyone can read every contact message, with the sender's name, email and phone, without signing in | `GET /api/message/` and `/api/message/{id}` answer 200 | High: privacy | [#1](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/1) | API-09 |
| F2 | Trying to book dates that are already taken crashes the booking page ("This page couldn't load") | after `POST /api/booking` answers 409 | High | [#2](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/2) | UI-13 |
| F3 | The menu link "Amenities" goes nowhere: the page has no `#amenities` section | home page | Medium | [#3](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/3) | UI-04 |
| F4 | The check-in and check-out fields, the contact form's message box, the phone menu button and the 3 footer icon links have no accessible name | home page | Medium: accessibility | [#4](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/4) | A11Y-01 |
| F5 | All three room photos are described as "Single Room", including the Double and the Suite | home page | Low: accessibility | [#5](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/5) | A11Y-01 |
| F6 | The footer's "Quick Links" (Home, Rooms, Booking, Contact) all point to `#` | every page | Low | [#6](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/6) | UI-15 |
| F7 | Booking errors are raw messages that don't say which field they mean ("size must be between 3 and 30") | booking form | Low | [#7](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/7) | UI-12 |
| F8 | Refusals without a sign-in differ: 401 with `{"error": …}`, 401 with `{"errors": […]}`, or 403 with an empty body | API | Low | [#8](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/8) | API-08 |
| F9 | Every page has the same title, "Restful-booker-platform demo" | every page | Low: accessibility | [#9](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/9) | UI-16 |
| F10 | Creating a booking answers 201 and a flat booking; its API description promises 200 and `{bookingid, booking}` | `POST /api/booking` | Low | [#11](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/11) | API-11 |
| F11 | Error answers name the app's Java classes, method signatures and exception types | `PUT /api/branding` with a bad logo address | Medium: security | [#12](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/12) | API-10 |
| F12 | Rooms added in the admin area don't appear on the home page; it shows only the app's first three | home page | Medium | [#13](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/13) | UI-17 |
| F13 | The contact form's errors aren't in a live region, so screen readers don't announce them | home page | Medium: accessibility | [#14](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/14) | UI-09 |
| F14 | Creating a room with nothing filled in fails without a message | admin rooms | Low | [#15](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/15) | ADM-05 |
| F15 | The message dialog is announced as "onRequestClose Example" | admin messages | Low: accessibility | [#16](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/16) | ADM-06 |
| F16 | Branding can't be saved: the app's own default logo address fails its URL check, and the page says nothing | admin branding | Medium | [#17](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/17) | ADM-07 |
| F17 | The sign-in cookie isn't HttpOnly, so scripts on the page can read it | signing in | Medium: security | [#18](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/18) | ADM-10 |
| F18 | Footer links, the breadcrumb and several admin buttons have too little colour contrast | most pages | Low: accessibility | [#19](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/19) | A11Y-01, A11Y-03 |
| F19 | Admin form fields have no accessible name, and the room delete icon can't be reached by keyboard | admin rooms and branding | Medium: accessibility | [#20](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/20) | A11Y-03 |
| F20 | Asking for a room that doesn't exist answers 500, not 404 | `GET /api/room/{id}` | Low | [#21](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/21) | API-12 |
| F21 | Signing out doesn't end the session: the old sign-in token keeps working | admin "Logout" | Medium: security | [#22](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/issues/22) | ADM-09 |

## UI: home page

| ID | Check | Runs | Tags |
|---|---|---|---|
| UI-01 | The page shows the B&B's name, description and contact details, matching the branding service | PR | `@smoke` |
| UI-02 | Every room the page shows has its type, price per night and features from the room service, and links to its booking page for tonight to tomorrow | PR | `@smoke` |
| UI-02 | Each room's photo is described as its own room (F5) | Nightly | `@known-bug` |
| UI-17 | A newly added room appears on the home page (F12). *Added* | Nightly | `@known-bug` |
| UI-03 | The menu links Rooms, Booking, Location and Contact go to their sections | Nightly | `@regression` |
| UI-04 | The menu link Amenities goes to an amenities section (F3) | Nightly | `@known-bug` |
| UI-05 | At phone width the menu opens from its button and shows the same links | Nightly | `@regression` |
| UI-06 | The availability search doesn't offer a room that is booked for the chosen dates (confirmed: passes; it books one of the app's own rooms years ahead, since added rooms aren't shown: F12) | Nightly | `@regression` |
| UI-15 | The footer's quick links Home, Rooms, Booking and Contact go to their pages or sections (F6) | Nightly | `@known-bug` |
| UI-16 | Every page has its own title (F9) | Nightly | `@known-bug` |

## UI: contact form

| ID | Check | Runs | Tags |
|---|---|---|---|
| UI-07 | A valid message shows "Thanks for getting in touch {name}!" and repeats its subject; the admin API then has the message as sent | PR | `@smoke` |
| UI-08 | Sending the empty form lists a problem for every field (8 messages seen) | Nightly | `@regression` |
| UI-09 | The form's errors are announced to screen-reader users (F13) | Nightly | `@a11y` `@known-bug` |

## UI: booking

| ID | Check | Runs | Tags |
|---|---|---|---|
| UI-10 | Booking free dates shows "Booking Confirmed" with those dates, and the room then shows them as unavailable | PR | `@smoke` |
| UI-11 | The price summary is nights × room price + £25 cleaning + £15 service, for each room (seen: 2 nights × £100 = £240) | Nightly | `@regression` |
| UI-12 | Sending the empty guest form lists the problems (7 messages seen), each naming its field (F7) | Nightly | `@regression` `@known-bug` |
| UI-13 | Booking dates that are already taken shows a clear message and leaves the page usable (F2) | Nightly | `@known-bug` |
| UI-14 | Cancel closes the guest form without booking | Nightly | `@regression` |

## API, without signing in

| ID | Check | Runs | Tags |
|---|---|---|---|
| API-01 | `GET /room` and `GET /room/{id}` match their schema | PR | `@smoke` |
| API-02 | `GET /branding` matches its schema | PR | `@api` |
| API-03 | Message rules at their limits: phone 10, 11, 21 and 22 characters; subject 4, 5, 100 and 101; message 19, 20, 2000 and 2001; malformed email; each field blank | PR | `@api` |
| API-04 | Booking rules at their limits: first name 2, 3, 18 and 19 characters; last name 2, 3, 30 and 31; phone 10, 11, 21 and 22; email blank or malformed | PR | `@api` |
| API-05 | Creating a booking answers 201 with the booking; the same room and dates again answer 409 | PR | `@smoke` |
| API-06 | A check-out on or before the check-in is refused with 409 and "Failed to create booking", the answer a double booking gets (seen in CI, 2026-10-07) | PR | `@api` |
| API-07 | A new booking's dates appear in `GET /booking/unavailable` and `GET /report/room/{id}` | PR | `@api` |
| API-08 | Every endpoint that changes data or reads private data refuses a visitor with 401 or 403. Seen: list bookings, read a booking, booking summary, the all-rooms report, create a room, change branding. Expected from the API description: change or delete a room, delete a booking, mark a message read, delete a message. All refusals use one status and one answer shape (F8) | PR | `@security` `@known-bug` |
| API-09 | Contact messages can't be read without signing in (F1) | PR | `@security` `@known-bug` |
| API-10 | An error answer doesn't reveal the app's internal code: class names, exception types (F11). *Added* | PR | `@security` `@known-bug` |
| API-11 | Creating a booking answers as the API description says: status 200 and `{bookingid, booking}` (F10). *Added* | PR | `@known-bug` |
| API-12 | A room that doesn't exist answers 404 (F20). *Added* | PR | `@known-bug` |

## Accessibility

| ID | Check | Runs | Tags |
|---|---|---|---|
| A11Y-01 | Automated scan (axe, WCAG 2.2 AA) of the home page, a booking page, the cookie and privacy pages, the 404 page, the form-error states and both confirmations. Known problems (F4, F18) are listed with their issues; anything new fails, and so does a known problem that is gone. (F5, a wrong photo description, is beyond axe and has its own test) | Nightly | `@a11y` |
| A11Y-02 | A room can be booked with the keyboard alone (confirmed: passed in the first full run) | Nightly | `@a11y` |
| A11Y-03 | Automated scan (axe, WCAG 2.2 AA) of the admin pages: rooms, report, branding, messages; known problems F18 and F19 are listed the same way. *Added* | Nightly | `@a11y` `@admin` |

## Suite-level checks

From PLAN.md, "Flagship scope".

| ID | Check | Runs |
|---|---|---|
| GATE-01 | Release gate: each area (home, contact, booking, API, accessibility) has its own pass mark; a run in which no tests ran counts as a failure; the gate is required before merging | PR |
| SIG-01 | Every test file is collected by the runner: no test file that never runs | PR |
| SIG-02 | Lint catches tests that cannot fail, such as a test with no assertion | PR |
| SIG-03 | The numbers in the README (test counts) are generated, and CI fails when they are out of date | PR |
| LOAD-01 | Optional: a short k6 smoke test of the room and booking APIs, written from scratch | Nightly |

## Admin area (*added*)

Explored signed in on our own copy, with the app's published default login (owner's permission,
2026-10-04). Records: [docs/exploration/2026-10-04/admin](docs/exploration/2026-10-04/admin), made
by `explore/admin.mjs` and `explore/admin-flows.mjs`.

| ID | Check | Runs | Tags |
|---|---|---|---|
| ADM-01 | The published login opens the rooms page, and Logout signs out | PR | `@smoke` |
| ADM-02 | A wrong password is refused with "Invalid credentials" | Nightly | `@admin` |
| ADM-03 | A room made in the admin area is listed with its type, price and features, and the API returns it; deleting it removes it. (Visitors not seeing it is F12, UI-17) | PR | `@smoke` |
| ADM-04 | A new price set in the admin area shows on the booking page | Nightly | `@admin` |
| ADM-05 | Creating a room with nothing filled in says what is missing (F14) | Nightly | `@known-bug` |
| ADM-06 | A visitor's message reaches the inbox; opening it shows the sender and marks it read | Nightly | `@admin` |
| ADM-06 | The message dialog is named after the message (F15) | Nightly | `@known-bug` |
| ADM-07 | A new B&B name shows on the public site, and the original comes back afterwards, behind the guard (F16) | Nightly | `@guard` `@known-bug` |
| ADM-08 | A visitor's booking shows in the admin report with the guest's name and room | Nightly | `@admin` |
| ADM-09 | Signing out ends the session: the old sign-in stops working (F21) | Nightly | `@security` `@known-bug` |
| ADM-10 | The sign-in cookie can't be read by the page's scripts (F17) | Nightly | `@security` `@known-bug` |

## Decisions

- The owner approved this list as written, and allowed signing in on our own copy (2026-10-04).
- F1 to F9 are tracked as issues #1 to #9 in this repo (owner, 2026-10-04); F10 to F21, found by the suite the same day, as #11 to #22. Nothing has been
reported to RBP's maintainer; that would be public, so it waits for the owner.
