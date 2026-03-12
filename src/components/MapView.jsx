import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import RestaurantMarker from './RestaurantMarker'
import LocateButton from './LocateButton'
import L from 'leaflet'
import { useEffect } from 'react'

const KOCHI_CENTER = [9.9312, 76.2673]
const DEFAULT_ZOOM = 13

const createClusterCustomIcon = function (cluster) {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(40, 40, true),
  })
}

// Helper component to handle imperative map operations
function MapController({ selectedRestaurant }) {
  const map = useMap()
  
  useEffect(() => {
    if (selectedRestaurant) {
      map.flyTo([selectedRestaurant.lat, selectedRestaurant.lng], 16, {
        animate: true,
        duration: 1
      })
    }
  }, [selectedRestaurant, map])

  return null
}

export default function MapView({ restaurants, statusMap, onSelectRestaurant, selectedRestaurant }) {
  return (
    <MapContainer
      center={KOCHI_CENTER}
      zoom={DEFAULT_ZOOM}
      className="map-container"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
        {restaurants.map((r) => {
          const key = `${r.lat.toFixed(5)}_${r.lng.toFixed(5)}`
          const statusData = statusMap[key]
          const status = statusData?.status || 'unknown'

          return (
            <RestaurantMarker
              key={r.id}
              restaurant={r}
              status={status}
              onClick={onSelectRestaurant}
            />
          )
        })}
      </MarkerClusterGroup>
      <LocateButton />
      <MapController selectedRestaurant={selectedRestaurant} />
    </MapContainer>
  )
}
