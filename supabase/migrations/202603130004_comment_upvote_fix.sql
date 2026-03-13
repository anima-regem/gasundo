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

select pg_notify('pgrst', 'reload schema');
