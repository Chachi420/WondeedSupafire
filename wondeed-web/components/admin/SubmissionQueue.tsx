'use client'

import { useState, useTransition } from 'react'
import { approveSubmission, rejectSubmission, fetchLiveViewCount } from '@/app/dashboard/admin/actions'

type Submission = {
  id: string
  clip_url: string
  platform: 'instagram' | 'youtube'
  status: string
  created_at: string
  campaigns: { title: string; rate_per_million_inr: number; per_post_view_cap: number; budget_remaining_inr: number } | null
  profiles: { full_name: string | null; phone: string | null } | null
}

function PlatformBadge({ platform }: { platform: string }) {
  if (platform === 'instagram') return <span className="badge badge-warn">IG Reels</span>
  return <span className="badge badge-danger">YT Shorts</span>
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function previewEarnings(views: number, cap: number, rate: number, remaining: number): number {
  const capped = Math.min(views, cap)
  const raw    = Math.floor(capped * rate / 1_000_000)
  return Math.min(raw, remaining)
}

function SubmissionRow({ sub }: { sub: Submission }) {
  const [isPending, startTransition] = useTransition()
  const [mode, setMode]         = useState<'idle' | 'approve' | 'reject'>('idle')
  const [views, setViews]       = useState('')
  const [liveViews, setLiveViews] = useState<number | null>(null)
  const [notes, setNotes]       = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [showDeltaWarn, setShowDeltaWarn] = useState(false)

  const camp = sub.campaigns

  async function handleFetchLiveViews() {
    setFetching(true)
    setError(null)
    try {
      const count = await fetchLiveViewCount(sub.id)
      if (count != null) { setViews(String(count)); setLiveViews(count) }
      else setError('Could not fetch views — paste manually')
    } catch {
      setError('Fetch failed — paste manually')
    } finally {
      setFetching(false)
    }
  }

  function doApprove() {
    const v = parseInt(views, 10)
    setError(null)
    setShowDeltaWarn(false)
    startTransition(async () => {
      try { await approveSubmission(sub.id, v) }
      catch (e: any) { setError(e.message) }
    })
  }

  function submitApprove() {
    const v = parseInt(views, 10)
    if (!v || v < 0) { setError('Enter a valid view count'); return }
    // Guard: if live views were fetched and manual entry deviates >20%, warn
    if (liveViews != null) {
      const delta = Math.abs(v - liveViews) / liveViews
      if (delta > 0.2) { setShowDeltaWarn(true); return }
    }
    doApprove()
  }

  function submitReject() {
    setError(null)
    startTransition(async () => {
      try { await rejectSubmission(sub.id, notes) }
      catch (e: any) { setError(e.message) }
    })
  }

  const parsedViews = parseInt(views, 10)
  const previewInr  = camp && !isNaN(parsedViews) && parsedViews > 0
    ? previewEarnings(parsedViews, Number(camp.per_post_view_cap), Number(camp.rate_per_million_inr), Number(camp.budget_remaining_inr))
    : null
  const needsEscalation = previewInr != null && previewInr > 5000
  const deltaFromLive = liveViews != null && !isNaN(parsedViews) && parsedViews > 0
    ? Math.abs(parsedViews - liveViews) / liveViews
    : null

  return (
    <>
      <tr className={isPending ? 'opacity-50 pointer-events-none' : ''}>
        <td>
          <p className="med text-xs">{camp?.title ?? '—'}</p>
          <p className="text-xs faint mt-4">{sub.profiles?.full_name ?? sub.profiles?.phone ?? '—'}</p>
        </td>
        <td>
          <a
            href={sub.clip_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs mono"
            style={{ color: 'var(--primary)', textDecoration: 'none', display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={sub.clip_url}
          >
            {sub.clip_url.replace(/^https?:\/\//, '').substring(0, 40)}…
          </a>
        </td>
        <td><PlatformBadge platform={sub.platform} /></td>
        <td className="text-xs muted">{camp ? fmt(Number(camp.budget_remaining_inr)) : '—'}</td>
        <td className="text-xs faint">{new Date(sub.created_at).toLocaleDateString('en-IN')}</td>
        <td>
          {mode === 'idle' && (
            <div className="row gap-8">
              <button onClick={() => setMode('approve')} className="btn btn-sm btn-success">Enter Views</button>
              <button onClick={() => setMode('reject')} className="btn btn-sm btn-danger">Reject</button>
            </div>
          )}
          {mode !== 'idle' && (
            <button onClick={() => { setMode('idle'); setError(null) }} className="text-xs faint" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              ← Cancel
            </button>
          )}
        </td>
      </tr>

      {mode === 'approve' && (
        <tr>
          <td colSpan={6} style={{ background: 'rgba(16,185,129,0.05)', borderBottom: '1px solid rgba(16,185,129,0.15)' }}>
            <div className="col gap-12" style={{ padding: '8px 0' }}>
              <div className="row gap-16" style={{ alignItems: 'flex-start' }}>
                <div className="col gap-8" style={{ flex: 1 }}>
                  <label className="field-label">Actual view count (from platform analytics)</label>
                  <div className="row gap-12 flex-wrap">
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 250000"
                      value={views}
                      onChange={(e) => { setViews(e.target.value); setShowDeltaWarn(false) }}
                      className="input"
                      style={{ width: 160 }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleFetchLiveViews}
                      disabled={fetching || isPending}
                      className="btn btn-sm btn-secondary"
                    >
                      {fetching ? 'Fetching…' : '⟳ Fetch Live Views'}
                    </button>
                    {liveViews != null && (
                      <span className="text-xs faint">API: {new Intl.NumberFormat('en-IN').format(liveViews)} views</span>
                    )}
                  </div>
                  {previewInr !== null && (
                    <div className="row gap-12">
                      <span className="text-xs">
                        <span className="faint">Clipper earns: </span>
                        <span className="med" style={{ color: 'var(--success)' }}>{fmt(previewInr)}</span>
                        {camp && parsedViews > Number(camp.per_post_view_cap) && (
                          <span className="faint"> (capped at {new Intl.NumberFormat('en-IN').format(Number(camp.per_post_view_cap))})</span>
                        )}
                      </span>
                      {needsEscalation && (
                        <span className="badge badge-warn" style={{ fontSize: 11 }}>
                          ⚠ Escalation required — &gt;₹5,000
                        </span>
                      )}
                      {deltaFromLive != null && deltaFromLive > 0.2 && (
                        <span className="badge badge-danger" style={{ fontSize: 11 }}>
                          {Math.round(deltaFromLive * 100)}% deviation from API
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={submitApprove}
                  disabled={!views || isPending}
                  className="btn btn-success"
                  style={{ marginTop: 24 }}
                >
                  {isPending ? 'Saving…' : needsEscalation ? '⚠ Escalate & Credit' : 'Confirm & Credit'}
                </button>
              </div>

              {/* Delta deviation warning dialog */}
              {showDeltaWarn && liveViews != null && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px' }}>
                  <p className="med text-xs" style={{ color: 'var(--danger)', marginBottom: 6 }}>
                    ⚠ Manual entry differs {Math.round((deltaFromLive ?? 0) * 100)}% from API count ({new Intl.NumberFormat('en-IN').format(liveViews)} views)
                  </p>
                  <p className="text-xs faint" style={{ marginBottom: 10 }}>
                    You entered {new Intl.NumberFormat('en-IN').format(parsedViews)}. This is a large deviation from what the API returned. Are you sure this is correct?
                  </p>
                  <div className="row gap-8">
                    <button onClick={doApprove} disabled={isPending} className="btn btn-sm btn-danger">
                      Yes, use {new Intl.NumberFormat('en-IN').format(parsedViews)} views
                    </button>
                    <button onClick={() => { setViews(String(liveViews)); setShowDeltaWarn(false) }} className="btn btn-sm btn-secondary">
                      Use API count instead
                    </button>
                  </div>
                </div>
              )}

              {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
            </div>
          </td>
        </tr>
      )}

      {mode === 'reject' && (
        <tr>
          <td colSpan={6} style={{ background: 'rgba(239,68,68,0.05)', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="row gap-16" style={{ padding: '4px 0', alignItems: 'flex-start' }}>
              <div className="col gap-8" style={{ flex: 1 }}>
                <label className="field-label">Reason for rejection (shown to clipper)</label>
                <input
                  type="text"
                  placeholder="e.g. Clip does not match campaign brief"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input"
                  autoFocus
                />
              </div>
              <button
                onClick={submitReject}
                disabled={isPending}
                className="btn btn-danger"
                style={{ background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)', marginTop: 20 }}
              >
                {isPending ? 'Saving…' : 'Confirm Reject'}
              </button>
            </div>
            {error && <p className="text-xs mt-8" style={{ color: 'var(--danger)' }}>{error}</p>}
          </td>
        </tr>
      )}
    </>
  )
}

export default function SubmissionQueue({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return (
      <div style={{ padding: '64px 28px', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 24, height: 24, color: 'var(--success)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="med text-xs">Queue empty</p>
        <p className="text-xs faint mt-4">No pending submissions to review</p>
      </div>
    )
  }

  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>Campaign / Clipper</th>
            <th>Clip URL</th>
            <th>Platform</th>
            <th>Budget Left</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => <SubmissionRow key={s.id} sub={s} />)}
        </tbody>
      </table>
    </div>
  )
}
