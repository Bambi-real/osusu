# Osusu

> Digitising rotating savings groups (ROSCAs) for The Gambia.

Osusu replaces the paper ledger of traditional *osusu* groups — a rotating savings and credit association common in West Africa. Organisers create a group, set contribution amounts and frequency, members join with an invite code, and contributions are tracked through a fixed payout cycle. No more notebooks, no more disputes.

---

## Features

- **Group Management** — Create, join, and manage rotating savings groups with invite codes
- **Fixed Payout Cycles** — Automatically generated payout schedules with round-robin member rotation
- **Contribution Tracking** — Record and verify member contributions for each cycle
- **Audit Trail** — Every contribution is timestamped with the contributing member's identity
- **Role-Based Access** — Organiser controls group settings; members view cycles and contribute
- **Invite-Only Joining** — Groups joined via secret invite codes generated on creation
- **Real-Time Balances** — Atomic `total_collected` counter per cycle; no race conditions
- **Responsive Design** — Mobile-first Tailwind UI works on phones, tablets, and desktop
- **Authentication** — Email/password auth via Supabase Auth with session management

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS 3, Axios |
| **Backend** | Node.js 20, Express 5 |
| **Database** | Supabase (PostgreSQL), raw SQL, no ORM |
| **Auth** | Supabase Auth (email/password) |
| **UI Components** | react-hot-toast, custom component library |
| **Linting** | ESLint (flat config) |

---

## Project Structure

```
osusu/
├── client/                          # React + Vite frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── api/                     # Axios API modules
│   │   │   ├── axios.js             # Axios instance (Supabase token interceptor)
│   │   │   ├── auth.js              # Auth endpoints
│   │   │   ├── groups.js            # Group endpoints
│   │   │   ├── contributions.js     # Contribution endpoints
│   │   │   └── cycles.js            # Cycle endpoints
│   │   ├── components/
│   │   │   ├── common/              # Button, Input, Modal, Badge, LoadingSpinner, EmptyState
│   │   │   ├── groups/              # GroupCard, ContributionsTab, ScheduleTab
│   │   │   └── layout/              # Navbar, PageWrapper
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state management
│   │   ├── lib/
│   │   │   └── supabase.js          # Supabase browser client (anon key)
│   │   ├── pages/                   # LandingPage, LoginPage, RegisterPage,
│   │   │                            # DashboardPage, CreateGroupPage,
│   │   │                            # GroupDetailPage, ProfilePage,
│   │   │                            # ForgotPasswordPage, ResetPasswordPage
│   │   ├── utils/
│   │   │   └── helpers.js           # formatCurrency, formatDate, formatRelativeDate
│   │   ├── App.jsx                  # React Router setup
│   │   ├── App.css
│   │   ├── index.css                # Tailwind entry
│   │   └── main.jsx                 # React entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   └── package.json
│
├── server/                          # Node + Express backend
│   ├── sql/                         # Database migrations
│   │   ├── schema.sql               # Full database schema
│   │   ├── 001_add_daily_frequency.sql
│   │   ├── 002_add_cancelled_status.sql
│   │   └── 003_atomic_total_collected.sql
│   ├── src/
│   │   ├── controllers/             # auth, groups, contributions, cycles
│   │   ├── lib/
│   │   │   └── supabase.js          # Supabase admin client (service role key)
│   │   ├── middleware/
│   │   │   ├── auth.js              # authenticateToken
│   │   │   └── requireOrganiser.js  # Organiser role guard
│   │   ├── routes/                  # auth, groups, contributions, cycles
│   │   ├── utils/
│   │   │   └── generatePayoutSchedule.js
│   │   └── app.js                   # Express app setup
│   ├── server.js                    # Server entry point
│   ├── .env                         # Environment variables
│   └── package.json
│
├── OsusuApp_Build_Spec_Supabase.md  # Full build specification document
├── AGENTS.md                        # OpenCode agent instructions
└── README.md                        # This file
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Supabase project (free tier works)

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd osusu

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

**Server** (`server/.env`):

```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Client** (`client/.env.local`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000/api
```

### Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Open the SQL Editor
3. Run `server/sql/schema.sql` to create all tables, enums, triggers, functions, and indexes
4. Run the migration files in order (`001`, `002`, `003`) for incremental updates

### Run the App

```bash
# Start the backend (port 5000)
cd server
npm run dev

# In a separate terminal, start the frontend (port 5173)
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Overview

All API routes are prefixed with `/api`. The response envelope uses this format:

```json
{
  "success": true,
  "data": { ... }
}
```

Errors use:

```json
{
  "success": false,
  "error": {
    "message": "Description of what went wrong"
  }
}
```

### Auth Routes (`/api/auth`)

| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create account (fullName, email, phone, password) |
| POST | `/login` | Sign in (email, password) |
| GET | `/me` | Get current user profile |
| PUT | `/profile` | Update profile |
| POST | `/change-password` | Change password (requires currentPassword) |

### Group Routes (`/api/groups`)

| Method | Path | Description |
|---|---|---|
| POST | `/` | Create a new group |
| GET | `/` | List user's groups |
| GET | `/:id` | Get group details with members |
| POST | `/join` | Join a group with invite code |
| POST | `/:id/start` | Start group (organiser only) |
| GET | `/:id/schedule` | Get payout schedule |
| GET | `/:id/members` | List group members |
| DELETE | `/:id` | Cancel/delete group (organiser only, FORMING status only) |

### Contribution Routes (`/api/contributions`)

| Method | Path | Description |
|---|---|---|
| POST | `/` | Record a contribution (groupId, cycleId) |
| GET | `/group/:groupId` | List contributions for a group |
| GET | `/my` | List current user's contributions |
| DELETE | `/:id` | Delete a contribution (own only, within window) |

### Cycle Routes (`/api/cycles`)

| Method | Path | Description |
|---|---|---|
| GET | `/group/:groupId` | List cycles for a group |
| GET | `/:id` | Get cycle details with contributions |

---

## Database Schema

The database uses `snake_case` naming convention with 5 tables:

- **`profiles`** — User profiles (auto-created on signup via trigger, linked to `auth.users`)
- **`groups`** — Savings groups with status lifecycle: `FORMING → ACTIVE → COMPLETED` or `CANCELLED`
- **`group_members`** — Many-to-many membership with payout order
- **`cycles`** — Individual payout cycles within a group
- **`contributions`** — Individual member contributions to a cycle

Status enums: `FORMING`, `ACTIVE`, `COMPLETED`, `CANCELLED`

Frequency enums: `WEEKLY`, `FORTNIGHTLY`, `MONTHLY`, `DAILY`

---

## Key Design Decisions

- **No ORM** — All database interactions use the Supabase JavaScript client directly. Schema is managed via raw SQL in the Supabase SQL Editor.
- **Service Role Key** — The server uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS. All authorization is handled in application code (middleware + controller checks).
- **Token Management** — Auth tokens are NOT stored in `localStorage`. The Axios interceptor reads the session via `supabase.auth.getSession()`. After login/register, the token is synced into the Supabase client using `supabase.auth.setSession()`.
- **Atomic Counters** — `total_collected` per cycle uses PostgreSQL RPC functions to prevent race conditions from concurrent contribution writes.

---

## Deployment

### Supabase (Database)

Schema is created via the Supabase SQL Editor using `server/sql/schema.sql`.

### Backend (Render/Railway/Fly)

```bash
cd server
npm install
npm start
```

Set environment variables in the dashboard:
- `PORT`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Frontend (Vercel/Netlify)

```bash
cd client
npm install
npm run build
```

Set environment variables in the dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (the deployed backend URL)

---

## License

Private — built for The Gambia.
