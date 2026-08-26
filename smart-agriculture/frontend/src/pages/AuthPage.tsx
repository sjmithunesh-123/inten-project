import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { extractApiError } from '../utils/error'
import logo from '../assets/logo/smart-agriculture-logo.svg'
import { agricultureImages, imageFallback } from '../assets/images'
import { LogIn } from 'lucide-react'

const REGISTER_SUCCESS_KEY = 'smart_agri_register_success'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate()
  const { login, register, resetPassword, signInWithGoogle } = useAuth()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'farmer',
    location: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecovering, setIsRecovering] = useState(false)

  useEffect(() => {
    if (mode !== 'login') return

    const savedMessage = sessionStorage.getItem(REGISTER_SUCCESS_KEY)
    if (savedMessage) {
      setSuccessMessage(savedMessage)
      sessionStorage.removeItem(REGISTER_SUCCESS_KEY)
    }
  }, [mode])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        navigate('/dashboard')
        return
      }

      if (form.password !== form.confirm_password) {
        throw new Error('Passwords do not match.')
      }

      await register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
        location: form.location || undefined,
        phone: form.phone || undefined,
      })

      sessionStorage.setItem(REGISTER_SUCCESS_KEY, 'Registration successful. Check your email to confirm the account, then log in.')
      navigate('/login')
    } catch (err) {
      const message = extractApiError(err)
      if (/rate limit|email.*exceeded|too many requests/i.test(message)) {
        setError('Supabase email limit reached. Wait a few minutes before registering again, or use an existing account and Forgot password.')
      } else if (/database error saving new user|saving new user|database error/i.test(message)) {
        setError('Supabase could not create your profile. Apply the auth profile migration in the Supabase SQL Editor, then try registering again.')
      } else if (/email not confirmed/i.test(message)) {
        setError('Please confirm your email address using the Supabase email, then try logging in again.')
      } else if (/invalid login credentials/i.test(message)) {
        setError('Email or password is incorrect. Check both fields or use Forgot password.')
      } else {
        setError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordReset = async () => {
    setError('')
    setSuccessMessage('')
    setIsRecovering(true)
    try {
      await resetPassword(form.email)
      setSuccessMessage('Password reset instructions have been sent to your email.')
    } catch (err) {
      setError(extractApiError(err))
    } finally {
      setIsRecovering(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setIsSubmitting(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      const message = extractApiError(err)
      setError(/provider|oauth|google|redirect/i.test(message) ? 'Google sign-in is unavailable. Enable Google in Supabase Authentication > Providers and configure the OAuth redirect URLs.' : message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <img src={mode === 'login' ? agricultureImages.login : agricultureImages.register} alt="Smart farming in a green crop field" onError={(event) => { event.currentTarget.src = imageFallback }} />
        <div className="auth-visual-copy"><p className="eyebrow">SMART AGRICULTURE</p><h2>Good seasons begin with good signals.</h2></div>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <img src={logo} className="auth-logo" alt="Smart Agriculture" />
        <div className="auth-head">
          <p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Create account'}</p>
          <h2>{mode === 'login' ? 'Login to your account' : 'Register your farm profile'}</h2>
        </div>

        {mode === 'register' && (
          <label>
            Full name
            <input name="full_name" value={form.full_name} onChange={handleChange} required />
          </label>
        )}

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>

        {mode === 'register' && (
          <>
            <label>
              Phone
              <input name="phone" value={form.phone} onChange={handleChange} />
            </label>
            <label>
              Location
              <input name="location" value={form.location} onChange={handleChange} />
            </label>
            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="farmer">Farmer</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </>
        )}

        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>

        {mode === 'register' && <label>
          Confirm password
          <input type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange} required />
        </label>}

        {mode === 'login' && <button type="button" className="text-button" onClick={handlePasswordReset} disabled={isRecovering}>{isRecovering ? 'Sending...' : 'Forgot password?'}</button>}

        {successMessage && <p className="success-text">{successMessage}</p>}
        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="primary-link wide" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
        </button>
        <div className="auth-divider"><span>or</span></div>
        <button type="button" className="google-button" onClick={handleGoogleSignIn} disabled={isSubmitting}><LogIn size={17} /> Continue with Google</button>
        <p className="auth-switch">{mode === 'login' ? "Don't have an account?" : 'Already registered?'} <Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Register' : 'Login'}</Link></p>
      </form>
    </div>
  )
}
