# Business Requirements Document: "Ready Ka Ba?"

| | |
|---|---|
| **Document status** | Source of truth — supersedes prior planning notes |
| **Version** | 1.0 |
| **Date** | 2026-08-14 |
| **Event** | 2-hour hackathon (Kiro) |
| **Team size** | 4 |
| **Owner** | Person 4 — Integration/Deploy/QA (document maintainer) |

Change control: this is a living document for the duration of the build. Any change to field names, endpoints, or routes must be edited here first, then announced to the team — not the other way around. If code and this document disagree, this document wins until the team explicitly updates it.

---

## 1. Purpose

This BRD defines what "Ready Ka Ba?" must do, who is responsible for which part, and the exact technical contract all four workstreams build against in parallel. It exists to eliminate the single biggest risk in a 4-person, 2-hour build: integration failure from undocumented assumptions (mismatched field names, hardcoded URLs, undefined routes). Every requirement below is binding for all contributors.

---

## 2. Problem Statement

People often carry critical emergency medical information (blood type, allergies, conditions, medications, emergency contacts) either on paper, in an easily-outdated photo, or nowhere at all. When that information changes, physical copies (wallet cards, fridge notes, printed stickers) do not update. First responders and bystanders need fast, reliable access to current information at the moment it matters most.

## 3. Objective

Deliver a full-stack web app where a user creates an emergency info profile once and receives a QR code that always resolves to the **current** version of that profile — not a static snapshot. Updating the profile updates every printed, saved, or shared QR code simultaneously, because the QR encodes a link, not the data itself.

## 4. Success Metrics

This build will be judged against four weighted criteria. Every requirement in this document maps to at least one of these:

| Criterion | Weight | What satisfies it |
|---|---|---|
| Execution & Deployment | 10% | Both frontend and backend are live at public URLs, no crashes, verified on mobile |
| Utility & Value | 40% | The product solves a real, common, easily-explained problem |
| Innovation & Creativity | 25% | The "living QR code" concept, plus a clear account of how Kiro's spec process was used |
| Pitch & Demo Quality | 25% | Rehearsed, on-time demo including a live QR scan |

---

## 5. Scope

### 5.1 In scope (must-have for demo)
- Create an emergency profile via a web form
- Generate a QR code linking to a persistent public URL for that profile
- Public, read-only card view optimized for a first responder to scan and read in seconds
- Live backend persisting and serving profile data
- Both frontend and backend deployed to public URLs

### 5.2 Out of scope (explicitly not built in this cycle)
- User accounts, authentication, or login of any kind
- Editing a profile after creation (not required for the demo loop; note this as a known limitation if asked)
- Rate limiting, spam protection, or abuse handling
- Any persistence beyond a flat JSON file (lowdb) — no relational database
- Native mobile app — mobile is served via responsive web only

### 5.3 Cut order if time runs short
If the team falls behind schedule, cut in this exact order — never cut the last item:
1. "Add up to 3 emergency contacts" — hardcode support for exactly 1 contact
2. Medications field — drop entirely
3. "Download card as image" button — the public card page alone is sufficient for the demo
4. **Never cut:** the create → QR → scan → live public card loop. That loop is the entire product.

---

## 6. Stakeholders & Roles

Roles are fixed before the build starts — not decided live.

| # | Role | Responsibility |
|---|---|---|
| 1 | Backend/API | Express + lowdb service, 3+ endpoints per §8 |
| 2 | Frontend: Intake Form | The `/` route — profile creation form |
| 3 | Frontend: Card + QR | The `/result/:id` and `/card/:id` routes |
| 4 | Integration/Deploy/QA | Repo setup, both deployments, merging, end-to-end QA, README, demo readiness |

---

## 7. Functional Requirements — Shared Data Model

All four roles depend on this exact shape. Field names are locked — do not rename (e.g. `fullName`, not `full_name`; `emergencyContacts`, not `contacts`).

```json
{
  "id": "string",
  "fullName": "string",
  "bloodType": "string",
  "allergies": "string[]",
  "conditions": "string[]",
  "medications": "string[]",
  "emergencyContacts": [
    { "name": "string", "relationship": "string", "phone": "string" }
  ],
  "notes": "string",
  "createdAt": "string (ISO timestamp)",
  "updatedAt": "string (ISO timestamp)"
}
```

**Required fields:** `fullName`, `bloodType`, and at least one `emergencyContacts` entry with both `name` and `phone` populated. All other fields are optional.

---

## 8. Functional Requirements — Backend (Person 1)

Node.js + Express, in `/backend`, using **lowdb** (JSON file storage, no external DB).

| Endpoint | Behavior |
|---|---|
| `POST /api/cards` | Accepts a card object minus `id`/timestamps. Validates `fullName`, `bloodType`, and ≥1 emergency contact with name+phone. Generates `id` via nanoid, sets `createdAt`/`updatedAt`, persists, returns the full saved object. |
| `GET /api/cards/:id` | Returns the card. 404 with a clear JSON error message if not found. |
| `PUT /api/cards/:id` | Updates fields on an existing card, bumps `updatedAt`, returns the updated object. 404 if not found. |
| `GET /api/health` | Returns `{ status: "ok" }`. Used to verify deployment. |

**Requirements:**
- CORS enabled for all origins (development).
- Error contract: 400 for bad input, 404 for missing resources, 500 with a generic message for anything unexpected — stack traces must never reach the client.
- Code separated into routes / controllers / storage layer.
- `/backend/README.md` documents local run instructions (install, dev command, port) and every endpoint with example request/response JSON.
- Every endpoint manually verified with curl or Postman before PR.

---

## 9. Functional Requirements — Frontend: Intake Form (Person 2)

React (Vite), in `/frontend`, route `/`.

**Fields:**
- Full name (text, required)
- Blood type (dropdown: A+, A-, B+, B-, AB+, AB-, O+, O-, Unknown; required)
- Allergies (tag input — type + Enter to add, removable chips)
- Conditions (tag input, same pattern)
- Medications (tag input, same pattern)
- 1–3 emergency contacts (name, relationship, phone; "add another" button capped at 3)
- Notes (optional free text)

**Requirements:**
- Client-side validation mirrors backend rules: `fullName` + `bloodType` required, ≥1 emergency contact with name+phone. Inline error messages — no silent empty submissions.
- On submit: `POST` to `${VITE_API_URL}/api/cards`. Base URL **must** come from the `VITE_API_URL` environment variable (default `http://localhost:3001` for local dev) — never hardcoded.
- On success: redirect to `/result/:id` using the returned `id`.
- Loading state (disabled submit + spinner) and error state (API down, validation failure) both handled visibly — no silent failure.
- Visual tone: calm and clean, not flashy — this is a safety tool. Generous whitespace, clear labels, fully mobile-responsive.

---

## 10. Functional Requirements — Frontend: Card + QR (Person 3)

React (Vite), same app, two routes.

**API contract consumed:** `GET /api/cards/:id` → full card object, 404 if missing. Base URL via `VITE_API_URL`.

### 10.1 Result page — `/result/:id`
Shown immediately after profile creation.
- Fetch the card by `id` from the URL.
- Generate a QR code (`qrcode` npm package) encoding `{site origin}/card/{id}`.
- Display the QR code alongside a styled, print/screenshot-quality "ID card" preview.
- "Download as image" button (`html-to-image` or `html2canvas`).
- "Copy link" button copying the public card URL to clipboard.

### 10.2 Public card view — `/card/:id`
What a scanner sees after scanning the QR.
- Fetch by `id`; friendly not-found message if missing.
- Read-only, scan-fast layout: **blood type and allergies are the largest, boldest, most visually prominent elements** — this is the one place an alert/red-amber accent color is earned.
- Emergency contact phone numbers are `tel:` tap-to-call links on mobile.
- Must load fast with zero friction on a phone browser: no login, no setup.

---

## 11. Functional Requirements — Integration / Deploy / QA (Person 4)

### 11.1 Repo structure (set up first, before other work begins)
```
ready-ka-ba/
  frontend/
  backend/
  shared/
  README.md
```

### 11.2 Deployment
- `/backend` → Render or Railway (free tier). Deploy a skeleton (`GET /api/health` only) within the **first 20 minutes**, before waiting on Person 1's full implementation.
- `/frontend` → Netlify or Vercel (free tier). Deploy a placeholder within the same window.
- Set the frontend's `VITE_API_URL` on the hosting platform to the real deployed backend URL — never `localhost` in production.
- Both live URLs must exist and respond by the 0:35 mark of the build.

### 11.3 Merge order
Backend first (nothing else functions without it), then `feature/frontend-form`, then `feature/frontend-card-qr` — merged incrementally as each becomes ready, not all at once. After each merge: redeploy and manually run the full flow (form → submit → result page → QR → scan → public card) to catch integration bugs (CORS, field-name drift, wrong env var) immediately.

### 11.4 Documentation
Root `README.md` covers: what the app does, live demo URL, local run instructions, and a short paragraph explaining the "living QR code" concept for judges.

### 11.5 QA checklist (final pass, all 4 contributors, split ~2–3 items each)
- [ ] Full-info card (allergies, conditions, medications, 2 contacts) works end to end
- [ ] Minimal-info card (name, blood type, 1 contact) — no crashes on missing optional fields
- [ ] Downloaded card image is correct and readable
- [ ] QR code scanned with an actual phone camera opens the correct public card page
- [ ] Public card page is readable and correct **on mobile** (this is what judges see)
- [ ] Emergency contact numbers are tap-to-call on mobile
- [ ] Refreshing result/card pages does not break anything
- [ ] No console errors on any page
- [ ] Both live URLs still functional (redeploy if broken)
- [ ] Two test profiles pre-created (one full, one minimal) for the demo — no live typing on stage

---

## 12. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| Mobile responsiveness | Mandatory on all routes; the public card page is what judges will physically scan and view |
| Performance | Public card view must load with minimal delay on a phone browser — no login/setup friction |
| Error handling | No silent failures anywhere in the stack; no stack traces exposed to clients |
| Config | All API base URLs via environment variable, never hardcoded |
| Security posture | No auth in this cycle — treat all endpoints as intentionally public; do not represent this as production-hardened |

---

## 13. Timeline & Milestones

| Window | Milestone |
|---|---|
| Pre-event | Accounts, tooling, and role assignments finalized individually — not decided live |
| 0:00–0:15 | Repo created, contract read aloud and confirmed by all 4, branches cut, Kiro prompts run |
| 0:15–1:15 | Parallel build; commit/push every 15–20 min; sync checkpoint at 0:45; skeleton deploys live by 0:35 |
| 1:15 checkpoint | Backend: all 3 endpoints tested and pushed. Form: renders/validates/submits against mock or real API. Card+QR: renders with mock data, QR generates. Deploy: both live URLs responding. |
| 1:15–1:45 | Sequential PR merges (backend → form → card/QR), redeploy + full end-to-end test after each |
| 1:45–1:55 | Full QA pass against checklist in §11.5 |
| 1:55–2:00 | Pitch rehearsal, roles assigned (speaker / demo driver) |

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Field-name drift between frontend and backend | Locked data model in §7; any change must be edited here first and announced |
| Integration bugs surface only at merge time | Incremental merges with immediate redeploy + manual E2E test after each (§11.3) |
| Deployment fails late, with no time to fix | Skeleton deploy in first 20 minutes de-risks hosting config early |
| Backend downtime breaks every printed/shared QR | Known, accepted architectural trade-off — see demo Q&A script in §15 |
| Live demo relies on typing under pressure | Two test profiles pre-created ahead of time (§11.5) |

---

## 15. Demo Script (reference)

**~60 seconds:**
1. Problem statement (5s): people carry emergency info on paper or nowhere; it goes stale.
2. Fill the form live using prepared test data → submit (10s).
3. Show QR code and generated card (5s).
4. **Scan it live on a phone** in front of judges (10s).
5. Public card loads; call out blood type/allergies prominence (10s).
6. Value line (15s): *"This isn't a static card — the QR points to a live page. Update your info once, and it's current everywhere it's been shared, printed, or saved to a lock screen."*
7. Close on README/live URL (5s).

**Anticipated questions:**
- *Why full stack instead of client-side only?* — the live-update feature is the whole point; a static QR can't do that.
- *What happens if the backend goes down?* — the card becomes unreachable; a known, named trade-off (§14).

---

## 16. Acceptance Criteria (Definition of Done)

The build is demo-ready only when all of the following hold simultaneously:
1. Backend and frontend are each live at a public URL and both respond correctly.
2. The full loop — create profile → receive QR → scan on a physical phone → public card loads with correct data — works without errors.
3. All items in the §11.5 QA checklist are checked.
4. Two pre-built test profiles exist and are ready to use in the demo.
5. This document's data model (§7) matches the deployed code exactly — no drift.
