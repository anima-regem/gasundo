export function getClientIp(headers) {
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim() || 'unknown'
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim() || 'unknown'
  }

  return 'unknown'
}
