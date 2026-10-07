# Admin flows, observed 2026-10-04

Recorded by `explore/admin-flows.mjs` in [run 37204739342](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/actions/runs/37204739342), against RBP 2.2 started from `docker-compose.yml`,
signed in on our own copy with the app's published default login. Made-up data only. The script
writes `<password>` and `<token>` wherever the password or the sign-in token appeared. Where a
step lists the page's controls, each has the attributes a selector could use.

## 1. sign-in page controls

Address afterwards: `/admin`

Controls on the page:

| Element | id | name | Test id | Class | aria-label | Placeholder | Text |
|---|---|---|---|---|---|---|---|
| a |  |  |  | `navbar-brand` |  |  | `Restful Booker Platform Demo` |
| a | `frontPageLink` |  |  | `nav-link` |  |  | `Front Page` |
| button |  |  |  | `btn btn-outline-danger my-2 my-sm-0` |  |  | `Logout` |
| input (text) | `username` |  |  | `form-control mt-2` |  | `Enter username` |  |
| input (password) | `password` |  |  | `form-control mt-2` |  | `Password` |  |
| button (submit) | `doLogin` |  |  | `btn btn-primary mt-3` |  |  | `Login` |

<details><summary>Accessibility tree afterwards</summary>

```yaml
- navigation:
  - link "Restful Booker Platform Demo":
    - /url: /
  - list
  - list:
    - listitem:
      - link "Front Page":
        - /url: /
    - listitem:
      - button "Logout"
- heading "Login" [level=2]
- text: Username
- textbox "Username":
  - /placeholder: Enter username
- text: Password
- textbox "Password"
- button "Login"
- alert
```

</details>

## 2. wrong password

Address afterwards: `/admin`

API calls the page made:

- `POST /api/auth/login` → 401
  - sent: `{"username":"admin","password":"<password>"}`
  - answer: `{"error":"Invalid credentials"}`

<details><summary>Accessibility tree afterwards</summary>

```yaml
- navigation:
  - link "Restful Booker Platform Demo":
    - /url: /
  - list
  - list:
    - listitem:
      - link "Front Page":
        - /url: /
    - listitem:
      - button "Logout"
- heading "Login" [level=2]
- alert: Invalid credentials
- text: Username
- textbox "Username":
  - /placeholder: Enter username
  - text: admin
- text: Password
- textbox "Password": not-the-password
- button "Login"
- alert
```

</details>

## 3. sign in

Address afterwards: `/admin/rooms`; result: `{"cookies":[{"name":"token","httpOnly":false,"secure":false,"sameSite":"Lax","path":"/"}],"storage":{"local":[],"session":[]}}`

API calls the page made:

- `POST /api/auth/login` → 200
  - sent: `{"username":"admin","password":"<password>"}`
- `GET /api/message/count` → 200
  - answer: `{"count":3}`
- `POST /api/auth/validate` → 200
  - sent: `{"token":"<token>"}`
  - answer: `{"valid":true}`
- `GET /api/room` → 200
  - answer: `{"rooms":[{"accessible":true,"description":"Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.","features":["TV","WiFi","Safe"],"image":"/images/room1.jpg","roomName":"101","roomPrice":100,"roomid":1,"type":"Single"},{"accessible":true,"description":"Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl. ","features":["TV","Radio","Safe"],"image":"/images/room2.jpg","roomName":"102","roomPrice":150,"roomid":2,"type":"Double"},{"accessible":true,"description":"Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex. ","features":["Radio","WiFi","Safe"],"image":"/images/room3.jpg","roomName":"103","roomPrice":225,"roomid":3,"type":"Suite"}]}`

Controls on the page:

| Element | id | name | Test id | Class | aria-label | Placeholder | Text |
|---|---|---|---|---|---|---|---|
| a |  |  |  | `navbar-brand` |  |  | `Restful Booker Platform Demo` |
| a |  |  |  | `nav-link active` |  |  | `Rooms` |
| a | `reportLink` |  |  | `nav-link` |  |  | `Report` |
| a | `brandingLink` |  |  | `nav-link` |  |  | `Branding` |
| a |  |  |  | `nav-link` |  |  | `Messages 3` |
| a | `frontPageLink` |  |  | `nav-link` |  |  | `Front Page` |
| button |  |  |  | `btn btn-outline-danger my-2 my-sm-0` |  |  | `Logout` |
| div | `room1` |  | `roomlisting` | `row detail` |  |  | `101Singletrue100TV, WiFi, Safe` |
| span | `1` |  |  | `fa fa-remove roomDelete` |  |  |  |
| div | `room2` |  | `roomlisting` | `row detail` |  |  | `102Doubletrue150TV, Radio, Safe` |
| span | `2` |  |  | `fa fa-remove roomDelete` |  |  |  |
| div | `room3` |  | `roomlisting` | `row detail` |  |  | `103Suitetrue225Radio, WiFi, Safe` |
| span | `3` |  |  | `fa fa-remove roomDelete` |  |  |  |
| input (text) | `roomName` |  | `roomName` | `form-control` |  |  |  |
| select | `type` |  |  | `form-control` |  |  | `SingleTwinDoubleFamilySuite` |
| select | `accessible` |  |  | `form-control` |  |  | `falsetrue` |
| input (text) | `roomPrice` |  |  | `form-control` |  |  |  |
| input (checkbox) | `wifiCheckbox` | `featureCheck` |  | `form-check-input` |  |  |  |
| input (checkbox) | `tvCheckbox` | `featureCheck` |  | `form-check-input` |  |  |  |
| input (checkbox) | `radioCheckbox` | `featureCheck` |  | `form-check-input` |  |  |  |
| input (checkbox) | `refreshCheckbox` | `featureCheck` |  | `form-check-input` |  |  |  |
| input (checkbox) | `safeCheckbox` | `featureCheck` |  | `form-check-input` |  |  |  |
| input (checkbox) | `viewsCheckbox` | `featureCheck` |  | `form-check-input` |  |  |  |
| button (submit) | `createRoom` |  |  | `btn btn-outline-primary` |  |  | `Create` |

<details><summary>Accessibility tree afterwards</summary>

```yaml
- navigation:
  - link "Restful Booker Platform Demo":
    - /url: /
  - list:
    - listitem:
      - link "Rooms":
        - /url: /admin/rooms
    - listitem:
      - link "Report":
        - /url: /admin/report
    - listitem:
      - link "Branding":
        - /url: /admin/branding
    - listitem:
      - link "Messages 3":
        - /url: /admin/message
  - list:
    - listitem:
      - link "Front Page":
        - /url: /
    - listitem:
      - button "Logout"
- paragraph: "Room #"
- paragraph: Type
- paragraph: Accessible
- paragraph: Price
- paragraph: Room details
- paragraph: "101"
- paragraph: Single
- paragraph: "true"
- paragraph: "100"
- paragraph: TV, WiFi, Safe
- text: 
- paragraph: "102"
- paragraph: Double
- paragraph: "true"
- paragraph: "150"
- paragraph: TV, Radio, Safe
- text: 
- paragraph: "103"
- paragraph: Suite
- paragraph: "true"
- paragraph: "225"
- paragraph: Radio, WiFi, Safe
- text: 
- textbox
- combobox:
  - option "Single" [selected]
  - option "Twin"
  - option "Double"
  - option "Family"
  - option "Suite"
- combobox:
  - option "false" [selected]
  - option "true"
- textbox
- checkbox "WiFi"
- text: WiFi
- checkbox "TV"
- text: TV
- checkbox "Radio"
- text: Radio
- checkbox "Refreshments"
- text: Refreshments
- checkbox "Safe"
- text: Safe
- checkbox "Views"
- text: Views
- button "Create"
- alert
```

</details>

## 4. rooms: create a room

Address afterwards: `/admin/rooms`; result: `{"room":"905"}`

API calls the page made:

- `GET /api/room` → 200
  - answer: `{"rooms":[{"accessible":true,"description":"Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.","features":["TV","WiFi","Safe"],"image":"/images/room1.jpg","roomName":"101","roomPrice":100,"roomid":1,"type":"Single"},{"accessible":true,"description":"Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl. ","features":["TV","Radio","Safe"],"image":"/images/room2.jpg","roomName":"102","roomPrice":150,"roomid":2,"type":"Double"},{"accessible":true,"description":"Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex. ","features":["Radio","WiFi","Safe"],"image":"/images/room3.jpg","roomName":"103","roomPrice":225,"roomid":3,"type":"Suite"},{"accessible":true,"description":"Please enter a description for this room","features":["WiFi","Safe"],"image":"https://www.mwtestconsultancy.co.uk/img/room1.jpg","roomName":"905","roomPrice":123,"roomid":4,"type":"Double"}]}`
- `POST /api/room` → 200
  - sent: `{"roomName":"905","type":"Double","accessible":true,"description":"Please enter a description for this room","image":"https://www.mwtestconsultancy.co.uk/img/room1.jpg","roomPrice":"123","features":["WiFi","Safe"]}`
  - answer: `{"success":true}`

Controls on the page:

| Element | id | name | Test id | Class | aria-label | Placeholder | Text |
|---|---|---|---|---|---|---|---|
| a |  |  |  | `navbar-brand` |  |  | `Restful Booker Platform Demo` |
| a |  |  |  | `nav-link active` |  |  | `Rooms` |
| a | `reportLink` |  |  | `nav-link` |  |  | `Report` |
| a | `brandingLink` |  |  | `nav-link` |  |  | `Branding` |
| a |  |  |  | `nav-link` |  |  | `Messages 3` |
| a | `frontPageLink` |  |  | `nav-link` |  |  | `Front Page` |
| button |  |  |  | `btn btn-outline-danger my-2 my-sm-0` |  |  | `Logout` |
| div | `room1` |  | `roomlisting` | `row detail` |  |  | `101Singletrue100TV, WiFi, Safe` |
| span | `1` |  |  | `fa fa-remove roomDelete` |  |  |  |
| div | `room2` |  | `roomlisting` | `row detail` |  |  | `102Doubletrue150TV, Radio, Safe` |
| span | `2` |  |  | `fa fa-remove roomDelete` |  |  |  |
| div | `room3` |  | `roomlisting` | `row detail` |  |  | `103Suitetrue225Radio, WiFi, Safe` |
| span | `3` |  |  | `fa fa-remove roomDelete` |  |  |  |
| div | `room4` |  | `roomlisting` | `row detail` |  |  | `905Doubletrue123WiFi, Safe` |
| span | `4` |  |  | `fa fa-remove roomDelete` |  |  |  |
| input (text) | `roomName` |  | `roomName` | `form-control` |  |  |  |
| select | `type` |  |  | `form-control` |  |  | `SingleTwinDoubleFamilySuite` |
| select | `accessible` |  |  | `form-control` |  |  | `falsetrue` |
| input (text) | `roomPrice` |  |  | `form-control` |  |  |  |
| input (checkbox) | `wifiCheckbox` | `featureCheck` |  | `form-check-input` |  |  |  |
| input (checkbox) | `tvCheckbox` | `featureCheck` |  | `form-check-input` |  |  |  |
| input (checkbox) | `radioCheckbox` | `featureCheck` |  | `form-check-input` |  |  |  |
| input (checkbox) | `refreshCheckbox` | `featureCheck` |  | `form-check-input` |  |  |  |
| input (checkbox) | `safeCheckbox` | `featureCheck` |  | `form-check-input` |  |  |  |
| input (checkbox) | `viewsCheckbox` | `featureCheck` |  | `form-check-input` |  |  |  |
| button (submit) | `createRoom` |  |  | `btn btn-outline-primary` |  |  | `Create` |

<details><summary>Accessibility tree afterwards</summary>

```yaml
- navigation:
  - link "Restful Booker Platform Demo":
    - /url: /
  - list:
    - listitem:
      - link "Rooms":
        - /url: /admin/rooms
    - listitem:
      - link "Report":
        - /url: /admin/report
    - listitem:
      - link "Branding":
        - /url: /admin/branding
    - listitem:
      - link "Messages 3":
        - /url: /admin/message
  - list:
    - listitem:
      - link "Front Page":
        - /url: /
    - listitem:
      - button "Logout"
- paragraph: "Room #"
- paragraph: Type
- paragraph: Accessible
- paragraph: Price
- paragraph: Room details
- paragraph: "101"
- paragraph: Single
- paragraph: "true"
- paragraph: "100"
- paragraph: TV, WiFi, Safe
- text: 
- paragraph: "102"
- paragraph: Double
- paragraph: "true"
- paragraph: "150"
- paragraph: TV, Radio, Safe
- text: 
- paragraph: "103"
- paragraph: Suite
- paragraph: "true"
- paragraph: "225"
- paragraph: Radio, WiFi, Safe
- text: 
- paragraph: "905"
- paragraph: Double
- paragraph: "true"
- paragraph: "123"
- paragraph: WiFi, Safe
- text: 
- textbox
- combobox:
  - option "Single" [selected]
  - option "Twin"
  - option "Double"
  - option "Family"
  - option "Suite"
- combobox:
  - option "false" [selected]
  - option "true"
- textbox
- checkbox "WiFi"
- text: WiFi
- checkbox "TV"
- text: TV
- checkbox "Radio"
- text: Radio
- checkbox "Refreshments"
- text: Refreshments
- checkbox "Safe"
- text: Safe
- checkbox "Views"
- text: Views
- button "Create"
- alert
```

</details>

## 5. rooms: create with nothing filled in

Address afterwards: `/admin/rooms`

API calls the page made:

- `POST /api/room` → 400
  - sent: `{"roomName":"","type":"Single","accessible":false,"description":"Please enter a description for this room","image":"https://www.mwtestconsultancy.co.uk/img/room1.jpg","roomPrice":"","features":[]}`
  - answer: `{"errors":["Failed to create room"]}`

<details><summary>Accessibility tree afterwards</summary>

```yaml
- navigation:
  - link "Restful Booker Platform Demo":
    - /url: /
  - list:
    - listitem:
      - link "Rooms":
        - /url: /admin/rooms
    - listitem:
      - link "Report":
        - /url: /admin/report
    - listitem:
      - link "Branding":
        - /url: /admin/branding
    - listitem:
      - link "Messages 3":
        - /url: /admin/message
  - list:
    - listitem:
      - link "Front Page":
        - /url: /
    - listitem:
      - button "Logout"
- paragraph: "Room #"
- paragraph: Type
- paragraph: Accessible
- paragraph: Price
- paragraph: Room details
- paragraph: "101"
- paragraph: Single
- paragraph: "true"
- paragraph: "100"
- paragraph: TV, WiFi, Safe
- text: 
- paragraph: "102"
- paragraph: Double
- paragraph: "true"
- paragraph: "150"
- paragraph: TV, Radio, Safe
- text: 
- paragraph: "103"
- paragraph: Suite
- paragraph: "true"
- paragraph: "225"
- paragraph: Radio, WiFi, Safe
- text: 
- paragraph: "905"
- paragraph: Double
- paragraph: "true"
- paragraph: "123"
- paragraph: WiFi, Safe
- text: 
- textbox
- combobox:
  - option "Single" [selected]
  - option "Twin"
  - option "Double"
  - option "Family"
  - option "Suite"
- combobox:
  - option "false" [selected]
  - option "true"
- textbox
- checkbox "WiFi"
- text: WiFi
- checkbox "TV"
- text: TV
- checkbox "Radio"
- text: Radio
- checkbox "Refreshments"
- text: Refreshments
- checkbox "Safe"
- text: Safe
- checkbox "Views"
- text: Views
- button "Create"
- paragraph: Failed to create room
- alert
```

</details>

## 6. room: open the new room

Address afterwards: `/admin/room/4`

API calls the page made:

- `POST /api/auth/validate` → 200
  - sent: `{"token":"<token>"}`
  - answer: `{"valid":true}`
- `GET /api/message/count` → 200
  - answer: `{"count":3}`
- `GET /api/booking/?roomid=4` → 308
- `GET /api/room/4` → 200
  - answer: `{"accessible":true,"description":"Please enter a description for this room","features":["WiFi","Safe"],"image":"https://www.mwtestconsultancy.co.uk/img/room1.jpg","roomName":"905","roomPrice":123,"roomid":4,"type":"Double"}`
- `GET /api/booking?roomid=4` → 200
  - answer: `{"bookings":[]}`

Controls on the page:

| Element | id | name | Test id | Class | aria-label | Placeholder | Text |
|---|---|---|---|---|---|---|---|
| a |  |  |  | `navbar-brand` |  |  | `Restful Booker Platform Demo` |
| a |  |  |  | `nav-link` |  |  | `Rooms` |
| a | `reportLink` |  |  | `nav-link` |  |  | `Report` |
| a | `brandingLink` |  |  | `nav-link` |  |  | `Branding` |
| a |  |  |  | `nav-link` |  |  | `Messages 3` |
| a | `frontPageLink` |  |  | `nav-link` |  |  | `Front Page` |
| button |  |  |  | `btn btn-outline-danger my-2 my-sm-0` |  |  | `Logout` |
| button (button) |  |  |  | `btn btn-outline-primary float-sm-end` |  |  | `Edit` |

<details><summary>Accessibility tree afterwards</summary>

```yaml
- navigation:
  - link "Restful Booker Platform Demo":
    - /url: /
  - list:
    - listitem:
      - link "Rooms":
        - /url: /admin/rooms
    - listitem:
      - link "Report":
        - /url: /admin/report
    - listitem:
      - link "Branding":
        - /url: /admin/branding
    - listitem:
      - link "Messages 3":
        - /url: /admin/message
  - list:
    - listitem:
      - link "Front Page":
        - /url: /
    - listitem:
      - button "Logout"
- 'heading "Room: 905" [level=2]'
- button "Edit"
- paragraph: "Type: Double"
- paragraph: "Description: Please enter a description for this room"
- paragraph: "Accessible: true"
- paragraph: "Features: WiFi, Safe"
- paragraph: "Room price: 123"
- paragraph: "Image:"
- 'img "Room: 905 preview image"'
- paragraph: First name
- paragraph: Last name
- paragraph: Price
- paragraph: Deposit paid?
- paragraph: Check in
- paragraph: Check out
- alert
```

</details>

## 7. room: edit the price

Address afterwards: `/admin/room/4`

API calls the page made:

- `GET /api/room/4` → 200
  - answer: `{"accessible":true,"description":"Please enter a description for this room","features":["WiFi","Safe"],"image":"https://www.mwtestconsultancy.co.uk/img/room1.jpg","roomName":"905","roomPrice":124,"roomid":4,"type":"Double"}`
- `PUT /api/room/4` → 202
  - sent: `{"accessible":true,"description":"Please enter a description for this room","features":["WiFi","Safe"],"image":"https://www.mwtestconsultancy.co.uk/img/room1.jpg","roomName":"905","roomPrice":"124","roomid":4,"type":"Double","featuresObject":{"WiFi":true,"TV":false,"Radio":false,"Refreshments":false,"Safe":true,"Views":false}}`
  - answer: `{"accessible":true,"description":"Please enter a description for this room","features":["WiFi","Safe"],"image":"https://www.mwtestconsultancy.co.uk/img/room1.jpg","roomName":"905","roomPrice":124,"roomid":4,"type":"Double"}`

Controls on the page:

| Element | id | name | Test id | Class | aria-label | Placeholder | Text |
|---|---|---|---|---|---|---|---|
| a |  |  |  | `navbar-brand` |  |  | `Restful Booker Platform Demo` |
| a |  |  |  | `nav-link` |  |  | `Rooms` |
| a | `reportLink` |  |  | `nav-link` |  |  | `Report` |
| a | `brandingLink` |  |  | `nav-link` |  |  | `Branding` |
| a |  |  |  | `nav-link` |  |  | `Messages 3` |
| a | `frontPageLink` |  |  | `nav-link` |  |  | `Front Page` |
| button |  |  |  | `btn btn-outline-danger my-2 my-sm-0` |  |  | `Logout` |
| button (button) |  |  |  | `btn btn-outline-primary float-sm-end` |  |  | `Edit` |

<details><summary>Accessibility tree afterwards</summary>

```yaml
- navigation:
  - link "Restful Booker Platform Demo":
    - /url: /
  - list:
    - listitem:
      - link "Rooms":
        - /url: /admin/rooms
    - listitem:
      - link "Report":
        - /url: /admin/report
    - listitem:
      - link "Branding":
        - /url: /admin/branding
    - listitem:
      - link "Messages 3":
        - /url: /admin/message
  - list:
    - listitem:
      - link "Front Page":
        - /url: /
    - listitem:
      - button "Logout"
- 'heading "Room: 905" [level=2]'
- button "Edit"
- paragraph: "Type: Double"
- paragraph: "Description: Please enter a description for this room"
- paragraph: "Accessible: true"
- paragraph: "Features: WiFi, Safe"
- paragraph: "Room price: 124"
- paragraph: "Image:"
- 'img "Room: 905 preview image"'
- paragraph: First name
- paragraph: Last name
- paragraph: Price
- paragraph: Deposit paid?
- paragraph: Check in
- paragraph: Check out
- alert
```

</details>

## 8. rooms: delete the new room

The step failed (`locator.click: Timeout 30000ms exceeded.`). Nothing was recorded after it but its screenshot, in the run's artifact.

API calls the page made:

- `GET /api/message/count` → 200
  - answer: `{"count":3}`
- `POST /api/auth/validate` → 200
  - sent: `{"token":"<token>"}`
  - answer: `{"valid":true}`
- `GET /api/room` → 200
  - answer: `{"rooms":[{"accessible":true,"description":"Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.","features":["TV","WiFi","Safe"],"image":"/images/room1.jpg","roomName":"101","roomPrice":100,"roomid":1,"type":"Single"},{"accessible":true,"description":"Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl. ","features":["TV","Radio","Safe"],"image":"/images/room2.jpg","roomName":"102","roomPrice":150,"roomid":2,"type":"Double"},{"accessible":true,"description":"Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex. ","features":["Radio","WiFi","Safe"],"image":"/images/room3.jpg","roomName":"103","roomPrice":225,"roomid":3,"type":"Suite"},{"accessible":true,"description":"Please enter a description for this room","features":["WiFi","Safe"],"image":"https://www.mwtestconsultancy.co.uk/img/room1.jpg","roomName":"905","roomPrice":124,"roomid":4,"type":"Double"}]}`

## 9. messages: open the first message

Address afterwards: `/admin/message`

API calls the page made:

- `GET /api/message/count` → 200
  - answer: `{"count":3}`
- `POST /api/auth/validate` → 200
  - sent: `{"token":"<token>"}`
  - answer: `{"valid":true}`
- `GET /api/message` → 200
  - answer: `{"messages":[{"id":1,"name":"James Dean","read":false,"subject":"Booking enquiry"},{"id":2,"name":"Test Visitor","read":false,"subject":"Question about rooms"},{"id":3,"name":"Test Visitor","read":false,"subject":"You have a new booking!"}]}`
- `GET /api/message/1` → 200
  - answer: `{"description":"I would like to book a room at your place","email":"james@email.com","messageid":1,"name":"James Dean","phone":"01402 619211","subject":"Booking enquiry"}`
- `PUT /api/message/1/read` → 202
- `GET /api/message/count` → 200
  - answer: `{"count":2}`
- `GET /api/message` → 200
  - answer: `{"messages":[{"id":1,"name":"James Dean","read":true,"subject":"Booking enquiry"},{"id":2,"name":"Test Visitor","read":false,"subject":"Question about rooms"},{"id":3,"name":"Test Visitor","read":false,"subject":"You have a new booking!"}]}`

Controls on the page:

| Element | id | name | Test id | Class | aria-label | Placeholder | Text |
|---|---|---|---|---|---|---|---|
| a |  |  |  | `navbar-brand` |  |  | `Restful Booker Platform Demo` |
| a |  |  |  | `nav-link` |  |  | `Rooms` |
| a | `reportLink` |  |  | `nav-link` |  |  | `Report` |
| a | `brandingLink` |  |  | `nav-link` |  |  | `Branding` |
| a |  |  |  | `nav-link active` |  |  | `Messages 2` |
| a | `frontPageLink` |  |  | `nav-link` |  |  | `Front Page` |
| button |  |  |  | `btn btn-outline-danger my-2 my-sm-0` |  |  | `Logout` |
| div |  |  | `message0` | `col-sm-2` |  |  | `James Dean` |
| div |  |  | `messageDescription0` | `col-sm-9` |  |  | `Booking enquiry` |
| span |  |  | `DeleteMessage0` | `fa fa-remove roomDelete` |  |  |  |
| div |  |  | `message1` | `col-sm-2` |  |  | `Test Visitor` |
| div |  |  | `messageDescription1` | `col-sm-9` |  |  | `Question about rooms` |
| span |  |  | `DeleteMessage1` | `fa fa-remove roomDelete` |  |  |  |
| div |  |  | `message2` | `col-sm-2` |  |  | `Test Visitor` |
| div |  |  | `messageDescription2` | `col-sm-9` |  |  | `You have a new booking!` |
| span |  |  | `DeleteMessage2` | `fa fa-remove roomDelete` |  |  |  |
| div |  |  | `message` |  |  |  | `From: James DeanPhone: 01402 619211Email: james@email.comBoo` |
| button |  |  |  | `btn btn-outline-primary` |  |  | `Close` |

<details><summary>Accessibility tree afterwards</summary>

```yaml
- navigation:
  - link "Restful Booker Platform Demo":
    - /url: /
  - list:
    - listitem:
      - link "Rooms":
        - /url: /admin/rooms
    - listitem:
      - link "Report":
        - /url: /admin/report
    - listitem:
      - link "Branding":
        - /url: /admin/branding
    - listitem:
      - link "Messages 2":
        - /url: /admin/message
  - list:
    - listitem:
      - link "Front Page":
        - /url: /
    - listitem:
      - button "Logout"
- paragraph: Name
- paragraph: Subject
- paragraph: James Dean
- paragraph: Booking enquiry
- text: 
- paragraph: Test Visitor
- paragraph: Question about rooms
- text: 
- paragraph: Test Visitor
- paragraph: You have a new booking!
- text: 
- alert
- dialog "onRequestClose Example":
  - paragraph: "From: James Dean"
  - paragraph: "Phone: 01402 619211"
  - paragraph: "Email: james@email.com"
  - paragraph: Booking enquiry
  - paragraph: I would like to book a room at your place
  - button "Close"
```

</details>

## 10. messages: close it

Address afterwards: `/admin/message`

API calls the page made:

- `GET /api/message/count` → 200
  - answer: `{"count":2}`
- `GET /api/message` → 200
  - answer: `{"messages":[{"id":1,"name":"James Dean","read":true,"subject":"Booking enquiry"},{"id":2,"name":"Test Visitor","read":false,"subject":"Question about rooms"},{"id":3,"name":"Test Visitor","read":false,"subject":"You have a new booking!"}]}`

<details><summary>Accessibility tree afterwards</summary>

```yaml
- navigation:
  - link "Restful Booker Platform Demo":
    - /url: /
  - list:
    - listitem:
      - link "Rooms":
        - /url: /admin/rooms
    - listitem:
      - link "Report":
        - /url: /admin/report
    - listitem:
      - link "Branding":
        - /url: /admin/branding
    - listitem:
      - link "Messages 2":
        - /url: /admin/message
  - list:
    - listitem:
      - link "Front Page":
        - /url: /
    - listitem:
      - button "Logout"
- paragraph: Name
- paragraph: Subject
- paragraph: James Dean
- paragraph: Booking enquiry
- text: 
- paragraph: Test Visitor
- paragraph: Question about rooms
- text: 
- paragraph: Test Visitor
- paragraph: You have a new booking!
- text: 
- alert
```

</details>

## 11. branding: change the name, then put it back

Address afterwards: `/admin/branding`; result: `{"original":"Shady Meadows B&B","publicNameAfterChange":"Shady Meadows B&B","restoredName":"Shady Meadows B&B"}`

<details><summary>Result afterChange: an accessibility tree</summary>

```yaml
- navigation:
  - link "Restful Booker Platform Demo":
    - /url: /
  - list:
    - listitem:
      - link "Rooms":
        - /url: /admin/rooms
    - listitem:
      - link "Report":
        - /url: /admin/report
    - listitem:
      - link "Branding":
        - /url: /admin/branding
    - listitem:
      - link "Messages 2":
        - /url: /admin/message
  - list:
    - listitem:
      - link "Front Page":
        - /url: /
    - listitem:
      - button "Logout"
- heading "B&B details" [level=2]
- text: Name
- textbox "Enter B&B name": Shady Meadows Test
- text: Logo
- textbox "Enter image url": /images/rbp-logo.jpg
- text: Description
- textbox: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
- heading "Map details" [level=2]
- text: Latitude
- textbox "Enter Latitude": "52.6351204"
- text: Longitude
- textbox "Enter Longitude": "1.2733774"
- text: Directions
- textbox: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
- heading "Contact details" [level=2]
- text: Name
- textbox "Enter Contact Name": Shady Meadows B&B
- text: Phone
- textbox "Enter Phone Number": "012345678901"
- text: Email
- textbox "Enter Email Address": fake@fakeemail.com
- heading "Address details" [level=2]
- text: Line 1
- textbox "Enter Address Line 1": Shady Meadows B&B
- text: Line 2
- textbox "Enter Address Line 2": Shadows valley
- text: Post Town
- textbox "Enter Post Town": Newingtonfordburyshire
- text: County
- textbox "Enter County": Dilbery
- text: Post Code
- textbox "Enter Post Code": N1 1AA
- button "Submit"
- paragraph: Url should be a correct url format
- alert
```

</details>

API calls the page made:

- `GET /api/message/count` → 200
  - answer: `{"count":2}`
- `POST /api/auth/validate` → 200
  - sent: `{"token":"<token>"}`
  - answer: `{"valid":true}`
- `GET /api/branding` → 200
  - answer: `{"address":{"county":"Dilbery","line1":"Shady Meadows B&B","line2":"Shadows valley","postCode":"N1 1AA","postTown":"Newingtonfordburyshire"},"contact":{"email":"fake@fakeemail.com","name":"Shady Meadows B&B","phone":"012345678901"},"description":"Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.","directions":"Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.","logoUrl":"/images/rbp-logo.jpg","map":{"latitude":52.6351204,"longitude":1.2733774},"name":"Shady Meadows B&B"}`
- `PUT /api/branding` → 400
  - sent: `{"address":{"county":"Dilbery","line1":"Shady Meadows B&B","line2":"Shadows valley","postCode":"N1 1AA","postTown":"Newingtonfordburyshire"},"contact":{"email":"fake@fakeemail.com","name":"Shady Meadows B&B","phone":"012345678901"},"description":"Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.","directions":"Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.","logoUrl":"/images/rbp-logo.jpg","map":{"latitude":52.6351204,"longitude":1.2733774},"name":"Shady Meadows Test"}`
  - answer: `{"error":"BAD_REQUEST","errorCode":400,"errorMessage":"Validation failed for argument [0] in public org.springframework.http.ResponseEntity<?> com.automationintesting.api.BrandingController.updateBranding(com.automationintesting.model.db.Branding,java.lang.String) throws java.sql.SQLException: [Field error in object 'branding' on field 'logoUrl': rejected value [/images/rbp-logo.jpg]; codes [URL.branding.logoUrl,URL.logoUrl,URL.java.lang.String,URL]; arguments [org.springframework.context.support.DefaultMessageSourceResolvable: codes [branding.logoUrl,logoUrl]; arguments []; default message [logoUrl],[Ljakarta.validation.constraints.Pattern$Flag;@4cdb272c,,-1,,.*]; default message [Url should be a correct url format]] ","fieldErrors":["Url should be a correct url format"]}`
- `PUT /api/branding` → 400
  - sent: `{"address":{"county":"Dilbery","line1":"Shady Meadows B&B","line2":"Shadows valley","postCode":"N1 1AA","postTown":"Newingtonfordburyshire"},"contact":{"email":"fake@fakeemail.com","name":"Shady Meadows B&B","phone":"012345678901"},"description":"Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.","directions":"Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.","logoUrl":"/images/rbp-logo.jpg","map":{"latitude":52.6351204,"longitude":1.2733774},"name":"Shady Meadows B&B"}`
  - answer: `{"error":"BAD_REQUEST","errorCode":400,"errorMessage":"Validation failed for argument [0] in public org.springframework.http.ResponseEntity<?> com.automationintesting.api.BrandingController.updateBranding(com.automationintesting.model.db.Branding,java.lang.String) throws java.sql.SQLException: [Field error in object 'branding' on field 'logoUrl': rejected value [/images/rbp-logo.jpg]; codes [URL.branding.logoUrl,URL.logoUrl,URL.java.lang.String,URL]; arguments [org.springframework.context.support.DefaultMessageSourceResolvable: codes [branding.logoUrl,logoUrl]; arguments []; default message [logoUrl],[Ljakarta.validation.constraints.Pattern$Flag;@4cdb272c,,-1,,.*]; default message [Url should be a correct url format]] ","fieldErrors":["Url should be a correct url format"]}`

Controls on the page:

| Element | id | name | Test id | Class | aria-label | Placeholder | Text |
|---|---|---|---|---|---|---|---|
| a |  |  |  | `navbar-brand` |  |  | `Restful Booker Platform Demo` |
| a |  |  |  | `nav-link` |  |  | `Rooms` |
| a | `reportLink` |  |  | `nav-link` |  |  | `Report` |
| a | `brandingLink` |  |  | `nav-link active` |  |  | `Branding` |
| a |  |  |  | `nav-link` |  |  | `Messages 2` |
| a | `frontPageLink` |  |  | `nav-link` |  |  | `Front Page` |
| button |  |  |  | `btn btn-outline-danger my-2 my-sm-0` |  |  | `Logout` |
| input (text) | `name` |  |  | `form-control` |  | `Enter B&B name` |  |
| input (text) | `logoUrl` |  |  | `form-control` |  | `Enter image url` |  |
| textarea | `description` |  |  | `form-control` |  |  | `Welcome to Shady Meadows, a delightful Bed & Breakfast nestl` |
| input (text) | `latitude` |  |  | `form-control` |  | `Enter Latitude` |  |
| input (text) | `longitude` |  |  | `form-control` |  | `Enter Longitude` |  |
| textarea | `directions` |  |  | `form-control` |  |  | `Welcome to Shady Meadows, a delightful Bed & Breakfast nestl` |
| input (text) | `contactName` |  |  | `form-control` |  | `Enter Contact Name` |  |
| input (text) | `contactPhone` |  |  | `form-control` |  | `Enter Phone Number` |  |
| input (email) | `contactEmail` |  |  | `form-control` |  | `Enter Email Address` |  |
| input (text) | `line1` |  |  | `form-control` |  | `Enter Address Line 1` |  |
| input (text) | `line2` |  |  | `form-control` |  | `Enter Address Line 2` |  |
| input (text) | `postTown` |  |  | `form-control` |  | `Enter Post Town` |  |
| input (text) | `county` |  |  | `form-control` |  | `Enter County` |  |
| input (text) | `postCode` |  |  | `form-control` |  | `Enter Post Code` |  |
| button (submit) | `updateBranding` |  |  | `btn btn-outline-primary` |  |  | `Submit` |

<details><summary>Accessibility tree afterwards</summary>

```yaml
- navigation:
  - link "Restful Booker Platform Demo":
    - /url: /
  - list:
    - listitem:
      - link "Rooms":
        - /url: /admin/rooms
    - listitem:
      - link "Report":
        - /url: /admin/report
    - listitem:
      - link "Branding":
        - /url: /admin/branding
    - listitem:
      - link "Messages 2":
        - /url: /admin/message
  - list:
    - listitem:
      - link "Front Page":
        - /url: /
    - listitem:
      - button "Logout"
- heading "B&B details" [level=2]
- text: Name
- textbox "Enter B&B name": Shady Meadows B&B
- text: Logo
- textbox "Enter image url": /images/rbp-logo.jpg
- text: Description
- textbox: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
- heading "Map details" [level=2]
- text: Latitude
- textbox "Enter Latitude": "52.6351204"
- text: Longitude
- textbox "Enter Longitude": "1.2733774"
- text: Directions
- textbox: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
- heading "Contact details" [level=2]
- text: Name
- textbox "Enter Contact Name": Shady Meadows B&B
- text: Phone
- textbox "Enter Phone Number": "012345678901"
- text: Email
- textbox "Enter Email Address": fake@fakeemail.com
- heading "Address details" [level=2]
- text: Line 1
- textbox "Enter Address Line 1": Shady Meadows B&B
- text: Line 2
- textbox "Enter Address Line 2": Shadows valley
- text: Post Town
- textbox "Enter Post Town": Newingtonfordburyshire
- text: County
- textbox "Enter County": Dilbery
- text: Post Code
- textbox "Enter Post Code": N1 1AA
- button "Submit"
- paragraph: Url should be a correct url format
- alert
```

</details>

## 12. report: open the calendar

Address afterwards: `/admin/report`

API calls the page made:

- `GET /api/message/count` → 200
  - answer: `{"count":2}`
- `POST /api/auth/validate` → 200
  - sent: `{"token":"<token>"}`
  - answer: `{"valid":true}`
- `GET /api/report` → 200
  - answer: `{"report":[{"end":"2026-02-05","start":"2026-02-01","title":"James Dean - Room: 101"},{"end":"2026-11-05","start":"2026-11-03","title":"Test Visitor - Room: 101"},{"end":"2026-02-04","start":"2026-02-02","title":"Erica Bowthorpe - Room: 102"},{"end":"2026-03-05","start":"2026-03-01","title":"Timothy Barrow - Room: 103"}]}`

Controls on the page:

| Element | id | name | Test id | Class | aria-label | Placeholder | Text |
|---|---|---|---|---|---|---|---|
| a |  |  |  | `navbar-brand` |  |  | `Restful Booker Platform Demo` |
| a |  |  |  | `nav-link` |  |  | `Rooms` |
| a | `reportLink` |  |  | `nav-link active` |  |  | `Report` |
| a | `brandingLink` |  |  | `nav-link` |  |  | `Branding` |
| a |  |  |  | `nav-link` |  |  | `Messages 2` |
| a | `frontPageLink` |  |  | `nav-link` |  |  | `Front Page` |
| button |  |  |  | `btn btn-outline-danger my-2 my-sm-0` |  |  | `Logout` |
| button (button) |  |  |  |  |  |  | `Today` |
| button (button) |  |  |  |  |  |  | `Back` |
| button (button) |  |  |  |  |  |  | `Next` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `27` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `28` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `29` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `30` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `01` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `02` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `03` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `04` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `05` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `06` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `07` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `08` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `09` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `10` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `11` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `12` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `13` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `14` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `15` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `16` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `17` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `18` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `19` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `20` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `21` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `22` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `23` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `24` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `25` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `26` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `27` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `28` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `29` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `30` |
| button (button) |  |  |  | `rbc-button-link` |  |  | `31` |

<details><summary>Accessibility tree afterwards</summary>

```yaml
- navigation:
  - link "Restful Booker Platform Demo":
    - /url: /
  - list:
    - listitem:
      - link "Rooms":
        - /url: /admin/rooms
    - listitem:
      - link "Report":
        - /url: /admin/report
    - listitem:
      - link "Branding":
        - /url: /admin/branding
    - listitem:
      - link "Messages 2":
        - /url: /admin/message
  - list:
    - listitem:
      - link "Front Page":
        - /url: /
    - listitem:
      - button "Logout"
- button "Today"
- button "Back"
- button "Next"
- text: October 2026
- table "Month View":
  - row "Sun Mon Tue Wed Thu Fri Sat":
    - columnheader "Sun"
    - columnheader "Mon"
    - columnheader "Tue"
    - columnheader "Wed"
    - columnheader "Thu"
    - columnheader "Fri"
    - columnheader "Sat"
  - rowgroup:
    - row "27 28 29 30 01 02 03":
      - cell "27":
        - button "27"
      - cell "28":
        - button "28"
      - cell "29":
        - button "29"
      - cell "30":
        - button "30"
      - cell "01":
        - button "01"
      - cell "02":
        - button "02"
      - cell "03":
        - button "03"
  - rowgroup:
    - row "04 05 06 07 08 09 10":
      - cell "04":
        - button "04"
      - cell "05":
        - button "05"
      - cell "06":
        - button "06"
      - cell "07":
        - button "07"
      - cell "08":
        - button "08"
      - cell "09":
        - button "09"
      - cell "10":
        - button "10"
  - rowgroup:
    - row "11 12 13 14 15 16 17":
      - cell "11":
        - button "11"
      - cell "12":
        - button "12"
      - cell "13":
        - button "13"
      - cell "14":
        - button "14"
      - cell "15":
        - button "15"
      - cell "16":
        - button "16"
      - cell "17":
        - button "17"
  - rowgroup:
    - row "18 19 20 21 22 23 24":
      - cell "18":
        - button "18"
      - cell "19":
        - button "19"
      - cell "20":
        - button "20"
      - cell "21":
        - button "21"
      - cell "22":
        - button "22"
      - cell "23":
        - button "23"
      - cell "24":
        - button "24"
  - rowgroup:
    - row "25 26 27 28 29 30 31":
      - cell "25":
        - button "25"
      - cell "26":
        - button "26"
      - cell "27":
        - button "27"
      - cell "28":
        - button "28"
      - cell "29":
        - button "29"
      - cell "30":
        - button "30"
      - cell "31":
        - button "31"
- alert
```

</details>

## 13. sign out, then try the old sign-in

Address afterwards: `/`; result: `{"checked":true,"validateStatus":200,"validateAnswer":"{\"valid\":true}","bookingsWithOldToken":401}`

API calls the page made:

- `POST /api/auth/validate` → 200
  - sent: `{"token":"<token>"}`
  - answer: `{"valid":true}`
- `GET /api/message/count` → 200
  - answer: `{"count":2}`
- `GET /api/branding` → 200
  - answer: `{"address":{"county":"Dilbery","line1":"Shady Meadows B&B","line2":"Shadows valley","postCode":"N1 1AA","postTown":"Newingtonfordburyshire"},"contact":{"email":"fake@fakeemail.com","name":"Shady Meadows B&B","phone":"012345678901"},"description":"Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.","directions":"Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.","logoUrl":"/images/rbp-logo.jpg","map":{"latitude":52.6351204,"longitude":1.2733774},"name":"Shady Meadows B&B"}`
- `GET /api/room` → 200
  - answer: `{"rooms":[{"accessible":true,"description":"Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.","features":["TV","WiFi","Safe"],"image":"/images/room1.jpg","roomName":"101","roomPrice":100,"roomid":1,"type":"Single"},{"accessible":true,"description":"Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl. ","features":["TV","Radio","Safe"],"image":"/images/room2.jpg","roomName":"102","roomPrice":150,"roomid":2,"type":"Double"},{"accessible":true,"description":"Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex. ","features":["Radio","WiFi","Safe"],"image":"/images/room3.jpg","roomName":"103","roomPrice":225,"roomid":3,"type":"Suite"},{"accessible":true,"description":"Please enter a description for this room","features":["WiFi","Safe"],"image":"https://www.mwtestconsultancy.co.uk/img/room1.jpg","roomName":"905","roomPrice":124,"roomid":4,"type":"Double"}]}`

<details><summary>Accessibility tree afterwards</summary>

```yaml
- navigation:
  - link "Shady Meadows B&B":
    - /url: /
  - list:
    - listitem:
      - link "Rooms":
        - /url: /#rooms
    - listitem:
      - link "Booking":
        - /url: /#booking
    - listitem:
      - link "Amenities":
        - /url: /#amenities
    - listitem:
      - link "Location":
        - /url: /#location
    - listitem:
      - link "Contact":
        - /url: /#contact
    - listitem:
      - link "Admin":
        - /url: /admin
- heading "Welcome to Shady Meadows B&B" [level=1]
- paragraph: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
- link "Book Now":
  - /url: "#booking"
- heading "Check Availability & Book Your Stay" [level=3]
- text: Check In
- textbox: 04/10/2026
- text: Check Out
- textbox: 05/10/2026
- button "Check Availability"
- heading "Our Rooms" [level=2]
- paragraph: Comfortable beds and delightful breakfast from locally sourced ingredients
- img "Single Room"
- heading "Single" [level=5]
- paragraph: Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.
- text:  TV  WiFi  Safe £100 per night
- link "Book now":
  - /url: /reservation/1?checkin=2026-10-04&checkout=2026-10-05
- img "Single Room"
- heading "Double" [level=5]
- paragraph: Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl.
- text:  TV  Radio  Safe £150 per night
- link "Book now":
  - /url: /reservation/2?checkin=2026-10-04&checkout=2026-10-05
- img "Single Room"
- heading "Suite" [level=5]
- paragraph: Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex.
- text:  Radio  WiFi  Safe £225 per night
- link "Book now":
  - /url: /reservation/3?checkin=2026-10-04&checkout=2026-10-05
- heading "Our Location" [level=2]
- paragraph: Find us in the beautiful Newingtonfordburyshire countryside
- img
- link "Pigeon":
  - /url: https://pigeon-maps.js.org/
- text: "| ©"
- link "OpenStreetMap":
  - /url: https://www.openstreetmap.org/copyright
- text: contributors
- heading "Contact Information" [level=3]
- text: 
- heading "Address" [level=5]
- paragraph: Shady Meadows B&B, Shadows valley, Newingtonfordburyshire, Dilbery, N1 1AA
- text: 
- heading "Phone" [level=5]
- paragraph: "012345678901"
- text: 
- heading "Email" [level=5]
- paragraph: fake@fakeemail.com
- separator
- heading "Getting Here" [level=4]
- paragraph: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
- heading "Send Us a Message" [level=3]
- text: Name
- textbox "Name"
- text: Email
- textbox "Email"
- text: Phone
- textbox "Phone"
- text: Subject
- textbox "Subject"
- text: Message
- textbox
- button "Submit"
- contentinfo:
  - heading "Shady Meadows B&B" [level=5]
  - paragraph: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
  - link "":
    - /url: "#"
  - link "":
    - /url: "#"
  - link "":
    - /url: "#"
  - heading "Contact Us" [level=5]
  - list:
    - listitem:  Shady Meadows B&B, Shadows valley, Newingtonfordburyshire, Dilbery, N1 1AA
    - listitem:  012345678901
    - listitem:  fake@fakeemail.com
  - heading "Quick Links" [level=5]
  - list:
    - listitem:
      - link "Home":
        - /url: "#"
    - listitem:
      - link "Rooms":
        - /url: "#"
    - listitem:
      - link "Booking":
        - /url: "#"
    - listitem:
      - link "Contact":
        - /url: "#"
  - separator
  - text: restful-booker-platform v2.2 Created by
  - link "Mark Winteringham":
    - /url: http://www.mwtestconsultancy.co.uk
  - text: "- © 2019-26"
  - link "Cookie-Policy":
    - /url: /cookie
  - text: "-"
  - link "Privacy-Policy":
    - /url: /privacy
  - text: "-"
  - link "Admin panel":
    - /url: /admin
- alert
```

</details>
