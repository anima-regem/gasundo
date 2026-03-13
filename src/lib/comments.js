import 'server-only'

import { buildViewerLabel } from './device-identity.js'
import { requireSupabaseAdmin } from './supabase-admin.js'

const COMMENT_SELECT =
  'id, restaurant_key, status_id, author_identity_hash, author_label, content, upvote_count, created_at, updated_at'

function toCommentRecord(comment, viewerIdentityHash, upvotedCommentIds) {
  if (!comment || typeof comment !== 'object') {
    return null
  }

  const isOwnComment =
    Boolean(viewerIdentityHash) &&
    viewerIdentityHash === comment.author_identity_hash

  return {
    id: comment.id,
    restaurant_key: comment.restaurant_key,
    status_id: comment.status_id,
    content: comment.content,
    upvote_count: Number(comment.upvote_count || 0),
    created_at: comment.created_at || null,
    updated_at: comment.updated_at || null,
    author_label: isOwnComment
      ? 'You'
      : comment.author_label || buildViewerLabel(comment.author_identity_hash),
    is_own_comment: isOwnComment,
    viewer_has_upvoted: upvotedCommentIds.has(comment.id),
  }
}

async function fetchViewerUpvotes(supabase, commentIds, viewerIdentityHash) {
  if (!viewerIdentityHash || commentIds.length === 0) {
    return new Set()
  }

  const { data, error } = await supabase
    .from('restaurant_comment_votes')
    .select('comment_id')
    .eq('voter_identity_hash', viewerIdentityHash)
    .in('comment_id', commentIds)

  if (error) {
    throw error
  }

  return new Set((data || []).map((vote) => vote.comment_id))
}

export async function getStatusThreadById(statusId) {
  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase
    .from('restaurant_status')
    .select('id, restaurant_key, restaurant_name, status, note')
    .eq('id', statusId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function listRestaurantComments(
  restaurantKey,
  viewerIdentityHash = null
) {
  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase
    .from('restaurant_comments')
    .select(COMMENT_SELECT)
    .eq('restaurant_key', restaurantKey)
    .order('upvote_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw error
  }

  const commentRows = data || []
  const upvotedCommentIds = await fetchViewerUpvotes(
    supabase,
    commentRows.map((comment) => comment.id),
    viewerIdentityHash
  )

  return commentRows
    .map((comment) =>
      toCommentRecord(comment, viewerIdentityHash, upvotedCommentIds)
    )
    .filter(Boolean)
}

export async function createStatusComment({
  statusId,
  restaurantKey,
  content,
  authorIdentityHash,
  authorLabel,
}) {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from('restaurant_comments')
    .insert([
      {
        status_id: statusId,
        restaurant_key: restaurantKey,
        author_identity_hash: authorIdentityHash,
        author_label: authorLabel,
        content,
      },
    ])
    .select(COMMENT_SELECT)
    .single()

  if (error) {
    throw error
  }

  return toCommentRecord(data, authorIdentityHash, new Set())
}

export async function upvoteComment(commentId, viewerIdentityHash) {
  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase.rpc('add_restaurant_comment_upvote', {
    target_comment_id: commentId,
    voter_identity_hash: viewerIdentityHash,
  })

  if (error) {
    throw error
  }

  return data
}

export async function getCommentById(commentId, viewerIdentityHash = null) {
  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase
    .from('restaurant_comments')
    .select(COMMENT_SELECT)
    .eq('id', commentId)
    .maybeSingle()

  if (error) {
    throw error
  }

  const upvotedCommentIds = await fetchViewerUpvotes(
    supabase,
    data?.id ? [data.id] : [],
    viewerIdentityHash
  )

  return toCommentRecord(data, viewerIdentityHash, upvotedCommentIds)
}
