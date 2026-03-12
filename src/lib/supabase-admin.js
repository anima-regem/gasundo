import 'server-only'

import { createClient } from '@supabase/supabase-js'

let supabaseAdmin

export function getSupabaseAdmin() {
  if (supabaseAdmin !== undefined) {
    return supabaseAdmin
  }

  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    supabaseAdmin = null
    return supabaseAdmin
  }

  supabaseAdmin = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return supabaseAdmin
}

export function requireSupabaseAdmin() {
  const client = getSupabaseAdmin()

  if (!client) {
    throw new Error('Server is missing Supabase configuration.')
  }

  return client
}
