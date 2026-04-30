# AI Kab — Team Tracking System

A full-stack Next.js dashboard to track the daily output of two team members:

1. **Social Media / Lead Gen person** — LinkedIn posts, LinkedIn outreach (with reply / interested / not interested status), Instagram posts (post/reel/story), Instagram DMs, emails sent, leads provided.
2. **Cold Caller** — cold calls (with outcome: connected / no answer / interested / etc.), Zoom meetings (with status and outcome), follow-ups.

Plus a shared **Leads pipeline**, **Targets**, **Daily Reports**, **Analytics** with charts, and **CSV export** on every page.

---

## Tech Stack

- **Next.js 15** (App Router, RSC) + **React 19** + **TypeScript**
- **Prisma 6** + **SQLite** (zero-setup file database)
- **Tailwind CSS** for styling
- **Recharts** for charts
- **JOSE** for cookie-based JWT auth (no third-party auth needed)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

```bash
npx prisma db push
npm run db:seed
```

This creates the SQLite database file at `prisma/dev.db` and seeds two example employees + default daily targets.

### 3. (Optional) Edit credentials

Open `.env` and change:

```
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
JWT_SECRET="change-this-to-a-long-random-string-please"
```

### 4. Start the dev server

```bash
npm run dev
```

Open <http://localhost:3000> and sign in with the credentials above.

---

## Pages

| Route                          | What it does                                                      |
| ------------------------------ | ----------------------------------------------------------------- |
| `/`                            | Dashboard — KPIs, per-person panels, target progress, trend chart |
| `/social/linkedin-posts`       | Log every LinkedIn post + engagement                              |
| `/social/linkedin-outreach`    | Track every prospect approached on LinkedIn + status              |
| `/social/instagram-posts`      | Posts / reels / stories with metrics                              |
| `/social/instagram-outreach`   | Instagram DM outreach with status                                 |
| `/social/emails`               | Outbound emails with subject + status                             |
| `/caller/cold-calls`           | Every cold call — duration, outcome, follow-up                    |
| `/caller/zoom-meetings`        | Scheduled / completed Zoom meetings + outcomes                    |
| `/leads`                       | Shared leads pipeline (provider → assignee, status, priority)     |
| `/targets`                     | Set per-employee daily/weekly/monthly targets                     |
| `/reports`                     | Daily reports — summary, highlights, blockers, tomorrow plan      |
| `/analytics`                   | Charts: trends, status breakdowns (pie), per-employee bars        |
| `/employees`                   | Add / edit / deactivate employees                                 |
| `/settings`                    | Admin info                                                        |

Every list page supports:

- Date range filter (Today / Yesterday / Last 7 / Last 30 / Week / Month)
- Filter by employee
- Filter by status / outcome where applicable
- **CSV export**
- Add / edit / delete

---

## Useful commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Run production server
npm run db:studio    # Browse the database in Prisma Studio
npm run db:push      # Apply schema changes to the database
npm run db:seed      # Re-run the seed script
```

---

## Adding more team members

Just go to `/employees` → "Add Entry". Pick a role (Social Media or Caller). Then go to `/targets` to set their goals. The dashboard and analytics pick them up automatically.

---

## Production checklist

- [ ] Rotate `ADMIN_PASSWORD` and `JWT_SECRET` in `.env`
- [ ] Move from SQLite to Postgres or MySQL (change `provider` in `prisma/schema.prisma` and `DATABASE_URL`)
- [ ] Set `NODE_ENV=production` and run `npm run build && npm run start`
- [ ] Back up `prisma/dev.db` regularly (or use a hosted DB)
