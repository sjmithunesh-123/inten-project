import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { setAuthToken } from '../api/client'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

const TOKEN_KEY = 'smart_agri_token'
const SESSION_KEY = 'smart_agri_session'

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  register: (payload: { full_name: string; email: string; password: string; role?: string; location?: string; phone?: string }) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
}

type SupabaseUser = { id: string; email?: string; user_metadata?: Record<string, unknown> }
type SupabaseSession = { access_token?: string; user?: SupabaseUser } | null

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function isSupabaseConfigured() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY && /^https?:\/\//i.test(String(import.meta.env.VITE_SUPABASE_URL)))
}

function getAuthRedirectUrl() {
  const configuredUrl = String(import.meta.env.VITE_AUTH_REDIRECT_URL ?? '').trim()
  if (!configuredUrl) return window.location.origin
  try {
    return new URL(configuredUrl).toString().replace(/\/$/, '')
  } catch {
    return window.location.origin
  }
}

function mapSupabaseUser(authUser: SupabaseUser): User {
  const metadata = authUser.user_metadata ?? {}
  return {
    id: authUser.id,
    full_name: typeof metadata.full_name === 'string' && metadata.full_name ? metadata.full_name : 'User',
    email: authUser.email ?? '',
    phone: typeof metadata.phone === 'string' ? metadata.phone : null,
    role: typeof metadata.role === 'string' ? metadata.role : 'farmer',
    location: typeof metadata.location === 'string' ? metadata.location : null,
    profile_image: typeof metadata.avatar_url === 'string' ? metadata.avatar_url : null,
    is_active: true,
  }
}

function persistSession(user: User | null, token: string | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  else localStorage.removeItem(SESSION_KEY)
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const applySession = (session: SupabaseSession) => {
      if (!mounted) return
      const nextToken = session?.access_token ?? null
      const nextUser = session?.user ? mapSupabaseUser(session.user) : null
      setUser(nextUser)
      setToken(nextToken)
      setAuthToken(nextToken)
      persistSession(nextUser, nextToken)
    }

    const initialize = async () => {
      if (!isSupabaseConfigured()) {
        applySession(null)
        if (mounted) setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.getSession()
      applySession(error ? null : (data.session as SupabaseSession))
      if (mounted) setLoading(false)
    }

    const subscription = isSupabaseConfigured()
      ? supabase.auth.onAuthStateChange((_event: string, session: SupabaseSession) => applySession(session))
      : null
    void initialize()

    return () => {
      mounted = false
      subscription?.data?.subscription?.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase authentication is not configured.')
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) throw error
    if (!data?.session?.user || !data.session.access_token) throw new Error('No active session was returned. Please try again.')
    const nextUser = mapSupabaseUser(data.session.user as SupabaseUser)
    setUser(nextUser)
    setToken(data.session.access_token)
    setAuthToken(data.session.access_token)
    persistSession(nextUser, data.session.access_token)
  }

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) throw new Error('Supabase authentication is not configured.')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getAuthRedirectUrl() },
    })
    if (error) throw error
  }

  const register = async (payload: { full_name: string; email: string; password: string; role?: string; location?: string; phone?: string }) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase authentication is not configured.')
    const fullName = payload.full_name.trim()
    const email = payload.email.trim().toLowerCase()
    if (!fullName || !email || !payload.password) throw new Error('Please complete all required fields.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.')
    if (payload.password.length < 6) throw new Error('Password must be at least 6 characters long.')

    const { data, error } = await supabase.auth.signUp({
      email,
      password: payload.password,
      options: { data: { full_name: fullName, phone: payload.phone?.trim() ?? '', location: payload.location?.trim() ?? '', role: payload.role ?? 'farmer' } },
    })
    if (error) throw error
    if (!data?.user) throw new Error('Account could not be created. Please try again.')
    if (Array.isArray(data.user.identities) && data.user.identities.length === 0) throw new Error('An account with this email already exists. Try logging in or resetting the password.')
    if (data.session) await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase authentication is not configured.')
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) throw new Error('Enter your email address first.')
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo: `${window.location.origin}/login` })
    if (error) throw error
  }

  const logout = async () => {
    try {
      if (isSupabaseConfigured()) await supabase.auth.signOut()
    } finally {
      setUser(null)
      setToken(null)
      setAuthToken(null)
      persistSession(null, null)
    }
  }

  const value = useMemo(() => ({ user, token, loading, login, signInWithGoogle, register, resetPassword, logout }), [user, token, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
