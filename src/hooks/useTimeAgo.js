'use client'

import { useEffect, useMemo, useState } from 'react'

function formatTimeAgo(dateString, nowTimestamp = Date.now()) {
  const now = new Date(nowTimestamp)
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function useTimeAgo(dateString) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!dateString) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 30000)

    return () => window.clearInterval(interval)
  }, [dateString])

  const text = useMemo(
    () => (dateString ? formatTimeAgo(dateString, now) : ''),
    [dateString, now]
  )

  const currentDate = new Date(now)
  const date = dateString ? new Date(dateString) : null
  const isStale = date ? (currentDate - date) > 24 * 60 * 60 * 1000 : false

  return { text, isStale }
}
