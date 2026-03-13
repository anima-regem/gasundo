import { NextResponse } from 'next/server'

import {
  createStatusComment,
  getStatusThreadById,
  listRestaurantComments,
} from '@/lib/comments'
import {
  getViewerIdentity,
} from '@/lib/device-identity'
import { getClientIp } from '@/lib/http'
import {
  enforceRateLimit,
  getCommentCreateLimiter,
} from '@/lib/ratelimit'
import {
  validateCommentRestaurantKey,
  validateCommentThreadStatusId,
  validateCreateCommentPayload,
} from '@/lib/comment-validation'

export const runtime = 'nodejs'

function jsonError(message, status, headers) {
  return NextResponse.json({ error: message }, { status, headers })
}

function getCommentLimiterKey(clientIp, viewerIdentityHash) {
  return viewerIdentityHash ? `${viewerIdentityHash}:${clientIp}` : clientIp
}

export async function GET(request) {
  const url = new URL(request.url)
  const restaurantKeyValidation = validateCommentRestaurantKey(
    url.searchParams.get('restaurantKey')
  )
  const statusIdValidation = validateCommentThreadStatusId(
    url.searchParams.get('statusId')
  )

  try {
    let restaurantKey = null

    if (!restaurantKeyValidation.error) {
      restaurantKey = restaurantKeyValidation.data
    } else if (!statusIdValidation.error) {
      const statusThread = await getStatusThreadById(statusIdValidation.data)

      if (!statusThread?.restaurant_key) {
        return jsonError('Comment thread not found.', 404)
      }

      restaurantKey = statusThread.restaurant_key
    } else {
      return jsonError('A valid restaurant key or status thread is required.', 400)
    }

    const viewerIdentity = getViewerIdentity(request.headers)
    const comments = await listRestaurantComments(
      restaurantKey,
      viewerIdentity?.identityHash || null
    )

    return NextResponse.json({ comments }, { status: 200 })
  } catch (error) {
    console.error('Failed to load status comments:', error)
    return jsonError('Could not load comments right now.', 500)
  }
}

export async function POST(request) {
  let payload

  try {
    payload = await request.json()
  } catch {
    return jsonError('Invalid JSON payload.', 400)
  }

  const validation = validateCreateCommentPayload(payload)

  if (validation.error) {
    return jsonError(validation.error, 400)
  }

  const viewerIdentity = getViewerIdentity(request.headers)

  if (!viewerIdentity) {
    return jsonError('Refresh the page and try commenting again.', 400)
  }

  const limiter = getCommentCreateLimiter()
  const clientIp = getClientIp(request.headers)

  try {
    const rateLimitResult = await enforceRateLimit(
      limiter,
      getCommentLimiterKey(clientIp, viewerIdentity.identityHash)
    )

    if (!rateLimitResult.success) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      )

      return jsonError(
        'Too many comments from this device right now. Please try again later.',
        429,
        { 'Retry-After': String(retryAfterSeconds) }
      )
    }
  } catch (error) {
    console.error('Comment create rate limit configuration error:', error)
    return jsonError('Comments are temporarily unavailable.', 500)
  }

  try {
    const statusThread = await getStatusThreadById(validation.data.status_id)

    if (!statusThread) {
      return jsonError('Comment thread not found.', 404)
    }

    if (statusThread.restaurant_key !== validation.data.restaurant_key) {
      return jsonError('Comment thread no longer matches this restaurant.', 409)
    }

    const comment = await createStatusComment({
      statusId: validation.data.status_id,
      restaurantKey: validation.data.restaurant_key,
      content: validation.data.content,
      authorIdentityHash: viewerIdentity.identityHash,
      authorLabel: viewerIdentity.label,
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return jsonError('Could not post your comment right now.', 500)
  }
}
