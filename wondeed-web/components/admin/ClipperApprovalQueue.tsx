'use client'

import { useState, useTransition } from 'react'
import { approveClipperAccount, suspendClipperAccount, reactivateClipperAccount } from '@/app/dashboard/admin/actions'

type Clipper = {
  id: string
  phone: string
  full_name: string | null
  account_status: 'pending' | 'active' | 'suspended'
  subscription_tier: string
  created_at: string
}

type Social = {
  youtube_channel_handle: string | null
  youtube_channel_title: string | null
  youtube_verified_at: string | null
  instagram_username: string | null
  instagram_connected_at: string | null
}

type Props = {
  clippers: Clipper[]
  socialByClipperId: Record<string, Social>
}

const STATUS_FILTERS = ['all', 'pending', 'active', 'suspended'] as const
type Filter = typeof STATUS_FILTERS[number]

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')    return <span className="badge badge-success">Active</span>
  if (status === 'pending')   return <span className="badge badge-warn">Pending</span>
  return <span className="badge badge-danger">Suspended</span>
}

function ClipperRow({ clipper, social }: { clipper: Clipper; social?: Social }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState<string | null>(null)

  const currentStatus = done ?? clipper.account_status

  function act(action: () => Promise<void>, label: string) {
    startTransition(async () => {
      try { await action(); setDone(label) }
      catch (e: any) { alert(e.message) }
    })
  }

  const joinedDate = new Date(clipper.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <tr className={isPending ? 'opacity-50' : ''}>
      <td>
        <p className="med text-xs">{clipper.full_name ?? '—'}</p>
        <p className="text-xs faint mt-4">{clipper.phone}</p>
      </td>
      <td><StatusBadge status={currentStatus} /></td>
      <td>
        {social?.youtube_channel_title ? (
          <div>
            <p className="med text-xs">{social.youtube_channel_title}</p>
            <p className="text-xs faint mt-4">{social.youtube_channel_handle ?? ''}</p>
          </div>
        ) : (
          <span className="text-xs faint">Not linked</span>
        )}
      </td>
      <td>
        {social?.instagram_username
          ? <p className="med text-xs">@{social.instagram_username}</p>
          : <span className="text-xs faint">Not linked</span>
        }
      </td>
      <td>
        <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{clipper.subscription_tier}</span>
      </td>
      <td className="text-xs faint">{joinedDate}</td>
      <td>
        <div className="row gap-8">
          {currentStatus === 'pending' && <>
            <button onClick={() => act(() => approveClipperAccount(clipper.id), 'active')} disabled={isPending} className="btn btn-primary btn-sm">Approve</button>
            <button onClick={() => act(() => suspendClipperAccount(clipper.id), 'suspended')} disabled={isPending} className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' }}>Reject</button>
          </>}
          {currentStatus === 'active' && (
            <button onClick={() => act(() => suspendClipperAccount(clipper.id), 'suspended')} disabled={isPending} className="btn btn-sm btn-danger">Suspend</button>
          )}
          {currentStatus === 'suspended' && (
            <button onClick={() => act(() => reactivateClipperAccount(clipper.id), 'active')} disabled={isPending} className="btn btn-sm btn-secondary">Reactivate</button>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function ClipperApprovalQueue({ clippers, socialByClipperId }: Props) {
  const [filter, setFilter] = useState<Filter>('pending')

  const filtered = filter === 'all'
    ? clippers
    : clippers.filter(c => c.account_status === filter)

  return (
    <>
      <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="segmented">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`seg-item${filter === f ? ' active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {f === 'all'
                ? `All (${clippers.length})`
                : `${f} (${clippers.filter(c => c.account_status === f).length})`
              }
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '48px 28px', textAlign: 'center', color: 'var(--fg-muted)' }}>
          No {filter === 'all' ? '' : filter} clippers
        </div>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Clipper</th>
                <th>Status</th>
                <th>YouTube</th>
                <th>Instagram</th>
                <th>Tier</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <ClipperRow key={c.id} clipper={c} social={socialByClipperId[c.id]} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
