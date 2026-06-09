-- ============================================================
-- OsusuApp Admin System — Database Setup
-- IMPORTANT: Run these in SEPARATE batches in the Supabase SQL Editor.
-- ALTER TYPE and subsequent usage of the new enum value must be
-- in separate transactions (separate batches).
-- ============================================================


-- ============================================================
-- BATCH 1: Add SUPER_ADMIN to enum
-- ============================================================
-- Run this first, by itself. Then run Batch 2.

ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

-- Verify
SELECT enum_range(NULL::role_type);
-- Expected: {MEMBER,ORGANISER,SUPER_ADMIN}


-- ============================================================
-- BATCH 2: Create view + assign role
-- ============================================================
-- Run this AFTER Batch 1 succeeds.

-- 2a. Create platform_stats view (read-only, safe)
CREATE OR REPLACE VIEW public.platform_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles)
    AS total_users,
  (SELECT COUNT(*) FROM public.profiles
   WHERE role = 'ORGANISER')
    AS total_organisers,
  (SELECT COUNT(*) FROM public.groups)
    AS total_groups,
  (SELECT COUNT(*) FROM public.groups
   WHERE status = 'ACTIVE')
    AS active_groups,
  (SELECT COUNT(*) FROM public.groups
   WHERE status = 'FORMING')
    AS forming_groups,
  (SELECT COUNT(*) FROM public.groups
   WHERE status = 'COMPLETED')
    AS completed_groups,
  (SELECT COUNT(*) FROM public.groups
   WHERE status = 'CANCELLED')
    AS cancelled_groups,
  (SELECT COUNT(*) FROM public.contributions)
    AS total_contributions,
  (SELECT COALESCE(SUM(amount), 0)
   FROM public.contributions)
    AS total_amount_contributed,
  (SELECT COUNT(*) FROM public.cycles
   WHERE status = 'PAID_OUT')
    AS total_payouts_completed,
  (SELECT COUNT(*) FROM public.group_members)
    AS total_memberships;

-- 2b. Assign SUPER_ADMIN role to your account
-- REPLACE the email below with YOUR actual email
UPDATE public.profiles
SET role = 'SUPER_ADMIN'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'your-email@example.com'
);

-- Verify it worked
SELECT id, full_name, phone, role, created_at
FROM public.profiles
WHERE role = 'SUPER_ADMIN';
