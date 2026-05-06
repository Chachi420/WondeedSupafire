import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import YouTubeConnect from '@/components/clipper/YouTubeConnect'
import InstagramConnect from '@/components/clipper/InstagramConnect'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

const TIER_DATA: Record<string, { label: string; min: number; max: number; next: string | null }> = {
  pro:        { label: 'Pro',        min: 0,       max: 50_000,  next: 'premium'    },
  premium:    { label: 'Premium',    min: 50_000,  max: 500_000, next: 'enterprise' },
  enterprise: { label: 'Enterprise', min: 500_000, max: Infinity, next: null        },
}

const TIER_PERKS: Record<string, string[]> = {
  pro:        ['Access to Pro campaigns', 'Basic earnings dashboard'],
  premium:    ['Access to Pro + Premium campaigns', 'Priority review', 'Advanced analytics'],
  enterprise: ['Access to all campaigns', 'Dedicated account support', 'Highest payout rates'],
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const [profileResult, walletResult, subsCountResult, approvedCountResult, socialResult] = await Promise.all([
    db.from('profiles').select('full_name, phone, subscription_tier, created_at').eq('id', user!.id).single(),
    db.from('wallets').select('total_credited_inr, balance_inr').eq('user_id', user!.id).maybeSingle(),
    db.from('campaign_submissions').select('id', { count: 'exact', head: true }).eq('clipper_id', user!.id),
    db.from('campaign_submissions').select('id', { count: 'exact', head: true }).eq('clipper_id', user!.id).eq('status', 'approved'),
    db.from('clipper_social_accounts').select('youtube_channel_id, youtube_channel_handle, youtube_channel_title, youtube_verified_at, instagram_username, instagram_connected_at').eq('clipper_id', user!.id).maybeSingle(),
  ])

  const profile       = profileResult.data
  const social        = socialResult.data
  const wallet        = walletResult.data
  const totalLifetime = Number(wallet?.total_credited_inr ?? 0)
  const totalSubs     = subsCountResult.count ?? 0
  const approvedSubs  = approvedCountResult.count ?? 0
  const currentTier   = profile?.subscription_tier ?? 'pro'
  const tierInfo      = TIER_DATA[currentTier] ?? TIER_DATA.pro
  const nextTierKey   = tierInfo.next
  const nextTierInfo  = nextTierKey ? TIER_DATA[nextTierKey] : null
  const displayName   = profile?.full_name ?? profile?.phone ?? 'Clipper'
  const initials      = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  const memberSince   = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—'

  let tierProgress = 100
  let toNext = 0
  if (nextTierInfo) {
    const range  = tierInfo.max - tierInfo.min
    const earned = Math.max(0, totalLifetime - tierInfo.min)
    tierProgress = Math.min(100, Math.round((earned / range) * 100))
    toNext       = Math.max(0, tierInfo.max - totalLifetime)
  }

  return (
    <>
      <div className="topbar">
        <div className="col">
          <h1>Profile</h1>
          <div className="topbar-sub">Your account details, connected platforms, and tier status</div>
        </div>
      </div>

      <div className="content fade-up">
        <div className="g2">

          {/* Left column */}
          <div className="col gap-16">

            {/* Account card */}
            <div className="card">
              <div className="card-head">
                <h2>Account</h2>
              </div>
              <div style={{ padding: '20px 24px' }} className="col gap-16">
                <div className="row gap-16">
                  <div className="avatar avatar-lg" style={{ width: 56, height: 56, fontSize: 20 }}>{initials}</div>
                  <div className="col">
                    <div className="med" style={{ fontSize: 15 }}>{displayName}</div>
                    <div className="text-xs faint">Member since {memberSince}</div>
                  </div>
                </div>
                <div className="col gap-0" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  {[
                    ['Phone',     profile?.phone     ?? '—'],
                    ['Full Name', profile?.full_name  ?? '—'],
                    ['User ID',   user!.id.slice(0, 20) + '…'],
                  ].map(([label, value]) => (
                    <div key={label} className="row between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span className="text-xs faint">{label}</span>
                      <span className="text-xs med" style={{ fontFamily: label === 'User ID' ? 'var(--mono)' : undefined }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats card */}
            <div className="card">
              <div className="card-head"><h2>Performance Stats</h2></div>
              <div className="g2" style={{ padding: '20px 24px', gap: 12 }}>
                {[
                  { label: 'Total Submissions', value: totalSubs },
                  { label: 'Approved Clips',    value: approvedSubs },
                  { label: 'Total Earned',       value: fmt(totalLifetime) },
                  { label: 'Approval Rate',      value: totalSubs > 0 ? `${Math.round((approvedSubs / totalSubs) * 100)}%` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="stat-card" style={{ padding: '16px 18px' }}>
                    <div className="stat-label">{label}</div>
                    <div className="stat-value" style={{ fontSize: 22 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="col gap-16">

            {/* Tier card */}
            <div className="card">
              <div className="card-head">
                <h2>Clipper Tier</h2>
                <div className="card-head-right">
                  <span className="badge badge-neutral">{tierInfo.label}</span>
                </div>
              </div>
              <div style={{ padding: '20px 24px' }} className="col gap-12">
                {nextTierInfo ? (
                  <>
                    <div className="text-xs faint">
                      Progress to <span className="med">{nextTierInfo.label}</span>
                    </div>
                    <div className="row between text-xs faint mb-4">
                      <span>{fmt(Math.max(0, totalLifetime - tierInfo.min))} earned</span>
                      <span>{fmt(tierInfo.max - tierInfo.min)} needed</span>
                    </div>
                    <div className="progress" style={{ height: 8, marginBottom: 8 }}>
                      <div className="progress-bar" style={{ width: `${tierProgress}%` }} />
                    </div>
                    <div className="text-xs faint">
                      Earn <span className="med">{fmt(toNext)}</span> more to unlock{' '}
                      <span className="med">{nextTierInfo.label}</span> tier.
                    </div>
                  </>
                ) : (
                  <div className="col gap-8 items-center" style={{ padding: '12px 0' }}>
                    <div className="stat-ico ico-violet" style={{ width: 48, height: 48 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                        <path d="M5 3l14 9-14 9V3z"/>
                      </svg>
                    </div>
                    <div className="med">Enterprise Clipper</div>
                    <div className="text-xs faint">You've reached the highest tier</div>
                  </div>
                )}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }} className="col gap-8">
                  <div className="text-xs med">Your tier perks</div>
                  {(TIER_PERKS[currentTier] ?? []).map(perk => (
                    <div key={perk} className="row gap-8 text-xs faint">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, color: 'var(--success)', flexShrink: 0 }}>
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                      {perk}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Connected accounts */}
            <div className="card">
              <div className="card-head">
                <div>
                  <h2>Connected Accounts</h2>
                  <div className="sub">Social platforms verified for clip submissions</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                  <InstagramConnect
                    username={social?.instagram_username ?? null}
                    connectedAt={social?.instagram_connected_at ?? null}
                  />
                </div>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                  <YouTubeConnect
                    channelId={social?.youtube_channel_id ?? null}
                    channelHandle={social?.youtube_channel_handle ?? null}
                    channelTitle={social?.youtube_channel_title ?? null}
                    verifiedAt={social?.youtube_verified_at ?? null}
                  />
                </div>
                <div style={{ padding: '16px 24px' }} className="row between">
                  <div className="row gap-12">
                    <div className="stat-ico ico-blue" style={{ width: 36, height: 36 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                    </div>
                    <div className="col">
                      <div className="med text-xs">Phone</div>
                      <div className="text-xs faint">{profile?.phone ?? '—'}</div>
                    </div>
                  </div>
                  <span className="badge badge-success">Verified</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
