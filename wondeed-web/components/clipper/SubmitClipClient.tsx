'use client'

import { useState, useTransition } from 'react'
import { submitMultipleClips } from '@/app/dashboard/clipper/actions'
import { NICHES } from '@/components/client/CampaignForm'

type Campaign = {
  id: string
  title: string
  platform: string
  rate_per_million_inr: number
  budget_remaining_inr: number
  end_date: string | null
  source_content_url: string | null
  niche: string | null
}

type ClipResult = { url: string; success: boolean; viewCount?: number | null; error?: string }

const MAX_CLIPS = 10

export default function SubmitClipClient({ campaigns }: { campaigns: Campaign[] }) {
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? '')
  const [platform, setPlatform]     = useState<'instagram' | 'youtube'>('instagram')
  const [urls, setUrls]             = useState<string[]>([''])
  const [isPending, startTransition] = useTransition()
  const [error, setError]           = useState<string | null>(null)
  const [results, setResults]       = useState<ClipResult[] | null>(null)

  const selected = campaigns.find(c => c.id === campaignId)
  const showPlatformToggle = selected?.platform === 'both'

  function handleCampaignChange(id: string) {
    setCampaignId(id)
    const c = campaigns.find(x => x.id === id)
    if (c?.platform === 'youtube') setPlatform('youtube')
    else if (c?.platform === 'instagram') setPlatform('instagram')
    else setPlatform('instagram')
  }

  function setUrl(index: number, value: string) {
    setUrls(prev => prev.map((u, i) => i === index ? value : u))
  }

  function addUrl() {
    if (urls.length < MAX_CLIPS) setUrls(prev => [...prev, ''])
  }

  function removeUrl(index: number) {
    if (urls.length === 1) { setUrls(['']); return }
    setUrls(prev => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const filled = urls.map(u => u.trim()).filter(Boolean)
    if (!filled.length) { setError('Add at least one clip URL'); return }

    startTransition(async () => {
      try {
        const res = await submitMultipleClips(campaignId, platform, filled)
        setResults(res)
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  function reset() {
    setUrls([''])
    setResults(null)
    setError(null)
  }

  if (campaigns.length === 0) {
    return (
      <div className="card" style={{ padding: '64px 28px', textAlign: 'center', borderStyle: 'dashed' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 40, height: 40, color: 'var(--fg-muted)', margin: '0 auto 12px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="med text-xs">No active campaigns right now</p>
        <p className="text-xs faint mt-4">Check back soon or ask an admin to approve campaigns</p>
      </div>
    )
  }

  if (results) {
    const successCount = results.filter(r => r.success).length
    const failCount    = results.length - successCount
    return (
      <div className="card">
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          background: successCount === results.length ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
        }}>
          <p className="med">{successCount} of {results.length} clip{results.length > 1 ? 's' : ''} submitted</p>
          <p className="text-xs muted mt-4">
            {failCount > 0 ? `${failCount} failed — fix the URLs and resubmit` : 'Admin will review within 48 hours'}
          </p>
        </div>

        <div style={{ borderBottom: '1px solid var(--border)' }}>
          {results.map((r, i) => (
            <div key={i} className="row gap-12" style={{ padding: '14px 24px', borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: r.success ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              }}>
                {r.success
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} style={{ width: 12, height: 12, color: 'var(--success)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} style={{ width: 12, height: 12, color: 'var(--danger)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                }
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="text-xs faint mono" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.url}</p>
                {r.success
                  ? <p className="text-xs mt-4" style={{ color: 'var(--primary)' }}>
                      Pending review{r.viewCount != null ? ` · ${r.viewCount.toLocaleString('en-IN')} views` : ''}
                    </p>
                  : <p className="text-xs mt-4" style={{ color: 'var(--danger)' }}>{r.error}</p>
                }
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '20px 24px' }}>
          <button onClick={reset} className="btn btn-primary">Submit more clips</button>
        </div>
      </div>
    )
  }

  const filledCount = urls.filter(u => u.trim()).length
  const placeholder = platform === 'youtube'
    ? 'https://youtube.com/shorts/… or youtube.com/watch?v=…'
    : 'https://instagram.com/reel/…'

  return (
    <form onSubmit={handleSubmit} className="col gap-16">

      {/* Campaign selector */}
      <div className="card">
        <div className="card-head">
          <h2>Select Campaign</h2>
        </div>
        <div style={{ padding: '16px 20px', maxHeight: 280, overflowY: 'auto' }} className="col gap-8">
          {campaigns.map(c => (
            <label
              key={c.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                borderRadius: 8, border: `1px solid ${campaignId === c.id ? 'var(--primary)' : 'var(--border)'}`,
                background: campaignId === c.id ? 'rgba(var(--primary-rgb, 163,230,53),0.06)' : 'var(--surface)',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="campaign"
                value={c.id}
                checked={campaignId === c.id}
                onChange={() => handleCampaignChange(c.id)}
                style={{ marginTop: 2, accentColor: 'var(--primary)' }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="med text-xs" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</p>
                <div className="row gap-12 mt-4">
                  <span className="text-xs faint" style={{ textTransform: 'capitalize' }}>{c.platform}</span>
                  <span className="text-xs" style={{ color: 'var(--primary)' }}>₹{Number(c.rate_per_million_inr).toLocaleString('en-IN')}/M views</span>
                  {c.niche && (
                    <span className="text-xs" style={{ color: 'var(--primary)' }}>
                      {NICHES.find(n => n.value === c.niche)?.label ?? c.niche}
                    </span>
                  )}
                  {c.end_date && (
                    <span className="text-xs faint">
                      Ends {new Date(c.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Source content */}
      {selected?.source_content_url && (
        <div className="card">
          <div style={{ padding: '12px 20px', background: 'var(--surface-2)' }}>
            <p className="text-xs faint mb-4">Source Content to Clip</p>
            <a href={selected.source_content_url} target="_blank" rel="noopener noreferrer"
              className="text-xs mono" style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>
              {selected.source_content_url}
            </a>
          </div>
        </div>
      )}

      {/* Platform toggle */}
      {showPlatformToggle && (
        <div className="card">
          <div style={{ padding: '16px 20px' }}>
            <p className="field-label mb-12">Platform</p>
            <div className="segmented">
              {(['instagram', 'youtube'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`seg-item${platform === p ? ' active' : ''}`}
                  style={{ textTransform: 'capitalize', flex: 1 }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Multi-URL inputs */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Clip URLs</h2>
            <div className="sub">up to {MAX_CLIPS} — {urls.length} added</div>
          </div>
        </div>
        <div style={{ padding: '16px 20px' }} className="col gap-8">
          {urls.map((url, i) => (
            <div key={i} className="row gap-8">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(i, e.target.value)}
                placeholder={placeholder}
                className="input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => removeUrl(i)}
                className="btn btn-sm btn-ghost"
                title="Remove"
                style={{ width: 32, height: 32, padding: 0, flexShrink: 0 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {urls.length < MAX_CLIPS && (
            <button
              type="button"
              onClick={addUrl}
              className="row gap-8"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 13, fontWeight: 500, padding: '4px 0' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 14, height: 14 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add another clip
            </button>
          )}

          <p className="text-xs faint">
            {platform === 'instagram'
              ? 'Paste public Instagram Reel URLs — views are fetched automatically'
              : 'Paste public YouTube Shorts or video URLs — views are fetched automatically'}
          </p>
        </div>
      </div>

      {error && (
        <div className="helper" style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !filledCount || !campaignId}
        className="btn btn-primary btn-block btn-lg"
      >
        {isPending
          ? `Submitting ${filledCount} clip${filledCount > 1 ? 's' : ''}…`
          : `Submit ${filledCount || ''} Clip${filledCount !== 1 ? 's' : ''} →`}
      </button>
    </form>
  )
}
