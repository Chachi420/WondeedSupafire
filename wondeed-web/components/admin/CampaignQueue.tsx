'use client'

import { useState, useTransition } from 'react'
import { approveCampaign, rejectCampaign } from '@/app/dashboard/admin/actions'

type Campaign = {
  id: string
  title: string
  description: string | null
  budget_inr: number
  total_charged_inr: number
  platform: string
  start_date: string | null
  end_date: string | null
  created_at: string
  per_post_view_cap: number
  profiles: { full_name: string | null; phone: string | null } | null
}

function PlatformBadge({ platform }: { platform: string }) {
  const styles: Record<string, string> = {
    instagram: 'bg-pink-100 text-pink-700',
    youtube:   'bg-red-100 text-red-700',
    both:      'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${styles[platform] ?? 'bg-gray-100 text-gray-600'}`}>
      {platform}
    </span>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const [isPending, startTransition] = useTransition()
  const [expanded, setExpanded]      = useState(false)
  const [error, setError]            = useState<string | null>(null)

  function handle(action: (id: string) => Promise<void>) {
    setError(null)
    startTransition(async () => {
      try { await action(campaign.id) }
      catch (e: any) { setError(e.message) }
    })
  }

  return (
    <>
      <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isPending ? 'opacity-50' : ''}`}>
        <td className="px-5 py-4">
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-sm font-semibold text-gray-900 hover:text-indigo-600 text-left"
          >
            {campaign.title}
          </button>
          <p className="text-xs text-gray-400 mt-0.5">
            {campaign.profiles?.full_name ?? campaign.profiles?.phone ?? 'Unknown client'}
          </p>
        </td>
        <td className="px-5 py-4">
          <div className="text-sm font-semibold text-gray-900">{fmt(campaign.budget_inr)}</div>
          <div className="text-xs text-gray-400">+20% fee → {fmt(campaign.total_charged_inr)} total</div>
        </td>
        <td className="px-5 py-4 text-sm text-gray-600">{fmtViews(campaign.per_post_view_cap)} cap/post</td>
        <td className="px-5 py-4"><PlatformBadge platform={campaign.platform} /></td>
        <td className="px-5 py-4 text-sm text-gray-500">
          {campaign.start_date ?? '—'} → {campaign.end_date ?? '—'}
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handle(approveCampaign)}
              disabled={isPending}
              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handle(rejectCampaign)}
              disabled={isPending}
              className="px-3 py-1.5 bg-white border border-red-300 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 disabled:opacity-40 transition-colors"
            >
              Reject
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </td>
      </tr>

      {/* Expanded description row */}
      {expanded && (
        <tr className="bg-gray-50 border-b border-gray-100">
          <td colSpan={6} className="px-5 py-3 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Description: </span>
            {campaign.description ?? <span className="italic text-gray-400">No description provided</span>}
          </td>
        </tr>
      )}
    </>
  )
}

export default function CampaignQueue({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-900">All clear</p>
        <p className="text-sm text-gray-400 mt-1">No campaigns pending approval</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Campaign / Client</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Post Cap</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Dates</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => <CampaignRow key={c.id} campaign={c} />)}
        </tbody>
      </table>
    </div>
  )
}
