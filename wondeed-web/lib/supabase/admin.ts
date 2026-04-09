import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database.types'

/**
 * Service-role Supabase client — bypasses RLS.
 * Only use in Server Actions and server-side code.
 * Never import this in client components.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
