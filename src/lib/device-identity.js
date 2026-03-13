import 'server-only'

import { createHmac } from 'node:crypto'

import { buildRestaurantKey } from './status-key.js'
import { isUuid } from './uuid.js'

const FALLBACK_IDENTITY_SECRET = 'gasundo-device-identity'

export function getViewerDeviceId(headers) {
  const deviceId = headers.get('x-device-id')

  if (!isUuid(deviceId)) {
    return null
  }

  return deviceId.trim()
}

export function hashViewerIdentity(deviceId) {
  if (!isUuid(deviceId)) {
    return null
  }

  const secret =
    process.env.IDENTITY_HASH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    FALLBACK_IDENTITY_SECRET

  return createHmac('sha256', secret).update(deviceId).digest('hex')
}

export function buildViewerLabel(identityHash) {
  const normalized = String(identityHash || '').trim()

  if (!normalized) {
    return 'Local guest'
  }

  return `Local ${normalized.slice(0, 4).toUpperCase()}`
}

export function getViewerIdentity(headers) {
  const deviceId = getViewerDeviceId(headers)

  if (!deviceId) {
    return null
  }

  const identityHash = hashViewerIdentity(deviceId)

  if (!identityHash) {
    return null
  }

  return {
    deviceId,
    identityHash,
    label: buildViewerLabel(identityHash),
  }
}

export function getStatusThreadKey(status) {
  return buildRestaurantKey(status || {})
}
