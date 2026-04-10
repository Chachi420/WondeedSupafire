'use client'

import { useState, useMemo, useTransition } from 'react'
import { submitClip } from '@/app/dashboard/clipper/actions'

// ── Types ──────────────────────────────────────────────────────

export type FeedCampaign = {
  id: string
  title: string
  description: string | null
  platform: 'instagram' | 'youtube' | 'both'
  target_platforms: string[]
  budget_remaining_inr: number
  budget_inr: number
  rate_per_million_inr: number
  per_post_view_cap: number
  end_date: string | null
  min_clipper_tier: string
  clip_aspect_ratio: string | null
  clip_length_seconds: number | null
  clip_language: string | null
  hook_style: string | null
  min_views_for_payout: number | null
  source_content_url: string | null
  created_at: string
}

type Props = {
  campaigns: FeedCampaign[]
  joinedCampaignIds: Set<string>
  clipperTier: string
}

// ── Constants ──────────────────────────────────────────────────

const TIER_RANK: Record<string, number> = { pro: 1, premium: 2, enterprise: 3 }

const TIER_LABEL: Record<string, string> = {
  pro:        'Tier 1 – Pro',
  premium:    'Tier 2 – Premium',
  enterprise: 'Tier 3 – Enterprise',
}

const TIER_BADGE: Record<string, string> = {
  pro:        'bg-gray-100 text-gray-600',
  premium:    'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
}

// ── Helpers ────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function daysLeft(endDate: string | null): number | null {
  if (!endDate) return null
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000)
}

function deadlineLabel(endDate: string | null): string {
  const d = daysLeft(endDate)
  if (d === null) return 'No deadline'
  if (d < 0)      return 'Expired'
  if (d === 0)    return 'Ends today'
  if (d === 1)    return '1 day left'
  if (d <= 7)     return `${d} days left`
  if (d <= 30)    return `${Math.ceil(d / 7)} weeks left`
  return `${Math.ceil(d / 30)} months left`
}

function deadlineColor(endDate: string | null): string {
  const d = daysLeft(endDate)
  if (d === null || d > 7) return 'text-gray-500'
  if (d <= 3)              return 'text-red-600'
  return 'text-amber-600'
}

function contentTypeLabel(c: FeedCampaign): string {
  const parts: string[] = []
  if (c.clip_aspect_ratio)   parts.push(c.clip_aspect_ratio)
  if (c.clip_length_seconds) parts.push(`${c.clip_length_seconds}s`)
  if (c.clip_language)       parts.push(c.clip_language)
  if (c.hook_style)          parts.push(c.hook_style.charAt(0).toUpperCase() + c.hook_style.slice(1))
  return parts.join(' · ') || 'Short-form video'
}

// ── Platform Icons ─────────────────────────────────────────────

function PlatformIcon({ id, size = 'md' }: { id: string; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  if (id === 'instagram') return (
    <svg className={sz} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
  if (id === 'youtube') return (
    <svg className={sz} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
  if (id === 'moj') return (
    <svg className={sz} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10"/>
      <path fill="white" d="M10 8l6 4-6 4V8z"/>
    </svg>
  )
  if (id === 'josh') return (
    <svg className={sz} viewBox="0 0 24 24" fill="currentColor">
      <rect width="24" height="24" rx="6"/>
      <path fill="white" d="M9 7l8 5-8 5V7z"/>
    </svg>
  )
  return null
}

const PLATFORM_COLOR: Record<string, string> = {
  instagram: 'text-pink-500',
  youtube:   'text-red-500',
  moj:       'text-orange-500',
  josh:      'text-blue-500',
}

// ── Join Flow (inline per card) ────────────────────────────────

function JoinFlow({
  campaign,
  onJoined,
}: {
  campaign: FeedCampaign
  onJoined: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [url, setUrl]       = useState('')
  const [platform, setPlatform] = useState<'instagram' | 'youtube'>(
    campaign.platform === 'youtube' ? 'youtube' : 'instagram'
  )
  const [error, setError]   = useState<string | null>(null)
  const [done, setDone]     = useState(false)

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Clip submitted for review!
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.set('campaign_id', campaign.id)
    fd.set('platform', platform)
    fd.set('clip_url', url.trim())
    startTransition(async () => {
      try {
        await submitClip(fd)
        setDone(true)
        onJoined()
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
      {/* Source content URL */}
      {campaign.source_content_url && (
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2.5">
          <p className="text-xs font-medium text-gray-600 mb-1">Source Content</p>
          <a
            href={campaign.source_content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-600 hover:underline break-all"
          >
            {campaign.source_content_url}
          </a>
        </div>
      )}

      {/* Platform selector if campaign accepts both */}
      {campaign.platform === 'both' && (
        <div className="flex gap-2">
          {(['instagram', 'youtube'] as const).map(p => (
            <label key={p} className={`flex-1 flex items-center justify-center gap-1.5 py-2 border rounded-lg cursor-pointer text-xs font-medium transition-colors capitalize ${
              platform === p
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
              <input type="radio" className="sr-only" checked={platform === p} onChange={() => setPlatform(p)} />
              {p}
            </label>
          ))}
        </div>
      )}

      {/* URL input + submit */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          required
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder={platform === 'youtube' ? 'https://youtube.com/shorts/…' : 'https://instagram.com/reel/…'}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={isPending || !url.trim()}
          className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg disabled:opacity-40 transition-colors"
        >
          {isPending ? '…' : 'Submit'}
        </button>
      </form>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      <p className="text-xs text-gray-400">
        Paste your live clip URL · admin reviews within 48 hours
      </p>
    </div>
  )
}

// ── Campaign Card ──────────────────────────────────────────────

function CampaignCard({
  campaign,
  isJoined: initialJoined,
  clipperTier,
}: {
  campaign: FeedCampaign
  isJoined: boolean
  clipperTier: string
}) {
  const [showJoin, setShowJoin] = useState(false)
  const [isJoined, setIsJoined] = useState(initialJoined)

  const tierRank    = TIER_RANK[clipperTier] ?? 1
  const minTierRank = TIER_RANK[campaign.min_clipper_tier] ?? 1
  const isEligible  = tierRank >= minTierRank

  const dlLabel = deadlineLabel(campaign.end_date)
  const dlColor = deadlineColor(campaign.end_date)

  // Budget bar: show relative to original budget_inr
  const budgetPct = campaign.budget_inr > 0
    ? Math.min(100, Math.round((campaign.budget_remaining_inr / campaign.budget_inr) * 100))
    : 0

  // CPM = rate_per_million_inr / 1000
  const cpm = Math.round(Number(campaign.rate_per_million_inr) / 1000)

  // Which platforms does this campaign accept (for icons)
  const platforms: string[] = campaign.target_platforms?.length
    ? campaign.target_platforms
    : campaign.platform === 'both'
      ? ['instagram', 'youtube']
      : [campaign.platform]

  return (
    <div className={`bg-white rounded-xl border flex flex-col transition-shadow hover:shadow-md ${
      !isEligible ? 'border-gray-200 opacity-80' : 'border-gray-200'
    }`}>

      {/* Card header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
            {campaign.title}
          </h3>
          {isJoined ? (
            <span className="shrink-0 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
              Joined
            </span>
          ) : !isEligible ? (
            <span className="shrink-0 text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Locked
            </span>
          ) : null}
        </div>

        {/* Platform icons row */}
        <div className="flex items-center gap-2 mb-3">
          {platforms.map(p => (
            <span key={p} className={`${PLATFORM_COLOR[p] ?? 'text-gray-400'}`} title={p.charAt(0).toUpperCase() + p.slice(1)}>
              <PlatformIcon id={p} size="sm" />
            </span>
          ))}
          <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded ${TIER_BADGE[campaign.min_clipper_tier] ?? 'bg-gray-100 text-gray-600'}`}>
            {TIER_LABEL[campaign.min_clipper_tier] ?? campaign.min_clipper_tier}
          </span>
        </div>

        {/* Content type */}
        <p className="text-xs text-gray-400 mb-4">{contentTypeLabel(campaign)}</p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg px-3 py-2.5">
            <p className="text-xs text-gray-400 mb-0.5">CPM Rate</p>
            <p className="text-sm font-bold text-gray-900">₹{cpm} / 1K views</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2.5">
            <p className="text-xs text-gray-400 mb-0.5">View Cap / Post</p>
            <p className="text-sm font-bold text-gray-900">{fmtViews(campaign.per_post_view_cap)}</p>
          </div>
        </div>
      </div>

      {/* Budget remaining */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">Budget Remaining</span>
          <span className="text-xs font-semibold text-gray-900">{fmt(campaign.budget_remaining_inr)}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${budgetPct < 20 ? 'bg-red-400' : budgetPct < 50 ? 'bg-amber-400' : 'bg-emerald-500'}`}
            style={{ width: `${budgetPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{budgetPct}% remaining</p>
      </div>

      {/* Deadline */}
      <div className="px-5 pb-4 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={`text-xs font-medium ${dlColor}`}>{dlLabel}</span>
        {campaign.min_views_for_payout != null && campaign.min_views_for_payout > 0 && (
          <>
            <span className="text-gray-200 mx-1">·</span>
            <span className="text-xs text-gray-400">Min {fmtViews(campaign.min_views_for_payout)} views</span>
          </>
        )}
      </div>

      {/* Footer CTA */}
      <div className="mt-auto px-5 pb-5 pt-1">
        {isJoined ? (
          <a
            href="/dashboard/clipper/my-campaigns"
            className="block w-full py-2.5 text-center text-sm font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            View My Submissions
          </a>
        ) : !isEligible ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center">
            <p className="text-xs font-medium text-gray-600">
              Requires {TIER_LABEL[campaign.min_clipper_tier]}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Your tier: <span className="font-medium">{TIER_LABEL[clipperTier] ?? clipperTier}</span>
            </p>
            <a
              href="/dashboard/clipper/profile"
              className="inline-block mt-2 text-xs font-semibold text-brand-600 hover:underline"
            >
              Upgrade tier to join →
            </a>
          </div>
        ) : showJoin ? null : (
          <button
            onClick={() => setShowJoin(true)}
            className="w-full py-2.5 text-center text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            Join Campaign →
          </button>
        )}
      </div>

      {/* Inline join flow (reveals source URL + submit form) */}
      {showJoin && !isJoined && isEligible && (
        <JoinFlow
          campaign={campaign}
          onJoined={() => {
            setIsJoined(true)
            setShowJoin(false)
          }}
        />
      )}
    </div>
  )
}

// ── Filter Bar ─────────────────────────────────────────────────

type SortKey = 'newest' | 'budget_high' | 'deadline'
type PlatformFilter = 'all' | 'instagram' | 'youtube' | 'moj' | 'josh'
type TierFilter = 'all' | 'eligible'
type BudgetFilter = 'all' | 'under50k' | '50k_2l' | 'over2l'

function FilterBar({
  platform, setP,
  tier, setT,
  budget, setB,
  sort, setS,
}: {
  platform: PlatformFilter; setP: (v: PlatformFilter) => void
  tier: TierFilter;         setT: (v: TierFilter) => void
  budget: BudgetFilter;     setB: (v: BudgetFilter) => void
  sort: SortKey;            setS: (v: SortKey) => void
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-3.5 flex flex-wrap items-center gap-4 mb-6">

      {/* Platform */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 shrink-0">Platform</span>
        <div className="flex gap-1">
          {([
            { value: 'all',       label: 'All'       },
            { value: 'instagram', label: 'Instagram' },
            { value: 'youtube',   label: 'YouTube'   },
            { value: 'moj',       label: 'Moj'       },
            { value: 'josh',      label: 'Josh'      },
          ] as { value: PlatformFilter; label: string }[]).map(opt => (
            <button
              key={opt.value}
              onClick={() => setP(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                platform === opt.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-5 w-px bg-gray-200 hidden sm:block" />

      {/* Tier */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 shrink-0">Tier</span>
        <div className="flex gap-1">
          {([
            { value: 'all',      label: 'All'         },
            { value: 'eligible', label: 'I can join'  },
          ] as { value: TierFilter; label: string }[]).map(opt => (
            <button
              key={opt.value}
              onClick={() => setT(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                tier === opt.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-5 w-px bg-gray-200 hidden sm:block" />

      {/* Budget */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 shrink-0">Budget</span>
        <div className="flex gap-1">
          {([
            { value: 'all',      label: 'All'         },
            { value: 'under50k', label: 'Under ₹50K'  },
            { value: '50k_2l',   label: '₹50K–₹2L'   },
            { value: 'over2l',   label: '₹2L+'        },
          ] as { value: BudgetFilter; label: string }[]).map(opt => (
            <button
              key={opt.value}
              onClick={() => setB(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                budget === opt.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort — pushed right */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs font-medium text-gray-500 shrink-0">Sort</span>
        <select
          value={sort}
          onChange={e => setS(e.target.value as SortKey)}
          className="pl-3 pr-7 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="newest">Newest</option>
          <option value="budget_high">Highest Budget</option>
          <option value="deadline">Soonest Deadline</option>
        </select>
      </div>
    </div>
  )
}

// ── Main Export ────────────────────────────────────────────────

export default function CampaignFeedClient({ campaigns, joinedCampaignIds, clipperTier }: Props) {
  const [platform, setPlatform] = useState<PlatformFilter>('all')
  const [tier, setTier]         = useState<TierFilter>('all')
  const [budget, setBudget]     = useState<BudgetFilter>('all')
  const [sort, setSort]         = useState<SortKey>('newest')

  const clipperTierRank = TIER_RANK[clipperTier] ?? 1

  const filtered = useMemo(() => {
    let list = [...campaigns]

    // Platform filter
    if (platform !== 'all') {
      list = list.filter(c => {
        const targets = c.target_platforms?.length ? c.target_platforms : [c.platform]
        return targets.includes(platform) || c.platform === 'both'
      })
    }

    // Tier filter
    if (tier === 'eligible') {
      list = list.filter(c => clipperTierRank >= (TIER_RANK[c.min_clipper_tier] ?? 1))
    }

    // Budget filter
    if (budget === 'under50k') {
      list = list.filter(c => c.budget_remaining_inr < 50_000)
    } else if (budget === '50k_2l') {
      list = list.filter(c => c.budget_remaining_inr >= 50_000 && c.budget_remaining_inr < 200_000)
    } else if (budget === 'over2l') {
      list = list.filter(c => c.budget_remaining_inr >= 200_000)
    }

    // Sort
    if (sort === 'budget_high') {
      list.sort((a, b) => b.budget_remaining_inr - a.budget_remaining_inr)
    } else if (sort === 'deadline') {
      list.sort((a, b) => {
        const da = a.end_date ? new Date(a.end_date).getTime() : Infinity
        const db2 = b.end_date ? new Date(b.end_date).getTime() : Infinity
        return da - db2
      })
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return list
  }, [campaigns, platform, tier, budget, sort, clipperTierRank])

  const eligibleCount = campaigns.filter(
    c => clipperTierRank >= (TIER_RANK[c.min_clipper_tier] ?? 1)
  ).length

  return (
    <div>
      {/* Stats row */}
      <div className="flex items-center gap-6 mb-6 text-sm text-gray-500">
        <span>
          <span className="font-semibold text-gray-900">{campaigns.length}</span> live campaign{campaigns.length !== 1 ? 's' : ''}
        </span>
        <span>
          <span className="font-semibold text-emerald-600">{eligibleCount}</span> you can join
        </span>
        <span>
          <span className="font-semibold text-gray-900">{joinedCampaignIds.size}</span> joined
        </span>
      </div>

      {/* Filter bar */}
      <FilterBar
        platform={platform} setP={setPlatform}
        tier={tier}         setT={setTier}
        budget={budget}     setB={setBudget}
        sort={sort}         setS={setSort}
      />

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {campaigns.length === 0 ? (
            <>
              <p className="text-gray-600 font-semibold">No live campaigns right now</p>
              <p className="text-sm text-gray-400 mt-1">Check back soon — new campaigns are added regularly</p>
            </>
          ) : (
            <>
              <p className="text-gray-600 font-semibold">No campaigns match your filters</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting the filters above</p>
              <button
                onClick={() => { setPlatform('all'); setTier('all'); setBudget('all') }}
                className="mt-4 text-sm text-emerald-600 underline hover:no-underline"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-3 gap-5">
            {filtered.map(c => (
              <CampaignCard
                key={c.id}
                campaign={c}
                isJoined={joinedCampaignIds.has(c.id)}
                clipperTier={clipperTier}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
