-- Migration 003: Atomic total_collected operations, updated_at columns, indexes
-- Run this in the Supabase SQL Editor after migrations 001 and 002.

-- Ensure the old RPC from schema.sql isn't the only one — the app now calls
-- the two functions below instead of fetch-then-update on total_collected.

-- 1. Atomic increment (called on successful contribution insert)
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

-- 2. Atomic decrement (called on contribution delete)
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

-- 3. Shared trigger function for auto-updating updated_at
-- (applied to any table with a timestamptz column named updated_at)
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

-- 4. Add updated_at to cycles (missing from initial schema)
alter table public.cycles
  add column if not exists updated_at timestamptz default now();

create trigger set_cycles_updated_at
  before update on public.cycles
  for each row execute procedure public.set_updated_at();

-- 5. Add updated_at to contributions (missing from initial schema)
alter table public.contributions
  add column if not exists updated_at timestamptz default now();

create trigger set_contributions_updated_at
  before update on public.contributions
  for each row execute procedure public.set_updated_at();

-- 6. Performance indexes for foreign-key columns commonly queried
create index if not exists idx_cycles_group_id          on public.cycles (group_id);
create index if not exists idx_cycles_group_status      on public.cycles (group_id, status);
create index if not exists idx_contributions_cycle_id   on public.contributions (cycle_id);
create index if not exists idx_contributions_group_id   on public.contributions (group_id);
create index if not exists idx_group_members_group_id   on public.group_members (group_id);
create index if not exists idx_group_members_user_id    on public.group_members (user_id);

-- Verify:
-- SELECT proname FROM pg_proc WHERE proname IN ('increment_total_collected', 'decrement_total_collected', 'set_updated_at');
-- Expected: three rows
-- SELECT column_name, is_updatable FROM information_schema.columns WHERE table_name = 'cycles' AND column_name = 'updated_at';
-- Expected: one row, YES
