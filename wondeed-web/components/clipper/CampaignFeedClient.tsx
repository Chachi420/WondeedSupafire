'use client'

import { useState, useMemo } from 'react'
import { NICHES } from '@/components/client/CampaignForm'

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
  niche: string | null
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
  if (d === null || d > 7) return 'var(--fg-muted)'
  if (d <= 3)              return 'var(--danger)'
  return '#d97706'
}

function contentTypeLabel(c: FeedCampaign): string {
  const parts: string[] = []
  if (c.clip_aspect_ratio)   parts.push(c.clip_aspect_ratio)
  if (c.clip_length_seconds) parts.push(`${c.clip_length_seconds}s`)
  if (c.clip_language)       parts.push(c.clip_language)
  if (c.hook_style)          parts.push(c.hook_style.charAt(0).toUpperCase() + c.hook_style.slice(1))
  return parts.join(' · ') || 'Short-form video'
}

// ── Campaign Card ──────────────────────────────────────────────

function CampaignCard({
  campaign,
  isJoined,
  clipperTier,
}: {
  campaign: FeedCampaign
  isJoined: boolean
  clipperTier: string
}) {

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
    <div className="campaign-card" style={!isEligible ? { opacity: 0.8 } : {}}>
      {campaign.min_clipper_tier === 'enterprise' && <div className="tier-ribbon">★ Enterprise</div>}
      {campaign.min_clipper_tier === 'premium' && <div className="tier-ribbon">Premium</div>}

      <div className="row gap-12">
        <div className="brand-logo" style={{ width: 44, height: 44, fontSize: 16, background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
          {campaign.title.slice(0, 2).toUpperCase()}
        </div>
        <div className="col flex-1" style={{ minWidth: 0 }}>
          <div className="row gap-6 between">
            {campaign.niche && <span className="badge badge-neutral">{NICHES.find(n => n.value === campaign.niche)?.label ?? campaign.niche}</span>}
            {isJoined && <span className="badge badge-success">Joined</span>}
          </div>
          <div className="text-md mt-4 bold" style={{ lineHeight: 1.3 }}>{campaign.title}</div>
        </div>
      </div>

      <div className="row gap-6" style={{ flexWrap: 'wrap' }}>
        {platforms.map(p => (
          <span key={p} className={`platform ${p === 'instagram' ? 'ig' : p === 'youtube' ? 'yt' : ''}`}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </span>
        ))}
        <span className="badge badge-neutral" style={{ marginLeft: 'auto' }}>
          {TIER_LABEL[campaign.min_clipper_tier] ?? campaign.min_clipper_tier}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '10px 0', borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)' }}>
        <div>
          <div className="text-xs faint">CPM Rate</div>
          <div className="med tnum mt-4">₹{cpm} <span className="text-xs faint">/ 1K views</span></div>
        </div>
        <div>
          <div className="text-xs faint">Per-post cap</div>
          <div className="med tnum mt-4">{fmtViews(campaign.per_post_view_cap)} views</div>
        </div>
        <div>
          <div className="text-xs faint">Budget left</div>
          <div className="med tnum mt-4">
            ₹{Math.round(campaign.budget_remaining_inr / 1000)}K{' '}
            <span className="text-xs faint">of ₹{Math.round(campaign.budget_inr / 1000)}K</span>
          </div>
        </div>
        <div>
          <div className="text-xs faint">Time left</div>
          <div className="med tnum mt-4" style={{ color: dlColor }}>{dlLabel}</div>
        </div>
      </div>

      <div className="progress"><div style={{ width: `${budgetPct}%` }} /></div>

      <div className="row gap-8">
        {isJoined ? (
          <a href="/dashboard/clipper/my-campaigns" className="btn btn-secondary flex-1" style={{ justifyContent: 'center' }}>View Submissions</a>
        ) : !isEligible ? (
          <span className="btn btn-secondary flex-1" style={{ justifyContent: 'center', opacity: 0.6, cursor: 'not-allowed' }}>🔒 Locked</span>
        ) : (
          <a href="/dashboard/clipper/submit" className="btn btn-primary flex-1" style={{ justifyContent: 'center' }}>Join Campaign</a>
        )}
        <a href={`/dashboard/clipper/campaigns/${campaign.id}`} className="btn btn-secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <circle cx="12" cy="12" r="9"/><path d="M12 16v-5"/><circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none"/>
          </svg>
        </a>
      </div>
    </div>
  )
}

// ── Filter Bar ─────────────────────────────────────────────────

type SortKey = 'newest' | 'budget_high' | 'deadline'
type PlatformFilter = 'all' | 'instagram' | 'youtube' | 'x'
type TierFilter = 'all' | 'eligible'
type BudgetFilter = 'all' | 'under50k' | '50k_2l' | 'over2l'
type NicheFilter = 'all' | string

function FilterBar({
  platform, setP,
  tier, setT,
  budget, setB,
  niche, setN,
  sort, setS,
}: {
  platform: PlatformFilter; setP: (v: PlatformFilter) => void
  tier: TierFilter;         setT: (v: TierFilter) => void
  budget: BudgetFilter;     setB: (v: BudgetFilter) => void
  niche: NicheFilter;       setN: (v: NicheFilter) => void
  sort: SortKey;            setS: (v: SortKey) => void
}) {
  return (
    <div className="card mb-20" style={{ padding: '14px 18px' }}>
      <div className="row gap-24" style={{ flexWrap: 'wrap' }}>
        <div className="col gap-6">
          <div className="text-xs faint med" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Platform</div>
          <div className="segmented">
            {(['all', 'instagram', 'youtube'] as PlatformFilter[]).map(p => (
              <button key={p} className={`seg-item ${platform === p ? 'active' : ''}`} onClick={() => setP(p)}>
                {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="divider-v" />
        <div className="col gap-6">
          <div className="text-xs faint med" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tier</div>
          <div className="segmented">
            {(['all', 'eligible'] as TierFilter[]).map(t => (
              <button key={t} className={`seg-item ${tier === t ? 'active' : ''}`} onClick={() => setT(t)}>
                {t === 'all' ? 'All' : 'I can join'}
              </button>
            ))}
          </div>
        </div>
        <div className="divider-v" />
        <div className="col gap-6">
          <div className="text-xs faint med" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Niche</div>
          <div className="row gap-6" style={{ flexWrap: 'wrap' }}>
            <button className={`chip ${niche === 'all' ? 'active' : ''}`} onClick={() => setN('all')}>All</button>
            {NICHES.slice(0, 5).map(n => (
              <button key={n.value} className={`chip ${niche === n.value ? 'active' : ''}`} onClick={() => setN(n.value)}>{n.label}</button>
            ))}
          </div>
        </div>
        <div className="col gap-6" style={{ marginLeft: 'auto' }}>
          <div className="text-xs faint med" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sort</div>
          <select className="select" value={sort} onChange={e => setS(e.target.value as SortKey)} style={{ minWidth: 160 }}>
            <option value="newest">Newest</option>
            <option value="budget_high">Highest Budget</option>
            <option value="deadline">Soonest Deadline</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// ── Main Export ────────────────────────────────────────────────

export default function CampaignFeedClient({ campaigns, joinedCampaignIds, clipperTier }: Props) {
  const [platform, setPlatform] = useState<PlatformFilter>('all')
  const [tier, setTier]         = useState<TierFilter>('all')
  const [budget, setBudget]     = useState<BudgetFilter>('all')
  const [niche, setNiche]       = useState<NicheFilter>('all')
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

    // Niche filter
    if (niche !== 'all') {
      list = list.filter(c => c.niche === niche)
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
  }, [campaigns, platform, tier, budget, niche, sort, clipperTierRank])

  const eligibleCount = campaigns.filter(
    c => clipperTierRank >= (TIER_RANK[c.min_clipper_tier] ?? 1)
  ).length

  return (
    <div>
      <FilterBar
        platform={platform} setP={setPlatform}
        tier={tier}         setT={setTier}
        budget={budget}     setB={setBudget}
        niche={niche}       setN={setNiche}
        sort={sort}         setS={setSort}
      />

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--fg-muted)' }}>
          {campaigns.length === 0 ? 'No live campaigns right now. Check back soon.' : (
            <>
              No campaigns match these filters.{' '}
              <button className="btn btn-ghost btn-sm" onClick={() => { setPlatform('all'); setTier('all'); setBudget('all'); setNiche('all') }}>
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="g3">
          {filtered.map(c => (
            <CampaignCard
              key={c.id}
              campaign={c}
              isJoined={joinedCampaignIds.has(c.id)}
              clipperTier={clipperTier}
            />
          ))}
        </div>
      )}
    </div>
  )
}
