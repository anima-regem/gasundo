import { NextResponse } from 'next/server'

import { getCommentById, upvoteComment } from '@/lib/comments'
import { validateCommentId } from '@/lib/comment-validation'
import { getViewerIdentity } from '@/lib/device-identity'
import { getClientIp } from '@/lib/http'
import {
  enforceRateLimit,
  getCommentUpvoteLimiter,
} from '@/lib/ratelimit'

export const runtime = 'nodejs'

function jsonError(message, status, headers) {
  return NextResponse.json({ error: message }, { status, headers })
}

function getVoteLimiterKey(clientIp, viewerIdentityHash) {
  return viewerIdentityHash ? `${viewerIdentityHash}:${clientIp}` : clientIp
}

export async function POST(request, context) {
  const params = await Promise.resolve(context.params)
  const validation = validateCommentId(params?.id)

  if (validation.error) {
    return jsonError(validation.error, 400)
  }

  const viewerIdentity = getViewerIdentity(request.headers)

  if (!viewerIdentity) {
    return jsonError('Refresh the page and try upvoting again.', 400)
  }

  const limiter = getCommentUpvoteLimiter()
  const clientIp = getClientIp(request.headers)

  try {
    const rateLimitResult = await enforceRateLimit(
      limiter,
      getVoteLimiterKey(clientIp, viewerIdentity.identityHash)
    )

    if (!rateLimitResult.success) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      )

      return jsonError(
        'Too many upvotes from this device right now. Please try again later.',
        429,
        { 'Retry-After': String(retryAfterSeconds) }
      )
    }
  } catch (error) {
    console.error('Comment upvote rate limit configuration error:', error)
    return jsonError('Comment voting is temporarily unavailable.', 500)
  }

  try {
    const comment = await getCommentById(
      validation.data,
      viewerIdentity.identityHash
    )

    if (!comment) {
      return jsonError('Comment not found.', 404)
    }

    if (comment.is_own_comment) {
      return jsonError('You cannot upvote your own comment.', 400)
    }

    await upvoteComment(validation.data, viewerIdentity.identityHash)

    return NextResponse.json(
      {
        comment: await getCommentById(
          validation.data,
          viewerIdentity.identityHash
        ),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to upvote comment:', error)
    return jsonError('Could not upvote this comment right now.', 500)
  }
}
