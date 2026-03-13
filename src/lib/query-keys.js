export const CATALOG_QUERY_KEY = ['catalog']
export const STATUS_SNAPSHOT_QUERY_KEY = ['status-snapshot']

export function getStatusCommentsQueryKey(statusId) {
  return ['status-comments', statusId]
}

export function getRestaurantCommentsQueryKey(restaurantKey) {
  return ['restaurant-comments', restaurantKey]
}
