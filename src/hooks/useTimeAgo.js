import { useState, useEffect } from 'react'

function formatTimeAgo(dateString) {
  const now = new Date()
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
  const [text, setText] = useState(() => dateString ? formatTimeAgo(dateString) : '')

  useEffect(() => {
    if (!dateString) return

    setText(formatTimeAgo(dateString))

    const interval = setInterval(() => {
      setText(formatTimeAgo(dateString))
    }, 30000)

    return () => clearInterval(interval)
  }, [dateString])

  const now = new Date()
  const date = dateString ? new Date(dateString) : null
  const isStale = date ? (now - date) > 24 * 60 * 60 * 1000 : false

  return { text, isStale }
}
