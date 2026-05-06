'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/types/database.types'

type Step = 'phone' | 'otp'

const SELECTABLE_ROLES: { value: Extract<UserRole, 'client' | 'clipper'>; label: string; description: string }[] = [
  {
    value: 'client',
    label: 'Client (Brand / Creator)',
    description: 'Post clipping campaigns and fund them with a budget',
  },
  {
    value: 'clipper',
    label: 'Clipper (Page Owner)',
    description: 'Join campaigns, post clips, and earn per view',
  },
]

export default function PhoneOTPForm() {
  const router   = useRouter()
  const supabase = createClient()

  const [step, setStep]         = useState<Step>('phone')
  const [phone, setPhone]       = useState('')
  const [otp, setOtp]           = useState('')
  const [role, setRole]         = useState<Extract<UserRole, 'client' | 'clipper'>>('clipper')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  function toE164(raw: string): string {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('91') && digits.length === 12) return `+${digits}`
    if (digits.length === 10) return `+91${digits}`
    return `+${digits}`
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const e164 = toE164(phone)

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('phone', e164)
      .maybeSingle()

    const isExisting = !!existingProfile

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: e164,
      options: { data: isExisting ? undefined : { role } },
    })

    if (otpError) { setError(otpError.message) } else { setStep('otp') }
    setLoading(false)
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const e164 = toE164(phone)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: e164,
      token: otp,
      type: 'sms',
    })

    if (verifyError) {
      setError(verifyError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const [devEmail, setDevEmail]       = useState('')
  const [devPassword, setDevPassword] = useState('')
  const [devLoading, setDevLoading]   = useState(false)
  const [devError, setDevError]       = useState<string | null>(null)

  async function handleDevLogin(e: React.FormEvent) {
    e.preventDefault()
    setDevError(null)
    setDevLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: devPassword,
    })

    if (signInError) {
      setDevError(signInError.message)
      setDevLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="col gap-16">
      {step === 'phone' ? (
        <form onSubmit={handleSendOTP} className="col gap-16" suppressHydrationWarning>
          <div className="field">
            <label htmlFor="phone" className="field-label">Phone number</label>
            <input
              id="phone"
              type="tel"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="input"
              suppressHydrationWarning
            />
            <span className="field-hint">India (+91) numbers only for now</span>
          </div>

          <div className="field">
            <label className="field-label">I am a…</label>
            <div className="col gap-8">
              {SELECTABLE_ROLES.map((r) => (
                <label
                  key={r.value}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                    borderRadius: 8, border: `1px solid ${role === r.value ? 'var(--primary)' : 'var(--border)'}`,
                    background: role === r.value ? 'rgba(163,230,53,0.06)' : 'var(--surface)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    style={{ marginTop: 2, accentColor: 'var(--primary)' }}
                  />
                  <div>
                    <p className="med text-xs">{r.label}</p>
                    <p className="text-xs faint mt-4">{r.description}</p>
                  </div>
                </label>
              ))}
            </div>
            <span className="field-hint">Returning users: role is fetched from your existing account automatically.</span>
          </div>

          {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || phone.length < 10}
            className="btn btn-primary btn-block"
          >
            {loading ? 'Sending OTP…' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="col gap-16">
          <div className="field">
            <label htmlFor="otp" className="field-label">Enter OTP</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
              className="input"
              style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: 20 }}
            />
            <span className="field-hint">Sent to +91 {phone}</span>
          </div>

          {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn btn-primary btn-block"
          >
            {loading ? 'Verifying…' : 'Verify & Sign In'}
          </button>

          <button
            type="button"
            onClick={() => { setStep('phone'); setOtp(''); setError(null) }}
            className="btn btn-ghost btn-block"
          >
            ← Change number
          </button>
        </form>
      )}

      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: 8, paddingTop: 20, borderTop: '1px dashed #d97706', background: 'rgba(245,158,11,0.06)', borderRadius: 8, padding: '16px' }}>
          <p className="text-xs med mb-12" style={{ color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dev Login</p>
          <form onSubmit={handleDevLogin} className="col gap-8">
            <input
              type="email"
              placeholder="Email"
              value={devEmail}
              onChange={(e) => setDevEmail(e.target.value)}
              required
              className="input"
              style={{ borderColor: '#d97706' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={devPassword}
              onChange={(e) => setDevPassword(e.target.value)}
              required
              className="input"
              style={{ borderColor: '#d97706' }}
            />
            {devError && <p className="text-xs" style={{ color: 'var(--danger)' }}>{devError}</p>}
            <button
              type="submit"
              disabled={devLoading}
              className="btn btn-block"
              style={{ background: '#fbbf24', color: '#78350f', borderColor: '#fbbf24' }}
            >
              {devLoading ? 'Signing in…' : 'Dev Login'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
