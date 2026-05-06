import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateProfile } from '@/app/dashboard/client/actions'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const { data: profile } = await db
    .from('profiles')
    .select('full_name, phone, role, subscription_tier, created_at')
    .eq('id', user!.id)
    .single()

  const p = profile as any

  return (
    <>
      <div className="topbar">
        <div className="col">
          <h1>Settings</h1>
          <div className="topbar-sub">Manage your account information</div>
        </div>
      </div>

      <div className="content fade-up">
        <form action={updateProfile} className="card mb-20">
          <div className="card-head">
            <h2>Profile Information</h2>
          </div>
          <div style={{ padding: '20px 24px' }} className="col gap-16">
            <div className="field">
              <label className="field-label">Display name</label>
              <input
                name="full_name"
                type="text"
                defaultValue={p?.full_name ?? ''}
                required
                placeholder="Your full name or company name"
                className="input"
              />
            </div>
            <div className="field">
              <label className="field-label">Phone number</label>
              <input
                type="text"
                value={p?.phone ?? '—'}
                disabled
                className="input"
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <span className="field-hint">Phone is your login identifier and cannot be changed.</span>
            </div>
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>

        <div className="card">
          <div className="card-head">
            <h2>Account Details</h2>
          </div>
          <div style={{ padding: '20px 24px' }} className="g2">
            {[
              ['Role',              p?.role ?? '—',                          true ],
              ['Subscription Tier', p?.subscription_tier ?? 'pro',           true ],
              ['Account ID',        user!.id,                                false],
              ['Member Since',      p?.created_at
                ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                : '—',                                                        false],
            ].map(([label, value, cap]) => (
              <div key={label as string} className="col gap-4">
                <div className="text-xs faint">{label}</div>
                <div
                  className="med text-xs"
                  style={{
                    textTransform: cap ? 'capitalize' : undefined,
                    fontFamily: label === 'Account ID' ? 'var(--mono)' : undefined,
                    wordBreak: 'break-all',
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
