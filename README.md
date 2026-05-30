# BigBrew Milk Tea Ordering System

Web-based ordering for a milk tea shop: customer kiosk, kitchen order board, and admin back office. Data is stored in **Supabase (PostgreSQL)**.

## URLs (local dev)

| Surface | URL | Who |
|--------|-----|-----|
| Customer ordering | http://localhost:3000/ | Public (no login) |
| Kitchen | http://localhost:3000/kitchen | Staff login |
| Admin | http://localhost:3000/admin | Admin login |

Kitchen staff are redirected away from the customer menu when signed in. Customer navbar does not link to kitchen or admin.

## Features

- **Customer** — Browse categories, customize drinks (size, sugar, quantity), checkout with name/phone/notes
- **Kitchen** — Live order board, status updates, auto-refresh, **Stock** panel to mark drinks sold out
- **Admin** — Dashboard, analytics, menu & categories, orders export (CSV/PDF), settings (admins, kitchen staff, password)
- **Stock** — Per-drink `available` flag; sold-out items hidden from customers and rejected on order submit
- **Security** — JWT auth, bcrypt passwords, server-side price validation

## Tech stack

- **Backend:** Node.js, Express, `pg`, JWT, bcryptjs
- **Frontend:** React 18, Tailwind CSS, Webpack, Recharts
- **Database:** Supabase PostgreSQL

## Project structure

```
milkteaProject/
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── supabase/schema.sql      # Run once in Supabase SQL editor
│   ├── scripts/
│   │   ├── import-json-to-supabase.js
│   │   └── reset-admin-password.js
│   ├── src/
│   │   ├── db/                  # pool, repositories, initSchema
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── admin/
│   │   └── routes/
│   └── data/                    # Legacy JSON backup (optional import source)
└── frontend/
    ├── src/
    │   ├── pages/               # OrderMenu, OrderPreparation, StaffLogin
    │   ├── admin/
    │   ├── components/
    │   └── context/
    └── public/
```

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with PostgreSQL

## Setup

### 1. Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run `backend/supabase/schema.sql`.
3. In **Project Settings → Database**, copy the **Connection string** (URI, pooler mode is fine).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=use-a-long-random-string-in-production
DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@....supabase.com:6543/postgres
```

Optional (scripts / tooling only):

```env
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Start the API (creates default admin/staff if tables are empty):

```bash
npm start
```

**One-time import** from legacy JSON in `backend/data/` (if you have it):

```bash
npm run db:import
```

**Reset a password** (admin or kitchen user):

```bash
npm run admin:reset-password
# Follow prompts; defaults: admin / admin123, kitchen / kitchen123
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000. The dev server proxies `/api` and `/health` to port **5000**.

### Production build

```bash
cd frontend
npm run build
# Output: frontend/dist/
# Serve dist/ and point API to your backend URL (see frontend/src/api.js)
```

## Default accounts

Created on first backend start if no users exist (change after setup):

| Role | Username | Password | Login URL |
|------|----------|----------|-----------|
| Admin | `admin` | `admin123` | `/admin` |
| Kitchen staff | `kitchen` | `kitchen123` | `/kitchen` |

## Authentication

- Login returns a JWT (24h). The frontend stores it in `localStorage` and sends `Authorization: Bearer <token>`.
- **Admin** — `POST /api/admin/login`
- **Kitchen** — `POST /api/staff/login`
- Menu mutations, order management (except public create), and `GET /api/menu?all=true` require a valid token.

## API overview

| Public | Protected |
|--------|-----------|
| `GET /api/menu` (available drinks only) | `GET /api/menu?all=true` (admin/staff) |
| `GET /api/categories` | `POST/PUT/DELETE` menu & categories |
| `POST /api/orders` | Order list, status updates |
| `GET /health` | Admin & staff user management |

**Stock:** `PUT /api/menu/:id` with body `{ "available": true \| false }` — admin always; kitchen staff when only `available` is sent.

## Order status flow

```
pending → preparing → ready → completed
              ↓
         cancelled
```

## Troubleshooting

- **Backend won’t start** — Check `DATABASE_URL` in `backend/.env` and that `schema.sql` was applied.
- **Stock toggle 404** — Restart the backend after pulling changes (`npm start` in `backend/`).
- **CORS / API errors in dev** — Run frontend on port 3000 and backend on 5000 so the webpack proxy works.

## License

Private / project use — adjust as needed for your shop.
