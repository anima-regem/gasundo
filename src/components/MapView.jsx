import { MapContainer, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import RestaurantMarker from './RestaurantMarker'
import LocateButton from './LocateButton'

const KOCHI_CENTER = [9.9312, 76.2673]
const DEFAULT_ZOOM = 13

export default function MapView({ restaurants, statusMap, onSelectRestaurant }) {
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
      <MarkerClusterGroup chunkedLoading>
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
    </MapContainer>
  )
}
