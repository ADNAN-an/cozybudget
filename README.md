# Cozy Budget

A personal budget tracker with dashboard, income, expenses, savings goals, and debts. Built for solo use with a simple email/password login and mobile-friendly UI.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Auth.js (credentials, single user via env vars)
- Prisma + PostgreSQL (Vercel Postgres / Neon)

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and fill in:

   - `DATABASE_URL` — Postgres connection string ([Neon](https://neon.tech) free tier works)
   - `AUTH_SECRET` — random string (`openssl rand -base64 32`)
   - `AUTH_USER_EMAIL` — your login email
   - `AUTH_USER_PASSWORD_HASH_B64` — run (plain bcrypt hashes break in Next.js because of `$`):

     ```bash
     npm run db:hash-password -- YourSecurePassword
     ```

     Copy the `AUTH_USER_PASSWORD_HASH_B64` line into `.env`.

3. **Run migrations**

   ```bash
   npx prisma migrate deploy
   ```

4. **Start dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and sign in.

## Deploy to Vercel

1. Push the repo to GitHub and import in Vercel.
2. Add **Vercel Postgres** (Storage → Create → Postgres). Link `DATABASE_URL` to the project.
3. Set environment variables:
   - `DATABASE_URL` (often auto-set)
   - `AUTH_SECRET`
   - `AUTH_USER_EMAIL`
   - `AUTH_USER_PASSWORD_HASH`
4. Set **Build Command** (optional, default works if `postinstall` runs generate):

   ```bash
   prisma generate && prisma migrate deploy && next build
   ```

5. Deploy and visit `/login`.

## Features

- **Dashboard** — monthly income, expenses, net cash flow, savings contributed, debt paid, 6-month chart, recent activity
- **Income / Expenses** — log entries per month with mobile card lists and desktop tables
- **Savings** — goals with linked contributions
- **Debts** — accounts with linked payments
- **Mobile** — bottom tab navigation, FABs, full-screen sheets on phone

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Create/apply dev migrations |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:hash-password` | Generate bcrypt hash for `.env` |
