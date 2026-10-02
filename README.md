# EveHealth - Diagnostic Booking System

A MERN stack project for booking diagnostic lab tests. Users can browse tests, pick a centre, book an appointment and simulate payments.

---

## What this project does

- Browse diagnostic tests and lab centres
- Book appointments (login required)
- Simulate payment success or failure
- Webhook endpoint with duplicate payment protection (idempotency)

---

## Tech Stack

- **Backend** — Node.js, Express, MongoDB, Mongoose
- **Frontend** — React, Vite, React Router, Tailwind CSS
- **Auth** — JWT tokens + bcrypt

---

## Folder Structure

```
EVE_Helth/
├── backend/
│   ├── config/db.js
│   ├── models/          (Centre, Test, Booking, Payment, User)
│   ├── controllers/     (auth, centre, test, booking, payment)
│   ├── routes/          (auth, centre, test, booking, payment)
│   ├── middlewares/authMiddleware.js
│   ├── .env
│   └── server.js        ← single entry point
└── frontend/
    └── src/
        ├── pages/       (TestsPage, MyBookings, PaymentSimulator, Login, Signup)
        ├── components/  (Navbar, ProtectedRoute, StatusBadge)
        ├── context/     AuthContext
        └── api/         (client.js, services.js)
```

---

## Setup

**Step 1 — Backend env**

Create `backend/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Step 2 — Install and run backend**

```bash
cd backend
npm install
npm run dev
```

Server starts at `http://localhost:5000`.  
Demo users and sample data (centres, tests) are seeded automatically on first run.

**Step 3 — Install and run frontend**

```bash
cd frontend
npm install
npm run dev
```

Frontend at `http://localhost:5173`.

---

## Demo Accounts

| Role  | Email                 | Password         |
|-------|-----------------------|------------------|
| User  | rahul@example.com     | UserPassword123  |
| Admin | admin@evehealth.com   | AdminPassword123 |

---

## API Routes

```
POST  /api/auth/signup
POST  /api/auth/login
GET   /api/auth/me          ← protected

GET   /api/centres
GET   /api/tests

GET   /api/bookings         ← protected
POST  /api/bookings         ← protected
PATCH /api/bookings/:id/cancel  ← protected

POST  /api/payments/simulate    ← protected
POST  /api/payments/webhook     ← public (gateway endpoint)
GET   /api/payments/:bookingId  ← protected
```

---

## How the Webhook Idempotency Works

Payment gateways sometimes send the same webhook twice (network retry, timeout etc.).

To handle this:
1. Every webhook must include a unique `transactionId`
2. Before processing, we check if that `transactionId` already exists in the database
3. If it does — we return HTTP 200 with `isDuplicate: true` and don't touch anything
4. If it's new — we record the payment and update the booking status
5. MongoDB also has a unique index on `transactionId` as a backup in case two requests hit simultaneously

You can test this on the **Payment Simulator** page after logging in.

---

## Protected Routes

Frontend:
- `/book/:testId` — needs login
- `/my-bookings` — needs login
- `/payment-console` — needs login

If not logged in, you're redirected to `/login` automatically.

Backend:
- Booking and payment routes all require a valid JWT in the `Authorization: Bearer <token>` header
- The webhook endpoint is public so the payment gateway can reach it

---

## Notes

- Booking IDs are human-readable like `BK-1025`, not raw MongoDB ObjectIds
- Sample data (3 centres, 5 tests) seeds on first run if the database is empty
- The payment page lets you pick from your bookings via a dropdown — no manual ID copying
