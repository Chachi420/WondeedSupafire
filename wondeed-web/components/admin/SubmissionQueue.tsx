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

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === 'instagram') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-100 text-pink-700 rounded text-xs font-medium">
        IG Reels
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
      YT Shorts
    </span>
  )
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
  const [mode, setMode]       = useState<'idle' | 'approve' | 'reject'>('idle')
  const [views, setViews]     = useState('')
  const [notes, setNotes]     = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)

  const camp = sub.campaigns

  async function handleFetchLiveViews() {
    setFetching(true)
    setError(null)
    try {
      const count = await fetchLiveViewCount(sub.id)
      if (count != null) setViews(String(count))
      else setError('Could not fetch views — paste manually')
    } catch {
      setError('Fetch failed — paste manually')
    } finally {
      setFetching(false)
    }
  }

  function submitApprove() {
    const v = parseInt(views, 10)
    if (!v || v < 0) { setError('Enter a valid view count'); return }
    setError(null)
    startTransition(async () => {
      try { await approveSubmission(sub.id, v) }
      catch (e: any) { setError(e.message) }
    })
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

  return (
    <>
      <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Campaign */}
        <td className="px-5 py-4">
          <p className="text-sm font-medium text-gray-900">{camp?.title ?? '—'}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sub.profiles?.full_name ?? sub.profiles?.phone ?? '—'}</p>
        </td>

        {/* Clip URL */}
        <td className="px-5 py-4">
          <a
            href={sub.clip_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:underline truncate max-w-[200px] block"
            title={sub.clip_url}
          >
            {sub.clip_url.replace(/^https?:\/\//, '').substring(0, 40)}…
          </a>
        </td>

        {/* Platform */}
        <td className="px-5 py-4"><PlatformIcon platform={sub.platform} /></td>

        {/* Budget remaining */}
        <td className="px-5 py-4 text-sm text-gray-600">
          {camp ? fmt(Number(camp.budget_remaining_inr)) : '—'}
        </td>

        {/* Submitted */}
        <td className="px-5 py-4 text-sm text-gray-400">
          {new Date(sub.created_at).toLocaleDateString('en-IN')}
        </td>

        {/* Actions */}
        <td className="px-5 py-4">
          {mode === 'idle' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode('approve')}
                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Enter Views
              </button>
              <button
                onClick={() => setMode('reject')}
                className="px-3 py-1.5 bg-white border border-red-300 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                Reject
              </button>
            </div>
          )}
          {mode !== 'idle' && (
            <button
              onClick={() => { setMode('idle'); setError(null) }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              ← Cancel
            </button>
          )}
        </td>
      </tr>

      {/* Approve form — inline expanded row */}
      {mode === 'approve' && (
        <tr className="bg-green-50 border-b border-green-100">
          <td colSpan={6} className="px-5 py-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-2">
                <label className="block text-xs font-semibold text-gray-700">
                  Actual view count (from platform analytics)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 250000"
                    value={views}
                    onChange={(e) => setViews(e.target.value)}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleFetchLiveViews}
                    disabled={fetching || isPending}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg disabled:opacity-40 transition-colors whitespace-nowrap"
                  >
                    {fetching ? 'Fetching…' : '⟳ Fetch Live Views'}
                  </button>
                  {previewInr !== null && (
                    <div className="text-sm">
                      <span className="text-gray-500">Clipper earns: </span>
                      <span className="font-semibold text-green-700">{fmt(previewInr)}</span>
                      {camp && parsedViews > Number(camp.per_post_view_cap) && (
                        <span className="ml-2 text-xs text-amber-600">
                          (capped at {new Intl.NumberFormat('en-IN').format(Number(camp.per_post_view_cap))} views)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={submitApprove}
                disabled={!views || isPending}
                className="mt-6 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors"
              >
                {isPending ? 'Saving…' : 'Confirm & Credit'}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </td>
        </tr>
      )}

      {/* Reject form */}
      {mode === 'reject' && (
        <tr className="bg-red-50 border-b border-red-100">
          <td colSpan={6} className="px-5 py-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Reason for rejection (shown to clipper)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Clip does not match campaign brief"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  autoFocus
                />
              </div>
              <button
                onClick={submitReject}
                disabled={isPending}
                className="mt-6 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-40 transition-colors"
              >
                {isPending ? 'Saving…' : 'Confirm Reject'}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </td>
        </tr>
      )}
    </>
  )
}

export default function SubmissionQueue({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-900">Queue empty</p>
        <p className="text-sm text-gray-400 mt-1">No pending submissions to review</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Campaign / Clipper</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Clip URL</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget Left</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => <SubmissionRow key={s.id} sub={s} />)}
        </tbody>
      </table>
    </div>
  )
}
