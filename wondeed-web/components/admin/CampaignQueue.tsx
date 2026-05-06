'use client'

import { useState, useTransition } from 'react'
import { approveCampaign, rejectCampaign } from '@/app/dashboard/admin/actions'
import { NICHES } from '@/components/client/CampaignForm'

type Campaign = {
  id: string
  title: string
  description: string | null
  budget_inr: number
  platform: string
  start_date: string | null
  end_date: string | null
  created_at: string
  per_post_view_cap: number
  niche: string | null
  profiles: { full_name: string | null; phone: string | null } | null
}

function PlatformBadge({ platform }: { platform: string }) {
  const cls: Record<string, string> = {
    instagram: 'badge-warn',
    youtube:   'badge-danger',
    both:      'badge-indigo',
  }
  return <span className={`badge ${cls[platform] ?? 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>{platform}</span>
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const [isPending, startTransition] = useTransition()
  const [expanded, setExpanded]      = useState(false)
  const [error, setError]            = useState<string | null>(null)
  const [cpm, setCpm]                = useState('')

  const nicheInfo    = NICHES.find(n => n.value === campaign.niche)
  const suggestedCpm = nicheInfo?.suggestedCpm ?? null

  function handleApprove() {
    const rate = parseInt(cpm, 10)
    if (!rate || rate <= 0) { setError('Enter a valid CPM rate (₹ per million views) before approving'); return }
    setError(null)
    startTransition(async () => {
      try { await approveCampaign(campaign.id, rate) }
      catch (e: any) { setError(e.message) }
    })
  }

  function handleReject() {
    setError(null)
    startTransition(async () => {
      try { await rejectCampaign(campaign.id) }
      catch (e: any) { setError(e.message) }
    })
  }

  return (
    <>
      <tr className={isPending ? 'opacity-50' : ''}>
        <td>
          <button
            onClick={() => setExpanded(v => !v)}
            className="med text-xs"
            style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--fg)' }}
          >
            {campaign.title}
          </button>
          <div className="text-xs faint mt-4">{campaign.profiles?.full_name ?? campaign.profiles?.phone ?? 'Unknown client'}</div>
          {nicheInfo && <div className="text-xs mt-4" style={{ color: 'var(--primary)' }}>{nicheInfo.label}</div>}
        </td>
        <td><span className="med text-xs">{fmt(campaign.budget_inr)}</span></td>
        <td className="text-xs muted">{fmtViews(campaign.per_post_view_cap)} cap/post</td>
        <td><PlatformBadge platform={campaign.platform} /></td>
        <td className="text-xs muted">{campaign.start_date ?? '—'} → {campaign.end_date ?? '—'}</td>
        <td style={{ minWidth: 260 }}>
          <div className="col gap-8">
            <div className="row gap-8">
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--fg-muted)', fontWeight: 600 }}>₹</span>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  placeholder={suggestedCpm ? String(suggestedCpm) : '10000'}
                  value={cpm}
                  onChange={e => { setCpm(e.target.value); setError(null) }}
                  className="input"
                  style={{ paddingLeft: 20, paddingTop: 6, paddingBottom: 6, fontSize: 12 }}
                />
              </div>
              <span className="text-xs faint" style={{ whiteSpace: 'nowrap' }}>/M views</span>
            </div>
            {suggestedCpm && !cpm && (
              <button
                type="button"
                onClick={() => setCpm(String(suggestedCpm))}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary)', fontSize: 12, textAlign: 'left' }}
              >
                Use suggested ₹{suggestedCpm.toLocaleString('en-IN')}
              </button>
            )}
            <div className="row gap-8">
              <button onClick={handleApprove} disabled={isPending} className="btn btn-primary btn-sm">Approve &amp; Set CPM</button>
              <button onClick={handleReject} disabled={isPending} className="btn btn-sm btn-danger">Reject</button>
            </div>
          </div>
          {error && <p className="text-xs mt-4" style={{ color: 'var(--danger)' }}>{error}</p>}
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={6} style={{ background: 'var(--surface-2)', fontSize: 12 }}>
            <span className="med">Description: </span>
            <span className="muted">{campaign.description ?? <em>No description provided</em>}</span>
          </td>
        </tr>
      )}
    </>
  )
}

export default function CampaignQueue({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) {
    return (
      <div style={{ padding: '64px 28px', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 24, height: 24, color: 'var(--success)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="med text-xs">All clear</p>
        <p className="text-xs faint mt-4">No campaigns pending approval</p>
      </div>
    )
  }

  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>Campaign / Client / Niche</th>
            <th>Budget</th>
            <th>Post Cap</th>
            <th>Platform</th>
            <th>Dates</th>
            <th>Set CPM &amp; Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => <CampaignRow key={c.id} campaign={c} />)}
        </tbody>
      </table>
    </div>
  )
}
