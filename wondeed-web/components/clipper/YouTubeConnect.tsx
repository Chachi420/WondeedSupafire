'use client'

import { useState, useTransition } from 'react'
import { linkYouTubeChannel, unlinkYouTubeChannel } from '@/app/dashboard/clipper/profile/actions'

type Props = {
  channelId:     string | null
  channelHandle: string | null
  channelTitle:  string | null
  verifiedAt:    string | null
}

const YtIcon = () => (
  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <svg style={{ width: 20, height: 20 }} fill="white" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  </div>
)

export default function YouTubeConnect({ channelId, channelHandle, channelTitle, verifiedAt }: Props) {
  const [isPending, startTransition] = useTransition()
  const [url, setUrl]       = useState('')
  const [error, setError]   = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
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
      <div className="row between">
        <div className="row gap-12">
          <YtIcon />
          <div>
            <p className="med text-xs">{linked.title}</p>
            <p className="text-xs faint mt-4">{linked.handle}</p>
          </div>
        </div>
        <div className="row gap-8">
          <span className="badge badge-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 10, height: 10 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Verified
          </span>
          <button onClick={handleUnlink} disabled={isPending} className="btn btn-sm btn-ghost">Unlink</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="row between">
        <div className="row gap-12">
          <YtIcon />
          <div>
            <p className="med text-xs">YouTube</p>
            <p className="text-xs faint mt-4">Shorts submissions</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="btn btn-sm btn-secondary"
          style={{ color: '#dc2626', borderColor: '#fecaca' }}
        >
          {showForm ? 'Cancel' : 'Connect'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleLink} className="col gap-8 mt-12">
          <input
            type="url"
            required
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://youtube.com/@YourChannel"
            className="input"
          />
          <p className="text-xs faint">Must be your professional/business channel. We verify ownership via the YouTube API.</p>
          {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
          <button
            type="submit"
            disabled={isPending || !url.trim()}
            className="btn btn-primary btn-block"
          >
            {isPending ? 'Verifying…' : 'Verify & Link Channel'}
          </button>
        </form>
      )}
    </div>
  )
}
