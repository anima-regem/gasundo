alter table public.restaurant_status
  add column if not exists author_identity_hash text;

create index if not exists restaurant_status_author_identity_hash_idx
  on public.restaurant_status (author_identity_hash);

update public.restaurant_status status_rows
set author_identity_hash = seeded.author_identity_hash
from (
  select distinct on (status_id)
    status_id,
    author_identity_hash
  from public.restaurant_comments
  where author_identity_hash is not null
    and author_identity_hash not like 'legacy:%'
  order by status_id, created_at asc, id asc
) seeded
where status_rows.id = seeded.status_id
  and status_rows.author_identity_hash is null;

create table if not exists public.restaurant_status_confirmations (
  status_id uuid not null references public.restaurant_status(id) on delete cascade,
  confirmer_identity_hash text not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (status_id, confirmer_identity_hash)
);

create index if not exists restaurant_status_confirmations_confirmer_idx
  on public.restaurant_status_confirmations (confirmer_identity_hash, created_at desc);

create or replace function public.add_restaurant_status_confirmation(
  target_status_id uuid,
  confirmer_identity_hash text
)
returns setof public.restaurant_status
language plpgsql
security definer
set search_path = public
as $$
declare
  target_status public.restaurant_status%rowtype;
  updated_row public.restaurant_status%rowtype;
begin
  if target_status_id is null or coalesce(confirmer_identity_hash, '') = '' then
    raise exception 'Status id and confirmer identity are required.';
  end if;

  select *
  into target_status
  from public.restaurant_status
  where id = target_status_id;

  if target_status.id is null then
    return;
  end if;

  if target_status.author_identity_hash is not null
     and target_status.author_identity_hash = confirmer_identity_hash then
    raise exception 'STATUS_SELF_CONFIRMATION_NOT_ALLOWED';
  end if;

  insert into public.restaurant_status_confirmations (
    status_id,
    confirmer_identity_hash
  )
  values (
    target_status_id,
    confirmer_identity_hash
  )
  on conflict do nothing;

  if not found then
    raise exception 'STATUS_ALREADY_CONFIRMED';
  end if;

  update public.restaurant_status
  set confirmations = coalesce(confirmations, 0) + 1,
      updated_at = timezone('utc', now())
  where id = target_status_id
  returning *
  into updated_row;

  if updated_row.id is null then
    return;
  end if;

  perform public.refresh_latest_restaurant_status(updated_row.restaurant_key);

  return query
  select *
  from public.restaurant_status
  where id = updated_row.id;
end;
$$;

select pg_notify('pgrst', 'reload schema');
