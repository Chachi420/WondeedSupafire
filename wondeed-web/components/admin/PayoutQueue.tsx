'use client'

import { useState, useTransition, useMemo } from 'react'
import {
  markPayoutProcessing,
  markPayoutCompleted,
  markPayoutFailed,
  verifyClipperAccount,
} from '@/app/dashboard/admin/actions'

type Payout = {
  id: string
  amount_inr: number
  upi_id: string
  status: 'requested' | 'processing' | 'completed' | 'failed'
  razorpay_payout_id: string | null
  failure_reason: string | null
  requested_at: string
  processed_at: string | null
  clipper_id: string
  profiles: { full_name: string | null; phone: string | null } | null
  clipper_accounts: {
    is_verified: boolean
    account_holder_name: string
    razorpay_fund_account_id: string | null
  } | null
}

const STATUS_STYLES: Record<string, string> = {
  requested:  'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  completed:  'bg-green-100 text-green-800',
  failed:     'bg-red-100 text-red-700',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function ActionModal({
  title,
  children,
  onClose,
}: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function PayoutRow({ payout, onRefresh }: { payout: Payout; onRefresh: (id: string, updates: Partial<Payout>) => void }) {
  const [isPending, startTransition] = useTransition()
  const [modal, setModal] = useState<'complete' | 'fail' | null>(null)
  const [razorpayId, setRazorpayId] = useState('')
  const [failReason, setFailReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const profile = payout.profiles
  const account = payout.clipper_accounts
  const name = account?.account_holder_name ?? profile?.full_name ?? profile?.phone ?? '—'

  function handleProcessing() {
    setError(null)
    startTransition(async () => {
      try {
        await markPayoutProcessing(payout.id)
        onRefresh(payout.id, { status: 'processing', processed_at: new Date().toISOString() })
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  function handleComplete() {
    if (!razorpayId.trim()) { setError('Razorpay Payout ID is required'); return }
    setError(null)
    startTransition(async () => {
      try {
        await markPayoutCompleted(payout.id, razorpayId)
        onRefresh(payout.id, {
          status: 'completed',
          razorpay_payout_id: razorpayId.trim(),
          processed_at: new Date().toISOString(),
        })
        setModal(null)
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  function handleFail() {
    setError(null)
    startTransition(async () => {
      try {
        await markPayoutFailed(payout.id, failReason)
        onRefresh(payout.id, {
          status: 'failed',
          failure_reason: failReason.trim() || null,
          processed_at: new Date().toISOString(),
        })
        setModal(null)
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  function handleVerifyAccount() {
    startTransition(async () => {
      try {
        await verifyClipperAccount(payout.clipper_id)
        onRefresh(payout.id, {
          clipper_accounts: account ? { ...account, is_verified: true } : null,
        })
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  return (
    <>
      <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
        {/* Clipper */}
        <td className="px-5 py-4">
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{profile?.phone ?? '—'}</p>
          {account && !account.is_verified && (
            <button
              onClick={handleVerifyAccount}
              disabled={isPending}
              className="mt-1 text-xs text-indigo-600 hover:underline disabled:opacity-50"
            >
              Verify account
            </button>
          )}
          {account?.is_verified && (
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-green-600">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          )}
        </td>

        {/* Amount */}
        <td className="px-5 py-4">
          <p className="text-sm font-semibold text-gray-900 tabular-nums">{fmt(Number(payout.amount_inr))}</p>
        </td>

        {/* UPI */}
        <td className="px-5 py-4">
          <p className="text-sm text-gray-700 font-mono">{payout.upi_id}</p>
          {account?.razorpay_fund_account_id && (
            <p className="text-xs text-gray-400 mt-0.5 font-mono truncate max-w-[180px]" title={account.razorpay_fund_account_id}>
              FA: {account.razorpay_fund_account_id}
            </p>
          )}
        </td>

        {/* Status */}
        <td className="px-5 py-4">
          <StatusBadge status={payout.status} />
          {payout.razorpay_payout_id && (
            <p className="text-xs text-gray-400 mt-1 font-mono truncate max-w-[160px]" title={payout.razorpay_payout_id}>
              {payout.razorpay_payout_id}
            </p>
          )}
          {payout.failure_reason && (
            <p className="text-xs text-red-500 mt-1">{payout.failure_reason}</p>
          )}
        </td>

        {/* Dates */}
        <td className="px-5 py-4">
          <p className="text-xs text-gray-500">{fmtDate(payout.requested_at)}</p>
          {payout.processed_at && (
            <p className="text-xs text-gray-400 mt-0.5">{fmtDate(payout.processed_at)}</p>
          )}
        </td>

        {/* Actions */}
        <td className="px-5 py-4">
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <div className="flex flex-col gap-1.5">
            {payout.status === 'requested' && (
              <>
                <button
                  onClick={handleProcessing}
                  disabled={isPending}
                  className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium disabled:opacity-50 transition-colors"
                >
                  {isPending ? 'Saving…' : 'Mark Processing'}
                </button>
                <button
                  onClick={() => { setModal('complete'); setError(null) }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => { setModal('fail'); setError(null) }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors"
                >
                  Mark Failed
                </button>
              </>
            )}
            {payout.status === 'processing' && (
              <>
                <button
                  onClick={() => { setModal('complete'); setError(null) }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => { setModal('fail'); setError(null) }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors"
                >
                  Mark Failed
                </button>
              </>
            )}
            {(payout.status === 'completed' || payout.status === 'failed') && (
              <span className="text-xs text-gray-400">—</span>
            )}
          </div>
        </td>
      </tr>

      {/* Complete modal */}
      {modal === 'complete' && (
        <ActionModal title="Mark Payout Completed" onClose={() => setModal(null)}>
          <p className="text-sm text-gray-600 mb-4">
            Enter the Razorpay Payout ID for the {fmt(Number(payout.amount_inr))} transfer to {name}.
          </p>
          <label className="block text-xs font-medium text-gray-700 mb-1">Razorpay Payout ID</label>
          <input
            type="text"
            value={razorpayId}
            onChange={e => setRazorpayId(e.target.value)}
            placeholder="pout_XXXXXXXXXXXX"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleComplete}
              disabled={isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving…' : 'Confirm Completed'}
            </button>
            <button
              onClick={() => setModal(null)}
              className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </ActionModal>
      )}

      {/* Fail modal */}
      {modal === 'fail' && (
        <ActionModal title="Mark Payout Failed" onClose={() => setModal(null)}>
          <p className="text-sm text-gray-600 mb-1">
            This will refund {fmt(Number(payout.amount_inr))} back to {name}'s Wondeed wallet.
          </p>
          <p className="text-xs text-amber-600 mb-4">The clipper will be able to request a new payout.</p>
          <label className="block text-xs font-medium text-gray-700 mb-1">Failure reason (optional)</label>
          <input
            type="text"
            value={failReason}
            onChange={e => setFailReason(e.target.value)}
            placeholder="e.g. Invalid UPI ID, bank rejected transfer"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleFail}
              disabled={isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving…' : 'Confirm Failed + Refund'}
            </button>
            <button
              onClick={() => setModal(null)}
              className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </ActionModal>
      )}
    </>
  )
}

const STATUS_ORDER = ['requested', 'processing', 'failed', 'completed']

export default function PayoutQueue({ payouts: initial }: { payouts: Payout[] }) {
  const [payouts, setPayouts] = useState<Payout[]>(initial)
  const [filter, setFilter] = useState<string>('all')

  function handleRefresh(id: string, updates: Partial<Payout>) {
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const filtered = useMemo(() => {
    const list = filter === 'all' ? payouts : payouts.filter(p => p.status === filter)
    return [...list].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
  }, [payouts, filter])

  const filters: { label: string; value: string }[] = [
    { label: 'All', value: 'all' },
    { label: 'Requested', value: 'requested' },
    { label: 'Processing', value: 'processing' },
    { label: 'Failed', value: 'failed' },
    { label: 'Completed', value: 'completed' },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} payout{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-400">No payouts found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Clipper', 'Amount', 'UPI / Fund Account', 'Status', 'Dates', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(payout => (
                <PayoutRow key={payout.id} payout={payout} onRefresh={handleRefresh} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
