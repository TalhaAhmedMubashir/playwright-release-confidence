# Exploration, 2026-10-04

What a visitor sees and can do in Restful-Booker-Platform 2.2, and what its admin area shows and
lets you do once signed in, recorded on our own copy, started in CI from `docker-compose.yml`. Tests
take their selectors only from records like these.

| Record | Made by | Run |
|---|---|---|
| [pages/](pages): the accessibility tree of every page a visitor can reach, at desktop (1280 px) and phone (390 px) width | `explore/visitor.mjs` | [37193321685](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/actions/runs/37193321685) |
| [flows.md](flows.md): each visitor action, what the page showed afterwards, the API calls it made, and what the API gives a visitor who isn't signed in | `explore/flows.mjs` | same run |
| [admin/pages/](admin/pages): the accessibility tree of the sign-in page, every admin page a link leads to once signed in, and the home page after signing out, at 1280 px | `explore/admin.mjs` | [37204739342](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/actions/runs/37204739342) |
| [admin/visited.md](admin/visited.md): those pages' forms, buttons and links, and the API calls on the way to each | `explore/admin.mjs` | same run |
| [admin/flows.md](admin/flows.md): each admin action (a wrong password, signing in, creating, editing and deleting a room, opening a message, changing the B&B's name and putting it back, the report, signing out and trying the old sign-in), what the page showed afterwards, the ids, names, test ids and classes of its controls, and the API calls it made | `explore/admin-flows.mjs` | same run |

The admin passes signed in with the app's published default login, on our own copy only, with the
owner's permission (2026-10-04); both scripts refuse any address but this machine. They write
`<password>` and `<token>` wherever the password or the sign-in token appeared.

Screenshots, and a Playwright trace of the visitor passes, were kept as each run's artifact for 30
days; the text records are here. The admin ones are the run's JSON files written out as Markdown.
Booking pages are named after their room (`reservation-1` is room 1); the dates in their addresses
were tonight and tomorrow.

The services' API descriptions were read from the app itself (`/api/{service}/v3/api-docs`).

## Pages visited

| Address | Status | Title |
|---|---|---|
| `/` | 200 | Restful-booker-platform demo |
| `/reservation/1?checkin=2026-10-04&checkout=2026-10-05` | 200 | Restful-booker-platform demo |
| `/reservation/2?checkin=2026-10-04&checkout=2026-10-05` | 200 | Restful-booker-platform demo |
| `/reservation/3?checkin=2026-10-04&checkout=2026-10-05` | 200 | Restful-booker-platform demo |
| `/cookie` | 200 | Restful-booker-platform demo |
| `/privacy` | 200 | Restful-booker-platform demo |

None logged a console error or a failed request.

## Admin pages visited

| Address | Record | Title |
|---|---|---|
| `/admin`, before signing in | [sign-in](admin/pages/sign-in.aria.yml) | Restful-booker-platform demo |
| `/admin/rooms`, after signing in | [signed-in](admin/pages/signed-in.aria.yml) | Restful-booker-platform demo |
| `/admin/report` | [admin-report](admin/pages/admin-report.aria.yml) | Restful-booker-platform demo |
| `/admin/branding` | [admin-branding](admin/pages/admin-branding.aria.yml) | Restful-booker-platform demo |
| `/admin/message` | [admin-message](admin/pages/admin-message.aria.yml) | Restful-booker-platform demo |
| `/`, after Logout | [signed-out](admin/pages/signed-out.aria.yml) | Restful-booker-platform demo |

A room's own page (`/admin/room/{id}`) opens from a click on its row, not a link, so it is recorded
only in [admin/flows.md](admin/flows.md), steps 6 and 7.

Three things the admin records show only in part:

- **Deleting a room:** step 8 failed; the script's guess at the delete control timed out. The control
  the tests use, a `span` with the class `roomDelete` and the room's id, is in step 4's controls.
- **The price field on a room's own page:** step 7 found it as `#roomPrice`,
  `input[name="roomPrice"]` or a textbox named like "price", and the record doesn't show which
  matched (the edit form was never recorded open). The tests use `#roomPrice`, the id the
  create-room row has in step 4.
- **A booking on the report's calendar:** the calendar opened on October 2026, which had no booking,
  so the page never showed one. The text the tests look for ("James Dean - Room: 101" for the app's
  own booking) has the form of the titles the report API sent, in
  [admin/visited.md](admin/visited.md), section 3.
