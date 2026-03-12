'use client'

import { Marker } from 'react-leaflet'
import L from 'leaflet'

const brandLogos = {
  "McDonald's": "/logos/mcdonalds.png",
  "KFC": "/logos/kfc.png",
  "Burger King": "/logos/burgerking.png",
  "Subway": "/logos/subway.png",
  "Domino's": "/logos/dominos.png",
  "Pizza Hut": "/logos/pizzahut.png",
  "Starbucks": "/logos/starbucks.png",
}

const STATUS_RING_COLORS = {
  'open': '#22c55e',
  'limited': '#eab308',
  'closed': '#ef4444',
  'unknown': '#6b7280',
}

const iconCache = {}

function createRingIcon(restaurant, status) {
  const ringColor = STATUS_RING_COLORS[status] || STATUS_RING_COLORS.unknown
  const hasBrand = restaurant.brand && brandLogos[restaurant.brand]
  const iconUrl = hasBrand ? brandLogos[restaurant.brand] : '/default-marker.png'
  const cacheKey = `${iconUrl}_${status}`

  if (iconCache[cacheKey]) return iconCache[cacheKey]

  const html = `
    <div style="
      width: 44px; height: 44px;
      border-radius: 50%;
      border: 3px solid ${ringColor};
      background: white;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      <img src="${iconUrl}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" />
    </div>
  `

  iconCache[cacheKey] = L.divIcon({
    html,
    className: 'custom-ring-marker',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })

  return iconCache[cacheKey]
}

export default function RestaurantMarker({ restaurant, status, onClick }) {
  return (
    <Marker
      position={[restaurant.lat, restaurant.lng]}
      icon={createRingIcon(restaurant, status)}
      eventHandlers={{
        click: () => onClick(restaurant),
      }}
    />
  )
}
