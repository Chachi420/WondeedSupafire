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
  if (status === 'requested')  return <span className="badge badge-warn" style={{ textTransform: 'capitalize' }}>Requested</span>
  if (status === 'processing') return <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>Processing</span>
  if (status === 'completed')  return <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>Completed</span>
  return <span className="badge badge-danger" style={{ textTransform: 'capitalize' }}>Failed</span>
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 460, margin: '0 16px' }}>
        <div className="card-head">
          <h2>{title}</h2>
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
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
      } catch (e: any) { setError(e.message) }
    })
  }

  function handleComplete() {
    if (!razorpayId.trim()) { setError('Razorpay Payout ID is required'); return }
    setError(null)
    startTransition(async () => {
      try {
        await markPayoutCompleted(payout.id, razorpayId)
        onRefresh(payout.id, { status: 'completed', razorpay_payout_id: razorpayId.trim(), processed_at: new Date().toISOString() })
        setModal(null)
      } catch (e: any) { setError(e.message) }
    })
  }

  function handleFail() {
    setError(null)
    startTransition(async () => {
      try {
        await markPayoutFailed(payout.id, failReason)
        onRefresh(payout.id, { status: 'failed', failure_reason: failReason.trim() || null, processed_at: new Date().toISOString() })
        setModal(null)
      } catch (e: any) { setError(e.message) }
    })
  }

  function handleVerifyAccount() {
    startTransition(async () => {
      try {
        await verifyClipperAccount(payout.clipper_id)
        onRefresh(payout.id, { clipper_accounts: account ? { ...account, is_verified: true } : null })
      } catch (e: any) { setError(e.message) }
    })
  }

  return (
    <>
      <tr>
        <td>
          <p className="med text-xs">{name}</p>
          <p className="text-xs faint mt-4">{profile?.phone ?? '—'}</p>
          {account && !account.is_verified && (
            <button
              onClick={handleVerifyAccount}
              disabled={isPending}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary)', fontSize: 12, marginTop: 4 }}
            >
              Verify account
            </button>
          )}
          {account?.is_verified && (
            <span className="row gap-4 mt-4 text-xs" style={{ color: 'var(--success)' }}>
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 12, height: 12 }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          )}
        </td>
        <td><span className="med text-xs">{fmt(Number(payout.amount_inr))}</span></td>
        <td>
          <p className="mono text-xs">{payout.upi_id}</p>
          {account?.razorpay_fund_account_id && (
            <p className="mono text-xs faint mt-4" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={account.razorpay_fund_account_id}>
              FA: {account.razorpay_fund_account_id}
            </p>
          )}
        </td>
        <td>
          <StatusBadge status={payout.status} />
          {payout.razorpay_payout_id && (
            <p className="mono text-xs faint mt-4" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={payout.razorpay_payout_id}>
              {payout.razorpay_payout_id}
            </p>
          )}
          {payout.failure_reason && (
            <p className="text-xs mt-4" style={{ color: 'var(--danger)' }}>{payout.failure_reason}</p>
          )}
        </td>
        <td>
          <p className="text-xs muted">{fmtDate(payout.requested_at)}</p>
          {payout.processed_at && (
            <p className="text-xs faint mt-4">{fmtDate(payout.processed_at)}</p>
          )}
        </td>
        <td>
          {error && <p className="text-xs mb-8" style={{ color: 'var(--danger)' }}>{error}</p>}
          <div className="col gap-6">
            {payout.status === 'requested' && <>
              <button onClick={handleProcessing} disabled={isPending} className="btn btn-sm btn-secondary">{isPending ? 'Saving…' : 'Mark Processing'}</button>
              <button onClick={() => { setModal('complete'); setError(null) }} className="btn btn-sm btn-success">Mark Completed</button>
              <button onClick={() => { setModal('fail'); setError(null) }} className="btn btn-sm btn-danger">Mark Failed</button>
            </>}
            {payout.status === 'processing' && <>
              <button onClick={() => { setModal('complete'); setError(null) }} className="btn btn-sm btn-success">Mark Completed</button>
              <button onClick={() => { setModal('fail'); setError(null) }} className="btn btn-sm btn-danger">Mark Failed</button>
            </>}
            {(payout.status === 'completed' || payout.status === 'failed') && (
              <span className="text-xs faint">—</span>
            )}
          </div>
        </td>
      </tr>

      {modal === 'complete' && (
        <Modal title="Mark Payout Completed" onClose={() => setModal(null)}>
          <p className="text-xs muted mb-16">
            Enter the Razorpay Payout ID for the {fmt(Number(payout.amount_inr))} transfer to {name}.
          </p>
          <div className="field">
            <label className="field-label">Razorpay Payout ID</label>
            <input
              type="text"
              value={razorpayId}
              onChange={e => setRazorpayId(e.target.value)}
              placeholder="pout_XXXXXXXXXXXX"
              className="input mono"
            />
          </div>
          {error && <p className="text-xs mt-8" style={{ color: 'var(--danger)' }}>{error}</p>}
          <div className="row gap-12 mt-20">
            <button onClick={handleComplete} disabled={isPending} className="btn btn-success btn-block" style={{ flex: 1 }}>
              {isPending ? 'Saving…' : 'Confirm Completed'}
            </button>
            <button onClick={() => setModal(null)} className="btn btn-secondary btn-block" style={{ flex: 1 }}>Cancel</button>
          </div>
        </Modal>
      )}

      {modal === 'fail' && (
        <Modal title="Mark Payout Failed" onClose={() => setModal(null)}>
          <p className="text-xs muted mb-4">This will refund {fmt(Number(payout.amount_inr))} back to {name}&apos;s Wondeed wallet.</p>
          <p className="text-xs mb-16" style={{ color: '#d97706' }}>The clipper will be able to request a new payout.</p>
          <div className="field">
            <label className="field-label">Failure reason (optional)</label>
            <input
              type="text"
              value={failReason}
              onChange={e => setFailReason(e.target.value)}
              placeholder="e.g. Invalid UPI ID, bank rejected transfer"
              className="input"
            />
          </div>
          {error && <p className="text-xs mt-8" style={{ color: 'var(--danger)' }}>{error}</p>}
          <div className="row gap-12 mt-20">
            <button onClick={handleFail} disabled={isPending} className="btn btn-block" style={{ flex: 1, background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' }}>
              {isPending ? 'Saving…' : 'Confirm Failed + Refund'}
            </button>
            <button onClick={() => setModal(null)} className="btn btn-secondary btn-block" style={{ flex: 1 }}>Cancel</button>
          </div>
        </Modal>
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

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Requested', value: 'requested' },
    { label: 'Processing', value: 'processing' },
    { label: 'Failed', value: 'failed' },
    { label: 'Completed', value: 'completed' },
  ]

  return (
    <>
      <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="segmented">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`seg-item${filter === f.value ? ' active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs faint" style={{ marginLeft: 'auto' }}>{filtered.length} payout{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '64px 28px', textAlign: 'center', color: 'var(--fg-muted)' }}>
          No payouts found
        </div>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Clipper</th>
                <th>Amount</th>
                <th>UPI / Fund Account</th>
                <th>Status</th>
                <th>Dates</th>
                <th>Actions</th>
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
    </>
  )
}
