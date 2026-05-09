'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Method = 'email' | 'phone'
type Step   = 'input' | 'otp'

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

export default function LoginForm() {
  const router   = useRouter()
  const supabase = createClient()

  const [method, setMethod]     = useState<Method>('email')
  const [step, setStep]         = useState<Step>('input')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
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
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (otpError) setError(otpError.message)
      else setStep('otp')
    } else {
      const e164 = toE164(phone)
      const { data: existing } = await supabase
        .from('profiles').select('role').eq('phone', e164).maybeSingle()
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: e164,
        options: { data: existing ? undefined : { role } },
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

  return (
    <div className="col" style={{ gap: 0 }}>
      {/* Google button */}
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

      {/* Divider */}
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

      {/* Input step */}
      {step === 'input' ? (
        <form onSubmit={handleSend} className="col gap-16">
          {method === 'email' ? (
            <div className="field">
              <label htmlFor="login-email" className="field-label">Email address</label>
              <input
                id="login-email" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required className="input"
              />
              <span className="field-hint">We'll send a 6-digit code to your inbox</span>
            </div>
          ) : (
            <>
              <div className="field">
                <label htmlFor="login-phone" className="field-label">Phone number</label>
                <input
                  id="login-phone" type="tel" placeholder="98765 43210"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  required className="input"
                />
                <span className="field-hint">India (+91) only · SMS OTP</span>
              </div>
              <div className="field">
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
                        type="radio" name="role" value={r.value} checked={role === r.value}
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
                <span className="field-hint">Returning users: your role is fetched from your existing account.</span>
              </div>
            </>
          )}

          {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || (method === 'email' ? !email.includes('@') : phone.replace(/\D/g, '').length < 10)}
            className="btn btn-primary btn-block"
          >
            {loading ? 'Sending…' : 'Send code'}
          </button>
        </form>
      ) : (
        /* OTP step */
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

      {process.env.NODE_ENV === 'development' && <DevLogin />}
    </div>
  )
}

function DevLogin() {
  const router   = useRouter()
  const supabase = createClient()
  const [email, setEmail]     = useState('')
  const [pw, setPw]           = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (signInError) { setError(signInError.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px dashed #d97706', background: 'rgba(245,158,11,0.06)', borderRadius: 8, padding: 16 }}>
      <p className="text-xs med mb-12" style={{ color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dev Login</p>
      <form onSubmit={handleSubmit} className="col gap-8">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="input" style={{ borderColor: '#d97706' }} />
        <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} required className="input" style={{ borderColor: '#d97706' }} />
        {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-block" style={{ background: '#fbbf24', color: '#78350f', borderColor: '#fbbf24' }}>
          {loading ? 'Signing in…' : 'Dev Login'}
        </button>
      </form>
    </div>
  )
}
