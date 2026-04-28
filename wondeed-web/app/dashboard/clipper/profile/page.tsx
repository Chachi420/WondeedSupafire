import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import YouTubeConnect from '@/components/clipper/YouTubeConnect'
import InstagramConnect from '@/components/clipper/InstagramConnect'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

// Clipper tier thresholds based on total lifetime earnings
const CLIPPER_TIER_THRESHOLDS: Record<string, { label: string; min: number; max: number; next: string | null; color: string; bg: string; dot: string }> = {
  pro: {
    label: 'Pro',
    min:   0,
    max:   50_000,
    next:  'premium',
    color: 'text-gray-700',
    bg:    'bg-gray-100',
    dot:   'bg-gray-400',
  },
  premium: {
    label: 'Premium',
    min:   50_000,
    max:   500_000,
    next:  'enterprise',
    color: 'text-blue-700',
    bg:    'bg-blue-100',
    dot:   'bg-blue-500',
  },
  enterprise: {
    label: 'Enterprise',
    min:   500_000,
    max:   Infinity,
    next:  null,
    color: 'text-purple-700',
    bg:    'bg-purple-100',
    dot:   'bg-purple-500',
  },
}

function TierBadge({ tier }: { tier: string }) {
  const t = CLIPPER_TIER_THRESHOLDS[tier]
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${t?.bg ?? 'bg-gray-100'} ${t?.color ?? 'text-gray-700'}`}>
      {t?.label ?? tier}
    </span>
  )
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
  const tierInfo      = CLIPPER_TIER_THRESHOLDS[currentTier] ?? CLIPPER_TIER_THRESHOLDS.pro
  const nextTier      = tierInfo.next ? CLIPPER_TIER_THRESHOLDS[tierInfo.next] : null
  const displayName   = profile?.full_name ?? profile?.phone ?? 'Clipper'
  const memberSince   = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—'

  // Tier progress
  let tierProgress = 100
  let toNext = 0
  if (nextTier) {
    const range = tierInfo.max - tierInfo.min
    const earned = Math.max(0, totalLifetime - tierInfo.min)
    tierProgress = Math.min(100, Math.round((earned / range) * 100))
    toNext = Math.max(0, tierInfo.max - totalLifetime)
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your account details, connected platforms, and tier status</p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Left column */}
        <div className="space-y-6">

          {/* Account info */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Account</h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-700">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-400">Member since {memberSince}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Phone</span>
                  <span className="text-sm font-medium text-gray-900">{profile?.phone ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Full Name</span>
                  <span className="text-sm font-medium text-gray-900">{profile?.full_name ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-500">User ID</span>
                  <span className="text-xs font-mono text-gray-400 truncate max-w-[160px]">{user!.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Performance Stats</h2>
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              <div className="px-5 py-5">
                <p className="text-xs text-gray-500 mb-1">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{totalSubs}</p>
              </div>
              <div className="px-5 py-5">
                <p className="text-xs text-gray-500 mb-1">Approved Clips</p>
                <p className="text-2xl font-bold text-emerald-600">{approvedSubs}</p>
              </div>
              <div className="px-5 py-5 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900">{fmt(totalLifetime)}</p>
              </div>
              <div className="px-5 py-5 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Approval Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalSubs > 0 ? `${Math.round((approvedSubs / totalSubs) * 100)}%` : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Tier status */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Clipper Tier</h2>
              <TierBadge tier={currentTier} />
            </div>
            <div className="p-5">
              {nextTier ? (
                <>
                  <p className="text-xs text-gray-500 mb-3">
                    Progress to <span className="font-semibold text-gray-700">{nextTier.label}</span>
                  </p>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400">{fmt(Math.max(0, totalLifetime - tierInfo.min))} earned</span>
                    <span className="text-xs text-gray-400">{fmt(tierInfo.max - tierInfo.min)} needed</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${CLIPPER_TIER_THRESHOLDS[tierInfo.next!]?.dot ?? 'bg-emerald-500'} transition-all`}
                      style={{ width: `${tierProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Earn <span className="font-semibold text-gray-900">{fmt(toNext)}</span> more to unlock{' '}
                    <span className="font-semibold">{nextTier.label}</span> tier and access higher-value campaigns.
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Enterprise Clipper</p>
                  <p className="text-xs text-gray-400 mt-1">You've reached the highest tier — access all campaigns</p>
                </div>
              )}

              {/* Tier perks */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-700 mb-3">Your tier perks</p>
                <ul className="space-y-2">
                  {currentTier === 'pro' && (
                    <>
                      <li className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Access to Pro campaigns
                      </li>
                      <li className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Basic earnings dashboard
                      </li>
                    </>
                  )}
                  {currentTier === 'premium' && (
                    <>
                      <li className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Access to Pro + Premium campaigns
                      </li>
                      <li className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Priority review
                      </li>
                      <li className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Advanced analytics
                      </li>
                    </>
                  )}
                  {currentTier === 'enterprise' && (
                    <>
                      <li className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Access to all campaigns
                      </li>
                      <li className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Dedicated account support
                      </li>
                      <li className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Highest payout rates
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Social accounts */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Connected Accounts</h2>
              <p className="text-xs text-gray-400 mt-0.5">Social platforms verified for clip submissions</p>
            </div>
            <div className="divide-y divide-gray-50">

              {/* Instagram */}
              <div className="px-5 py-4">
                <InstagramConnect
                  username={social?.instagram_username ?? null}
                  connectedAt={social?.instagram_connected_at ?? null}
                />
              </div>

              {/* YouTube */}
              <div className="px-5 py-4">
                <YouTubeConnect
                  channelId={social?.youtube_channel_id ?? null}
                  channelHandle={social?.youtube_channel_handle ?? null}
                  channelTitle={social?.youtube_channel_title ?? null}
                  verifiedAt={social?.youtube_verified_at ?? null}
                />
              </div>

              {/* Phone (verified) */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-xs text-gray-400">{profile?.phone ?? '—'}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
