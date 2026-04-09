'use client'

import { useState, useTransition } from 'react'
import { submitClip } from '@/app/dashboard/clipper/actions'

type Campaign = {
  id: string
  title: string
  platform: 'instagram' | 'youtube' | 'both'
}

export default function SubmitClipForm({ campaigns }: { campaigns: Campaign[] }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedId, setSelectedId] = useState(campaigns[0]?.id ?? '')
  const [platform, setPlatform] = useState<'instagram' | 'youtube'>('instagram')
  const [url, setUrl] = useState('')

  const selectedCampaign = campaigns.find(c => c.id === selectedId)
  const campaignPlatform = selectedCampaign?.platform ?? 'both'

  function handleCampaignChange(id: string) {
    setSelectedId(id)
    setError(null)
    setSuccess(false)
    const c = campaigns.find(x => x.id === id)
    if (c?.platform !== 'both') setPlatform(c?.platform ?? 'instagram')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const form = e.currentTarget
    startTransition(async () => {
      try {
        await submitClip(new FormData(form))
        setSuccess(true)
        setUrl('')
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  if (campaigns.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        No active campaigns right now. Check back soon!
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Campaign select */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Campaign</label>
        <select
          name="campaign_id"
          value={selectedId}
          onChange={e => handleCampaignChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          {campaigns.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Platform */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Platform</label>
        {campaignPlatform === 'both' ? (
          <div className="flex gap-3">
            {(['instagram', 'youtube'] as const).map(p => (
              <label
                key={p}
                className={`flex-1 flex items-center gap-2 px-3 py-2.5 border rounded-lg cursor-pointer transition-colors ${
                  platform === p
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="platform"
                  value={p}
                  checked={platform === p}
                  onChange={() => setPlatform(p)}
                  className="sr-only"
                />
                <span className="text-sm font-medium text-gray-900 capitalize">{p}</span>
              </label>
            ))}
          </div>
        ) : (
          <>
            <input type="hidden" name="platform" value={campaignPlatform} />
            <p className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 capitalize">
              {campaignPlatform} only
            </p>
          </>
        )}
      </div>

      {/* Clip URL */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Clip URL</label>
        <input
          name="clip_url"
          type="url"
          required
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder={
            campaignPlatform === 'youtube'
              ? 'https://www.youtube.com/shorts/...'
              : 'https://www.instagram.com/reel/...'
          }
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700">
          Clip submitted! It will be reviewed by our team shortly.
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !url.trim() || !selectedId}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Submitting…' : 'Submit Clip →'}
      </button>
    </form>
  )
}
