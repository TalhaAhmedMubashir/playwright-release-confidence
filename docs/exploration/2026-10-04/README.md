# Exploration, 2026-10-04

What a visitor sees and can do in Restful-Booker-Platform 2.2, recorded on our own copy, started in
CI from `docker-compose.yml`. Tests take their selectors only from records like these. No sign-in
was used, so the admin area isn't here.

| Record | Made by | Run |
|---|---|---|
| [pages/](pages): the accessibility tree of every page a visitor can reach, at desktop (1280 px) and phone (390 px) width | `explore/visitor.mjs` | [37193321685](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/actions/runs/37193321685) |
| [flows.md](flows.md): each visitor action, what the page showed afterwards, the API calls it made, and what the API gives a visitor who isn't signed in | `explore/flows.mjs` | same run |

Screenshots and a Playwright trace of both passes were kept as that run's artifact for 30 days.
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

None logged a console error or a failed request. The admin area (`/admin`) was not visited.
