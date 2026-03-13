import { isUuid } from './uuid.js'

export function validateCreateCommentPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { error: 'Invalid request body.' }
  }

  const statusId =
    typeof payload.status_id === 'string' ? payload.status_id.trim() : ''

  if (!isUuid(statusId)) {
    return { error: 'A valid status thread is required.' }
  }

  const restaurantKey =
    typeof payload.restaurant_key === 'string'
      ? payload.restaurant_key.trim()
      : ''

  if (!restaurantKey || restaurantKey.length > 220) {
    return { error: 'Restaurant key must be 220 characters or fewer.' }
  }

  const content =
    typeof payload.content === 'string' ? payload.content.trim() : ''

  if (!content) {
    return { error: 'Comment text is required.' }
  }

  if (content.length > 500) {
    return { error: 'Comment must be 500 characters or fewer.' }
  }

  return {
    data: {
      status_id: statusId,
      restaurant_key: restaurantKey,
      content,
    },
  }
}

export function validateCommentId(value) {
  const commentId = typeof value === 'string' ? value.trim() : ''

  if (!isUuid(commentId)) {
    return { error: 'Invalid comment id.' }
  }

  return { data: commentId }
}

export function validateCommentThreadStatusId(value) {
  const statusId = typeof value === 'string' ? value.trim() : ''

  if (!isUuid(statusId)) {
    return { error: 'A valid status thread is required.' }
  }

  return { data: statusId }
}

export function validateCommentRestaurantKey(value) {
  const restaurantKey = typeof value === 'string' ? value.trim() : ''

  if (!restaurantKey || restaurantKey.length > 220) {
    return { error: 'A valid restaurant key is required.' }
  }

  return { data: restaurantKey }
}
