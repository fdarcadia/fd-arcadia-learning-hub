create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  account_type text not null check (account_type in ('learning_hub', 'custom_worksheet', 'flashcard_modul')),
  profile_image_url text,
  user_type text check (user_type in ('learning_hub', 'custom_worksheet', 'flashcard_modul')),
  avatar_url text,
  learning_hub_unlocked boolean not null default false,
  custom_worksheet_unlocked boolean not null default false,
  flashcard_modul_unlocked boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.profiles
add column if not exists phone text,
add column if not exists account_type text,
add column if not exists profile_image_url text,
add column if not exists user_type text,
add column if not exists avatar_url text,
add column if not exists learning_hub_unlocked boolean not null default false,
add column if not exists custom_worksheet_unlocked boolean not null default false,
add column if not exists flashcard_modul_unlocked boolean not null default false,
add column if not exists created_at timestamptz not null default now();

alter table public.profiles
alter column account_type drop not null;

create table if not exists public.user_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_hub_access boolean not null default false,
  custom_worksheet_access boolean not null default false,
  flashcard_modul_access boolean not null default false,
  subscription_status text not null default 'inactive',
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.user_access
add column if not exists id uuid default gen_random_uuid(),
add column if not exists user_id uuid references auth.users(id) on delete cascade,
add column if not exists learning_hub_access boolean not null default false,
add column if not exists custom_worksheet_access boolean not null default false,
add column if not exists flashcard_modul_access boolean not null default false,
add column if not exists subscription_status text not null default 'inactive',
add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_access_user_id_key'
      and conrelid = 'public.user_access'::regclass
  ) then
    alter table public.user_access add constraint user_access_user_id_key unique (user_id);
  end if;
end $$;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_access enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Admins can read own admin row" on public.admin_users;
create policy "Admins can read own admin row"
on public.admin_users for select
using (auth.uid() = user_id);

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = user_id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles for select
using (exists (
  select 1
  from public.admin_users
  where admin_users.user_id = auth.uid()
));

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles"
on public.profiles for update
using (exists (
  select 1
  from public.admin_users
  where admin_users.user_id = auth.uid()
))
with check (exists (
  select 1
  from public.admin_users
  where admin_users.user_id = auth.uid()
));

drop policy if exists "Users can read own access" on public.user_access;
create policy "Users can read own access"
on public.user_access for select
using (auth.uid() = user_id);

drop policy if exists "Admins can read all access" on public.user_access;
create policy "Admins can read all access"
on public.user_access for select
using (exists (
  select 1
  from public.admin_users
  where admin_users.user_id = auth.uid()
));

drop policy if exists "Users can insert own access" on public.user_access;
create policy "Users can insert own access"
on public.user_access for insert
with check (auth.uid() = user_id);

drop policy if exists "Admins can insert all access" on public.user_access;
create policy "Admins can insert all access"
on public.user_access for insert
with check (exists (
  select 1
  from public.admin_users
  where admin_users.user_id = auth.uid()
));

drop policy if exists "Users can update own access" on public.user_access;
create policy "Users can update own access"
on public.user_access for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins can update all access" on public.user_access;
create policy "Admins can update all access"
on public.user_access for update
using (exists (
  select 1
  from public.admin_users
  where admin_users.user_id = auth.uid()
))
with check (exists (
  select 1
  from public.admin_users
  where admin_users.user_id = auth.uid()
));

insert into storage.buckets (id, name, public)
values ('profile-pictures', 'profile-pictures', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Users can view profile pictures" on storage.objects;
create policy "Users can view profile pictures"
on storage.objects for select
using (bucket_id in ('profile-pictures', 'avatars'));

drop policy if exists "Users can upload own profile pictures" on storage.objects;
create policy "Users can upload own profile pictures"
on storage.objects for insert
with check (
  bucket_id in ('profile-pictures', 'avatars')
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update own profile pictures" on storage.objects;
create policy "Users can update own profile pictures"
on storage.objects for update
using (
  bucket_id in ('profile-pictures', 'avatars')
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id in ('profile-pictures', 'avatars')
  and auth.uid()::text = (storage.foldername(name))[1]
);
