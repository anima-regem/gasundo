create or replace function public.assign_restaurant_key()
returns trigger
language plpgsql
as $$
begin
  new.restaurant_key = public.build_restaurant_key(
    new.restaurant_name,
    new.lat,
    new.lng
  );

  return new;
end;
$$;

drop trigger if exists restaurant_status_assign_restaurant_key
on public.restaurant_status;

create trigger restaurant_status_assign_restaurant_key
before insert or update of restaurant_name, lat, lng
on public.restaurant_status
for each row
execute function public.assign_restaurant_key();

update public.restaurant_status
set restaurant_key = public.build_restaurant_key(restaurant_name, lat, lng)
where restaurant_key is distinct from public.build_restaurant_key(
  restaurant_name,
  lat,
  lng
);

insert into public.restaurant_latest_status (
  restaurant_key,
  status_id,
  restaurant_name,
  lat,
  lng,
  status,
  note,
  confirmations,
  created_at,
  updated_at
)
select distinct on (restaurant_key)
  restaurant_key,
  id,
  restaurant_name,
  lat,
  lng,
  status,
  note,
  coalesce(confirmations, 0),
  coalesce(created_at, timezone('utc', now())),
  coalesce(updated_at, timezone('utc', now()))
from public.restaurant_status
where restaurant_key is not null
order by restaurant_key, updated_at desc, id desc
on conflict (restaurant_key) do update
set status_id = excluded.status_id,
    restaurant_name = excluded.restaurant_name,
    lat = excluded.lat,
    lng = excluded.lng,
    status = excluded.status,
    note = excluded.note,
    confirmations = excluded.confirmations,
    created_at = excluded.created_at,
    updated_at = excluded.updated_at;

select pg_notify('pgrst', 'reload schema');
