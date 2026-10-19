import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
// Dukung kunci baru (SUPABASE_SECRET_KEY) maupun fallback kunci lama (SUPABASE_SERVICE_ROLE_KEY)
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
// Dukung kunci baru (SUPABASE_PUBLISHABLE_KEY) maupun fallback kunci lama (SUPABASE_ANON_KEY)
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl) {
  console.warn('⚠️ Peringatan: SUPABASE_URL belum diatur pada server/.env')
}

// Supabase Admin Client (menggunakan Secret Key untuk operasi server / bypass RLS jika diperlukan)
export const supabaseAdmin = supabaseSecretKey 
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Supabase Public Client (menggunakan Publishable / Anon Key)
export const supabase = supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey)
  : (supabaseAdmin || null)

export default supabase
