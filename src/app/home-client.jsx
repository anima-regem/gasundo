'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'

import FilterBar from '@/components/FilterBar'
import RestaurantSheet from '@/components/RestaurantSheet'
import { buildStatusKey } from '@/lib/status-key'
import { confirmStatus, updateStatus } from '@/services/statusService'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="map-container bg-[#1a1a2e]" />,
})

export default function HomeClient({
  initialRestaurants,
  initialStatusMap,
  initialError,
}) {
  const [restaurants] = useState(initialRestaurants)
  const [statusMap, setStatusMap] = useState(initialStatusMap)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [error, setError] = useState(initialError)
  const [filter, setFilter] = useState({ search: '', statusFilter: 'all' })

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      if (filter.search) {
        const query = filter.search.toLowerCase()
        if (!restaurant.name.toLowerCase().includes(query)) {
          return false
        }
      }

      if (filter.statusFilter !== 'all') {
        const key = buildStatusKey(restaurant.lat, restaurant.lng)
        const status = statusMap[key]?.status || 'unknown'

        if (status !== filter.statusFilter) {
          return false
        }
      }

      return true
    })
  }, [restaurants, statusMap, filter])

  const handleStatusUpdate = async (updateData) => {
    const result = await updateStatus(updateData)
    const key = buildStatusKey(result.lat, result.lng)

    setStatusMap((previous) => ({
      ...previous,
      [key]: result,
    }))
    setError(null)

    return result
  }

  const handleConfirm = async (statusId) => {
    const result = await confirmStatus(statusId)
    const key = buildStatusKey(result.lat, result.lng)

    setStatusMap((previous) => ({
      ...previous,
      [key]: result,
    }))
    setError(null)

    return result
  }

  const selectedKey = selectedRestaurant
    ? buildStatusKey(selectedRestaurant.lat, selectedRestaurant.lng)
    : null

  return (
    <div className="h-full flex flex-col relative">
      <header className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-[#1a1a2e] via-[#1a1a2e]/80 to-transparent pointer-events-none pb-4">
        <div className="px-4 pt-3 pb-8 pointer-events-auto">
          <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-md">
            🔥 GasUndo Kochi
          </h1>
          <p className="text-white/90 font-medium text-xs mt-0.5 drop-shadow-md">
            Live map of restaurants affected by LPG shortage
          </p>
        </div>
      </header>

      {restaurants.length > 0 && (
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          restaurants={restaurants}
          onSelect={setSelectedRestaurant}
        />
      )}

      {error && (
        <div className="absolute top-16 left-4 right-4 z-[999] bg-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl text-center">
          {error}
        </div>
      )}

      <MapView
        restaurants={filteredRestaurants}
        statusMap={statusMap}
        onSelectRestaurant={setSelectedRestaurant}
        selectedRestaurant={selectedRestaurant}
      />

      {restaurants.length > 0 && (
        <div className="absolute bottom-6 left-4 z-[999] bg-[#1a1a2e]/90 backdrop-blur-sm text-white/60 text-xs px-3 py-1.5 rounded-full">
          {filteredRestaurants.length === restaurants.length
            ? `${restaurants.length} restaurants`
            : `${filteredRestaurants.length} of ${restaurants.length} restaurants`}
        </div>
      )}

      <RestaurantSheet
        restaurant={selectedRestaurant}
        statusData={selectedKey ? statusMap[selectedKey] : null}
        onClose={() => setSelectedRestaurant(null)}
        onStatusUpdate={handleStatusUpdate}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
