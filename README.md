# Zara Handmade — E-commerce Starter

A full-stack e-commerce site for a handmade gifts & flower bouquet business.

**Stack:** React + Vite (frontend) · Express + MongoDB (backend) · JWT auth

## Features
- Customer accounts (register/login) with JWT-based sessions
- Product catalog with detail modal
- Shopping cart (add, adjust quantity, remove, checkout)
- Custom bouquet builder (flower type, wrap color, notes)
- Order history for customers
- Admin dashboard: view all orders, mark as completed
- Admin product management: add/delete products

## Project structure
```
zara-handmade-v2/
├── api/server.js          # Express API (also used as Vercel serverless function)
├── package.json           # backend dependencies
├── vercel.json            # deployment routing config
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js          # API base URL + fetch helper
    │   └── components/
    └── package.json
```

## 1. Local setup

### Backend
From the project root:
```
npm install
```
Create a `.env` file in the project root:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
```
Run it:
```
node api/server.js
```
This starts the API at `http://localhost:5000`.

### Frontend
```
cd frontend
npm install
cp .env.example .env
npm run dev
```
This starts the site at `http://localhost:5173`, calling the API at the URL set in `.env`.

## 2. Deploying (Vercel)

1. Push this project to a GitHub repo.
2. Import it in Vercel (vercel.com → Add New → Project).
3. In Vercel → Settings → Environment Variables, add:
   - `MONGO_URI`
   - `JWT_SECRET`
4. Deploy. Vercel will build the frontend and run the API as a serverless function, using `vercel.json`.
5. **Important:** create `frontend/.env.production` with your live API URL before deploying, since this app is served from one Vercel domain, you can simply set:
   ```
   VITE_API_URL=
   ```
   (leave empty — relative `/api/...` calls work automatically when frontend and backend share the same domain).

## Notes
- Passwords are hashed with bcrypt; never store plaintext.
- Admin-only routes (add/delete product, view all orders, mark order complete) are protected by a JWT + role check on the backend — not just hidden in the UI.
- Cart state lives in memory (React state) and is not persisted across refreshes by design; orders are what get saved to the database.
