'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { submitClip } from '@/app/dashboard/clipper/actions'

// ── Types ──────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────

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

// Real-time earnings: capped_views × rate / 1,000,000
function calcEarnings(cappedViews: number | null, ratePerMillion: number): number | null {
  if (cappedViews == null) return null
  return Math.round((cappedViews / 1_000_000) * ratePerMillion * 100) / 100
}

// ── Platform Icon ──────────────────────────────────────────────

function PlatformIcon({ id, className = 'w-4 h-4' }: { id: string; className?: string }) {
  if (id === 'instagram') return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
  if (id === 'youtube') return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
  if (id === 'moj') return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="12"/>
      <path fill="white" d="M10 7.5l7 4.5-7 4.5V7.5z"/>
    </svg>
  )
  if (id === 'josh') return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect width="24" height="24" rx="6"/>
      <path fill="white" d="M9 7l8 5-8 5V7z"/>
    </svg>
  )
  return <span className="text-xs capitalize text-gray-500">{id}</span>
}

const PLATFORM_COLOR: Record<string, string> = {
  instagram: 'text-pink-500',
  youtube:   'text-red-500',
  moj:       'text-orange-500',
  josh:      'text-blue-500',
}

// ── Status Badge ───────────────────────────────────────────────

function StatusBadge({ status, isCapped }: { status: string; isCapped?: boolean }) {
  if (status === 'approved' && isCapped) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Approved · Capped
      </span>
    )
  }
  const styles: Record<string, string> = {
    pending:  'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-700',
  }
  const labels: Record<string, string> = {
    pending:  'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[status] ?? status}
    </span>
  )
}

// ── Rejection Guidance ─────────────────────────────────────────

const REJECTION_TIPS: Record<string, string> = {
  'wrong platform': 'Make sure you're posting on the platform specified by the campaign.',
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

// ── Submit Modal ───────────────────────────────────────────────

function SubmitModal({
  group,
  onClose,
  onSuccess,
}: {
  group: CampaignGroup
  onClose: () => void
  onSuccess: (s: SubmissionRow) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]   = useState<string | null>(null)
  const [done, setDone]     = useState(false)
  const [url, setUrl]       = useState('')

  // Platform options: submission_platform is 'instagram' | 'youtube'
  // The campaign platform drives which options to show
  const platformOptions: Array<'instagram' | 'youtube'> =
    group.platform === 'instagram' ? ['instagram'] :
    group.platform === 'youtube'   ? ['youtube']   :
    ['instagram', 'youtube']

  const [platform, setPlatform] = useState<'instagram' | 'youtube'>(platformOptions[0])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Focus trap: focus first input on mount
  const urlRef = useRef<HTMLInputElement>(null)
  useEffect(() => { urlRef.current?.focus() }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.set('campaign_id', group.campaign_id)
    fd.set('platform', platform)
    fd.set('clip_url', url.trim())
    startTransition(async () => {
      try {
        await submitClip(fd)
        setDone(true)
        // Optimistically add submission row
        const newSub: SubmissionRow = {
          id:               `optimistic-${Date.now()}`,
          clip_url:         url.trim(),
          platform,
          status:           'pending',
          raw_view_count:   null,
          capped_view_count: null,
          earnings_inr:     null,
          admin_notes:      null,
          created_at:       new Date().toISOString(),
          reviewed_at:      null,
        }
        onSuccess(newSub)
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in">

        {/* Modal header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900">Submit New Clip</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{group.title}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {done ? (
          <div className="px-6 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-900 mb-1">Clip Submitted!</p>
            <p className="text-sm text-gray-500 mb-6">
              Our team will review your clip within 48 hours. You'll see the status update here.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Source content reference */}
            {group.source_content_url && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                <p className="text-xs font-medium text-blue-700 mb-1">Reference Content</p>
                <a
                  href={group.source_content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline break-all"
                >
                  {group.source_content_url}
                </a>
                <p className="text-xs text-blue-500 mt-1">Base your clip on this source material</p>
              </div>
            )}

            {/* Platform selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <div className="flex gap-2">
                {platformOptions.map(p => (
                  <label
                    key={p}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-lg cursor-pointer transition-colors font-medium text-sm capitalize ${
                      platform === p
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      checked={platform === p}
                      onChange={() => setPlatform(p)}
                    />
                    <span className={PLATFORM_COLOR[p] ?? ''}>
                      <PlatformIcon id={p} className="w-4 h-4" />
                    </span>
                    {p === 'instagram' ? 'Instagram' : 'YouTube'}
                  </label>
                ))}
              </div>
            </div>

            {/* URL input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Clip URL <span className="text-red-400">*</span>
              </label>
              <input
                ref={urlRef}
                type="url"
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={
                  platform === 'youtube'
                    ? 'https://www.youtube.com/shorts/…'
                    : 'https://www.instagram.com/reel/…'
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Paste the live public URL of your posted clip
              </p>
            </div>

            {/* CPM info */}
            <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">₹{Math.round(group.rate_per_million_inr / 1000)}</span> per 1,000 views
              </div>
              <div className="text-xs text-gray-500">
                View cap: <span className="font-medium text-gray-700">{fmtViews(group.per_post_view_cap)}</span>
              </div>
              <div className="text-xs text-gray-500">
                Max earn: <span className="font-medium text-emerald-600">
                  {fmt((group.per_post_view_cap / 1_000_000) * group.rate_per_million_inr)}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !url.trim()}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Submitting…' : 'Submit Clip →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Submission Row ─────────────────────────────────────────────

function SubmissionRowUI({
  sub,
  ratePerMillion,
}: {
  sub: SubmissionRow
  ratePerMillion: number
}) {
  const [expanded, setExpanded] = useState(sub.status === 'rejected')

  const isCapped  = sub.status === 'approved'
    && sub.raw_view_count != null
    && sub.capped_view_count != null
    && sub.raw_view_count > sub.capped_view_count

  // Real-time earnings: derive from capped views if not stored yet
  const displayEarnings = sub.earnings_inr != null
    ? Number(sub.earnings_inr)
    : calcEarnings(sub.capped_view_count, ratePerMillion)

  return (
    <>
      <tr className={`border-b border-gray-50 transition-colors ${
        sub.status === 'rejected' ? 'bg-red-50/30' : 'hover:bg-gray-50'
      }`}>
        {/* URL */}
        <td className="px-5 py-3.5 max-w-[200px]">
          <a
            href={sub.clip_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-600 hover:underline truncate block"
          >
            {sub.clip_url}
          </a>
        </td>

        {/* Platform icon */}
        <td className="px-5 py-3.5">
          <span className={`flex items-center gap-1.5 ${PLATFORM_COLOR[sub.platform] ?? 'text-gray-400'}`}>
            <PlatformIcon id={sub.platform} className="w-4 h-4" />
            <span className="text-xs text-gray-500 capitalize">{sub.platform}</span>
          </span>
        </td>

        {/* Date */}
        <td className="px-5 py-3.5">
          <span className="text-xs text-gray-400">
            {new Date(sub.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        </td>

        {/* Status */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <StatusBadge status={sub.status} isCapped={isCapped} />
            {sub.status === 'rejected' && (
              <button
                onClick={() => setExpanded(x => !x)}
                className="text-xs text-red-500 underline hover:no-underline"
              >
                {expanded ? 'Hide' : 'Why?'}
              </button>
            )}
          </div>
        </td>

        {/* Views */}
        <td className="px-5 py-3.5 text-right">
          <div className="text-xs tabular-nums">
            {sub.capped_view_count != null ? (
              <span className="font-medium text-gray-900">{fmtViews(sub.capped_view_count)}</span>
            ) : (
              <span className="text-gray-300">—</span>
            )}
            {isCapped && sub.raw_view_count != null && (
              <span className="block text-gray-400 line-through">{fmtViews(sub.raw_view_count)}</span>
            )}
          </div>
        </td>

        {/* Earnings */}
        <td className="px-5 py-3.5 text-right">
          <span className={`text-xs font-semibold tabular-nums ${
            displayEarnings != null && displayEarnings > 0
              ? 'text-emerald-600'
              : 'text-gray-300'
          }`}>
            {displayEarnings != null && displayEarnings > 0
              ? fmt(displayEarnings)
              : '—'}
          </span>
        </td>
      </tr>

      {/* Rejection reason row */}
      {sub.status === 'rejected' && expanded && (
        <tr className="border-b border-gray-50 bg-red-50/40">
          <td colSpan={6} className="px-5 py-3.5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-800 mb-0.5">Rejection reason</p>
                {sub.admin_notes ? (
                  <p className="text-xs text-red-700 mb-2">"{sub.admin_notes}"</p>
                ) : (
                  <p className="text-xs text-red-600 mb-2">No specific reason provided.</p>
                )}
                <div className="flex items-start gap-1.5 bg-white border border-red-100 rounded-lg px-3 py-2">
                  <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">How to fix: </span>
                    {rejectionTip(sub.admin_notes)}
                  </p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Campaign Accordion ─────────────────────────────────────────

function CampaignAccordion({
  group,
  defaultOpen,
}: {
  group: CampaignGroup
  defaultOpen: boolean
}) {
  const [open, setOpen]           = useState(defaultOpen)
  const [modalOpen, setModalOpen] = useState(false)
  const [submissions, setSubmissions] = useState<SubmissionRow[]>(group.submissions)

  const isActive   = group.campaign_status === 'active'
  const totalViews = submissions.reduce((s, sub) => s + Number(sub.capped_view_count ?? 0), 0)
  const totalEarnings = submissions.reduce((s, sub) => {
    if (sub.earnings_inr != null) return s + Number(sub.earnings_inr)
    return s + (calcEarnings(sub.capped_view_count, group.rate_per_million_inr) ?? 0)
  }, 0)

  const pending  = submissions.filter(s => s.status === 'pending').length
  const approved = submissions.filter(s => s.status === 'approved').length
  const rejected = submissions.filter(s => s.status === 'rejected').length

  function handleNewSubmission(s: SubmissionRow) {
    setSubmissions(prev => [s, ...prev])
    setModalOpen(false)
  }

  return (
    <>
      {modalOpen && (
        <SubmitModal
          group={group}
          onClose={() => setModalOpen(false)}
          onSuccess={handleNewSubmission}
        />
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Accordion header */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          {/* Chevron */}
          <svg
            className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>

          {/* Campaign name + status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold text-gray-900 truncate">{group.title}</span>
              <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                isActive
                  ? 'bg-green-100 text-green-700'
                  : group.campaign_status === 'completed'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-amber-100 text-amber-700'
              }`}>
                {group.campaign_status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</span>
              {pending > 0  && <span className="text-amber-600">{pending} pending</span>}
              {approved > 0 && <span className="text-green-600">{approved} approved</span>}
              {rejected > 0 && <span className="text-red-500">{rejected} rejected</span>}
            </div>
          </div>

          {/* Summary stats */}
          <div className="flex items-center gap-5 shrink-0 mr-2">
            <div className="text-right">
              <p className="text-xs text-gray-400">Views</p>
              <p className="text-sm font-bold text-gray-900 tabular-nums">{fmtViews(totalViews)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Earned</p>
              <p className="text-sm font-bold text-emerald-600 tabular-nums">{fmt(totalEarnings)}</p>
            </div>
          </div>

          {/* Submit button (stop propagation so accordion doesn't toggle) */}
          {isActive && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setModalOpen(true) }}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Submit Clip
            </button>
          )}
        </button>

        {/* Accordion body */}
        {open && (
          <>
            {submissions.length === 0 ? (
              <div className="px-5 py-10 text-center border-t border-gray-100">
                <p className="text-sm text-gray-400">No clips submitted yet for this campaign</p>
                {isActive && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="mt-3 text-sm text-emerald-600 underline hover:no-underline"
                  >
                    Submit your first clip →
                  </button>
                )}
              </div>
            ) : (
              <div className="border-t border-gray-100 overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 w-[200px]">Post URL</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Platform</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Submitted</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Views</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(sub => (
                      <SubmissionRowUI
                        key={sub.id}
                        sub={sub}
                        ratePerMillion={group.rate_per_million_inr}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Campaign footer: source URL + earnings formula */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>
                  CPM rate: <span className="font-medium text-gray-700">
                    ₹{Math.round(group.rate_per_million_inr / 1000)} / 1K views
                  </span>
                </span>
                <span>
                  Per-post cap: <span className="font-medium text-gray-700">
                    {fmtViews(group.per_post_view_cap)} views
                  </span>
                </span>
                <span>
                  Budget left: <span className="font-medium text-gray-700">
                    {fmt(group.budget_remaining_inr)}
                  </span>
                </span>
              </div>
              {group.source_content_url && (
                <a
                  href={group.source_content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View source content
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ── Main Export ────────────────────────────────────────────────

export default function MyCampaignsClient({
  activeGroups,
  completedGroups,
  initialJoinId,
}: Props) {
  const allCount = activeGroups.length + completedGroups.length

  return (
    <div className="space-y-8">

      {/* Active campaigns */}
      {activeGroups.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Active ({activeGroups.length})
            </h2>
          </div>
          <div className="space-y-4">
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

      {/* Completed / other campaigns */}
      {completedGroups.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Completed / Paused ({completedGroups.length})
            </h2>
          </div>
          <div className="space-y-4">
            {completedGroups.map(g => (
              <CampaignAccordion
                key={g.campaign_id}
                group={g}
                defaultOpen={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {allCount === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82V15a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
          <p className="text-gray-600 font-semibold">No campaigns joined yet</p>
          <p className="text-sm text-gray-400 mt-1">Browse the campaign feed and submit your first clip to start earning</p>
          <a
            href="/dashboard/clipper/feed"
            className="inline-block mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Browse Campaigns →
          </a>
        </div>
      )}
    </div>
  )
}
