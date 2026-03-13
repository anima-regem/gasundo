function toCoordinate(value) {
  const numericValue =
    typeof value === 'string' && value.trim() !== ''
      ? Number(value)
      : value

  return Number.isFinite(numericValue) ? numericValue : null
}

export function buildGoogleMapsPlaceUrl(restaurant) {
  const lat = toCoordinate(restaurant?.lat)
  const lng = toCoordinate(restaurant?.lng)

  if (lat === null || lng === null) {
    return null
  }

  const restaurantName =
    typeof restaurant?.name === 'string' ? restaurant.name.trim() : ''
  const query = restaurantName
    ? `${restaurantName} ${lat},${lng}`
    : `${lat},${lng}`

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
