'use client'

import { useState, useTransition } from 'react'
import { saveClipperAccount, requestPayout } from '@/app/dashboard/clipper/actions'

type ClipperAccount = {
  upi_id: string
  account_holder_name: string
  is_verified: boolean
} | null

type Props = {
  walletBalance: number
  account: ClipperAccount
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

function UPIForm({ account, onSaved }: { account: ClipperAccount; onSaved: (a: { upi_id: string; account_holder_name: string }) => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]    = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(!account)

  if (!editing && account) {
    return (
      <div className="row between" style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '10px 14px' }}>
        <div>
          <p className="med text-xs">{account.upi_id}</p>
          <p className="text-xs faint mt-4">{account.account_holder_name}</p>
        </div>
        <div className="row gap-12">
          {account.is_verified && (
            <span className="row gap-4 text-xs" style={{ color: 'var(--success)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 12, height: 12 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Verified
            </span>
          )}
          <button
            onClick={() => { setEditing(true); setSuccess(false) }}
            className="text-xs faint"
            style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            Edit
          </button>
        </div>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await saveClipperAccount(fd)
        setSuccess(true)
        setEditing(false)
        onSaved({
          upi_id:              fd.get('upi_id') as string,
          account_holder_name: fd.get('account_holder_name') as string,
        })
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="col gap-12">
      <div className="field">
        <label className="field-label">UPI ID</label>
        <input name="upi_id" type="text" required defaultValue={account?.upi_id ?? ''} placeholder="yourname@upi" className="input" />
      </div>
      <div className="field">
        <label className="field-label">Account Holder Name</label>
        <input name="account_holder_name" type="text" required defaultValue={account?.account_holder_name ?? ''} placeholder="Full name as on bank account" className="input" />
      </div>
      {error && (
        <p className="text-xs" style={{ color: 'var(--danger)', background: 'var(--danger-bg)', borderRadius: 6, padding: '8px 12px' }}>{error}</p>
      )}
      <div className="row gap-8">
        <button type="submit" disabled={isPending} className="btn btn-primary" style={{ flex: 1 }}>
          {isPending ? 'Saving…' : 'Save UPI Details'}
        </button>
        {account && (
          <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">Cancel</button>
        )}
      </div>
      {success && (
        <p className="text-xs" style={{ color: 'var(--success)', background: 'rgba(16,185,129,0.08)', borderRadius: 6, padding: '8px 12px' }}>
          UPI details saved successfully.
        </p>
      )}
    </form>
  )
}

function PayoutForm({ balance, upiId }: { balance: number; upiId: string | null }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]    = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [amount, setAmount]  = useState('')

  if (!upiId) {
    return (
      <p className="text-xs faint" style={{ textAlign: 'center', padding: '16px 0' }}>
        Please save your UPI details above before requesting a payout.
      </p>
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.set('amount', amount)
    fd.set('upi_id', upiId!)
    startTransition(async () => {
      try {
        await requestPayout(fd)
        setSuccess(true)
        setAmount('')
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  if (success) {
    return (
      <div className="helper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16, flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Payout request submitted! We&apos;ll process it within 2–3 business days.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="col gap-12">
      <div className="field">
        <label className="field-label">Amount (available: {fmt(balance)})</label>
        <div className="row gap-8">
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', fontSize: 13 }}>₹</span>
            <input
              type="number"
              min={100}
              max={balance}
              step={1}
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="input"
              style={{ paddingLeft: 26 }}
            />
          </div>
          <button
            type="button"
            onClick={() => setAmount(String(Math.floor(balance)))}
            className="btn btn-secondary btn-sm"
          >
            Max
          </button>
        </div>
        <span className="field-hint">To UPI: {upiId}</span>
      </div>
      {error && (
        <p className="text-xs" style={{ color: 'var(--danger)', background: 'var(--danger-bg)', borderRadius: 6, padding: '8px 12px' }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={isPending || !amount || Number(amount) <= 0 || Number(amount) > balance}
        className="btn btn-primary btn-block"
      >
        {isPending ? 'Requesting…' : 'Request Payout →'}
      </button>
    </form>
  )
}

export default function EarningsClient({ walletBalance, account }: Props) {
  const [currentUpi, setCurrentUpi] = useState(account?.upi_id ?? null)

  return (
    <div className="col gap-16">
      <div className="card">
        <div className="card-head">
          <div>
            <h2>UPI Details</h2>
            <div className="sub">Used for payout transfers</div>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <UPIForm
            account={account}
            onSaved={({ upi_id }) => setCurrentUpi(upi_id)}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Request Payout</h2>
            <div className="sub">Minimum withdrawal: ₹100</div>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <PayoutForm balance={walletBalance} upiId={currentUpi} />
        </div>
      </div>
    </div>
  )
}
