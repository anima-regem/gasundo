import { getDeviceRequestHeaders } from '@/lib/device-identity-client'

async function parseResponse(response, fallbackMessage) {
  let payload = null

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(payload?.error || fallbackMessage)
  }

  return payload
}

export async function fetchStatusComments({ statusId, restaurantKey }) {
  const params = new URLSearchParams()

  if (restaurantKey) {
    params.set('restaurantKey', restaurantKey)
  }

  if (statusId) {
    params.set('statusId', statusId)
  }

  const response = await fetch(`/api/comments?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      ...getDeviceRequestHeaders(),
    },
    cache: 'no-store',
  })

  const payload = await parseResponse(
    response,
    'Could not load comments right now.'
  )

  return payload.comments || []
}

export async function createComment({ status_id, restaurant_key, content }) {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getDeviceRequestHeaders(),
    },
    body: JSON.stringify({
      status_id,
      restaurant_key,
      content,
    }),
  })

  const payload = await parseResponse(
    response,
    'Could not post your comment right now.'
  )

  return payload.comment
}

export async function upvoteComment(commentId) {
  const response = await fetch(`/api/comments/${commentId}/upvote`, {
    method: 'POST',
    headers: getDeviceRequestHeaders(),
  })

  const payload = await parseResponse(
    response,
    'Could not upvote this comment right now.'
  )

  return payload.comment
}
