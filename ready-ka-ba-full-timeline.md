# "Ready Ka Ba?" — Full Step-by-Step Guide (Start to Finish)
### 4-person team · 2-hour hackathon · Kiro

---

## Before the clock starts (do this the night before / morning of, not during your 2 hours)

Each person individually:
- [ ] Create a GitHub account if you don't have one, and make sure `git` works on your machine
- [ ] Install Node.js (v18+) and confirm with `node -v`
- [ ] Install/open Kiro
- [ ] Create accounts (free tier, no card needed for most): **Netlify or Vercel** (frontend hosting), **Render or Railway** (backend hosting)
- [ ] Everyone agrees on who owns which role (see below) — don't decide this live, decide it now

**Roles:**
| # | Role | From the spec doc |
|---|---|---|
| 1 | Backend/API | Express + lowdb, 3 endpoints |
| 2 | Frontend: Intake Form | The "/" page |
| 3 | Frontend: Card + QR | "/result/:id" and "/card/:id" pages |
| 4 | Integration/Deploy/QA | Pipelines, merging, final testing, README |

---

## Hour 0:00–0:15 — Kickoff (all 4 together)

1. **Person 4 creates the GitHub repo.**
   ```
   ready-ka-ba/
     frontend/
     backend/
     shared/
     README.md
   ```
   Push an initial commit with just this folder structure and an empty `shared/types.ts`.

2. **Person 4 adds everyone as collaborators**, or the repo is public and everyone forks — whichever your team prefers. Everyone clones it locally:
   ```
   git clone <repo-url>
   cd ready-ka-ba
   ```

3. **Everyone reads the shared contract together out loud** (2-3 minutes) — the data model and API shape from the spec doc. This is the single most important step: if everyone doesn't agree on field names right now, you'll lose 20 minutes to integration bugs later. Confirm out loud:
   - Field names match exactly (`fullName` not `full_name`, `emergencyContacts` not `contacts`)
   - The API base URL convention (env variable, not hardcoded)
   - The QR URL pattern (`/card/:id`)

4. **Each person creates their branch:**
   ```
   git checkout -b feature/backend-api          (Person 1)
   git checkout -b feature/frontend-form         (Person 2)
   git checkout -b feature/frontend-card-qr      (Person 3)
   git checkout -b feature/deploy-integration    (Person 4)
   ```

5. **Everyone opens Kiro**, pastes the **shared contract block** first, then their **individual role prompt** from the spec doc. Let Kiro generate its plan/spec — actually read it before accepting, don't just click through. This read-through is also your "Innovation & Creativity" story for the pitch later, so pay attention to what Kiro proposes.

---

## Hour 0:15–1:15 — Parallel build (everyone works their piece)

This is the biggest block — an hour of heads-down building. Some guardrails to keep it from going sideways:

- **Commit and push every 15-20 minutes**, even if incomplete. Small, frequent commits mean if something breaks, you lose 15 minutes of work, not an hour.
- **Don't wait on each other.** Person 2 builds the form against the *documented* API shape, not the real backend — Person 1's actual server doesn't need to exist yet for Person 2 to make progress. Same for Person 3 building against mock/placeholder data.
- **Person 4 starts deploying skeleton code immediately** (first 20 minutes), not at the end — see their prompt for why. By minute 0:35, you should have a live (mostly empty) frontend URL and backend URL, even before real features exist. This de-risks the scariest part of the judging criteria (Execution & Deployment) early.
- **Quick sync at the 0:45 mark** (5 minutes, all 4): each person says one sentence on where they're at. This surfaces blockers early — e.g., if Person 1's backend field names drifted from the contract, you catch it now, not during integration.

**Checkpoint at 1:15 — each person should have:**
- Person 1: All 3 endpoints working, tested with curl/Postman, pushed
- Person 2: Form renders, validates, and submits (even if pointed at a placeholder/mock API still)
- Person 3: Result and public card pages render with mock data, QR code generates correctly
- Person 4: Both live URLs exist and respond, ready to start merging real code in

---

## Hour 1:15–1:45 — Merge and integrate (Person 4 leads, everyone helps)

1. **Open PRs one at a time**, not all at once — merge backend first (nothing else works without it):
   ```
   git push origin feature/backend-api
   ```
   Open a PR on GitHub, Person 4 (or anyone else) reviews quickly, merge into `main`.

2. **Pull main and merge in frontend branches, one at a time:**
   ```
   git checkout main
   git pull
   git checkout feature/frontend-form
   git merge main
   # resolve any conflicts, push
   ```
   Repeat for `feature/frontend-card-qr`.

3. **After each merge, redeploy and test the real flow end-to-end:**
   - Fill out the form on the live URL → submit → land on result page → QR appears → scan it on an actual phone → public card loads with correct info
   - This is the moment integration bugs show up (CORS errors, mismatched field names, wrong env variable). Fix as a team — whoever wrote the mismatched piece fixes it fastest.

4. **Set environment variables on the hosting platforms** if not already done: frontend's `VITE_API_URL` pointing at the real deployed backend URL (not localhost).

---

## Hour 1:45–1:55 — Final QA pass (all 4, split up the checklist)

Go through this together, each person owns 2-3 items:

- [ ] Create a card with full info (allergies, conditions, medications, 2 contacts) — works end to end
- [ ] Create a card with minimal info (just name, blood type, 1 contact) — no crashes on missing optional fields
- [ ] Downloaded card image looks correct and readable
- [ ] QR code, when scanned with an actual phone camera, opens the correct public card page
- [ ] Public card page is readable and looks good **on mobile** — this is what judges will actually see when they scan it
- [ ] Emergency contact phone numbers are tap-to-call on mobile (if you built that in)
- [ ] Refreshing the result/card pages doesn't break anything
- [ ] No console errors on any page
- [ ] Both live URLs still work (redeploy if anything broke)

**Prepare 2 test cards now** so no one is typing live during the demo — one full example, one minimal.

---

## Hour 1:55–2:00 — Pitch prep (all 4)

Assign: who talks, who drives the laptop/phone for the live demo. Rehearse once, out loud, with a timer.

**~60-second demo flow:**
1. "People carry emergency info on paper or nowhere at all — and if it changes, nobody updates it." (5 sec)
2. Fill the form live (use your prepared test data, don't type from scratch) → submit. (10 sec)
3. Show the QR code and generated card. (5 sec)
4. **Scan it live on a phone** — this is your best moment, actually do it in front of judges, don't just describe it. (10 sec)
5. Public card loads, point at the blood type/allergies being the most visually prominent info. (10 sec)
6. The pitch line that justifies "full stack" and "innovation": *"This isn't just a static card — the QR points to a live page. Update your info once, and it's current everywhere it's been shared, printed, or saved to a lock screen."* (15 sec)
7. Close with the README/live URL on screen. (5 sec)

**Have ready if judges ask questions:**
- "Why full stack instead of just client-side?" → because the live-update feature is the whole point; a purely static QR can't do that
- "What happens if the backend goes down?" → honest answer: the card becomes unreachable, which is a real trade-off worth naming if asked — shows you understand your own architecture

---

## Submission checklist (matches the judging criteria you showed me)

- [ ] **Execution & Deployment (10%)** — live public URL works, no crashes, tested on mobile
- [ ] **Utility & Value (40%)** — can you explain in one sentence who this helps and why? (yes — anyone, for a genuinely common gap)
- [ ] **Innovation & Creativity (25%)** — can you explain the live-QR concept clearly, and how you used Kiro's spec process, not just "AI wrote our code"?
- [ ] **Pitch & Demo Quality (25%)** — rehearsed once, under time, live scan moment included

---

## If you're running behind — cut in this order

1. Skip the "add up to 3 contacts" feature — hardcode support for exactly 1
2. Skip medications field entirely
3. Skip the "download as image" button — the public card page alone is enough for the demo
4. Never cut: the create → QR → scan → live public card flow. That loop *is* the product.
