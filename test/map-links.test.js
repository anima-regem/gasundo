import assert from 'node:assert/strict'
import test from 'node:test'

import { buildGoogleMapsPlaceUrl } from '../src/lib/map-links.js'

test('buildGoogleMapsPlaceUrl includes the restaurant name and coordinates', () => {
  assert.equal(
    buildGoogleMapsPlaceUrl({
      name: 'New Golden Bakers',
      lat: 9.96188,
      lng: 76.30787,
    }),
    'https://www.google.com/maps/search/?api=1&query=9.96188%2C76.30787%20New%20Golden%20Bakers'
  )
})

test('buildGoogleMapsPlaceUrl returns null for missing coordinates', () => {
  assert.equal(
    buildGoogleMapsPlaceUrl({
      name: 'Missing Place',
      lat: null,
      lng: 76.30787,
    }),
    null
  )
})
