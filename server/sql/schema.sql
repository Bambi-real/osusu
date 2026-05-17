-- Step 1 — Enable extensions
create extension if not exists "uuid-ossp";

-- Step 2 — Create enums
create type role_type       as enum ('MEMBER', 'ORGANISER');
create type frequency_type  as enum ('DAILY', 'WEEKLY', 'MONTHLY');
create type group_status    as enum ('FORMING', 'ACTIVE', 'COMPLETED');
create type cycle_status    as enum ('PENDING', 'COLLECTING', 'PAID_OUT');

-- Step 3 — Create tables
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
  created_at       timestamptz default now()
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
  unique(user_id, cycle_id)  -- one contribution per member per cycle
);

-- Step 4 — Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Unknown User'),
    coalesce(new.raw_user_meta_data ->> 'phone', 'Unknown Phone')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Step 5 — Enable Row Level Security (RLS)
alter table public.profiles      enable row level security;
alter table public.groups        enable row level security;
alter table public.group_members enable row level security;
alter table public.cycles        enable row level security;
alter table public.contributions enable row level security;

-- Step 6 — RLS Policies
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

-- Step 7 — RPCs
create or replace function public.increment_cycle_total(cycle_id uuid, increment_amount float)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.cycles
  set total_collected = total_collected + increment_amount
  where id = cycle_id;
end;
$$;