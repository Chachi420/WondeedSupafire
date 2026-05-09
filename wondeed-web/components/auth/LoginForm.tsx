'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Method = 'email' | 'phone' | 'password'
type Step   = 'input' | 'otp'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"/>
      <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" fill="#34A853"/>
      <path d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" fill="#FBBC05"/>
      <path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z" fill="#EA4335"/>
    </svg>
  )
}

function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`
  if (digits.length === 10) return `+91${digits}`
  return `+${digits}`
}

const METHODS: { value: Method; label: string }[] = [
  { value: 'email',    label: 'Email OTP' },
  { value: 'phone',    label: 'Phone OTP' },
  { value: 'password', label: 'Password'  },
]

export default function LoginForm() {
  const router   = useRouter()
  const supabase = createClient()

  const [method, setMethod]     = useState<Method>('email')
  const [step, setStep]         = useState<Step>('input')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp]           = useState('')
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  function switchMethod(m: Method) {
    setMethod(m)
    setStep('input')
    setOtp('')
    setError(null)
  }

  async function handleGoogle() {
    setGLoading(true)
    setError(null)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
    if (oauthError) { setError(oauthError.message); setGLoading(false) }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (method === 'email') {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      })
      if (otpError) {
        setError('No account found with this email. Sign up first.')
      } else {
        setStep('otp')
      }
    } else if (method === 'phone') {
      const e164 = toE164(phone)
      const { data: existing } = await supabase
        .from('profiles').select('role').eq('phone', e164).maybeSingle()
      if (!existing) {
        setError('No account found with this number. Sign up first.')
        setLoading(false)
        return
      }
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone: e164 })
      if (otpError) setError(otpError.message)
      else setStep('otp')
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError('Incorrect email or password.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }
    setLoading(false)
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    let verifyError: { message: string } | null = null
    if (method === 'email') {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
      verifyError = error
    } else {
      const { error } = await supabase.auth.verifyOtp({ phone: toE164(phone), token: otp, type: 'sms' })
      verifyError = error
    }

    if (verifyError) { setError(verifyError.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  const dest = method === 'email' ? email : `+91 ${phone}`

  const canSubmit = method === 'email'    ? email.includes('@')
    : method === 'phone'    ? phone.replace(/\D/g, '').length >= 10
    : email.includes('@') && password.length > 0

  return (
    <div className="col" style={{ gap: 0 }}>
      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={gLoading}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 10,
          padding: '11px 20px', borderRadius: 8,
          background: '#fff', border: '1.5px solid #e5e7eb',
          color: '#111827', fontSize: 14, fontWeight: 600,
          cursor: gLoading ? 'default' : 'pointer',
          opacity: gLoading ? 0.7 : 1,
          marginBottom: 20,
        }}
      >
        <GoogleIcon />
        {gLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>or</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Method tabs */}
      <div style={{
        display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)',
        borderRadius: 8, padding: 3, marginBottom: 20,
        border: '1px solid var(--border)',
      }}>
        {METHODS.map(m => (
          <button
            key={m.value}
            type="button"
            onClick={() => switchMethod(m.value)}
            style={{
              flex: 1, padding: '7px 6px', borderRadius: 6,
              background: method === m.value ? 'var(--surface)' : 'transparent',
              border: method === m.value ? '1px solid var(--border)' : '1px solid transparent',
              color: method === m.value ? 'var(--fg)' : 'var(--fg-muted)',
              fontSize: 12, fontWeight: method === m.value ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {step === 'input' ? (
        <form onSubmit={handleSend} className="col gap-16">
          {method === 'email' && (
            <div className="field">
              <label htmlFor="login-email" className="field-label">Email address</label>
              <input
                id="login-email" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required className="input"
              />
              <span className="field-hint">We'll send a 6-digit code to your inbox</span>
            </div>
          )}

          {method === 'phone' && (
            <div className="field">
              <label htmlFor="login-phone" className="field-label">Phone number</label>
              <input
                id="login-phone" type="tel" placeholder="98765 43210"
                value={phone} onChange={e => setPhone(e.target.value)}
                required className="input"
              />
              <span className="field-hint">India (+91) only · SMS OTP</span>
            </div>
          )}

          {method === 'password' && (
            <>
              <div className="field">
                <label htmlFor="login-pw-email" className="field-label">Email address</label>
                <input
                  id="login-pw-email" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required className="input"
                />
              </div>
              <div className="field">
                <label htmlFor="login-pw" className="field-label">Password</label>
                <input
                  id="login-pw" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required className="input"
                />
              </div>
            </>
          )}

          {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="btn btn-primary btn-block"
          >
            {loading
              ? (method === 'password' ? 'Signing in…' : 'Sending…')
              : method === 'password' ? 'Sign in' : 'Send code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="col gap-16">
          <div className="field">
            <label htmlFor="login-otp" className="field-label">Enter 6-digit code</label>
            <input
              id="login-otp" type="text" inputMode="numeric"
              pattern="[0-9]{6}" maxLength={6}
              placeholder="• • • • • •"
              value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              required autoFocus className="input"
              style={{ textAlign: 'center', letterSpacing: '0.35em', fontSize: 22 }}
            />
            <span className="field-hint">Sent to {dest}</span>
          </div>

          {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn btn-primary btn-block"
          >
            {loading ? 'Verifying…' : 'Verify & sign in'}
          </button>

          <button
            type="button"
            onClick={() => { setStep('input'); setOtp(''); setError(null) }}
            className="btn btn-ghost btn-block"
          >
            ← Change {method === 'email' ? 'email' : 'number'}
          </button>
        </form>
      )}

      <p className="text-xs" style={{ textAlign: 'center', marginTop: 24, color: 'var(--fg-muted)' }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign up →</Link>
      </p>
    </div>
  )
}
