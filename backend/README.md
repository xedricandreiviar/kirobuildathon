# Ready Ka Ba — Backend API

Express + lowdb API for the Ready Ka Ba emergency medical info card system.

## Quick start

```bash
npm install
npm run dev     # starts with --watch (auto-restart on changes)
# or
npm start       # production
```

Server runs on `http://localhost:3001` (override with `PORT` env variable).

## Project structure

```
backend/
├── src/
│   ├── index.js              ← Express app entry point
│   ├── db.js                 ← lowdb setup
│   ├── model.js              ← Validation & sanitization
│   ├── routes/api.js         ← Route definitions
│   ├── controllers/cards.js  ← Request handlers
│   └── storage/cards.js      ← Data access layer
├── package.json
└── README.md
```

## API Endpoints

All endpoints are prefixed with `/api`.

---

### `GET /api/health`

Health check for deployment verification.

**Response:**
```json
{ "status": "ok" }
```

---

### `POST /api/cards`

Create a new emergency card.

**Request body:**
```json
{
  "fullName": "Juan dela Cruz",
  "bloodType": "O+",
  "allergies": ["Penicillin", "Shellfish"],
  "conditions": ["Asthma", "Hypertension"],
  "medications": ["Salbutamol inhaler", "Losartan 50mg"],
  "emergencyContacts": [
    { "name": "Maria dela Cruz", "relationship": "Wife", "phone": "+63 912 345 6789" }
  ],
  "notes": "Prefers Makati Med."
}
```

**Required fields:** `fullName`, `bloodType`, `emergencyContacts` (≥1 entry with `name` + `phone`)

**Optional fields:** `allergies`, `conditions`, `medications`, `notes`, `emergencyContacts[].relationship`

**Response:** `201` with the created card (includes `id`, `createdAt`, `updatedAt`)

**Error:** `400` with `{ "errors": [...] }` for invalid input

---

### `GET /api/cards/:id`

Retrieve a card by its ID.

**Response:** `200` with the card object

**Error:** `404` with `{ "error": "Card not found" }`

---

### `PUT /api/cards/:id`

Update fields on an existing card. Only include fields you want to change.

**Request body (partial):**
```json
{
  "allergies": ["Penicillin", "Shellfish", "Ibuprofen"],
  "notes": "Updated info."
}
```

**Response:** `200` with the full updated card (bumps `updatedAt`)

**Error:** `404` if card not found, `400` for invalid input

---

## Data model (shared contract — BRD §7)

Field names are locked across all workstreams:

```json
{
  "id": "string (nanoid, 10 chars)",
  "fullName": "string",
  "bloodType": "string",
  "allergies": ["string"],
  "conditions": ["string"],
  "medications": ["string"],
  "emergencyContacts": [
    { "name": "string", "relationship": "string", "phone": "string" }
  ],
  "notes": "string",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

## Error handling

| Status | Meaning |
|--------|---------|
| 400 | Bad input (validation errors returned in response) |
| 404 | Resource not found |
| 500 | Internal server error (generic message, no stack traces) |

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT`   | `3001`  | Server port |

## Deploy

On Render/Railway:
- Root directory: `backend/`
- Build command: `npm install`
- Start command: `npm start`
