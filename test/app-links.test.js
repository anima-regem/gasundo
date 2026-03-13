import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildRestaurantSharePath,
  buildRestaurantShareUrl,
} from '../src/lib/app-links.js'

test('buildRestaurantSharePath creates a restaurant deep link path', () => {
  assert.equal(
    buildRestaurantSharePath({
      restaurant_key: 'new-golden-bakers::9.96188::76.30787',
    }),
    '/?restaurant=new-golden-bakers%3A%3A9.96188%3A%3A76.30787'
  )
})

test('buildRestaurantShareUrl preserves the current app origin', () => {
  assert.equal(
    buildRestaurantShareUrl('https://gasundo.app/?foo=bar#map', {
      restaurant_key: 'new-golden-bakers::9.96188::76.30787',
    }),
    'https://gasundo.app/?foo=bar&restaurant=new-golden-bakers%3A%3A9.96188%3A%3A76.30787'
  )
})

test('buildRestaurantShareUrl returns null without a restaurant key', () => {
  assert.equal(
    buildRestaurantShareUrl('https://gasundo.app/', {
      restaurant_key: '',
    }),
    null
  )
})
