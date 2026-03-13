create table if not exists public.restaurant_comments (
  id uuid primary key default gen_random_uuid(),
  restaurant_key text not null,
  status_id uuid not null references public.restaurant_status(id) on delete cascade,
  author_identity_hash text not null,
  author_label text not null,
  content text not null,
  upvote_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint restaurant_comments_content_length
    check (char_length(trim(content)) between 1 and 500)
);

create index if not exists restaurant_comments_status_id_created_at_idx
  on public.restaurant_comments (status_id, upvote_count desc, created_at desc, id desc);

create index if not exists restaurant_comments_restaurant_key_created_at_idx
  on public.restaurant_comments (restaurant_key, created_at desc, id desc);

create table if not exists public.restaurant_comment_votes (
  comment_id uuid not null references public.restaurant_comments(id) on delete cascade,
  voter_identity_hash text not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (comment_id, voter_identity_hash)
);

create or replace function public.touch_restaurant_comment_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists restaurant_comments_touch_updated_at
on public.restaurant_comments;

create trigger restaurant_comments_touch_updated_at
before update of content
on public.restaurant_comments
for each row
execute function public.touch_restaurant_comment_updated_at();

create or replace function public.add_restaurant_comment_upvote(
  target_comment_id uuid,
  voter_identity_hash text
)
returns table (
  comment_id uuid,
  upvote_count integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_comment_id is null or coalesce(voter_identity_hash, '') = '' then
    raise exception 'Comment id and voter identity are required.';
  end if;

  insert into public.restaurant_comment_votes (comment_id, voter_identity_hash)
  values (target_comment_id, voter_identity_hash)
  on conflict do nothing;

  if found then
    update public.restaurant_comments
    set upvote_count = coalesce(public.restaurant_comments.upvote_count, 0) + 1
    where public.restaurant_comments.id = target_comment_id;
  end if;

  return query
  select
    public.restaurant_comments.id,
    public.restaurant_comments.upvote_count
  from public.restaurant_comments
  where public.restaurant_comments.id = target_comment_id;
end;
$$;

insert into public.restaurant_comments (
  restaurant_key,
  status_id,
  author_identity_hash,
  author_label,
  content,
  upvote_count,
  created_at,
  updated_at
)
select
  restaurant_key,
  id,
  concat('legacy:', id::text),
  'Earlier report',
  note,
  0,
  coalesce(created_at, updated_at, timezone('utc', now())),
  coalesce(updated_at, created_at, timezone('utc', now()))
from public.restaurant_status
where note is not null
  and btrim(note) <> ''
  and restaurant_key is not null
  and not exists (
    select 1
    from public.restaurant_comments existing_comments
    where existing_comments.status_id = public.restaurant_status.id
      and existing_comments.author_identity_hash = concat('legacy:', public.restaurant_status.id::text)
  );

select pg_notify('pgrst', 'reload schema');
