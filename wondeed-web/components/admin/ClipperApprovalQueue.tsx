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
  if (status === 'active')
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>
  if (status === 'pending')
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Pending</span>
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Suspended</span>
}

function ClipperRow({ clipper, social }: { clipper: Clipper; social?: Social }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState<string | null>(null)

  const currentStatus = done ?? clipper.account_status

  function act(action: () => Promise<void>, label: string) {
    startTransition(async () => {
      try {
        await action()
        setDone(label)
      } catch (e: any) {
        alert(e.message)
      }
    })
  }

  const joinedDate = new Date(clipper.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-gray-900">{clipper.full_name ?? '—'}</p>
        <p className="text-xs text-gray-400 mt-0.5">{clipper.phone}</p>
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={currentStatus} />
      </td>
      <td className="px-5 py-4">
        {social?.youtube_channel_title ? (
          <div>
            <p className="text-xs font-medium text-gray-900">{social.youtube_channel_title}</p>
            <p className="text-xs text-gray-400">{social.youtube_channel_handle ?? ''}</p>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Not linked</span>
        )}
      </td>
      <td className="px-5 py-4">
        {social?.instagram_username ? (
          <p className="text-xs font-medium text-gray-900">@{social.instagram_username}</p>
        ) : (
          <span className="text-xs text-gray-400">Not linked</span>
        )}
      </td>
      <td className="px-5 py-4">
        <span className="text-xs capitalize px-2 py-0.5 rounded bg-gray-100 text-gray-600">
          {clipper.subscription_tier}
        </span>
      </td>
      <td className="px-5 py-4 text-xs text-gray-400">{joinedDate}</td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          {currentStatus === 'pending' && (
            <button
              onClick={() => act(() => approveClipperAccount(clipper.id), 'active')}
              disabled={isPending}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              Approve
            </button>
          )}
          {currentStatus === 'pending' && (
            <button
              onClick={() => act(() => suspendClipperAccount(clipper.id), 'suspended')}
              disabled={isPending}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              Reject
            </button>
          )}
          {currentStatus === 'active' && (
            <button
              onClick={() => act(() => suspendClipperAccount(clipper.id), 'suspended')}
              disabled={isPending}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg border border-red-200 disabled:opacity-50 transition-colors"
            >
              Suspend
            </button>
          )}
          {currentStatus === 'suspended' && (
            <button
              onClick={() => act(() => reactivateClipperAccount(clipper.id), 'active')}
              disabled={isPending}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-200 disabled:opacity-50 transition-colors"
            >
              Reactivate
            </button>
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Filter bar */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? `All (${clippers.length})` : `${f} (${clippers.filter(c => c.account_status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-gray-400">
          No {filter === 'all' ? '' : filter} clippers
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Clipper</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">YouTube</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Instagram</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
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
    </div>
  )
}
