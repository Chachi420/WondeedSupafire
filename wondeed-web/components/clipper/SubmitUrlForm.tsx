'use client'

import { useState, useTransition } from 'react'
import { submitClip } from '@/app/dashboard/clipper/actions'

type Props = {
  campaignId: string
  campaignPlatform: 'instagram' | 'youtube' | 'both'
  onSuccess?: () => void
}

export default function SubmitUrlForm({ campaignId, campaignPlatform, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [platform, setPlatform] = useState<'instagram' | 'youtube'>(
    campaignPlatform === 'both' ? 'instagram' : campaignPlatform
  )
  const [url, setUrl] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const fd = new FormData()
    fd.set('campaign_id', campaignId)
    fd.set('platform', platform)
    fd.set('clip_url', url.trim())
    startTransition(async () => {
      try {
        await submitClip(fd)
        setSuccess(true)
        setUrl('')
        onSuccess?.()
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Clip submitted! It will be reviewed by our team shortly.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {campaignPlatform === 'both' && (
        <div className="flex gap-2">
          {(['instagram', 'youtube'] as const).map(p => (
            <label
              key={p}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border rounded-lg cursor-pointer transition-colors text-sm font-medium ${
                platform === p
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={`platform_${campaignId}`}
                value={p}
                checked={platform === p}
                onChange={() => setPlatform(p)}
                className="sr-only"
              />
              <span className="capitalize">{p}</span>
            </label>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="url"
          required
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder={
            platform === 'youtube'
              ? 'https://www.youtube.com/shorts/...'
              : 'https://www.instagram.com/reel/...'
          }
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={isPending || !url.trim()}
          className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? '…' : 'Submit'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
    </form>
  )
}
