'use client'

import { useState } from 'react'

export type SubmissionRow = {
  id: string
  clip_url: string
  platform: string
  status: string
  raw_view_count: number | null
  capped_view_count: number | null
  earnings_inr: number | null
  admin_notes: string | null
  created_at: string
  reviewed_at: string | null
}

export type CampaignGroup = {
  campaign_id: string
  title: string
  platform: 'instagram' | 'youtube' | 'both'
  target_platforms: string[]
  rate_per_million_inr: number
  budget_remaining_inr: number
  per_post_view_cap: number
  campaign_status: string
  end_date: string | null
  source_content_url: string | null
  total_views: number
  total_earnings: number
  submissions: SubmissionRow[]
}

type Props = {
  activeGroups: CampaignGroup[]
  completedGroups: CampaignGroup[]
  initialJoinId?: string
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function calcEarnings(cappedViews: number | null, ratePerMillion: number): number | null {
  if (cappedViews == null) return null
  return Math.round((cappedViews / 1_000_000) * ratePerMillion * 100) / 100
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#ec4899',
  youtube:   '#ef4444',
  x:         '#111827',
}

function PlatformDot({ id }: { id: string }) {
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: PLATFORM_COLORS[id] ?? 'var(--fg-muted)', flexShrink: 0, display: 'inline-block' }} />
}

function StatusBadge({ status, isCapped }: { status: string; isCapped?: boolean }) {
  if (status === 'approved' && isCapped) return <span className="badge badge-info">✓ Approved · Capped</span>
  if (status === 'pending')  return <span className="badge badge-warn">Pending Review</span>
  if (status === 'approved') return <span className="badge badge-success">Approved</span>
  if (status === 'rejected') return <span className="badge badge-danger">Rejected</span>
  return <span className="badge badge-neutral">{status}</span>
}

const REJECTION_TIPS: Record<string, string> = {
  'wrong platform': "Make sure you're posting on the platform specified by the campaign.",
  'caption':        'Double-check that you included the mandatory caption and all required hashtags.',
  'quality':        'Re-record or re-edit the clip to meet the quality bar — good lighting and clear audio matter.',
  'duration':       'Ensure your clip matches the required length (e.g. 30s, 60s, 90s).',
  'aspect':         'Post in the correct aspect ratio — most short-form campaigns require 9:16.',
  'watermark':      'Remove any third-party watermarks before reposting.',
  'default':        'Read the campaign brief carefully and re-submit a clip that follows all guidelines.',
}

function rejectionTip(note: string | null): string {
  if (!note) return REJECTION_TIPS.default
  const lower = note.toLowerCase()
  for (const [key, tip] of Object.entries(REJECTION_TIPS)) {
    if (key !== 'default' && lower.includes(key)) return tip
  }
  return REJECTION_TIPS.default
}

function SubmissionRowUI({ sub, ratePerMillion }: { sub: SubmissionRow; ratePerMillion: number }) {
  const [expanded, setExpanded] = useState(sub.status === 'rejected')

  const isCapped = sub.status === 'approved'
    && sub.raw_view_count != null
    && sub.capped_view_count != null
    && sub.raw_view_count > sub.capped_view_count

  const displayEarnings = sub.earnings_inr != null
    ? Number(sub.earnings_inr)
    : calcEarnings(sub.capped_view_count, ratePerMillion)

  return (
    <>
      <tr style={sub.status === 'rejected' ? { background: 'rgba(239,68,68,0.03)' } : {}}>
        <td>
          <a href={sub.clip_url} target="_blank" rel="noopener noreferrer"
            className="mono text-xs" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {sub.clip_url}
          </a>
        </td>
        <td>
          <span className="row gap-6 text-xs">
            <PlatformDot id={sub.platform} />
            <span className="muted" style={{ textTransform: 'capitalize' }}>{sub.platform}</span>
          </span>
        </td>
        <td className="text-xs faint">
          {new Date(sub.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </td>
        <td>
          <div className="row gap-8">
            <StatusBadge status={sub.status} isCapped={isCapped} />
            {sub.status === 'rejected' && (
              <button
                onClick={() => setExpanded(x => !x)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 12, textDecoration: 'underline', padding: 0 }}
              >
                {expanded ? 'Hide' : 'Why?'}
              </button>
            )}
          </div>
        </td>
        <td className="num" style={{ textAlign: 'right' }}>
          <div className="text-xs">
            {sub.capped_view_count != null ? (
              <span className="med">{fmtViews(sub.capped_view_count)}</span>
            ) : (
              <span className="faint">—</span>
            )}
            {isCapped && sub.raw_view_count != null && (
              <span className="faint" style={{ display: 'block', textDecoration: 'line-through' }}>{fmtViews(sub.raw_view_count)}</span>
            )}
          </div>
        </td>
        <td className="num" style={{ textAlign: 'right' }}>
          <span className="text-xs med" style={{ color: displayEarnings != null && displayEarnings > 0 ? 'var(--primary)' : 'var(--fg-muted)' }}>
            {displayEarnings != null && displayEarnings > 0 ? fmt(displayEarnings) : '—'}
          </span>
        </td>
      </tr>

      {sub.status === 'rejected' && expanded && (
        <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
          <td colSpan={6}>
            <div className="row gap-12" style={{ alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16, color: 'var(--danger)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="med text-xs mb-4" style={{ color: 'var(--danger)' }}>Rejection reason</p>
                {sub.admin_notes
                  ? <p className="text-xs mb-8" style={{ color: 'var(--danger)' }}>"{sub.admin_notes}"</p>
                  : <p className="text-xs faint mb-8">No specific reason provided.</p>
                }
                <div className="helper" style={{ marginBottom: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14, color: '#d97706', flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs"><span className="med">How to fix: </span>{rejectionTip(sub.admin_notes)}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function CampaignStatusBadge({ status }: { status: string }) {
  if (status === 'active')    return <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>{status}</span>
  if (status === 'completed') return <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{status}</span>
  return <span className="badge badge-warn" style={{ textTransform: 'capitalize' }}>{status}</span>
}

function CampaignAccordion({ group, defaultOpen }: { group: CampaignGroup; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const submissions = group.submissions

  const isActive       = group.campaign_status === 'active'
  const totalViews     = submissions.reduce((s, sub) => s + Number(sub.capped_view_count ?? 0), 0)
  const totalEarnings  = submissions.reduce((s, sub) => {
    if (sub.earnings_inr != null) return s + Number(sub.earnings_inr)
    return s + (calcEarnings(sub.capped_view_count, group.rate_per_million_inr) ?? 0)
  }, 0)

  const pending  = submissions.filter(s => s.status === 'pending').length
  const approved = submissions.filter(s => s.status === 'approved').length
  const rejected = submissions.filter(s => s.status === 'rejected').length

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
          style={{ width: 16, height: 16, color: 'var(--fg-muted)', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'none' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row gap-8 mb-4">
            <span className="med text-xs" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.title}</span>
            <CampaignStatusBadge status={group.campaign_status} />
          </div>
          <div className="row gap-12 text-xs faint">
            <span>{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</span>
            {pending > 0  && <span style={{ color: 'var(--warning)' }}>{pending} pending</span>}
            {approved > 0 && <span style={{ color: 'var(--success)' }}>{approved} approved</span>}
            {rejected > 0 && <span style={{ color: 'var(--danger)' }}>{rejected} rejected</span>}
          </div>
        </div>

        <div className="row gap-20" style={{ flexShrink: 0, marginRight: 8 }}>
          <div style={{ textAlign: 'right' }}>
            <p className="text-xs faint">Views</p>
            <p className="med text-xs">{fmtViews(totalViews)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="text-xs faint">Earned</p>
            <p className="med text-xs" style={{ color: 'var(--primary)' }}>{fmt(totalEarnings)}</p>
          </div>
        </div>

        <div className="row gap-8" style={{ flexShrink: 0 }}>
          <a
            href={`/dashboard/clipper/campaigns/${group.campaign_id}`}
            onClick={e => e.stopPropagation()}
            className="btn btn-sm btn-secondary"
          >
            Details
          </a>
          {isActive && (
            <a
              href="/dashboard/clipper/submit"
              onClick={e => e.stopPropagation()}
              className="btn btn-sm btn-primary"
            >
              Submit Clips
            </a>
          )}
        </div>
      </button>

      {open && (
        <>
          {submissions.length === 0 ? (
            <div style={{ padding: '40px 28px', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--fg-muted)', fontSize: 14 }}>
              No clips submitted yet for this campaign
              {isActive && (
                <div style={{ marginTop: 12 }}>
                  <a href="/dashboard/clipper/submit" style={{ color: 'var(--primary)', fontSize: 13 }}>
                    Submit clips (up to 10 at once) →
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div style={{ borderTop: '1px solid var(--border)' }} className="tbl-wrap">
              <table className="tbl" style={{ minWidth: 640 }}>
                <thead>
                  <tr>
                    <th style={{ width: 200 }}>Post URL</th>
                    <th>Platform</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Views</th>
                    <th style={{ textAlign: 'right' }}>Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(sub => (
                    <SubmissionRowUI key={sub.id} sub={sub} ratePerMillion={group.rate_per_million_inr} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div className="row gap-16 text-xs faint">
              <span>
                CPM rate: <span className="med" style={{ color: 'var(--fg)' }}>₹{Math.round(group.rate_per_million_inr / 1000)}/1K views</span>
              </span>
              <span>
                Per-post cap: <span className="med" style={{ color: 'var(--fg)' }}>{fmtViews(group.per_post_view_cap)} views</span>
              </span>
              <span>
                Budget left: <span className="med" style={{ color: 'var(--fg)' }}>{fmt(group.budget_remaining_inr)}</span>
              </span>
            </div>
            {group.source_content_url && (
              <a
                href={group.source_content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs"
                style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View source content
              </a>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function MyCampaignsClient({ activeGroups, completedGroups, initialJoinId }: Props) {
  const allCount = activeGroups.length + completedGroups.length

  return (
    <div className="col gap-32">

      {activeGroups.length > 0 && (
        <section>
          <div className="row gap-8 mb-16">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Active ({activeGroups.length})
            </h2>
          </div>
          <div className="col gap-12">
            {activeGroups.map(g => (
              <CampaignAccordion
                key={g.campaign_id}
                group={g}
                defaultOpen={g.campaign_id === initialJoinId || activeGroups.length === 1}
              />
            ))}
          </div>
        </section>
      )}

      {completedGroups.length > 0 && (
        <section>
          <div className="row gap-8 mb-16">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--fg-muted)', display: 'inline-block' }} />
            <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Completed / Paused ({completedGroups.length})
            </h2>
          </div>
          <div className="col gap-12">
            {completedGroups.map(g => (
              <CampaignAccordion key={g.campaign_id} group={g} defaultOpen={false} />
            ))}
          </div>
        </section>
      )}

      {allCount === 0 && (
        <div className="card" style={{ padding: '64px 28px', textAlign: 'center', borderStyle: 'dashed' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 48, height: 48, color: 'var(--fg-muted)', margin: '0 auto 16px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82V15a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
          <p className="med">No campaigns joined yet</p>
          <p className="text-xs faint mt-8">Browse the campaign feed and submit your first clip to start earning</p>
          <a href="/dashboard/clipper/feed" className="btn btn-primary mt-20">Browse Campaigns →</a>
        </div>
      )}
    </div>
  )
}
