# Visitor flows, observed 2026-10-04

Recorded by `explore/flows.mjs` in [run 37193321685](https://github.com/TalhaAhmedMubashir/playwright-release-confidence/actions/runs/37193321685),
against RBP 2.2 started from `docker-compose.yml`. Made-up data only; no sign-in. Calendar cells are left out of the
accessibility trees below to keep them readable.

## 1. menu links: which section targets exist

Address afterwards: `/`; result: `{"rooms":true,"booking":true,"amenities":false,"location":true,"contact":true}`

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

## 2. contact form: submit empty

Address afterwards: `/`

API calls the page made:

- `POST /api/message` → 400
  - sent: `{"name":"","email":"","phone":"","subject":"","description":""}`
  - answer: `["Phone must be between 11 and 21 characters.","Phone may not be blank","Message must be between 20 and 2000 characters.","Message may not be blank","Email may not be blank","Subject must be between 5 and 100 characters.","Name may not be blank","Subject may not be blank"]`

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
- paragraph: Phone must be between 11 and 21 characters.
- paragraph: Phone may not be blank
- paragraph: Message must be between 20 and 2000 characters.
- paragraph: Message may not be blank
- paragraph: Email may not be blank
- paragraph: Subject must be between 5 and 100 characters.
- paragraph: Name may not be blank
- paragraph: Subject may not be blank
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

## 3. contact form: values too short or malformed

Address afterwards: `/`

API calls the page made:

- `POST /api/message` → 400
  - sent: `{"name":"A","email":"not-an-email","phone":"123","subject":"Hi","description":"Short"}`
  - answer: `["must be a well-formed email address","Phone must be between 11 and 21 characters.","Message must be between 20 and 2000 characters.","Subject must be between 5 and 100 characters."]`

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
- textbox "Name": A
- text: Email
- textbox "Email": not-an-email
- text: Phone
- textbox "Phone": "123"
- text: Subject
- textbox "Subject": Hi
- text: Message
- textbox: Short
- button "Submit"
- paragraph: must be a well-formed email address
- paragraph: Phone must be between 11 and 21 characters.
- paragraph: Message must be between 20 and 2000 characters.
- paragraph: Subject must be between 5 and 100 characters.
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

## 4. contact form: valid message

Address afterwards: `/`

API calls the page made:

- `POST /api/message` → 200
  - sent: `{"name":"Test Visitor","email":"visitor@example.com","phone":"01234567890","subject":"Question about rooms","description":"Is breakfast included with every room? Thank you for your help."}`
  - answer: `{"success":true}`

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
- heading "Thanks for getting in touch Test Visitor!" [level=3]
- paragraph: We'll get back to you about
- paragraph: Question about rooms
- paragraph: as soon as possible.
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

## 5. availability: search dates

Address afterwards: `/`; result: `{"checkIn":"13/11/2026","checkOut":"15/11/2026"}`

API calls the page made:

- `GET /api/room?checkin=2026-11-13&checkout=2026-11-15` → 200
  - answer: `{"rooms":[{"accessible":true,"description":"Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.","features":["TV","WiFi","Safe"],"image":"/images/room1.jpg","roomName":"101","roomPrice":100,"roomid":1,"type":"Single"},{"accessible":true,"description":"Vestibulum sollicitudin, lectus ac mollis consequat, `

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
- textbox: 13/11/2026
- text: Check Out
- textbox: 15/11/2026
- button "Check Availability"
- heading "Our Rooms" [level=2]
- paragraph: Comfortable beds and delightful breakfast from locally sourced ingredients
- img "Single Room"
- heading "Single" [level=5]
- paragraph: Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.
- text:  TV  WiFi  Safe £100 per night
- link "Book now":
  - /url: /reservation/1?checkin=2026-11-13&checkout=2026-11-15
- img "Single Room"
- heading "Double" [level=5]
- paragraph: Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl.
- text:  TV  Radio  Safe £150 per night
- link "Book now":
  - /url: /reservation/2?checkin=2026-11-13&checkout=2026-11-15
- img "Single Room"
- heading "Suite" [level=5]
- paragraph: Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex.
- text:  Radio  WiFi  Safe £225 per night
- link "Book now":
  - /url: /reservation/3?checkin=2026-11-13&checkout=2026-11-15
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

## 6. booking: open the guest form

Address afterwards: `/reservation/1?checkin=2026-11-03&checkout=2026-11-05`

API calls the page made:

- `GET /api/room/1` → 200
  - answer: `{"accessible":true,"description":"Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.","features":["TV","WiFi","Safe"],"image":"/images/room1.jpg","roomName":"101","roomPrice":100,"roomid":1,"type":"Single"}`
- `GET /api/report/room/1` → 200
  - answer: `{"report":[{"end":"2026-02-05","start":"2026-02-01","title":"Unavailable"}]}`

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
- navigation "breadcrumb":
  - list:
    - listitem:
      - link "Home":
        - /url: /
    - listitem:
      - text: /
      - link "Rooms":
        - /url: "#"
    - listitem: / Single Room
- heading "Single Room" [level=1]
- text: Accessible  Max 2 Guests
- img "Room Image"
- heading "Room Description" [level=2]
- paragraph: Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.
- heading "Room Features" [level=2]
- text:  TV  WiFi  Safe
- heading "Room Policies" [level=2]
- heading "Check-in & Check-out" [level=3]
- list:
  - listitem:
    - text: 
    - strong: "Check-in:"
    - text: 3:00 PM - 8:00 PM
  - listitem:
    - text: 
    - strong: "Check-out:"
    - text: By 11:00 AM
  - listitem:
    - text: 
    - strong: "Early/Late:"
    - text: By arrangement
- heading "House Rules" [level=3]
- list:
  - listitem:  No smoking
  - listitem:  No parties or events
  - listitem:  Pets allowed (restrictions apply)
- heading "Book This Room" [level=2]
- text: £100 per night 
- textbox "Firstname"
- text: 
- textbox "Lastname"
- text: 
- textbox "Email"
- text: 
- textbox "Phone"
- heading "Price Summary" [level=3]
- text: £100 x 2 nights £200 Cleaning fee £25 Service fee £15
- separator
- text: Total £240
- button "Reserve Now"
- button "Cancel"
- heading "Similar Rooms You Might Like" [level=2]
- img "Double"
- heading "Double" [level=3]
- text:  2 Guests £150/night
- paragraph: Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl.
- link "View Details":
  - /url: /reservation/2?checkin=2026-11-03&checkout=2026-11-05
- img "Suite"
- heading "Suite" [level=3]
- text:  2 Guests £225/night
- paragraph: Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex.
- link "View Details":
  - /url: /reservation/3?checkin=2026-11-03&checkout=2026-11-05
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

## 7. booking: submit the guest form empty

Address afterwards: `/reservation/1?checkin=2026-11-03&checkout=2026-11-05`

API calls the page made:

- `POST /api/booking` → 400
  - sent: `{"roomid":1,"firstname":"","lastname":"","depositpaid":false,"bookingdates":{"checkin":"2026-11-03","checkout":"2026-11-05"},"email":"","phone":""}`
  - answer: `{"errors":["must not be empty","size must be between 3 and 30","size must be between 3 and 18","must not be empty","size must be between 11 and 21","Lastname should not be blank","Firstname should not be blank"]}`

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
- navigation "breadcrumb":
  - list:
    - listitem:
      - link "Home":
        - /url: /
    - listitem:
      - text: /
      - link "Rooms":
        - /url: "#"
    - listitem: / Single Room
- heading "Single Room" [level=1]
- text: Accessible  Max 2 Guests
- img "Room Image"
- heading "Room Description" [level=2]
- paragraph: Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.
- heading "Room Features" [level=2]
- text:  TV  WiFi  Safe
- heading "Room Policies" [level=2]
- heading "Check-in & Check-out" [level=3]
- list:
  - listitem:
    - text: 
    - strong: "Check-in:"
    - text: 3:00 PM - 8:00 PM
  - listitem:
    - text: 
    - strong: "Check-out:"
    - text: By 11:00 AM
  - listitem:
    - text: 
    - strong: "Early/Late:"
    - text: By arrangement
- heading "House Rules" [level=3]
- list:
  - listitem:  No smoking
  - listitem:  No parties or events
  - listitem:  Pets allowed (restrictions apply)
- heading "Book This Room" [level=2]
- text: £100 per night 
- textbox "Firstname"
- text: 
- textbox "Lastname"
- text: 
- textbox "Email"
- text: 
- textbox "Phone"
- alert:
  - list:
    - listitem: must not be empty
    - listitem: size must be between 3 and 30
    - listitem: size must be between 3 and 18
    - listitem: must not be empty
    - listitem: size must be between 11 and 21
    - listitem: Lastname should not be blank
    - listitem: Firstname should not be blank
- heading "Price Summary" [level=3]
- text: £100 x 2 nights £200 Cleaning fee £25 Service fee £15
- separator
- text: Total £240
- button "Reserve Now"
- button "Cancel"
- heading "Similar Rooms You Might Like" [level=2]
- img "Double"
- heading "Double" [level=3]
- text:  2 Guests £150/night
- paragraph: Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl.
- link "View Details":
  - /url: /reservation/2?checkin=2026-11-03&checkout=2026-11-05
- img "Suite"
- heading "Suite" [level=3]
- text:  2 Guests £225/night
- paragraph: Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex.
- link "View Details":
  - /url: /reservation/3?checkin=2026-11-03&checkout=2026-11-05
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

## 8. booking: valid guest details

Address afterwards: `/reservation/1?checkin=2026-11-03&checkout=2026-11-05`; result: `{"filled":["firstname firstname firstname","lastname lastname lastname","email email email","phone phone phone"]}`

API calls the page made:

- `POST /api/booking` → 201
  - sent: `{"roomid":1,"firstname":"Test","lastname":"Visitor","depositpaid":false,"bookingdates":{"checkin":"2026-11-03","checkout":"2026-11-05"},"email":"visitor@example.com","phone":"01234567890"}`
  - answer: `{"bookingdates":{"checkin":"2026-11-03","checkout":"2026-11-05"},"bookingid":4,"depositpaid":false,"firstname":"Test","lastname":"Visitor","roomid":1}`

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
- navigation "breadcrumb":
  - list:
    - listitem:
      - link "Home":
        - /url: /
    - listitem:
      - text: /
      - link "Rooms":
        - /url: "#"
    - listitem: / Single Room
- heading "Single Room" [level=1]
- text: Accessible  Max 2 Guests
- img "Room Image"
- heading "Room Description" [level=2]
- paragraph: Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.
- heading "Room Features" [level=2]
- text:  TV  WiFi  Safe
- heading "Room Policies" [level=2]
- heading "Check-in & Check-out" [level=3]
- list:
  - listitem:
    - text: 
    - strong: "Check-in:"
    - text: 3:00 PM - 8:00 PM
  - listitem:
    - text: 
    - strong: "Check-out:"
    - text: By 11:00 AM
  - listitem:
    - text: 
    - strong: "Early/Late:"
    - text: By arrangement
- heading "House Rules" [level=3]
- list:
  - listitem:  No smoking
  - listitem:  No parties or events
  - listitem:  Pets allowed (restrictions apply)
- heading "Booking Confirmed" [level=2]
- paragraph: "Your booking has been confirmed for the following dates:"
- paragraph:
  - strong: 2026-11-03 - 2026-11-05
- link "Return home":
  - /url: /
- heading "Similar Rooms You Might Like" [level=2]
- img "Double"
- heading "Double" [level=3]
- text:  2 Guests £150/night
- paragraph: Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl.
- link "View Details":
  - /url: /reservation/2?checkin=2026-11-03&checkout=2026-11-05
- img "Suite"
- heading "Suite" [level=3]
- text:  2 Guests £225/night
- paragraph: Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex.
- link "View Details":
  - /url: /reservation/3?checkin=2026-11-03&checkout=2026-11-05
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

## 9. booking: the same room and dates again

Address afterwards: `/reservation/1?checkin=2026-11-03&checkout=2026-11-05`; result: `{"filled":["firstname firstname firstname","lastname lastname lastname","email email email","phone phone phone"]}`

API calls the page made:

- `GET /api/room/1` → 200
  - answer: `{"accessible":true,"description":"Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.","features":["TV","WiFi","Safe"],"image":"/images/room1.jpg","roomName":"101","roomPrice":100,"roomid":1,"type":"Single"}`
- `GET /api/report/room/1` → 200
  - answer: `{"report":[{"end":"2026-02-05","start":"2026-02-01","title":"Unavailable"},{"end":"2026-11-05","start":"2026-11-03","title":"Unavailable"}]}`
- `POST /api/booking` → 409
  - sent: `{"roomid":1,"firstname":"Test","lastname":"Visitor","depositpaid":false,"bookingdates":{"checkin":"2026-11-03","checkout":"2026-11-05"},"email":"visitor@example.com","phone":"01234567890"}`
  - answer: `{"error":"Failed to create booking"}`

<details><summary>Accessibility tree afterwards</summary>

```yaml
- img
- heading "This page couldn’t load" [level=1]
- paragraph: Reload to try again, or go back.
- button "Reload"
- button "Back"
```

</details>

## 10. phone width: open the menu

Address afterwards: `/`

<details><summary>Accessibility tree afterwards</summary>

```yaml
- navigation:
  - link "Shady Meadows B&B":
    - /url: /
  - button [expanded]
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

## 11. an address with no page

Address afterwards: `/no-such-page`; result: `{"status":404}`

<details><summary>Accessibility tree afterwards</summary>

```yaml
- heading "404" [level=1]
- heading "This page could not be found." [level=2]
- alert
```

</details>

## What the API gives a visitor who is not signed in

| Request | Status | Answer (start) |
|---|---|---|
| `GET /api/message/` | 200 | `{"messages":[{"id":1,"name":"James Dean","read":false,"subject":"Booking enquiry"},{"id":2,"name":"Test Visitor","read":false,"subject":"Question about rooms"},` |
| `GET /api/message/1` | 200 | `{"description":"I would like to book a room at your place","email":"james@email.com","messageid":1,"name":"James Dean","phone":"01402 619211","subject":"Booking` |
| `GET /api/message/count` | 200 | `{"count":3}` |
| `GET /api/booking/` | 401 | `{"error":"Authentication required"}` |
| `GET /api/booking/1` | 403 | `` |
| `GET /api/booking/summary?roomid=1` | 401 | `{"error":"Authentication required"}` |
| `GET /api/booking/unavailable?checkin=2026-11-03&checkout=2026-11-05` | 200 | `[{"roomid":1}]` |
| `GET /api/report/` | 401 | `{"error":"Authentication required"}` |
| `GET /api/report/room/1` | 200 | `{"report":[{"end":"2026-02-05","start":"2026-02-01","title":"Unavailable"},{"end":"2026-11-05","start":"2026-11-03","title":"Unavailable"}]}` |
| `GET /api/room/1` | 200 | `{"accessible":true,"description":"Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et male` |
| `POST /api/room/` | 401 | `{"errors":["Authentication required"]}` |
| `PUT /api/branding/` | 401 | `{"error":"Authentication required"}` |
