"Ready Ka Ba?" — 4 Standalone Kiro Prompts

Each block below is complete on its own — the shared contract is already baked into every prompt, so each person just copies their entire block and pastes it straight into Kiro. No assembly required. Work all 4 simultaneously on separate branches.

---

## 🧩 PERSON 1 — Backend / API

I'm building "Ready Ka Ba?" — a full-stack emergency info card app, as part of a 4-person team working in parallel on separate branches of the same repo. My job is the backend.

**THE PRODUCT:** users fill in emergency medical info (blood type, allergies, conditions, emergency contacts). They get a QR code that links to a live, always-up-to-date public page showing that info — useful for first responders or anyone who needs it in an emergency. The key idea: the QR encodes a LINK, not raw data, so updating your info once keeps every printed/saved QR current.

**SHARED DATA MODEL** (must match exactly — my teammates' frontend code depends on these field names):
```json
{
  "id": "string",
  "fullName": "string",
  "bloodType": "string",
  "allergies": "string[]",
  "conditions": "string[]",
  "medications": "string[]",
  "emergencyContacts": [{ "name": "string", "relationship": "string", "phone": "string" }],
  "notes": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**MY TASK** — build the backend as Node.js + Express in a /backend folder:

1. **POST /api/cards** — accepts a card object (fullName, bloodType, allergies[], conditions[], medications[], emergencyContacts[], notes). Validate: fullName and bloodType required, at least 1 emergency contact with name+phone required. Generate a unique id with nanoid, set createdAt/updatedAt to the current ISO timestamp, save it, return the full saved object.

2. **GET /api/cards/:id** — fetch a card by id. Return 404 with a clear JSON error message if not found.

3. **PUT /api/cards/:id** — update an existing card's fields, bump updatedAt, return the updated object. 404 if the id doesn't exist.

4. Use **lowdb** (simple JSON file storage) — no external database, zero setup overhead.

5. Enable **CORS** for all origins in development.

6. Clear error responses: 400 for bad input, 404 for missing resources, 500 with a generic message for anything unexpected (never leak stack traces to the client).

7. **GET /api/health** — returns `{ status: "ok" }`, used to verify deployment later.

Structure it cleanly — separate routes, controllers, and the storage layer — so a teammate can read it easily. Write a README.md in /backend covering: how to run it locally (npm install, npm run dev, what port), and the full endpoint list with example request and response JSON for each one.

**When finished:** test every endpoint yourself with curl or Postman, commit, push to `feature/backend-api`, and open a PR against main.

---

## 🧩 PERSON 2 — Frontend: Intake Form

I'm building "Ready Ka Ba?" — a full-stack emergency info card app, as part of a 4-person team working in parallel on separate branches of the same repo. My job is the intake form.

**THE PRODUCT:** users fill in emergency medical info (blood type, allergies, conditions, emergency contacts). They get a QR code that links to a live, always-up-to-date public page showing that info — useful for first responders or anyone who needs it in an emergency. The key idea: the QR encodes a LINK, not raw data, so updating your info once keeps every printed/saved QR current.

**SHARED DATA MODEL** (must match exactly — the backend and my teammates' code depend on these field names):
```json
{
  "id": "string",
  "fullName": "string",
  "bloodType": "string",
  "allergies": "string[]",
  "conditions": "string[]",
  "medications": "string[]",
  "emergencyContacts": [{ "name": "string", "relationship": "string", "phone": "string" }],
  "notes": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**API CONTRACT I'm calling:**
- **POST /api/cards** — send the card object minus id/timestamps, receive back the full saved object including its new id
- Base URL comes from an environment variable `VITE_API_URL`, defaulting to `http://localhost:3001` for local dev — never hardcode the URL

**MY TASK** — build the card creation form as a React (Vite) app in a /frontend folder, at route "/" (home page):

1. A clean, single-page form collecting: full name, blood type (dropdown: A+, A-, B+, B-, AB+, AB-, O+, O-, Unknown), allergies (tag-style input — type and press Enter to add, removable chips), conditions (same tag-style input), medications (same tag-style input), 1-3 emergency contacts (name, relationship, phone, with an "add another contact" button capped at 3), and an optional free-text notes field.

2. Client-side validation before submit: full name and blood type required, at least one emergency contact with name+phone filled in. Show inline error messages — don't allow empty submissions through.

3. On submit, POST the data to `VITE_API_URL + "/api/cards"`.

4. On success, redirect to `/result/:id` using the id returned from the API. That route is being built by a teammate in parallel — if it doesn't exist yet in my local branch, navigate there anyway; it'll work once we merge.

5. Handle loading state (disable the submit button, show a spinner) and error state (API down, validation failed) gracefully — never let the form silently fail with no feedback.

6. Visual design should be clean and calm, not flashy — this is a safety tool. Generous whitespace, clear labels, fully mobile-responsive since people will fill this out on their phones.

**When finished:** test the full form flow against the real backend locally once it's available (coordinate the API URL with the backend teammate), commit, push to `feature/frontend-form`, and open a PR against main.

---

## 🧩 PERSON 3 — Frontend: Card Display, QR Code, Public View

I'm building "Ready Ka Ba?" — a full-stack emergency info card app, as part of a 4-person team working in parallel on separate branches of the same repo. My job is the QR code and card display.

**THE PRODUCT:** users fill in emergency medical info (blood type, allergies, conditions, emergency contacts). They get a QR code that links to a live, always-up-to-date public page showing that info — useful for first responders or anyone who needs it in an emergency. The key idea: the QR encodes a LINK, not raw data, so updating your info once keeps every printed/saved QR current.

**SHARED DATA MODEL** (must match exactly):
```json
{
  "id": "string",
  "fullName": "string",
  "bloodType": "string",
  "allergies": "string[]",
  "conditions": "string[]",
  "medications": "string[]",
  "emergencyContacts": [{ "name": "string", "relationship": "string", "phone": "string" }],
  "notes": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**API CONTRACT I'm calling:**
- **GET /api/cards/:id** — returns the full card object, 404 if not found
- Base URL comes from environment variable `VITE_API_URL`, defaulting to `http://localhost:3001` for local dev

**MY TASK** — build two pages in the same /frontend React (Vite) app as my teammates:

### PART A — Result page, route "/result/:id" (shown right after someone creates their card):
1. Fetch the card from GET /api/cards/:id using the id from the URL.
2. Generate a QR code using the "qrcode" npm package, encoding the public URL: `{current site origin}/card/{id}`
3. Display the QR code prominently alongside a styled "ID card" preview of the person's info — good enough to actually print or screenshot.
4. Add a "Download as image" button (use html-to-image or html2canvas to export the card element as a PNG).
5. Add a "Copy link" button that copies the public card URL to the clipboard.

### PART B — Public card view, route "/card/:id" (what someone sees after scanning the QR):
1. Fetch GET /api/cards/:id, show a friendly not-found message if the card doesn't exist.
2. Read-only layout optimized for someone in an emergency to scan quickly: blood type and allergies should be the largest, boldest, most visually prominent elements on the page (this is the one place an alert/red-amber accent color is earned, not decorative). Emergency contact phone numbers should be tap-to-call links (tel:) on mobile.
3. Must load fast and work with zero friction on a phone browser — no login, no setup.

**When finished:** test both routes against the real backend locally, confirm the downloaded image actually looks good, commit, push to `feature/frontend-card-qr`, and open a PR against main.

---

## 🧩 PERSON 4 — Integration, Deployment, QA

I'm building "Ready Ka Ba?" — a full-stack emergency info card app, as part of a 4-person team working in parallel on separate branches of the same repo. My job is integration, deployment, and quality assurance across everyone's work.

**THE PRODUCT:** users fill in emergency medical info (blood type, allergies, conditions, emergency contacts). They get a QR code that links to a live, always-up-to-date public page showing that info — useful for first responders or anyone who needs it in an emergency. The key idea: the QR encodes a LINK, not raw data, so updating your info once keeps every printed/saved QR current.

**ARCHITECTURE:** a Node/Express backend in /backend (built by teammate 1) and a React/Vite frontend in /frontend with a form page, a result page, and a public card page (built by teammates 2 and 3).

**MY TASKS, roughly in order:**

### 1. EARLY (first 20 minutes, before waiting on teammates to finish):
- Set up a GitHub repo with folders /frontend, /backend, /shared, and a root README.md. Push an initial commit.
- Deploy /backend to Render or Railway (free tier), even as a skeleton Express app with just a GET /api/health route returning `{ status: "ok" }` — confirm it's publicly reachable.
- Deploy /frontend to Netlify or Vercel (free tier), even as a placeholder page — confirm it's publicly reachable.
- Set the frontend's `VITE_API_URL` environment variable on the hosting platform to point at the real deployed backend URL, not localhost.

### 2. MIDDLE (as teammates open PRs):
- Review and merge `feature/backend-api`, `feature/frontend-form`, and `feature/frontend-card-qr` into main as each becomes ready — merge incrementally, don't wait for all three at once.
- After each merge, redeploy and manually test the real flow: fill out the form → get redirected to the result page → QR code appears → open the /card/:id link (or scan it) on a phone → the public card loads correctly.
- Fix integration bugs as they surface — mismatched API URLs, CORS errors, or field name drift between frontend and backend are the most likely issues.

### 3. LATE (last 30 minutes):
- Full end-to-end test on an actual phone: create a card, download the image, scan the QR with a phone camera, confirm the public page loads and looks good on mobile.
- Write the root README.md: what the app does, the live demo URL, how to run it locally, and a short paragraph explaining the "living QR code" concept for judges.
- Prepare 2 test cards (one full example, one minimal) so the live demo doesn't rely on typing from scratch on stage.
- Final bug pass: broken states, unclear error messages, and mobile layout on the public card page especially, since that's what judges will see scanned live.

**Push deployment configs and the README to main directly, or to a `feature/deploy-integration` branch merged early, so the whole team can see the live URLs throughout the build.**
