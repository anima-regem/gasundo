import { isWithinKochiBounds, STATUS_VALUES } from './constants'

function toNumber(value) {
  const normalized =
    typeof value === 'string' && value.trim() !== ''
      ? Number(value)
      : value

  return Number.isFinite(normalized) ? normalized : null
}

export function validateCreateStatusPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { error: 'Invalid request body.' }
  }

  const restaurantName =
    typeof payload.restaurant_name === 'string'
      ? payload.restaurant_name.trim()
      : ''

  if (!restaurantName) {
    return { error: 'Restaurant name is required.' }
  }

  if (restaurantName.length > 120) {
    return { error: 'Restaurant name must be 120 characters or fewer.' }
  }

  const status = typeof payload.status === 'string' ? payload.status.trim() : ''
  if (!STATUS_VALUES.includes(status)) {
    return { error: 'Status must be open, limited, or closed.' }
  }

  const lat = toNumber(payload.lat)
  const lng = toNumber(payload.lng)

  if (lat === null || lng === null) {
    return { error: 'Latitude and longitude must be valid numbers.' }
  }

  if (!isWithinKochiBounds(lat, lng)) {
    return { error: 'Location is outside the Kochi coverage area.' }
  }

  const rawNote = typeof payload.note === 'string' ? payload.note.trim() : ''
  if (rawNote.length > 200) {
    return { error: 'Note must be 200 characters or fewer.' }
  }

  return {
    data: {
      restaurant_name: restaurantName,
      lat,
      lng,
      status,
      note: rawNote || null,
    },
  }
}

export function validateStatusId(value) {
  const id = Number(value)

  if (!Number.isInteger(id) || id < 1) {
    return { error: 'Invalid status id.' }
  }

  return { data: id }
}
