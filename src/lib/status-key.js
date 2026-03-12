export function buildStatusKey(lat, lng) {
  return `${Number(lat).toFixed(5)}_${Number(lng).toFixed(5)}`
}
