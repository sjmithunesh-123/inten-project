import { supabase } from '../lib/supabase'

export const authService = {
  async signUp(payload: {
    email: string
    password: string
    full_name: string
    phone?: string
    location?: string
  }) {
    const { data, error } = await supabase.auth.signUp(
      {
        email: payload.email,
        password: payload.password,
      },
      { data: { full_name: payload.full_name, phone: payload.phone, location: payload.location } },
    )
    return { data, error }
  },
  async signIn(payload: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: payload.email, password: payload.password })
    return { data, error }
  },
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },
  async getUser() {
    const { data, error } = await supabase.auth.getUser()
    return { data, error }
  },
}
