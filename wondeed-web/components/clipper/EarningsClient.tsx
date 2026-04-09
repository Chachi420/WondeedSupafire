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
  const [error, setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(!account)

  if (!editing && account) {
    return (
      <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">{account.upi_id}</p>
          <p className="text-xs text-gray-500">{account.account_holder_name}</p>
        </div>
        <div className="flex items-center gap-3">
          {account.is_verified && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Verified
            </span>
          )}
          <button
            onClick={() => { setEditing(true); setSuccess(false) }}
            className="text-xs text-gray-500 hover:text-gray-900 underline"
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">UPI ID</label>
        <input
          name="upi_id"
          type="text"
          required
          defaultValue={account?.upi_id ?? ''}
          placeholder="yourname@upi"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Account Holder Name</label>
        <input
          name="account_holder_name"
          type="text"
          required
          defaultValue={account?.account_holder_name ?? ''}
          placeholder="Full name as on bank account"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors"
        >
          {isPending ? 'Saving…' : 'Save UPI Details'}
        </button>
        {account && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
      {success && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          UPI details saved successfully.
        </p>
      )}
    </form>
  )
}

function PayoutForm({ balance, upiId }: { balance: number; upiId: string | null }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [amount, setAmount] = useState('')

  if (!upiId) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
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
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Payout request submitted! We'll process it within 2–3 business days.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Amount (available: {fmt(balance)})
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₹</span>
            <input
              type="number"
              min={100}
              max={balance}
              step={1}
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setAmount(String(Math.floor(balance)))}
            className="shrink-0 px-3 py-2.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors"
          >
            Max
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">To UPI: {upiId}</p>
      </div>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
      <button
        type="submit"
        disabled={isPending || !amount || Number(amount) <= 0 || Number(amount) > balance}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Requesting…' : 'Request Payout →'}
      </button>
    </form>
  )
}

export default function EarningsClient({ walletBalance, account }: Props) {
  const [currentUpi, setCurrentUpi] = useState(account?.upi_id ?? null)

  return (
    <div className="space-y-6">
      {/* UPI Setup */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">UPI Details</h2>
          <p className="text-xs text-gray-400 mt-0.5">Used for payout transfers</p>
        </div>
        <div className="p-5">
          <UPIForm
            account={account}
            onSaved={({ upi_id }) => setCurrentUpi(upi_id)}
          />
        </div>
      </div>

      {/* Payout Request */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Request Payout</h2>
          <p className="text-xs text-gray-400 mt-0.5">Minimum withdrawal: ₹100</p>
        </div>
        <div className="p-5">
          <PayoutForm balance={walletBalance} upiId={currentUpi} />
        </div>
      </div>
    </div>
  )
}
