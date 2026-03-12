import { supabase } from './supabaseClient'

export async function getLatestStatuses() {
  if (!supabase) return {}

  // Get all statuses ordered by updated_at desc, then deduplicate by restaurant key
  const { data, error } = await supabase
    .from('restaurant_status')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching statuses:', error)
    return {}
  }

  const statusMap = {}
  for (const row of data) {
    const key = `${row.lat.toFixed(5)}_${row.lng.toFixed(5)}`
    if (!statusMap[key]) {
      statusMap[key] = row
    }
  }

  return statusMap
}

export async function updateStatus({ restaurant_name, lat, lng, status, note }) {
  if (!supabase) {
    console.warn('Supabase not configured – status update skipped')
    return null
  }

  const { data, error } = await supabase
    .from('restaurant_status')
    .insert([{ restaurant_name, lat, lng, status, note, confirmations: 1 }])
    .select()

  if (error) {
    console.error('Error updating status:', error)
    throw error
  }

  return data[0]
}

export async function confirmStatus(statusId) {
  if (!supabase) {
    console.warn('Supabase not configured – confirmation skipped')
    return null
  }

  const { data, error } = await supabase
    .rpc('increment_confirmations', { status_id: statusId })

  if (error) {
    // Fallback: fetch current value and update
    const { data: current } = await supabase
      .from('restaurant_status')
      .select('confirmations')
      .eq('id', statusId)
      .single()

    const newCount = (current?.confirmations || 0) + 1

    const { data: updated, error: updateError } = await supabase
      .from('restaurant_status')
      .update({ confirmations: newCount })
      .eq('id', statusId)
      .select()

    if (updateError) {
      console.error('Error confirming status:', updateError)
      throw updateError
    }

    return updated[0]
  }

  return data
}
