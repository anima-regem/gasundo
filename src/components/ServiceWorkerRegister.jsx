'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return undefined
    }

    if (!('serviceWorker' in navigator)) {
      return undefined
    }

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    if (document.readyState === 'complete') {
      register()
      return undefined
    }

    window.addEventListener('load', register)

    return () => {
      window.removeEventListener('load', register)
    }
  }, [])

  return null
}
