# OsusuApp — Complete Build Specification (Supabase Edition)
> **For OpenCode:** Build this project from start to finish, in order, one step at a time. Do not skip ahead. Confirm each step works before moving to the next.

---

## Project Summary

Osusu is a full-stack web application that digitises **osusu** — traditional rotating savings groups (ROSCAs) used widely in The Gambia. Members contribute a fixed amount each week or month, and each member receives the full pot in turn.

The app replaces paper ledgers and verbal agreements with a transparent, mobile-friendly platform.

**Live users:**
- **Organiser** — creates the group, records contributions, manages members
- **Member** — joins a group, views their payment history and payout schedule

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS 3 |
| HTTP Client | Axios |
| Backend | Node.js 20 + Express.js 4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| DB Client (server) | `@supabase/supabase-js` (service role) |
| DB Client (frontend) | `@supabase/supabase-js` (anon key) |
| Frontend Host | Vercel |
| Backend Host | Render |
| Version Control | Git + GitHub |

---

## Monorepo Structure

```
osusu/
├── client/                        # React + Vite frontend
│   ├── public/
│   └── src/
│       ├── lib/
│       │   └── supabase.js        # Supabase browser client (anon key)
│       ├── api/
│       │   ├── axios.js           # Axios instance with Supabase token interceptor
│       │   ├── auth.js            # Auth API calls
│       │   ├── groups.js          # Group API calls
│       │   ├── contributions.js   # Contribution API calls
│       │   └── cycles.js          # Cycle API calls
│       ├── components/
│       │   ├── common/
│       │   │   ├── Button.jsx
│       │   │   ├── Input.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Badge.jsx
│       │   │   ├── LoadingSpinner.jsx
│       │   │   └── EmptyState.jsx
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   └── PageWrapper.jsx
│       │   └── groups/
│       │       └── GroupCard.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── CreateGroupPage.jsx
│       │   ├── GroupDetailPage.jsx
│       │   └── ProfilePage.jsx
│       ├── utils/
│       │   └── helpers.js         # formatCurrency, formatDate
│       ├── App.jsx                 # Routes
│       └── main.jsx
│
├── server/
│   └── src/
│       ├── lib/
│       │   └── supabase.js        # Supabase admin client (service role key)
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── groups.routes.js
│       │   ├── contributions.routes.js
│       │   └── cycles.routes.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── groups.controller.js
│       │   ├── contributions.controller.js
│       │   └── cycles.controller.js
│       ├── middleware/
│       │   ├── auth.js              # authenticateToken (uses Supabase)
│       │   └── requireOrganiser.js  # role guard
│       ├── utils/
│       │   └── generatePayoutSchedule.js
│       └── app.js
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## Environment Variables

### `server/.env`
```
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

### `client/.env.local`
```
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_API_URL="http://localhost:5000/api"
```

> **For production:** `CLIENT_URL` = Vercel URL, `VITE_API_URL` = Render URL
>
> **Where to find these values:** Supabase dashboard → Project Settings → API.
> - `SUPABASE_URL` → Project URL
> - `SUPABASE_ANON_KEY` → `anon` / `public` key
> - `SUPABASE_SERVICE_ROLE_KEY` → `service_role` key (keep this secret — never expose in the frontend)

---

## Database Schema

### Overview

Do **not** use a `schema.prisma` file. Instead, run the following SQL directly in the **Supabase SQL Editor** (Dashboard → SQL Editor → New Query).

Run these statements in order.

### Step 1 — Enable extensions
```sql
create extension if not exists "uuid-ossp";
```

### Step 2 — Create enums
```sql
create type role_type       as enum ('MEMBER', 'ORGANISER');
create type frequency_type  as enum ('WEEKLY', 'MONTHLY');
create type group_status    as enum ('FORMING', 'ACTIVE', 'COMPLETED');
create type cycle_status    as enum ('PENDING', 'COLLECTING', 'PAID_OUT');
```

### Step 3 — Create tables

```sql
-- profiles: public extension of auth.users
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  phone      text unique not null,
  role       role_type not null default 'MEMBER',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- groups
create table public.groups (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  description         text,
  contribution_amount float not null,
  frequency           frequency_type not null,
  max_members         int not null,
  start_date          timestamptz not null,
  status              group_status not null default 'FORMING',
  invite_code         text unique not null default gen_random_uuid()::text,
  organiser_id        uuid not null references public.profiles(id),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- group_members
create table public.group_members (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id),
  group_id     uuid not null references public.groups(id) on delete cascade,
  payout_order int not null,
  joined_at    timestamptz default now(),
  unique(user_id, group_id)
);

-- cycles
create table public.cycles (
  id               uuid primary key default uuid_generate_v4(),
  group_id         uuid not null references public.groups(id) on delete cascade,
  cycle_number     int not null,
  due_date         timestamptz not null,
  payout_user_id   uuid not null references public.profiles(id),
  total_expected   float not null,
  total_collected  float not null default 0,
  status           cycle_status not null default 'PENDING',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- contributions
create table public.contributions (
  id        uuid primary key default uuid_generate_v4(),
  group_id  uuid not null references public.groups(id) on delete cascade,
  cycle_id  uuid not null references public.cycles(id) on delete cascade,
  user_id   uuid not null references public.profiles(id),
  amount    float not null,
  paid_at   timestamptz default now(),
  note      text,
  updated_at timestamptz default now(),
  unique(user_id, cycle_id)  -- one contribution per member per cycle
);
```

> **Schema files** in `server/sql/`:
> - `schema.sql` — the full schema (Steps 1–9) for fresh Supabase projects
> - `001_add_daily_frequency.sql` through `003_atomic_total_collected.sql` — sequential migrations for existing projects

### Step 4 — Auto-create profile trigger

When a user signs up via Supabase Auth, this trigger automatically inserts a row into `public.profiles` using the metadata we pass during registration.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Step 5 — Enable Row Level Security (RLS)

```sql
alter table public.profiles      enable row level security;
alter table public.groups        enable row level security;
alter table public.group_members enable row level security;
alter table public.cycles        enable row level security;
alter table public.contributions enable row level security;
```

### Step 6 — RLS Policies

> The **Express backend uses the service role key**, which bypasses RLS entirely. These policies protect direct client access if ever needed and are good practice.

```sql
-- profiles: anyone authenticated can read; only owner can update
create policy "profiles: read all"   on public.profiles for select using (auth.role() = 'authenticated');
create policy "profiles: own update" on public.profiles for update using (auth.uid() = id);

-- groups: authenticated users can read
create policy "groups: read all" on public.groups for select using (auth.role() = 'authenticated');

-- group_members: authenticated users can read
create policy "group_members: read all" on public.group_members for select using (auth.role() = 'authenticated');

-- cycles: authenticated users can read
create policy "cycles: read all" on public.cycles for select using (auth.role() = 'authenticated');

-- contributions: authenticated users can read
create policy "contributions: read all" on public.contributions for select using (auth.role() = 'authenticated');
```

### Step 7 — RPCs (atomic operations)

Replace the old fetch-then-update pattern with atomic SQL functions to prevent race conditions on `total_collected`.

```sql
-- Atomic increment (call after contribution insert)
create or replace function public.increment_total_collected(cycle_id uuid, amount_to_add float)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.cycles
  set total_collected = total_collected + amount_to_add
  where id = cycle_id;
end;
$$;

-- Atomic decrement (call after contribution delete)
create or replace function public.decrement_total_collected(cycle_id uuid, amount_to_remove float)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.cycles
  set total_collected = total_collected - amount_to_remove
  where id = cycle_id;
end;
$$;

-- Shared trigger function for auto-updating updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

### Step 8 — updated_at triggers

```sql
create trigger set_cycles_updated_at
  before update on public.cycles
  for each row execute procedure public.set_updated_at();

create trigger set_contributions_updated_at
  before update on public.contributions
  for each row execute procedure public.set_updated_at();
```

### Step 9 — Performance indexes

```sql
create index if not exists idx_cycles_group_id          on public.cycles (group_id);
create index if not exists idx_cycles_group_status      on public.cycles (group_id, status);
create index if not exists idx_contributions_cycle_id   on public.contributions (cycle_id);
create index if not exists idx_contributions_group_id   on public.contributions (group_id);
create index if not exists idx_group_members_group_id   on public.group_members (group_id);
create index if not exists idx_group_members_user_id    on public.group_members (user_id);
```

---

## Supabase Client Setup

### Server admin client (`server/src/lib/supabase.js`)

The service role key bypasses RLS and is used for all server-side database operations and auth administration.

```js
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

module.exports = supabaseAdmin;
```

### Browser client (`client/src/lib/supabase.js`)

```js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## API Specification

**Base URL:** `/api`
**Auth header:** `Authorization: Bearer <supabase_access_token>` (all protected routes)

### Response envelope
```json
// Success
{ "success": true, "data": { } }

// Error
{ "success": false, "error": { "message": "Description" } }
```

### HTTP status codes
| Code | When |
|---|---|
| 200 | Successful GET or PUT |
| 201 | Successful POST (resource created) |
| 400 | Validation error / bad input |
| 401 | Missing or invalid Supabase token |
| 403 | Valid token but wrong role/not a member |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 500 | Unhandled server error |

---

### Auth Routes `/api/auth`

| Method | Endpoint | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/auth/register` | No | `{ fullName, email, phone, password }` | `{ token, user }` |
| POST | `/auth/login` | No | `{ email, password }` | `{ token, user }` |
| GET | `/auth/me` | Yes | — | `user` object |
| PUT | `/auth/profile` | Yes | `{ fullName?, phone? }` | updated `user` |
| POST | `/auth/change-password` | Yes | `{ newPassword }` | success message |

**register logic:**
1. Validate all fields present
2. Check phone not already in `profiles` → 409 if taken
3. Call `supabaseAdmin.auth.admin.createUser({ email, password, user_metadata: { full_name: fullName, phone }, email_confirm: true })`
4. If Supabase returns an email-already-exists error → 409
5. The `handle_new_user` trigger auto-inserts the `profiles` row
6. Call `supabaseAdmin.auth.signInWithPassword({ email, password })` to get the initial session token
7. Return `{ token: session.access_token, user: safeProfileObject }`

**login logic:**
1. Call `supabaseAdmin.auth.signInWithPassword({ email, password })` → 401 if error
2. Fetch the user's profile from `profiles` table using `data.user.id`
3. Return `{ token: session.access_token, user: safeProfileObject }`

> **Safe profile object** — never return the raw Supabase user object. Return only:
> `{ id, email, fullName, phone, role, createdAt }`

**change-password note:**
Call `supabaseAdmin.auth.admin.updateUserById(req.user.id, { password: newPassword })`
No need to verify old password — that is handled by requiring the user to be authenticated.

---

### Group Routes `/api/groups`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/groups` | Yes | Create a group |
| GET | `/groups/my` | Yes | List all groups the current user belongs to |
| GET | `/groups/:id` | Yes + member | Full group detail |
| POST | `/groups/join` | Yes | Join by invite code |
| POST | `/groups/:id/start` | Yes + organiser | Activate group, generate cycles |
| GET | `/groups/:id/schedule` | Yes + member | Full payout schedule |
| GET | `/groups/:id/members` | Yes + member | Member list with payout order |

**POST /groups logic:**
1. Insert into `groups` with `organiser_id = req.user.id`
2. Update `profiles` row: set `role = 'ORGANISER'` for `req.user.id`
3. Insert into `group_members`: `{ user_id: req.user.id, group_id, payout_order: 1 }`
4. Return the created group including `invite_code`

**POST /groups/join body:** `{ inviteCode }`
1. Find group by `invite_code` → 404 if not found
2. Check `group.status === 'FORMING'` → 400 if not
3. Count current `group_members` for the group; check < `group.max_members` → 400 if full
4. Check user not already in `group_members` for this group → 409 if so
5. Insert `group_members` with `payout_order = currentCount + 1`

**POST /groups/:id/start logic:**
1. Verify organiser (use `requireOrganiser` middleware)
2. Count members in `group_members` — must be ≥ 2, else return 400
3. Fetch all `group_members` rows for the group
4. Call `generatePayoutSchedule(group, members)` → returns array of cycle objects
5. Insert all cycles: `supabaseAdmin.from('cycles').insert(cycles)`
6. Update group: `status = 'ACTIVE'`
7. Return the updated group

**GET /groups/:id** should return:
```json
{
  "group": { ...groupFields },
  "members": [ { ...memberFields, "user": { "id", "fullName", "email", "phone" } } ],
  "currentCycle": { ...cycleFields, "contributions": [...] },
  "organiser": { "id", "fullName" }
}
```

---

### Contribution Routes `/api/contributions`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/contributions` | Yes + organiser | Record a payment |
| GET | `/contributions/group/:groupId` | Yes + member | All contributions for a group |
| GET | `/contributions/my` | Yes | My contribution history across all groups |
| DELETE | `/contributions/:id` | Yes + organiser | Delete an incorrect entry |

**POST /contributions body:** `{ groupId, cycleId, userId, amount, note? }`
1. Verify organiser of the group
2. Verify the `cycleId` belongs to the `groupId`
3. Verify `userId` is a member of the group
4. Check `unique(user_id, cycle_id)` not already taken → 409 if so
5. Insert into `contributions`
6. Update `cycles` row: `total_collected = total_collected + amount`
7. Return the created contribution

---

### Cycle Routes `/api/cycles`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/cycles/group/:groupId` | Yes + member | All cycles with totals and status |
| GET | `/cycles/:id` | Yes + member | Single cycle with its contributions |
| PUT | `/cycles/:id/complete` | Yes + organiser | Mark cycle as `PAID_OUT` |

**GET /cycles/:id** should return the cycle with:
- All its contributions, each including the contributor's `full_name`
- The `payoutUser` profile (from `payout_user_id`)

---

## Middleware

### `src/middleware/auth.js`

```js
const supabaseAdmin = require('../lib/supabase');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, error: { message: 'No token provided' } });
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }

  req.user = user; // user.id is the UUID used in all tables
  next();
}

module.exports = { authenticateToken };
```

### `src/middleware/requireOrganiser.js`

```js
const supabaseAdmin = require('../lib/supabase');

async function requireOrganiser(req, res, next) {
  const groupId = req.params.groupId || req.params.id || req.body.groupId;

  const { data: group, error } = await supabaseAdmin
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error || !group) {
    return res.status(404).json({ success: false, error: { message: 'Group not found' } });
  }
  if (group.organiser_id !== req.user.id) {
    return res.status(403).json({ success: false, error: { message: 'Only the group organiser can do this' } });
  }

  req.group = group;
  next();
}

module.exports = { requireOrganiser };
```

---

## Database Query Patterns

All controllers use `supabaseAdmin` from `../lib/supabase`. Replace all former Prisma calls with these patterns.

### Select one row
```js
const { data, error } = await supabaseAdmin
  .from('groups')
  .select('*')
  .eq('id', groupId)
  .single(); // throws if not found
```

### Select multiple rows
```js
const { data, error } = await supabaseAdmin
  .from('group_members')
  .select('*, profiles(id, full_name, email, phone)')
  .eq('group_id', groupId);
```

### Insert one row
```js
const { data, error } = await supabaseAdmin
  .from('groups')
  .insert({ name, description, contribution_amount, ... })
  .select()
  .single();
```

### Insert many rows
```js
const { error } = await supabaseAdmin
  .from('cycles')
  .insert(cyclesArray); // array of objects
```

### Update a row
```js
const { data, error } = await supabaseAdmin
  .from('groups')
  .update({ status: 'ACTIVE', updated_at: new Date() })
  .eq('id', groupId)
  .select()
  .single();
```

### Delete a row
```js
const { error } = await supabaseAdmin
  .from('contributions')
  .delete()
  .eq('id', contributionId);
```

### Increment a value atomically
```js
// Fetch current value then update — or use a Supabase RPC for production
const { data: cycle } = await supabaseAdmin
  .from('cycles').select('total_collected').eq('id', cycleId).single();

await supabaseAdmin
  .from('cycles')
  .update({ total_collected: cycle.total_collected + amount })
  .eq('id', cycleId);
```

### Error handling pattern
```js
const { data, error } = await supabaseAdmin.from('groups').select('*').eq('id', id).single();
if (error) {
  if (error.code === 'PGRST116') { // "no rows found"
    return res.status(404).json({ success: false, error: { message: 'Group not found' } });
  }
  return res.status(500).json({ success: false, error: { message: 'Database error' } });
}
```

> **Common Supabase error codes:**
> - `PGRST116` — no rows found (equivalent to Prisma's `null` on `findUnique`)
> - `23505` — unique constraint violation (equivalent to Prisma's `P2002`)

---

## Core Utility: `generatePayoutSchedule.js`

Unchanged from the original spec. No database calls — pure function.

```js
// server/src/utils/generatePayoutSchedule.js

function addInterval(date, frequency) {
  const d = new Date(date);
  if (frequency === 'WEEKLY')  d.setDate(d.getDate() + 7);
  if (frequency === 'MONTHLY') d.setMonth(d.getMonth() + 1);
  return d;
}

/**
 * Generates one Cycle record per group member, in payout rotation order.
 * @param {object} group   - Group record from Supabase
 * @param {array}  members - Array of group_member records (each includes user_id)
 * @returns {array} Array of cycle objects ready for supabase.from('cycles').insert()
 */
function generatePayoutSchedule(group, members) {
  const sorted = [...members].sort((a, b) => a.payout_order - b.payout_order);
  const cycles = [];
  let cycleDate = new Date(group.start_date);

  for (let i = 0; i < sorted.length; i++) {
    cycles.push({
      group_id:        group.id,
      cycle_number:    i + 1,
      due_date:        new Date(cycleDate),
      payout_user_id:  sorted[i].user_id,
      total_expected:  group.contribution_amount * sorted.length,
      total_collected: 0,
      status:          i === 0 ? 'COLLECTING' : 'PENDING',
    });
    cycleDate = addInterval(cycleDate, group.frequency);
  }

  return cycles;
}

module.exports = { generatePayoutSchedule };
```

> **Note:** Column names are now `snake_case` to match Supabase/PostgreSQL convention (e.g. `payout_order` not `payoutOrder`, `group_id` not `groupId`).

---

## Express App Setup (`server/src/app.js`)

Unchanged from the original spec:

```js
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');

const authRoutes         = require('./routes/auth.routes');
const groupRoutes        = require('./routes/groups.routes');
const contributionRoutes = require('./routes/contributions.routes');
const cycleRoutes        = require('./routes/cycles.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use('/api/auth',          authRoutes);
app.use('/api/groups',        groupRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/cycles',        cycleRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: { message: 'Internal server error' } });
});

module.exports = app;
```

**Install these packages (server):**
```bash
cd server
npm install express cors helmet morgan @supabase/supabase-js
npm install --save-dev nodemon
```

> **Removed:** `bcrypt`, `jsonwebtoken`, `@prisma/client`, `prisma`

---

## Axios Instance (`client/src/api/axios.js`)

The interceptor now reads the token from the Supabase session instead of `localStorage`.

```js
import axios from 'axios';
import { supabase } from '../lib/supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach the current Supabase access token to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// On 401, sign out and redirect to login
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

---

## AuthContext (`client/src/context/AuthContext.jsx`)

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for an active Supabase session and load the profile
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadProfile();
      } else {
        setLoading(false);
      }
    });

    // Keep in sync with Supabase auth state changes (e.g. token refresh, signOut)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile() {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Called by LoginPage and RegisterPage after a successful API response
  function setLoggedInUser(userData) {
    setUser(userData);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, setLoggedInUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## Login and Register Flow

### `LoginPage.jsx` — login flow

```js
// On form submit:
const res = await api.post('/auth/login', { email, password });
const { token, user } = res.data.data;

// Sync the token with the Supabase client so getSession() works in the Axios interceptor
await supabase.auth.setSession({ access_token: token, refresh_token: token });

setLoggedInUser(user); // from AuthContext
navigate('/dashboard');
```

### `RegisterPage.jsx` — register flow

```js
// On form submit:
const res = await api.post('/auth/register', { fullName, email, phone, password });
const { token, user } = res.data.data;

await supabase.auth.setSession({ access_token: token, refresh_token: token });

setLoggedInUser(user);
navigate('/dashboard');
```

> `supabase.auth.setSession()` persists the access token inside the Supabase client so that `supabase.auth.getSession()` in the Axios interceptor always returns a valid session without a separate `localStorage` call.

---

## Frontend Routes (`client/src/App.jsx`)

Unchanged from the original spec:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LandingPage     from './pages/LandingPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import DashboardPage   from './pages/DashboardPage';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupDetailPage from './pages/GroupDetailPage';
import ProfilePage     from './pages/ProfilePage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/groups/new" element={<ProtectedRoute><CreateGroupPage /></ProtectedRoute>} />
        <Route path="/groups/:id" element={<ProtectedRoute><GroupDetailPage /></ProtectedRoute>} />
        <Route path="/profile"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<div className="p-8 text-center text-gray-500">404 — Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Install these packages (client):**
```bash
cd client
npm install @supabase/supabase-js axios react-router-dom
```

---

## Page Specifications

Unchanged from the original spec. All pages behave exactly as originally described. The only difference is the login/register forms use the flow described in the section above.

### `LandingPage.jsx`
- App name and tagline: *"Your osusu group, organised."*
- Brief 1-paragraph explanation of what the app does
- Two buttons: **Login** and **Register**
- Clean, centred layout. Mobile friendly.

### `LoginPage.jsx`
- Email and password fields
- On submit: `POST /api/auth/login` → sync token with Supabase client → set user in AuthContext → redirect to `/dashboard`
- Show error message below form on failure
- Link to `/register`

### `RegisterPage.jsx`
- Fields: Full Name, Email, Phone (placeholder: +220XXXXXXX), Password, Confirm Password
- Validation: all required; phone `/^\+220[0-9]{7}$/`; password min 8 chars; passwords match
- On success: `POST /api/auth/register` → sync token → redirect to `/dashboard`
- Link to `/login`

### `DashboardPage.jsx`
- Fetch `GET /api/groups/my` on load
- Summary cards: Active Groups, Next Contribution Due, Total Groups
- List of `GroupCard` components
- Empty state + Create/Join buttons
- **Join Group** modal with invite code input

### `GroupCard.jsx`
- Group name, description, frequency badge, contribution amount, member count, status badge, payout position
- Click → navigate to `/groups/:id`

### `CreateGroupPage.jsx`
- Form: Group Name, Description, Contribution Amount, Frequency, Max Members, Start Date
- On success: display invite code with copy button, then redirect to `/groups/:id`

### `GroupDetailPage.jsx`
Three tabs: **Overview**, **Contributions** (ACTIVE only), **Schedule**

See original spec for full tab details — all behaviour is identical.

### `ProfilePage.jsx`
- View/edit name and phone
- Change password section: calls `POST /api/auth/change-password` with `{ newPassword }`

---

## Common Components

Unchanged from the original spec.

### `Button.jsx`
Props: `variant` (`primary` | `secondary` | `danger` | `ghost`), `size` (`sm` | `md` | `lg`), `loading`, `disabled`, `onClick`, `children`, `type`

- `primary`: `bg-green-700 hover:bg-green-800 text-white`
- `secondary`: white with green border
- `danger`: red
- `ghost`: no background, green text
- When `loading=true`: spinner inside button

### `Input.jsx`
Props: `label`, `name`, `type`, `placeholder`, `error`, `value`, `onChange`, `disabled`
- Label above input; red border + error message when `error` is set

### `Modal.jsx`
Props: `isOpen`, `onClose`, `title`, `children`
- Overlay backdrop, centred card, X close button, close on backdrop click or Escape

### `Badge.jsx`
Props: `status`
- `FORMING` → gray | `ACTIVE`/`PAID`/`PAID_OUT` → green | `COLLECTING` → amber | `PENDING`/`UNPAID` → gray | `COMPLETED` → blue

### `LoadingSpinner.jsx`
Props: `fullPage` (bool) — fullPage: centred in viewport; otherwise inline

### `EmptyState.jsx`
Props: `title`, `description`, `action` (JSX button)

### `Navbar.jsx`
- Left: OsusuApp logo/name (links to `/dashboard`)
- Right: user's first name, **Profile** link, **Logout** button
- Mobile: hamburger menu or condensed layout

---

## Utility Helpers (`client/src/utils/helpers.js`)

Unchanged:

```js
export function formatCurrency(amount) {
  return `D ${Number(amount).toLocaleString('en-GM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} GMD`;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatRelativeDate(dateString) {
  const diff = Math.round((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff === 0)  return 'Today';
  if (diff === 1)  return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 0)   return `In ${diff} days`;
  return `${Math.abs(diff)} days ago`;
}
```

---

## Form Validation Rules

| Field | Rule |
|---|---|
| Full Name | Required, 2–80 chars |
| Email | Required, valid email format |
| Phone | Required, must match `/^\+220[0-9]{7}$/` |
| Password | Required, min 8 chars |
| Group Name | Required, 3–60 chars |
| Contribution Amount | Required, number, min 50 |
| Max Members | Required, integer, 2–50 |
| Start Date | Required, must be today or in the future |

---

## Security Requirements

| Requirement | Implementation |
|---|---|
| Passwords | Managed entirely by Supabase Auth — never stored or hashed in application code |
| Supabase keys | In `.env` only — service role key never exposed to the frontend |
| HTTPS | Enforced automatically by Vercel and Render |
| CORS | `cors({ origin: process.env.CLIENT_URL })` |
| `.gitignore` | Include `.env`, `.env.local`, `node_modules` before first commit |
| Input checks | Validate all required fields in controllers, return 400 if missing |
| Role checks | Use `requireOrganiser` middleware on all organiser-only routes |
| RLS | Enabled on all tables; backend bypasses via service role (safe by design) |

---

## Build Order (Follow This Exactly)

### Phase 1 — Foundation
```
1. git init, create /client (Vite + React + Tailwind) and /server (Express)

2. Set up Supabase:
   a. Create free project at supabase.com
   b. Run the SQL schema (Steps 1–6 above) in the Supabase SQL Editor
   c. Confirm all tables exist in the Table Editor
   d. Copy SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY into .env files

3. Build auth backend:
   a. Create server/src/lib/supabase.js (admin client)
   b. Build register, login, GET /auth/me, PUT /auth/profile, POST /auth/change-password

4. Build auth frontend:
   a. Create client/src/lib/supabase.js (browser client)
   b. Build LoginPage, RegisterPage, AuthContext, ProtectedRoute

5. Build Axios instance with Supabase session interceptor

6. Build Navbar and PageWrapper layout components

7. Set up React Router with all routes in App.jsx (stub pages are fine)
```
**Checkpoint:** Can register, login, see /dashboard (even if empty), log out.

---

### Phase 2 — Groups
```
8.  Groups backend: POST /groups, GET /groups/my, GET /groups/:id
9.  Join group backend: POST /groups/join (with all validation)
10. DashboardPage: fetch and display GroupCards, empty state, Join Group modal
11. CreateGroupPage: form, validation, show invite code on success
12. GroupDetailPage: Overview tab only (members list, invite code, Start Group button)
```
**Checkpoint:** Can create a group, share the invite code, have a second user join, see both in the member list.

---

### Phase 3 — Schedule
```
13. Write generatePayoutSchedule.js utility
14. POST /groups/:id/start — validates members, calls utility, creates cycles, sets ACTIVE
15. GET /groups/:id/schedule — returns all cycles with payoutUser populated
16. Schedule tab in GroupDetailPage: table with all cycles, dates, recipients, status badges
17. Start Group button triggers activation and reveals the Schedule tab
```
**Checkpoint:** After clicking Start Group, full payout schedule is visible with correct dates and recipient names.

---

### Phase 4 — Contributions
```
18. Contributions backend: POST, GET by group, GET /my, DELETE
19. requireOrganiser middleware applied to POST and DELETE
20. Contributions tab in GroupDetailPage: cycle dropdown, member checklist
21. Mark Paid button → modal → POST /contributions → refresh cycle data
22. Progress bar updates as members are marked paid
23. Mark Cycle Complete button → PUT /cycles/:id/complete → status updates
```
**Checkpoint:** Organiser can record all members as paid for a cycle, progress bar fills, cycle marked complete.

---

### Phase 5 — Polish & Deploy
```
24. ProfilePage: view and edit name/phone, change password
25. Mobile responsiveness pass on all pages (test at 375px, 768px, 1280px)
26. Loading states on every async operation
27. Error handling: show friendly messages for 400/403/404/409/500 responses
28. Empty states for all list views
29. Deploy: backend to Render (see deployment steps below)
30. Deploy: frontend to Vercel, set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
31. Full smoke test on live URL (see checklist below)
```

---

## Manual Test Checklist (Run Before Submission)

### Auth
- [ ] Register a new account → redirected to dashboard
- [ ] Register with the same email → friendly error shown
- [ ] Register with the same phone → friendly error shown
- [ ] Login with wrong password → friendly error shown
- [ ] Refresh the page while logged in → still logged in
- [ ] Logout → redirected to login; back button doesn't show dashboard

### Groups
- [ ] Create a group → invite code displayed on success
- [ ] Second account joins using invite code → appears in members list
- [ ] Cannot join the same group twice → friendly error
- [ ] Start Group button hidden from non-organisers
- [ ] Start Group with 1 member → blocked with helpful message
- [ ] Start Group with 2+ members → status changes to ACTIVE, schedule appears

### Contributions
- [ ] Organiser records a payment → member row turns green, total collected updates
- [ ] Cannot record same member twice in one cycle → friendly error
- [ ] Non-organiser cannot see the Mark Paid button
- [ ] Mark Cycle Complete → cycle status updates to PAID_OUT

### Schedule
- [ ] Correct number of cycles (one per member)
- [ ] Dates increase correctly per frequency (7 days apart for WEEKLY, 1 month for MONTHLY)
- [ ] Each cycle shows the correct recipient name
- [ ] Completed cycles show PAID_OUT badge

### Mobile
- [ ] All pages usable at 375px width (no horizontal scroll)
- [ ] All buttons tappable, forms work with on-screen keyboard
- [ ] Tables scroll horizontally if needed on small screens

---

## Deployment Steps

### 1. Database — Supabase
Already done during development (SQL schema was run in the SQL Editor).
No migration commands needed on deploy — Supabase manages the database.

### 2. Backend — Render
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect repo
3. Set **Root Directory** to `server`
4. **Build command:** `npm install`
5. **Start command:** `node server.js`
6. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PORT` = `5000`
   - `CLIENT_URL` = your Vercel URL (e.g. `https://osusuapp.vercel.app`)
7. Copy the live Render URL (e.g. `https://osusuapp-api.onrender.com`)

> **No Prisma commands needed** — `npm install` is all that is required.

### 3. Frontend — Vercel
1. Go to [vercel.com/new](https://vercel.com/new) → Import repo
2. Set **Root Directory** to `client`
3. Framework preset: **Vite**
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
5. Deploy — every push to `main` auto-redeploys

### 4. Post-Deploy Smoke Test
```
GET  /api/health                    → { status: "ok" }
POST /api/auth/register             → 201 + token
POST /api/auth/login                → 200 + token
CORS check from Vercel domain       → no errors in browser console
Full user flow on live URL          → register, create, join, start, contribute, schedule
Test on a real mobile phone         → all pages usable
```

---

## npm Scripts to Add

### `server/package.json`
```json
"scripts": {
  "dev":   "nodemon server.js",
  "start": "node server.js"
}
```

### `client/package.json`
```json
"scripts": {
  "dev":     "vite",
  "build":   "vite build",
  "preview": "vite preview"
}
```

---

## .gitignore (root)
```
# Dependencies
node_modules/

# Environment
.env
.env.local
.env.production

# Build output
client/dist/

# OS
.DS_Store
Thumbs.db
```

> **Note:** The `server/prisma/migrations/` entry has been removed — there is no Prisma in this project.

---

*End of OsusuApp MVP Build Specification (Supabase Edition) — University of The Gambia · 2025/2026*
