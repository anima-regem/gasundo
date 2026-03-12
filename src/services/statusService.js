async function parseResponse(response, fallbackMessage) {
  let payload = null

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(payload?.error || fallbackMessage)
  }

  return payload
}

export async function updateStatus({ restaurant_name, lat, lng, status, note }) {
  const response = await fetch('/api/statuses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ restaurant_name, lat, lng, status, note }),
  })

<<<<<<< Updated upstream
  const payload = await parseResponse(
    response,
    'Could not save your update right now.'
  )

  return payload.status
=======
  const { data, error } = await supabase.functions.invoke('update-status', {
    body: {
      action: 'insert_status',
      payload: { restaurant_name, lat, lng, status, note }
    }
  })

  // Check if it's our 429 error
  if (error && error.message.includes('Too many requests')) {
    alert('You are doing that too fast. Please wait a minute.')
    throw new Error('Rate limit exceeded')
  } else if (error) {
    console.error('Error invoking update-status:', error)
    throw error
  }

  return data
>>>>>>> Stashed changes
}

export async function confirmStatus(statusId) {
  const response = await fetch(`/api/statuses/${statusId}/confirm`, {
    method: 'POST',
  })

<<<<<<< Updated upstream
  const payload = await parseResponse(
    response,
    'Could not confirm this update right now.'
  )

  return payload.status
=======
  const { data, error } = await supabase.functions.invoke('update-status', {
    body: {
      action: 'confirm_status',
      payload: { statusId }
    }
  })

  if (error && error.message.includes('Too many requests')) {
    alert('You are doing that too fast. Please wait a minute.')
    throw new Error('Rate limit exceeded')
  } else if (error) {
    console.error('Error invoking confirm_status:', error)
    throw error
  }

  return data
>>>>>>> Stashed changes
}
