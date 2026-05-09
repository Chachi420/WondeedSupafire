'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ROLES = [
  {
    value: 'client' as const,
    label: 'Brand / Client',
    desc: 'Post clipping campaigns, set budgets, and get your content amplified by clippers',
  },
  {
    value: 'clipper' as const,
    label: 'Clipper',
    desc: 'Join campaigns, create and post clips to your social pages, and earn per view',
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
          <label
            key={r.value}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '16px', borderRadius: 10, cursor: 'pointer',
              border: `1.5px solid ${role === r.value ? 'var(--primary)' : 'var(--border)'}`,
              background: role === r.value ? 'rgba(163,230,53,0.06)' : 'var(--surface)',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <input
              type="radio" name="role" value={r.value} checked={role === r.value}
              onChange={() => setRole(r.value)}
              style={{ marginTop: 3, accentColor: 'var(--primary)', flexShrink: 0 }}
            />
            <div>
              <p className="med" style={{ fontSize: 14, marginBottom: 5 }}>{r.label}</p>
              <p className="faint text-xs" style={{ lineHeight: 1.5 }}>{r.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-block"
        style={{ marginTop: 4 }}
      >
        {loading ? 'Setting up your account…' : 'Continue'}
      </button>
    </form>
  )
}
