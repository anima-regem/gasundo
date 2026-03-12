export const KOCHI_BOUNDS = {
  minLat: 9.75,
  minLng: 75.95,
  maxLat: 10.15,
  maxLng: 76.55,
}

export const KOCHI_CENTER = [9.9312, 76.2673]
export const DEFAULT_MAP_ZOOM = 13
export const STATUS_VALUES = ['open', 'limited', 'closed']

export function isWithinKochiBounds(lat, lng) {
  return (
    lat >= KOCHI_BOUNDS.minLat &&
    lat <= KOCHI_BOUNDS.maxLat &&
    lng >= KOCHI_BOUNDS.minLng &&
    lng <= KOCHI_BOUNDS.maxLng
  )
}
