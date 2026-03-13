'use client'

import { isUuid } from './uuid.js'

const STORAGE_KEY = 'gasundo-device-id'

let cachedDeviceId = null

function generateFallbackUuid() {
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'

  return template.replace(/[xy]/g, (char) => {
    const randomNibble = Math.floor(Math.random() * 16)
    const nibble = char === 'x' ? randomNibble : (randomNibble & 0x3) | 0x8
    return nibble.toString(16)
  })
}

export function getOrCreateDeviceId() {
  if (cachedDeviceId) {
    return cachedDeviceId
  }

  if (typeof window === 'undefined') {
    return null
  }

  const storedDeviceId = window.localStorage.getItem(STORAGE_KEY)

  if (isUuid(storedDeviceId)) {
    cachedDeviceId = storedDeviceId
    return cachedDeviceId
  }

  const nextDeviceId =
    window.crypto?.randomUUID?.() || generateFallbackUuid()

  window.localStorage.setItem(STORAGE_KEY, nextDeviceId)
  cachedDeviceId = nextDeviceId
  return cachedDeviceId
}

export function getDeviceRequestHeaders() {
  const deviceId = getOrCreateDeviceId()

  if (!deviceId) {
    return {}
  }

  return {
    'X-Device-Id': deviceId,
  }
}
