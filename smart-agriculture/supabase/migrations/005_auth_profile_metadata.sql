-- Keep public.users synchronized with the metadata collected during registration.
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
      coalesce(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.email,
      nullif(NEW.raw_user_meta_data->>'phone', ''),
      case when NEW.raw_user_meta_data->>'role' in ('farmer', 'admin') then NEW.raw_user_meta_data->>'role' else 'farmer' end,
      nullif(NEW.raw_user_meta_data->>'location', ''),
      nullif(NEW.raw_user_meta_data->>'avatar_url', ''),
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
        full_name = coalesce(NEW.raw_user_meta_data->>'full_name', full_name),
        phone = nullif(NEW.raw_user_meta_data->>'phone', ''),
        role = case when NEW.raw_user_meta_data->>'role' in ('farmer', 'admin') then NEW.raw_user_meta_data->>'role' else role end,
        location = nullif(NEW.raw_user_meta_data->>'location', ''),
        profile_image = nullif(NEW.raw_user_meta_data->>'avatar_url', ''),
        updated_at = now()
    where id = NEW.id;
    return NEW;
  end if;
  return null;
end;
$$;

drop trigger if exists auth_user_insert_trigger on auth.users;
create trigger auth_user_insert_trigger
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists auth_user_update_trigger on auth.users;
create trigger auth_user_update_trigger
  after update on auth.users
  for each row execute function public.handle_new_user();