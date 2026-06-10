'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ROLES = [
  {
    value: 'client' as const,
    label: 'Brand / Client',
    desc: 'Post clipping campaigns, set budgets, and get your content amplified by clippers',
    icon: <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM8 5V3.5A1.5 1.5 0 019.5 2h5A1.5 1.5 0 0116 3.5V5M3 11h18" />,
  },
  {
    value: 'clipper' as const,
    label: 'Clipper',
    desc: 'Join campaigns, create and post clips to your social pages, and earn per view',
    icon: <path d="M6 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM20 4L8.5 15.5M14.5 14.5L20 20M8.5 8.5l3.5 3.5" />,
  },
]

export default function OnboardForm() {
  const router   = useRouter()
  const supabase = createClient()
  const [role, setRole]       = useState<'client' | 'clipper'>('clipper')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: updateError } = await (supabase as any)
      .from('profiles')
      .update({ role })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/${role}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="col gap-16">
      <div className="col gap-10">
        {ROLES.map(r => (
          <label key={r.value} className={`role-pick ${role === r.value ? 'selected' : ''}`}>
            <input
              type="radio" name="role" value={r.value} checked={role === r.value}
              onChange={() => setRole(r.value)}
              className="sr-only"
            />
            <span className="rp-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {r.icon}
              </svg>
            </span>
            <div style={{ paddingRight: 22 }}>
              <p className="med text-md" style={{ margin: 0 }}>{r.label}</p>
              <p className="text-sm muted" style={{ margin: '3px 0 0', lineHeight: 1.5 }}>{r.desc}</p>
            </div>
            <span className="rp-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </label>
        ))}
      </div>

      {error && <p className="auth-error">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-auth-submit"
        style={{ marginTop: 4 }}
      >
        {loading ? 'Setting up your account…' : 'Continue'}
      </button>
    </form>
  )
}
