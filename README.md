# SplitTab

A real-time shared expense tracking app. Create a tab, invite friends with a room code, add expenses, and see who owes what — all synced live.

**Live:** [split-tab.theteecee.dev](https://split-tab.theteecee.dev)

---

## Stack

**Client** (`splittab-client`)

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- TanStack Query v5
- Socket.io client
- Framer Motion
- react-hot-toast

**Server** (`splittab-server`)

- Node.js + Express 5
- Socket.io
- Neon Postgres + Drizzle ORM
- JWT auth with HTTP-only cookies
- Zod validation

**Infrastructure**

- Frontend deployed on Vercel
- Backend deployed on Railway
- Database on Neon

---

## Features

- Register and login with JWT auth
- Create a tab or join one with a 4-character room code
- Add expenses with categories, amounts, and custom splits
- Edit and delete expenses (payer only)
- Real-time balance updates via Socket.io
- Debt simplification algorithm — calculates minimum transfers to settle up
- Leave a tab (auto-deletes if you're the last member)
- Share tab via native share API or clipboard fallback
- Mobile bottom nav, page transitions, loading skeletons, empty states, error boundary

---

## Architecture

**Why Express over serverless?**
Socket.io requires a persistent server connection. Serverless functions spin up and down per request and can't hold a socket open, so a long-running Express server on Railway was the right call.

**Why HTTP-only cookies over localStorage for auth?**
HTTP-only cookies can't be read by JavaScript, which protects against XSS attacks. The tradeoff is needing `sameSite: 'lax'` and a shared root domain between the client and server — which is why both are served under `theteecee.dev`.

**Real-time pattern**
Socket.io rooms map 1:1 to tabs. When a user opens a tab they emit `join-tab`, and the server broadcasts `expense-added`, `expense-updated`, `expense-deleted`, and `member-joined` events to everyone in the room. On the client, TanStack Query invalidates the relevant queries on each socket event so the UI stays in sync.

**Debt simplification**
The settle up screen uses a greedy algorithm — it separates members into debtors and creditors, then iterates through both lists simultaneously to produce the minimum number of transfers needed to zero out all balances.

---

## Local Setup

**Prerequisites:** Node.js 18+, a Neon database

**Server**

```bash
cd splittab-server
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, CLIENT_URL, PORT
npm run db:push
npm run dev
```

**Client**

```bash
cd splittab-client
npm install
cp .env.example .env   # fill in VITE_API_URL
npm run dev
```
