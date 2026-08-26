-- Replace the invalid membership lookup from the public.users policy.
-- The application profile table is public.users and its ownership key is id.
alter table public.users enable row level security;

drop policy if exists users_select_own on public.users;
create policy users_select_own
  on public.users
  for select
  using (auth.uid() = id);

drop policy if exists users_update_own on public.users;
create policy users_update_own
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);