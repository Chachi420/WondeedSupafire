'use client'

import { useState, useTransition } from 'react'
import { submitMultipleClips } from '@/app/dashboard/clipper/actions'

type Campaign = {
  id: string
  title: string
  platform: string
  rate_per_million_inr: number
  budget_remaining_inr: number
  end_date: string | null
  source_content_url: string | null
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
      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-sm font-medium text-gray-500">No active campaigns right now</p>
        <p className="text-xs text-gray-400 mt-1">Check back soon or ask an admin to approve campaigns</p>
      </div>
    )
  }

  if (results) {
    const successCount = results.filter(r => r.success).length
    const failCount    = results.length - successCount
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className={`px-6 py-5 ${successCount === results.length ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-amber-50 border-b border-amber-100'}`}>
          <p className="text-base font-semibold text-gray-900">
            {successCount} of {results.length} clip{results.length > 1 ? 's' : ''} submitted
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            {failCount > 0 ? `${failCount} failed — fix the URLs and resubmit` : 'Admin will review within 48 hours'}
          </p>
        </div>

        <ul className="divide-y divide-gray-100">
          {results.map((r, i) => (
            <li key={i} className="flex items-start gap-3 px-6 py-4">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${r.success ? 'bg-emerald-100' : 'bg-red-100'}`}>
                {r.success
                  ? <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  : <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 truncate font-mono">{r.url}</p>
                {r.success
                  ? <p className="text-xs text-emerald-600 mt-0.5">
                      Pending review{r.viewCount != null ? ` · ${r.viewCount.toLocaleString('en-IN')} views` : ''}
                    </p>
                  : <p className="text-xs text-red-500 mt-0.5">{r.error}</p>
                }
              </div>
            </li>
          ))}
        </ul>

        <div className="px-6 py-5 border-t border-gray-100">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Submit more clips
          </button>
        </div>
      </div>
    )
  }

  const filledCount = urls.filter(u => u.trim()).length
  const placeholder = platform === 'youtube'
    ? 'https://youtube.com/shorts/… or youtube.com/watch?v=…'
    : 'https://instagram.com/reel/…'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">

      {/* Campaign selector */}
      <div className="px-6 py-5">
        <label className="block text-sm font-semibold text-gray-800 mb-3">Select Campaign</label>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {campaigns.map(c => (
            <label
              key={c.id}
              className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                campaignId === c.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="campaign"
                value={c.id}
                checked={campaignId === c.id}
                onChange={() => handleCampaignChange(c.id)}
                className="mt-0.5 accent-emerald-600"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-gray-500 capitalize">{c.platform}</span>
                  <span className="text-xs text-emerald-600 font-medium">
                    ₹{Number(c.rate_per_million_inr).toLocaleString('en-IN')}/M views
                  </span>
                  {c.end_date && (
                    <span className="text-xs text-gray-400">
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
        <div className="px-6 py-4 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 mb-1">Source Content to Clip</p>
          <a href={selected.source_content_url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-emerald-600 hover:underline break-all">
            {selected.source_content_url}
          </a>
        </div>
      )}

      {/* Platform toggle */}
      {showPlatformToggle && (
        <div className="px-6 py-5">
          <p className="text-sm font-semibold text-gray-800 mb-3">Platform</p>
          <div className="flex gap-3">
            {(['instagram', 'youtube'] as const).map(p => (
              <label key={p}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-colors capitalize ${
                  platform === p
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <input type="radio" className="sr-only" checked={platform === p} onChange={() => setPlatform(p)} />
                {p}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Multi-URL inputs */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-800">
            Clip URLs
            <span className="ml-2 text-xs font-normal text-gray-400">up to {MAX_CLIPS}</span>
          </label>
          {urls.length > 1 && (
            <span className="text-xs text-gray-400">{urls.length} clips</span>
          )}
        </div>

        <div className="space-y-2">
          {urls.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(i, e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removeUrl(i)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {urls.length < MAX_CLIPS && (
          <button
            type="button"
            onClick={addUrl}
            className="mt-3 flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add another clip
          </button>
        )}

        <p className="mt-3 text-xs text-gray-400">
          {platform === 'instagram'
            ? 'Paste public Instagram Reel URLs — views are fetched automatically'
            : 'Paste public YouTube Shorts or video URLs — views are fetched automatically'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-3 bg-red-50">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="px-6 py-5">
        <button
          type="submit"
          disabled={isPending || !filledCount || !campaignId}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPending
            ? `Submitting ${filledCount} clip${filledCount > 1 ? 's' : ''}…`
            : `Submit ${filledCount || ''} Clip${filledCount !== 1 ? 's' : ''} →`}
        </button>
      </div>
    </form>
  )
}
