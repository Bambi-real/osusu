# Troubleshooting Guide

## Overview

Common issues encountered when developing, deploying, or using the Osusu application, along with their solutions.

---

## Development Issues

### Backend Won't Start

#### Symptom: `Error: listen EADDRINUSE :::5000`

**Cause:** Another process is already using port 5000.

**Solution:**
```bash
# Find the process using port 5000
lsof -i :5000

# Kill it (replace PID with the actual process ID)
kill -9 <PID>

# Or use a different port in server/.env
PORT=5001
```

#### Symptom: `Error: Cannot find module 'express'`

**Cause:** Dependencies not installed.

**Solution:**
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

#### Symptom: `TypeError: Cannot destructure property 'data' of ...`

**Cause:** Supabase query returned unexpected shape (often due to RLS blocking the service role).

**Solution:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct in `server/.env`
2. Check that `schema.sql` was run successfully
3. Verify the table exists in Supabase Dashboard → Table Editor

#### Symptom: `Error: relation "profiles" does not exist`

**Cause:** Schema has not been applied to the Supabase project.

**Solution:**
1. Go to Supabase Dashboard → SQL Editor
2. Open `server/sql/schema.sql`
3. Run the entire file
4. Verify all tables appear in Table Editor

---

### Frontend Won't Start

#### Symptom: `Error: The following dependencies are imported but could not be resolved`

**Cause:** Missing dependencies.

**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

#### Symptom: Blank white page, no errors in console

**Cause:** Usually a missing environment variable or an import error that Vite silently swallows.

**Solution:**
1. Check `client/.env.local` exists and has all required variables
2. Check browser DevTools → Console for any warnings
3. Check browser DevTools → Network tab to see if API calls are failing
4. Try `npm run build` to see if there are build-time errors

#### Symptom: `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html"`

**Cause:** Vite dev server is running but returning HTML for a JS file request. Usually means a page refresh on a client-side route.

**Solution:** This is expected behaviour during development with SPA routing. It happens when you refresh a page like `/dashboard` and the dev server returns `index.html`. The React Router should handle it. If it persists, check that your `vite.config.js` has the correct settings.

---

## Authentication Issues

### Symptom: "Invalid email or password" for valid credentials

**Possible causes:**
1. User was created but email confirmation is still pending
2. Supabase Auth has issues with the project

**Solutions:**
1. Check Supabase Dashboard → Authentication → Users to verify the user exists
2. Ensure email confirmation is disabled (or verify the email)
3. Reset the password via the forgot password flow

### Symptom: Session expires immediately or randomly

**Cause:** Usually a mismatch between the token stored in the browser and what Supabase expects.

**Solutions:**
1. Clear browser localStorage and re-login
2. Check that `supabase.auth.setSession()` is called after login/register
3. Verify the Supabase project URL and anon key are correct

### Symptom: "No token provided" on protected routes

**Cause:** The Axios interceptor is failing to get the session.

**Solutions:**
1. Check `client/src/lib/supabase.js` — verify the Supabase client is configured correctly
2. Check `client/src/api/axios.js` — verify the request interceptor is working
3. Open DevTools → Network → check that the `Authorization` header is present
4. If not, the `supabase.auth.getSession()` call in the interceptor is returning null

### Symptom: "Invalid or expired token"

**Cause:** The token attached to the request is not valid according to Supabase.

**Solutions:**
1. Clear localStorage and re-login
2. Check server's `SUPABASE_SERVICE_ROLE_KEY` is correct
3. The token may have expired (Supabase access tokens last 1 hour)

---

## Group Issues

### Symptom: "Invalid invite code"

**Possible causes:**
1. The invite code was entered incorrectly
2. The group was deleted
3. The group was started and the invite code is no longer valid

**Solutions:**
1. Double-check the invite code for typos
2. Ask the organiser to verify the group still exists
3. Codes are UUIDs — they should be copied, not typed

### Symptom: "Group is not currently accepting members"

**Cause:** The group status is not `FORMING` (it may be `ACTIVE`, `COMPLETED`, or `CANCELLED`).

**Solution:** Only groups with `FORMING` status can accept new members. The organiser must create a new group if the current one has already started.

### Symptom: "Group must have at least 2 members to start"

**Cause:** The organiser tried to start a group with only themselves as a member.

**Solution:** Share the invite code with at least one other person so they can join before starting.

### Symptom: "Only the group organiser can do this"

**Cause:** A non-organiser member tried to perform an organiser-only action (start group, record contribution, delete group, complete cycle).

**Solution:** Only the user who created the group can perform these actions. The organiser is determined by `groups.organiser_id`.

---

## Contribution Issues

### Symptom: "This member has already contributed to this cycle"

**Cause:** There is already a contribution for this `(user_id, cycle_id)` pair.

**Solution:** The organiser can delete the existing contribution first, then re-record it. Each member can only contribute once per cycle.

### Symptom: "Contribution amount must be exactly X"

**Cause:** The `amount` field in the contribution does not match the group's `contribution_amount`.

**Solution:** Contributions must be for the exact amount set when the group was created. Partial contributions are not supported.

### Symptom: Progress bar is not updating

**Possible causes:**
1. The page was not refreshed after recording a contribution
2. There's a cache issue

**Solutions:**
1. Refresh the page
2. Check that the contribution was actually saved (check the API response)
3. Verify `total_collected` increased in the database

---

## Deployment Issues

### Symptom: CORS errors in browser console

**Cause:** The server's `CLIENT_URL` does not match the actual frontend URL.

**Solution:**
1. Verify the `CLIENT_URL` environment variable in the deployed server (Render):
   - It should match exactly the frontend URL (e.g., `https://osusu.vercel.app`)
   - No trailing slash
2. Re-deploy the server after updating the variable

### Symptom: 500 errors on API calls in production

**Possible causes:**
1. Missing environment variables on the deployed server
2. Schema not applied to the production Supabase database

**Solutions:**
1. Check Render logs for the actual error
2. Verify all environment variables are set in Render Dashboard
3. Run `schema.sql` in the Supabase SQL Editor

### Symptom: Blank page on Vercel

**Possible causes:**
1. Build failed but Vercel deployed the old build
2. Environment variables are missing or incorrect

**Solutions:**
1. Check Vercel build logs
2. Verify `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL` are set in Vercel Dashboard
3. Ensure `VITE_API_URL` points to the deployed backend (e.g., `https://api.onrender.com/api`)

### Symptom: "Mixed Content" warning in production

**Cause:** Frontend is served over HTTPS but makes HTTP requests to the backend.

**Solution:** Ensure `VITE_API_URL` uses `https://` in the production environment variables on Vercel.

---

## Database Issues

### Symptom: Schema migration fails

**Possible causes:**
1. Migration attempts to add an enum value that already exists
2. Migration references a column that doesn't exist

**Solutions:**
1. Use `ALTER TYPE ... ADD VALUE IF NOT EXISTS` for enum additions
2. Check the target schema state before running migrations
3. Run migrations in order

### Symptom: Slow queries

**Possible causes:**
1. Missing indexes on frequently queried columns
2. Large result sets being transferred

**Solutions:**
1. Check Supabase Dashboard → Database → Query Performance
2. Add indexes for slow queries (see `003_atomic_total_collected.sql` for examples)
3. Ensure queries filter by indexed columns

### Symptom: "Could not find the 'public' schema or the requested table"

**Cause:** The Supabase project may have been reset or the schema was not run.

**Solution:**
1. Go to Supabase Dashboard → SQL Editor
2. Run `server/sql/schema.sql`
3. Run any migration files

---

## Quick Reference: Common Error Messages

| Error Message | Likely Cause | Quick Fix |
|---|---|---|
| `ECONNREFUSED` | Supabase not reachable | Check SUPABASE_URL |
| `PGRST116` | Resource not found | Check ID is correct |
| `23505` | Duplicate entry | Already exists |
| `42P01` | Table not found | Run schema.sql |
| `22P02` | Invalid UUID | Check ID format |
| `CORS Missing Allow Origin` | CLIENT_URL mismatch | Update CLIENT_URL |
| `Module not found` | Missing dependency | npm install |
| `EADDRINUSE` | Port in use | Kill process or change port |
| `ETIMEDOUT` | Database connection timeout | Check network/credentials |
| `403` from API | Not authorised | Check organiser status |

---

## Getting Help

If you encounter an issue not documented here:

1. **Check server logs:** `server/` terminal output (or Render Dashboard → Logs)
2. **Check browser logs:** DevTools → Console and Network tabs
3. **Check Supabase logs:** Dashboard → Database → Query Performance
4. **Check recent changes:** `git log --oneline -10` for recent commits
5. **Isolate the issue:** Try to reproduce with a minimal test case
