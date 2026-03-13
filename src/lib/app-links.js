export function buildRestaurantSharePath(restaurant) {
  const restaurantKey =
    typeof restaurant?.restaurant_key === 'string'
      ? restaurant.restaurant_key.trim()
      : ''

  if (!restaurantKey) {
    return null
  }

  const url = new URL('https://gasundo.app/')
  url.searchParams.set('restaurant', restaurantKey)

  return `${url.pathname}${url.search}`
}

export function buildRestaurantShareUrl(currentUrl, restaurant) {
  const restaurantKey =
    typeof restaurant?.restaurant_key === 'string'
      ? restaurant.restaurant_key.trim()
      : ''

  if (!restaurantKey) {
    return null
  }

  const url = new URL(currentUrl)
  url.searchParams.set('restaurant', restaurantKey)
  url.hash = ''

  return url.toString()
}
