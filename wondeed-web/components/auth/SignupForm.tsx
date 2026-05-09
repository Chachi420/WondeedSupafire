'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Method = 'email' | 'phone'
type Step   = 'input' | 'otp' | 'done'

const ROLES = [
  { value: 'client'  as const, label: 'Brand / Client', desc: 'Post clipping campaigns and fund them with a budget' },
  { value: 'clipper' as const, label: 'Clipper',        desc: 'Join campaigns, post clips, and earn per view' },
]

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

export default function SignupForm() {
  const router   = useRouter()
  const supabase = createClient()

  const [method, setMethod]     = useState<Method>('email')
  const [step, setStep]         = useState<Step>('input')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp]           = useState('')
  const [role, setRole]         = useState<'client' | 'clipper'>('clipper')
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
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (signUpError) setError(signUpError.message)
      else setStep('done')
    } else {
      const e164 = toE164(phone)
      const { data: existing } = await supabase
        .from('profiles').select('role').eq('phone', e164).maybeSingle()
      if (existing) {
        setError('An account already exists with this number. Log in instead.')
        setLoading(false)
        return
      }
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: e164,
        options: { data: { role } },
      })
      if (otpError) setError(otpError.message)
      else setStep('otp')
    }
    setLoading(false)
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: toE164(phone), token: otp, type: 'sms',
    })

    if (verifyError) { setError(verifyError.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  if (step === 'done') {
    return (
      <div className="col gap-16" style={{ textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(163,230,53,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
        }}>
          <svg width="28" height="28" fill="none" stroke="var(--primary)" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Check your email</h2>
          <p className="text-xs faint" style={{ lineHeight: 1.6 }}>
            We sent a confirmation link to <strong>{email}</strong>.
            Click it to verify your account and get started.
          </p>
        </div>
        <p className="text-xs faint" style={{ marginTop: 4 }}>
          Wrong email?{' '}
          <button
            type="button"
            onClick={() => { setStep('input'); setError(null) }}
            style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12, padding: 0 }}
          >
            Go back
          </button>
        </p>
      </div>
    )
  }

  const canSubmit = method === 'email'
    ? email.includes('@') && password.length >= 8
    : phone.replace(/\D/g, '').length >= 10

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
        {(['email', 'phone'] as Method[]).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => switchMethod(m)}
            style={{
              flex: 1, padding: '7px 12px', borderRadius: 6,
              background: method === m ? 'var(--surface)' : 'transparent',
              border: method === m ? '1px solid var(--border)' : '1px solid transparent',
              color: method === m ? 'var(--fg)' : 'var(--fg-muted)',
              fontSize: 13, fontWeight: method === m ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {m === 'email' ? 'Email' : 'Phone'}
          </button>
        ))}
      </div>

      {/* Role selector */}
      <div className="field" style={{ marginBottom: 16 }}>
        <label className="field-label">I am a…</label>
        <div className="col gap-8">
          {ROLES.map(r => (
            <label
              key={r.value}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                border: `1px solid ${role === r.value ? 'var(--primary)' : 'var(--border)'}`,
                background: role === r.value ? 'rgba(163,230,53,0.06)' : 'var(--surface)',
              }}
            >
              <input
                type="radio" name="signup-role" value={r.value} checked={role === r.value}
                onChange={() => setRole(r.value)}
                style={{ marginTop: 2, accentColor: 'var(--primary)' }}
              />
              <div>
                <p className="med text-xs">{r.label}</p>
                <p className="text-xs faint mt-4">{r.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {step === 'input' ? (
        <form onSubmit={handleSend} className="col gap-16">
          {method === 'email' ? (
            <>
              <div className="field">
                <label htmlFor="signup-email" className="field-label">Email address</label>
                <input
                  id="signup-email" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required className="input"
                />
              </div>
              <div className="field">
                <label htmlFor="signup-pw" className="field-label">Password</label>
                <input
                  id="signup-pw" type="password" placeholder="Min. 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)}
                  minLength={8} required className="input"
                />
                <span className="field-hint">A confirmation link will be sent to your email</span>
              </div>
            </>
          ) : (
            <div className="field">
              <label htmlFor="signup-phone" className="field-label">Phone number</label>
              <input
                id="signup-phone" type="tel" placeholder="98765 43210"
                value={phone} onChange={e => setPhone(e.target.value)}
                required className="input"
              />
              <span className="field-hint">India (+91) only · OTP verification</span>
            </div>
          )}

          {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="btn btn-primary btn-block"
          >
            {loading
              ? (method === 'email' ? 'Creating account…' : 'Sending code…')
              : method === 'email' ? 'Create account' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="col gap-16">
          <div className="field">
            <label htmlFor="signup-otp" className="field-label">Enter 6-digit code</label>
            <input
              id="signup-otp" type="text" inputMode="numeric"
              pattern="[0-9]{6}" maxLength={6}
              placeholder="• • • • • •"
              value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              required autoFocus className="input"
              style={{ textAlign: 'center', letterSpacing: '0.35em', fontSize: 22 }}
            />
            <span className="field-hint">Sent to +91 {phone}</span>
          </div>

          {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn btn-primary btn-block"
          >
            {loading ? 'Verifying…' : 'Verify & create account'}
          </button>

          <button
            type="button"
            onClick={() => { setStep('input'); setOtp(''); setError(null) }}
            className="btn btn-ghost btn-block"
          >
            ← Change number
          </button>
        </form>
      )}

      <p className="text-xs" style={{ textAlign: 'center', marginTop: 24, color: 'var(--fg-muted)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in →</Link>
      </p>
    </div>
  )
}
