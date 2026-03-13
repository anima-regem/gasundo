import assert from 'node:assert/strict'
import test from 'node:test'

import {
  validateCreateStatusPayload,
  validateStatusId,
} from '../src/lib/status-validation.js'

test('validateCreateStatusPayload derives a restaurant key when omitted', () => {
  const result = validateCreateStatusPayload({
    restaurant_name: 'Probe Cafe',
    lat: 9.96723,
    lng: 76.24567,
    status: 'open',
    note: 'Fresh batch',
  })

  assert.deepEqual(result, {
    data: {
      restaurant_name: 'Probe Cafe',
      restaurant_key: 'probe-cafe::9.96723::76.24567',
      lat: 9.96723,
      lng: 76.24567,
      status: 'open',
      note: 'Fresh batch',
    },
  })
})

test('validateStatusId accepts UUID identifiers', () => {
  assert.deepEqual(validateStatusId('9f4d3b58-3c2b-4a40-9b2e-8d9c18d4f1a7'), {
    data: '9f4d3b58-3c2b-4a40-9b2e-8d9c18d4f1a7',
  })
})

test('validateStatusId rejects non-UUID identifiers', () => {
  assert.deepEqual(validateStatusId('1947'), {
    error: 'Invalid status id.',
  })
})
