import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  const [profileResult, walletResult, subsCountResult, approvedCountResult] = await Promise.all([
    db.from('profiles').select('full_name, phone, subscription_tier, created_at').eq('id', user!.id).single(),
    db.from('wallets').select('total_credited_inr, balance_inr').eq('user_id', user!.id).maybeSingle(),
    db.from('campaign_submissions').select('id', { count: 'exact', head: true }).eq('clipper_id', user!.id),
    db.from('campaign_submissions').select('id', { count: 'exact', head: true }).eq('clipper_id', user!.id).eq('status', 'approved'),
  ])

  const profile       = profileResult.data
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
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Instagram</p>
                    <p className="text-xs text-gray-400">Reels submissions</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full font-medium">
                  Coming soon
                </span>
              </div>

              {/* YouTube */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">YouTube</p>
                    <p className="text-xs text-gray-400">Shorts submissions</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full font-medium">
                  Coming soon
                </span>
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
