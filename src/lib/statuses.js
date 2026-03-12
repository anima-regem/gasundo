import 'server-only'

import { buildStatusKey } from './status-key'
import { getSupabaseAdmin, requireSupabaseAdmin } from './supabase-admin'

async function fetchStatusById(supabase, statusId) {
  const { data, error } = await supabase
    .from('restaurant_status')
    .select('*')
    .eq('id', statusId)
    .single()

  if (error) {
    throw error
  }

  return data
}

function normalizeStatusResult(result) {
  if (Array.isArray(result)) {
    return result[0] ?? null
  }

  if (result && typeof result === 'object' && 'id' in result) {
    return result
  }

  return null
}

export async function getLatestStatuses() {
  const supabase = getSupabaseAdmin()

  if (!supabase) {
    return {}
  }

  const { data, error } = await supabase
    .from('restaurant_status')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  const statusMap = {}

  for (const row of data ?? []) {
    const key = buildStatusKey(row.lat, row.lng)
    if (!statusMap[key]) {
      statusMap[key] = row
    }
  }

  return statusMap
}

export async function createStatus({ restaurant_name, lat, lng, status, note }) {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from('restaurant_status')
    .insert([{ restaurant_name, lat, lng, status, note, confirmations: 1 }])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

async function confirmStatusFallback(supabase, statusId) {
  const current = await fetchStatusById(supabase, statusId)
  const nextCount = (current?.confirmations || 0) + 1

  const { data, error } = await supabase
    .from('restaurant_status')
    .update({ confirmations: nextCount })
    .eq('id', statusId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function confirmStatus(statusId) {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase.rpc('increment_confirmations', {
    status_id: statusId,
  })

  if (error) {
    return confirmStatusFallback(supabase, statusId)
  }

  const updatedStatus = normalizeStatusResult(data)
  if (updatedStatus) {
    return updatedStatus
  }

  return fetchStatusById(supabase, statusId)
}
