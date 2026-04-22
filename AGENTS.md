# OpenCode Agent Instructions

This file contains crucial context for operating in the OsusuApp codebase. Always follow these constraints.

## Architecture & Monorepo
- **Structure:** Monorepo containing a `client/` (React 18 + Vite + Tailwind CSS 3) and `server/` (Node 20 + Express 4).
- **Primary Spec:** This project is built strictly according to `OsusuApp_Build_Spec_Supabase.md`. Consult it for schema, route logic, and component details before implementing new features.

## Database & Supabase (CRITICAL)
- **No Prisma:** This project does **not** use Prisma or any ORM. Do not create a `schema.prisma` file or run Prisma commands.
- **Schema Management:** Database schema is managed via raw SQL executed manually in the Supabase SQL Editor (documented in the Build Spec). 
- **Server Client (`server/src/lib/supabase.js`):** Uses the `SUPABASE_SERVICE_ROLE_KEY`. This bypasses Row Level Security (RLS) entirely. Use this for all server-side DB operations.
- **Browser Client (`client/src/lib/supabase.js`):** Uses the `VITE_SUPABASE_ANON_KEY`.
- **Querying:** Use the `@supabase/supabase-js` client for all database interactions. Note that column names in the DB use `snake_case` (e.g., `group_id`, `payout_order`).

## Auth & Token Quirks
- **Token Management:** Do not use `localStorage` for tokens.
- **Axios Interceptor:** The frontend Axios instance (`client/src/api/axios.js`) automatically attaches the token by calling `supabase.auth.getSession()`.
- **Login/Register Flow:** After a successful API login/register, you must manually sync the token back into the browser's Supabase client using: `await supabase.auth.setSession({ access_token: token, refresh_token: token })`.

## Development Commands
- **Frontend (`client/`):** `npm run dev` (Vite)
- **Backend (`server/`):** `npm run dev` (Nodemon, runs on port 5000)
