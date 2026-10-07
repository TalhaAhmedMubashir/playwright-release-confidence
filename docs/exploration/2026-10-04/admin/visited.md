# Admin pages, observed 2026-10-04

Recorded by `explore/admin.mjs` in [run 37204739342](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/actions/runs/37204739342), against RBP 2.2 started from `docker-compose.yml`,
signed in on our own copy with the app's published default login, in a 1280 × 800 window. Each
page's accessibility tree is in [pages/](pages), under the name of its section. The script writes
`<password>` and `<token>` wherever the password or the sign-in token appeared. The default
password is the word "password", so the sign-in request's field name reads `<password>` too.

Cookies read right after pressing Login, before the next page loaded: `[]`.
The sign-in cookie, read once the rooms page had opened, is in [flows.md](flows.md), step 3.

## 1. sign-in

Address: `/admin`; title: Restful-booker-platform demo; accessibility tree: [pages/sign-in.aria.yml](pages/sign-in.aria.yml)

Form 1 of 1, buttons: `Login`

| Field | Type | id | name | Label | Required |
|---|---|---|---|---|---|
| input | `text` | `username` |  | `Username` | no |
| input | `password` | `password` |  | `Password` | no |

Buttons on the page: `Logout`, `Login`

| Link | Address |
|---|---|
| `Restful Booker Platform Demo` | `/` |
| `Front Page` | `/` |

No API calls on the way to this page.

## 2. signed-in

Address: `/admin/rooms`; title: Restful-booker-platform demo; accessibility tree: [pages/signed-in.aria.yml](pages/signed-in.aria.yml)

Buttons on the page: `Logout`, `Create`

| Link | Address |
|---|---|
| `Restful Booker Platform Demo` | `/` |
| `Rooms` | `/admin/rooms` |
| `Report` | `/admin/report` |
| `Branding` | `/admin/branding` |
| `Messages 3` | `/admin/message` |
| `Front Page` | `/` |

API calls on the way to this page:

- `POST /api/auth/login` → 200
  - sent: `{"username":"admin","<password>":"<password>"}`
- `GET /api/message/count` → 200
  - answer: `{"count":3}`
- `POST /api/auth/validate` → 200
  - sent: `{"token":"<token>"}`
  - answer: `{"valid":true}`
- `GET /api/room` → 200
  - answer: `{"rooms":[{"accessible":true,"description":"Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.","features":["TV","WiFi","Safe"],"image":"/images/room1.jpg","roomName":"101","roomPrice":100,"roomid":1,"type":"Single"},{"accessible":true,"description":"Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl. ","features":["TV","Radio","Safe"],"image":"/images/room2.jpg","roomName":"102","roomPrice":150,"roomid":2,"type":"Double"},{"accessible":true,"description":"Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex. ","features":["Radio","WiFi","Safe"],"image":"/images/room3.jpg","roomName":"103","roomPrice":225,"roomid":3,"type":"Suite"}]}`

## 3. admin-report

Address: `/admin/report`; title: Restful-booker-platform demo; accessibility tree: [pages/admin-report.aria.yml](pages/admin-report.aria.yml)

Buttons on the page: `Logout`, `Today`, `Back`, `Next`, `27`, `28`, `29`, `30`, `01`, `02`, `03`, `04`, `05`, `06`, `07`, `08`, `09`, `10`, `11`, `12`, `13`, `14`, `15`, `16`, `17`, `18`, `19`, `20`, `21`, `22`, `23`, `24`, `25`, `26`, `27`, `28`, `29`, `30`, `31`

| Link | Address |
|---|---|
| `Restful Booker Platform Demo` | `/` |
| `Rooms` | `/admin/rooms` |
| `Report` | `/admin/report` |
| `Branding` | `/admin/branding` |
| `Messages 3` | `/admin/message` |
| `Front Page` | `/` |

API calls on the way to this page:

- `GET /api/message/count` → 200
  - answer: `{"count":3}`
- `POST /api/auth/validate` → 200
  - sent: `{"token":"<token>"}`
  - answer: `{"valid":true}`
- `GET /api/report` → 200
  - answer: `{"report":[{"end":"2026-02-05","start":"2026-02-01","title":"James Dean - Room: 101"},{"end":"2026-11-05","start":"2026-11-03","title":"Test Visitor - Room: 101"},{"end":"2026-02-04","start":"2026-02-02","title":"Erica Bowthorpe - Room: 102"},{"end":"2026-03-05","start":"2026-03-01","title":"Timothy Barrow - Room: 103"}]}`

## 4. admin-branding

Address: `/admin/branding`; title: Restful-booker-platform demo; accessibility tree: [pages/admin-branding.aria.yml](pages/admin-branding.aria.yml)

Buttons on the page: `Logout`, `Submit`

| Link | Address |
|---|---|
| `Restful Booker Platform Demo` | `/` |
| `Rooms` | `/admin/rooms` |
| `Report` | `/admin/report` |
| `Branding` | `/admin/branding` |
| `Messages 3` | `/admin/message` |
| `Front Page` | `/` |

API calls on the way to this page:

- `GET /api/message/count` → 200
  - answer: `{"count":3}`
- `POST /api/auth/validate` → 200
  - sent: `{"token":"<token>"}`
  - answer: `{"valid":true}`
- `GET /api/branding` → 200
  - answer: `{"address":{"county":"Dilbery","line1":"Shady Meadows B&B","line2":"Shadows valley","postCode":"N1 1AA","postTown":"Newingtonfordburyshire"},"contact":{"email":"fake@fakeemail.com","name":"Shady Meadows B&B","phone":"012345678901"},"description":"Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.","directions":"Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.","logoUrl":"/images/rbp-logo.jpg","map":{"latitude":52.6351204,"longitude":1.2733774},"name":"Shady Meadows B&B"}`

## 5. admin-message

Address: `/admin/message`; title: Restful-booker-platform demo; accessibility tree: [pages/admin-message.aria.yml](pages/admin-message.aria.yml)

Buttons on the page: `Logout`

| Link | Address |
|---|---|
| `Restful Booker Platform Demo` | `/` |
| `Rooms` | `/admin/rooms` |
| `Report` | `/admin/report` |
| `Branding` | `/admin/branding` |
| `Messages 3` | `/admin/message` |
| `Front Page` | `/` |

API calls on the way to this page:

- `GET /api/message/count` → 200
  - answer: `{"count":3}`
- `POST /api/auth/validate` → 200
  - sent: `{"token":"<token>"}`
  - answer: `{"valid":true}`
- `GET /api/message` → 200
  - answer: `{"messages":[{"id":1,"name":"James Dean","read":false,"subject":"Booking enquiry"},{"id":2,"name":"Test Visitor","read":false,"subject":"Question about rooms"},{"id":3,"name":"Test Visitor","read":false,"subject":"You have a new booking!"}]}`

## 6. signed-out

Address: `/`; title: Restful-booker-platform demo; accessibility tree: [pages/signed-out.aria.yml](pages/signed-out.aria.yml)

Form 1 of 2, buttons: `Check Availability`

| Field | Type | id | name | Label | Required |
|---|---|---|---|---|---|
| input | `text` |  |  |  | no |
| input | `text` |  |  |  | no |

Form 2 of 2, buttons: `Submit`

| Field | Type | id | name | Label | Required |
|---|---|---|---|---|---|
| input | `text` | `name` |  | `Name` | no |
| input | `email` | `email` |  | `Email` | no |
| input | `tel` | `phone` |  | `Phone` | no |
| input | `text` | `subject` |  | `Subject` | no |
| textarea |  | `description` |  |  | no |

Buttons on the page: `Check Availability`, `Submit`

| Link | Address |
|---|---|
| `Shady Meadows B&B` | `/` |
| `Rooms` | `/#rooms` |
| `Booking` | `/#booking` |
| `Amenities` | `/#amenities` |
| `Location` | `/#location` |
| `Contact` | `/#contact` |
| `Admin` | `/admin` |
| `Book Now` | `#booking` |
| `Book now` | `/reservation/1?checkin=2026-10-04&checkout=2026-10-05` |
| `Book now` | `/reservation/2?checkin=2026-10-04&checkout=2026-10-05` |
| `Book now` | `/reservation/3?checkin=2026-10-04&checkout=2026-10-05` |
| `Pigeon` | `https://pigeon-maps.js.org/` |
| `OpenStreetMap` | `https://www.openstreetmap.org/copyright` |
|  | `#` |
|  | `#` |
|  | `#` |
| `Home` | `#` |
| `Rooms` | `#` |
| `Booking` | `#` |
| `Contact` | `#` |
| `Mark Winteringham` | `http://www.mwtestconsultancy.co.uk` |
| `Cookie-Policy` | `/cookie` |
| `Privacy-Policy` | `/privacy` |
| `Admin panel` | `/admin` |

API calls on the way to this page:

- `GET /api/message/count` → 200
- `GET /api/message/count` → 200
  - answer: `{"count":3}`
- `POST /api/auth/validate` → 200
  - sent: `{"token":"<token>"}`
  - answer: `{"valid":true}`
- `GET /api/branding` → 200
  - answer: `{"address":{"county":"Dilbery","line1":"Shady Meadows B&B","line2":"Shadows valley","postCode":"N1 1AA","postTown":"Newingtonfordburyshire"},"contact":{"email":"fake@fakeemail.com","name":"Shady Meadows B&B","phone":"012345678901"},"description":"Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.","directions":"Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.","logoUrl":"/images/rbp-logo.jpg","map":{"latitude":52.6351204,"longitude":1.2733774},"name":"Shady Meadows B&B"}`
- `GET /api/room` → 200
  - answer: `{"rooms":[{"accessible":true,"description":"Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.","features":["TV","WiFi","Safe"],"image":"/images/room1.jpg","roomName":"101","roomPrice":100,"roomid":1,"type":"Single"},{"accessible":true,"description":"Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl. ","features":["TV","Radio","Safe"],"image":"/images/room2.jpg","roomName":"102","roomPrice":150,"roomid":2,"type":"Double"},{"accessible":true,"description":"Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex. ","features":["Radio","WiFi","Safe"],"image":"/images/room3.jpg","roomName":"103","roomPrice":225,"roomid":3,"type":"Suite"}]}`
