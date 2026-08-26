-- 002_auth_profile_trigger.sql
-- Create a function and trigger to sync auth.users -> public.users

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    insert into public.users (id, full_name, email, phone, role, location, profile_image, created_at, updated_at)
    values (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.email,
      NULLIF(NEW.raw_user_meta_data->>'phone', ''),
      CASE WHEN NEW.raw_user_meta_data->>'role' IN ('farmer', 'admin') THEN NEW.raw_user_meta_data->>'role' ELSE 'farmer' END,
      NULLIF(NEW.raw_user_meta_data->>'location', ''),
      NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
      now(),
      now()
    )
    on conflict (id) do update set
      full_name = excluded.full_name,
      email = excluded.email,
      phone = excluded.phone,
      role = excluded.role,
      location = excluded.location,
      profile_image = excluded.profile_image,
      updated_at = now();
    return NEW;
  elsif (TG_OP = 'UPDATE') then
    update public.users
    set email = NEW.email,
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
        phone = NULLIF(NEW.raw_user_meta_data->>'phone', ''),
        role = CASE WHEN NEW.raw_user_meta_data->>'role' IN ('farmer', 'admin') THEN NEW.raw_user_meta_data->>'role' ELSE role END,
        location = NULLIF(NEW.raw_user_meta_data->>'location', ''),
        profile_image = NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
        updated_at = now()
    where id = NEW.id;
    return NEW;
  end if;
  return NULL;
end;
$$;

-- Create trigger on auth.users
drop trigger if exists auth_user_insert_trigger on auth.users;
create trigger auth_user_insert_trigger
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists auth_user_update_trigger on auth.users;
create trigger auth_user_update_trigger
  after update on auth.users
  for each row execute function public.handle_new_user();
