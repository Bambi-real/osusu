# Deployment Guide — OsusuApp

## Prerequisites

- GitHub account with the project pushed
- Supabase project already set up with schema run
- Render account (free tier works)
- Vercel account (free tier works)

---

## Step 1 — Push to GitHub

```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

---

## Step 2 — Deploy Backend to Render

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Configure:
   - **Name:** osusuapp-api
   - **Root Directory:** server
   - **Environment:** Node
   - **Build Command:** npm install
   - **Start Command:** node server.js
   - **Instance Type:** Free

4. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | NODE_ENV | production |
   | SUPABASE_URL | https://xxx.supabase.co |
   | SUPABASE_SERVICE_ROLE_KEY | your-service-role-key |
   | SUPABASE_ANON_KEY | your-anon-key |
   | PORT | 5000 |
   | CLIENT_URL | https://your-app.vercel.app |

5. Click **Create Web Service**
6. Wait for deployment (3-5 minutes)
7. Copy the URL: https://osusuapp-api.onrender.com
8. Test: visit https://osusuapp-api.onrender.com/api/health
   Should return: `{"status":"ok",...}`

> **Note:** Render free tier spins down after 15 minutes
> of inactivity. First request after sleep takes ~30 seconds.
> Upgrade to Starter ($7/mo) for always-on service.

---

## Step 3 — Deploy Frontend to Vercel

1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Configure:
   - **Root Directory:** client
   - **Framework Preset:** Vite
   - **Build Command:** npm run build (auto-detected)
   - **Output Directory:** dist (auto-detected)

4. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | VITE_SUPABASE_URL | https://xxx.supabase.co |
   | VITE_SUPABASE_ANON_KEY | your-anon-public-key |
   | VITE_API_URL | https://osusuapp-api.onrender.com/api |

5. Click **Deploy**
6. Wait for deployment (2-3 minutes)
7. Your app is live at: https://your-app.vercel.app

---

## Step 4 — Update Supabase Configuration

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set Site URL: https://your-app.vercel.app
3. Add Redirect URLs:
   - https://your-app.vercel.app/reset-password
   - https://your-app.vercel.app/
4. Save changes

---

## Step 5 — Update Render CORS

Once you have your Vercel URL, update the CLIENT_URL environment variable on Render:

1. Go to Render → osusuapp-api → Environment
2. Update CLIENT_URL to your exact Vercel URL
3. Render will redeploy automatically

---

## Step 6 — Admin System Setup (Post-Deploy)

> ⚠️ These SQL commands MUST be run in two separate batches in the Supabase SQL Editor.
> `ALTER TYPE ... ADD VALUE` and subsequent usage of the new value cannot be in the same transaction.

### Batch 1 — Add SUPER_ADMIN to enum (run first, by itself)

```sql
ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
SELECT enum_range(NULL::role_type);
-- Expected: {MEMBER,ORGANISER,SUPER_ADMIN}
```

### Batch 2 — Create stats view & assign role (run after Batch 1 succeeds)

```sql
CREATE OR REPLACE VIEW public.platform_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) AS total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'ORGANISER') AS total_organisers,
  (SELECT COUNT(*) FROM public.groups) AS total_groups,
  (SELECT COUNT(*) FROM public.groups WHERE status = 'ACTIVE') AS active_groups,
  (SELECT COUNT(*) FROM public.groups WHERE status = 'FORMING') AS forming_groups,
  (SELECT COUNT(*) FROM public.groups WHERE status = 'COMPLETED') AS completed_groups,
  (SELECT COUNT(*) FROM public.groups WHERE status = 'CANCELLED') AS cancelled_groups,
  (SELECT COUNT(*) FROM public.contributions) AS total_contributions,
  (SELECT COALESCE(SUM(amount), 0) FROM public.contributions) AS total_amount_contributed,
  (SELECT COUNT(*) FROM public.cycles WHERE status = 'PAID_OUT') AS total_payouts_completed,
  (SELECT COUNT(*) FROM public.group_members) AS total_memberships;

-- ⚠️ There is NO API endpoint for this. It must be done manually via SQL.
-- Replace 'your-email@example.com' with YOUR actual email
UPDATE public.profiles
SET role = 'SUPER_ADMIN'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

SELECT id, full_name, phone, role, created_at
FROM public.profiles
WHERE role = 'SUPER_ADMIN';
```

The admin panel is then accessible at `/admin` on the live site.

---

## Step 7 — Post-Deployment Smoke Test

Run through this checklist on the live URL:

- [ ] Visit the app URL — landing page loads
- [ ] Register a new account
- [ ] Login with the new account
- [ ] Create a group
- [ ] Copy the invite code
- [ ] Register a second account and join the group
- [ ] Start the group — schedule generates
- [ ] Record a contribution — total updates
- [ ] Mark a cycle complete
- [ ] Test password reset — check email
- [ ] Test on a real mobile phone

---

## Troubleshooting

**CORS errors in browser console:**
- Verify CLIENT_URL on Render matches your exact Vercel URL (no trailing slash)
- Redeploy Render after changing CLIENT_URL

**API calls failing (network error):**
- Check VITE_API_URL in Vercel env vars
- Verify Render service is running (check /api/health endpoint)
- Check Render logs for errors

**Login/Register not working:**
- Verify SUPABASE_URL and keys are correct on both Render and Vercel
- Check Supabase project is not paused (free tier pauses after 1 week of inactivity)

**Password reset email not arriving:**
- Check Supabase redirect URLs are configured
- Check spam folder
- Verify Site URL in Supabase matches Vercel URL

**Render service sleeping:**
- Free tier spins down after 15min inactivity
- First request after sleep takes ~30 seconds
- Use UptimeRobot (free) to ping /api/health every 14 minutes to keep it awake
