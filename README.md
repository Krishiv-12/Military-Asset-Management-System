# Military Asset Management System (MAMS)

Full-stack application for managing military assets across bases: purchases, transfers, assignments, expenditures, RBAC, and audit logging.

## Stack

- Frontend: React, React Router, Tailwind CSS, Axios, Recharts
- Backend: Node.js, Express, Prisma, PostgreSQL, JWT (HTTP-only cookies), Zod

## Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

## Setup

```bash
cd military-asset-management
docker compose up -d

cd server
copy .env.example .env   # already created for local development
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

In another terminal:

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Demo accounts

Password for all: `Password123!`

| Email | Role |
| --- | --- |
| admin@mams.mil | Admin |
| commander.alpha@mams.mil | Base Commander (Fort Alpha) |
| logistics.alpha@mams.mil | Logistics Officer (Fort Alpha) |
| commander.bravo@mams.mil | Base Commander (Fort Bravo) |

## Roles

- **Admin**: full access across all bases
- **Base Commander**: all operations for the assigned base
- **Logistics Officer**: purchases and transfers for the assigned base (assignments and expenditures are blocked on the API)

Authorization is enforced on the server. Role and base are loaded from the database for each request.

## Inventory consistency

Purchases, transfers, assignments, and expenditures run inside database transactions. Transfers validate source stock, update both bases, write transfer items, movement ledger rows, and an audit log in the same transaction.

## API

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/dashboard/summary`
- `GET /api/inventory`
- `POST|GET /api/purchases`
- `POST|GET /api/transfers`
- `GET /api/transfers/:id`
- `POST|GET /api/assignments`
- `POST|GET /api/expenditures`
- `GET /api/audit-logs`

## Environment

See `server/.env.example`. Never commit production secrets. Rotate `JWT_SECRET` before any real deployment and set `COOKIE_SECURE=true` with HTTPS.
