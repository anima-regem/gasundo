import HomeClient from './home-client'

import { getRestaurants } from '@/lib/restaurants'
import { getLatestStatuses } from '@/lib/statuses'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [restaurantsResult, statusesResult] = await Promise.allSettled([
    getRestaurants(),
    getLatestStatuses(),
  ])

  const initialRestaurants =
    restaurantsResult.status === 'fulfilled' ? restaurantsResult.value : []
  const initialStatusMap =
    statusesResult.status === 'fulfilled' ? statusesResult.value : {}

  let initialError = null

  if (restaurantsResult.status === 'rejected') {
    console.error('Failed to load restaurants on the server:', restaurantsResult.reason)
    initialError = 'Failed to load restaurants. Please try again.'
  }

  if (statusesResult.status === 'rejected') {
    console.error('Failed to load statuses on the server:', statusesResult.reason)
  }

  return (
    <HomeClient
      initialRestaurants={initialRestaurants}
      initialStatusMap={initialStatusMap}
      initialError={initialError}
    />
  )
}
