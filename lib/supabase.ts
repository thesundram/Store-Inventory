import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      "Supabase environment variables are missing.\n" +
        "Add SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_ equivalents) " +
        "in your Vercel project settings.",
    )
  }

  _supabase = createClient(url, anonKey)
  return _supabase
}
