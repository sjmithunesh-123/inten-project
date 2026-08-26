import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

function isValidHttpUrl(value: any) {
  if (!value || typeof value !== 'string') return false
  return /^https?:\/\//i.test(value.trim())
}

if (!isValidHttpUrl(SUPABASE_URL) || !SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or ANON key not set in environment')
}

const isRemoteAuthEnabled = isValidHttpUrl(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY)

export const supabase: any = isRemoteAuthEnabled
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : {
      auth: {
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured for local development') }),
        signInWithOAuth: async () => ({ data: null, error: new Error('Google sign-in requires Supabase configuration') }),
        signUp: async () => ({ data: null, error: new Error('Supabase not configured for local development') }),
        resetPasswordForEmail: async () => ({ data: null, error: new Error('Supabase not configured for local development') }),
        getUser: async () => ({ data: null, error: new Error('Supabase not configured for local development') }),
        getSession: async () => ({ data: { session: null } }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({ select: async () => ({ data: null, error: new Error('Supabase not configured for local development') }) }),
      storage: {
        from: () => ({ upload: async () => ({ data: null, error: new Error('Supabase not configured for local development') }) }),
      },
    }

