import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import EarningsClient from '@/components/clipper/EarningsClient'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

const PAYOUT_STATUS_STYLES: Record<string, string> = {
  requested:  'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-700',
  completed:  'bg-green-100 text-green-800',
  failed:     'bg-red-100 text-red-700',
}

export default async function EarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [walletResult, accountResult, payoutsResult, thisMonthResult, allEarningsResult] = await Promise.all([
    db.from('wallets').select('balance_inr, total_credited_inr, total_debited_inr').eq('user_id', user!.id).maybeSingle(),
    db.from('clipper_accounts').select('upi_id, account_holder_name, is_verified').eq('clipper_id', user!.id).maybeSingle(),
    db.from('payouts')
      .select('id, amount_inr, upi_id, status, razorpay_payout_id, requested_at, processed_at')
      .eq('clipper_id', user!.id)
      .order('requested_at', { ascending: false }),
    db.from('earnings')
      .select('amount_inr')
      .eq('clipper_id', user!.id)
      .gte('created_at', monthStart),
    db.from('earnings')
      .select('amount_inr, created_at')
      .eq('clipper_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const wallet   = walletResult.data
  const account  = accountResult.data
  const payouts  = payoutsResult.data ?? []

  const balance        = Number(wallet?.balance_inr ?? 0)
  const totalCredited  = Number(wallet?.total_credited_inr ?? 0)
  const totalDebited   = Number(wallet?.total_debited_inr ?? 0)
  const thisMonth      = (thisMonthResult.data ?? []).reduce((s, e) => s + Number(e.amount_inr), 0)

  const hasPendingPayout = payouts.some(p => p.status === 'requested' || p.status === 'processing')

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your wallet balance, payouts, and transaction history</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-gray-900 rounded-xl p-6 text-white">
          <div className="w-2 h-2 rounded-full bg-emerald-400 mb-4" />
          <p className="text-3xl font-bold tabular-nums">{fmt(balance)}</p>
          <p className="text-sm text-gray-400 mt-1.5">Available Balance</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{fmt(thisMonth)}</p>
          <p className="text-sm text-gray-500 mt-1.5">This Month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-2 h-2 rounded-full bg-blue-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{fmt(totalCredited)}</p>
          <p className="text-sm text-gray-500 mt-1.5">Total Earned</p>
        </div>
      </div>

      {/* Pending payout warning */}
      {hasPendingPayout && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-amber-800 font-medium">
            You have a payout request in progress. Please wait for it to complete before requesting another.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">

        {/* Left: UPI + payout form */}
        <EarningsClient
          walletBalance={balance}
          account={account ?? null}
        />

        {/* Right: Payout history */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden self-start">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Payout History</h2>
            <span className="text-xs text-gray-400">{payouts.length} total</span>
          </div>

          {payouts.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-gray-400">No payouts yet</p>
              <p className="text-xs text-gray-400 mt-1">Your payout requests will appear here</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {payouts.map((p: any) => (
                <li key={p.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{fmt(Number(p.amount_inr))}</p>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${PAYOUT_STATUS_STYLES[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{p.upi_id}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-gray-400">
                      Requested {new Date(p.requested_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                    {p.processed_at && (
                      <p className="text-xs text-gray-400">
                        Processed {new Date(p.processed_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short',
                        })}
                      </p>
                    )}
                  </div>
                  {p.razorpay_payout_id && (
                    <p className="text-xs text-gray-400 mt-1 font-mono">{p.razorpay_payout_id}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
