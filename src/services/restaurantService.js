const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

const KOCHI_QUERY = `
[out:json][timeout:25];
(
  node["amenity"="restaurant"](9.85,76.15,10.05,76.45);
  node["amenity"="cafe"](9.85,76.15,10.05,76.45);
  node["amenity"="fast_food"](9.85,76.15,10.05,76.45);
  node["amenity"="food_court"](9.85,76.15,10.05,76.45);
);
out body;
`

export async function fetchRestaurants() {
  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: KOCHI_QUERY,
  })

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`)
  }

  const data = await response.json()

  return data.elements
    .filter((el) => el.tags && el.tags.name)
    .map((el) => ({
      id: el.id,
      name: el.tags.name,
      brand: el.tags.brand || null,
      lat: el.lat,
      lng: el.lon,
    }))
}
