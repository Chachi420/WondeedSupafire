'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/types/database.types'

type Step = 'phone' | 'otp'

// Role selection is only shown to new users who choose to sign up.
// Existing users simply enter their phone and OTP — role is fetched from profiles.
// Admins are provisioned manually; they should not self-select admin role.
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
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep]         = useState<Step>('phone')
  const [phone, setPhone]       = useState('')
  const [otp, setOtp]           = useState('')
  const [role, setRole]         = useState<Extract<UserRole, 'client' | 'clipper'>>('clipper')
  const [isNewUser, setIsNewUser] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // Normalise to E.164 with +91 prefix
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

    // Check if user already exists to decide whether to show role picker
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('phone', e164)
      .maybeSingle()

    const isExisting = !!existingProfile
    setIsNewUser(!isExisting)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: e164,
      options: {
        // Pass role in metadata so the DB trigger can set it on new profiles
        data: isExisting ? undefined : { role },
      },
    })

    if (otpError) {
      setError(otpError.message)
    } else {
      setStep('otp')
    }

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

    // Middleware will redirect to the correct dashboard based on role in profiles
    router.push('/dashboard')
    router.refresh()
  }

  // ── Dev login state ───────────────────────────────────────
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
    <div className="space-y-4">
      {step === 'phone' ? (
        <form onSubmit={handleSendOTP} className="space-y-4" suppressHydrationWarning>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              suppressHydrationWarning
            />
            <p className="mt-1 text-xs text-gray-400">India (+91) numbers only for now</p>
          </div>

          {/* Role picker — only relevant for new users; existing users skip this */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">I am a…</p>
            <div className="space-y-2">
              {SELECTABLE_ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    role === r.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.label}</p>
                    <p className="text-xs text-gray-500">{r.description}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Returning users: role is fetched from your existing account automatically.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || phone.length < 10}
            className="w-full py-2.5 px-4 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending OTP…' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              Enter OTP
            </label>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 tracking-widest text-center text-lg"
            />
            <p className="mt-1 text-xs text-gray-400">Sent to +91 {phone}</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-2.5 px-4 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying…' : 'Verify & Sign In'}
          </button>

          <button
            type="button"
            onClick={() => { setStep('phone'); setOtp(''); setError(null) }}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            ← Change number
          </button>
        </form>
      )}

      {/* ── Dev Only (hidden in production) ──────────────────── */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 pt-6 border-t border-dashed border-amber-300 bg-amber-50 rounded-lg p-4">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
            Dev Login
          </p>
          <form onSubmit={handleDevLogin} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={devEmail}
              onChange={(e) => setDevEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            />
            <input
              type="password"
              placeholder="Password"
              value={devPassword}
              onChange={(e) => setDevPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            />
            {devError && <p className="text-xs text-red-600">{devError}</p>}
            <button
              type="submit"
              disabled={devLoading}
              className="w-full py-2 px-4 bg-amber-400 text-amber-900 rounded-lg text-sm font-medium hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {devLoading ? 'Signing in…' : 'Dev Login'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
