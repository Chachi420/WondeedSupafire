'use client'

import { useState, useTransition } from 'react'
import { linkYouTubeChannel, unlinkYouTubeChannel } from '@/app/dashboard/clipper/profile/actions'

type Props = {
  channelId:     string | null
  channelHandle: string | null
  channelTitle:  string | null
  verifiedAt:    string | null
}

export default function YouTubeConnect({ channelId, channelHandle, channelTitle, verifiedAt }: Props) {
  const [isPending, startTransition] = useTransition()
  const [url, setUrl]   = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // optimistic state
  const [linked, setLinked] = useState<{ id: string; handle: string; title: string } | null>(
    channelId ? { id: channelId, handle: channelHandle ?? '', title: channelTitle ?? '' } : null
  )

  function handleLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const result = await linkYouTubeChannel(url.trim())
        setLinked({ id: result.channelId, handle: result.channelHandle, title: result.channelTitle })
        setShowForm(false)
        setUrl('')
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  function handleUnlink() {
    startTransition(async () => {
      await unlinkYouTubeChannel()
      setLinked(null)
      setShowForm(false)
    })
  }

  if (linked) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{linked.title}</p>
            <p className="text-xs text-gray-400">{linked.handle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Verified
          </span>
          <button
            onClick={handleUnlink}
            disabled={isPending}
            className="text-xs text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
          >
            Unlink
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">YouTube</p>
            <p className="text-xs text-gray-400">Shorts submissions</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors"
        >
          {showForm ? 'Cancel' : 'Connect'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleLink} className="mt-3 space-y-2">
          <input
            type="url"
            required
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://youtube.com/@YourChannel"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p className="text-xs text-gray-400">
            Must be your professional/business channel. We verify ownership via the YouTube API.
          </p>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={isPending || !url.trim()}
            className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors"
          >
            {isPending ? 'Verifying…' : 'Verify & Link Channel'}
          </button>
        </form>
      )}
    </div>
  )
}
