import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export default async function ClientWalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const { data: wallet } = await db
    .from('wallets')
    .select('balance_inr, total_credited_inr, total_debited_inr')
    .eq('user_id', user!.id)
    .single()

  const balance   = Number(wallet?.balance_inr        ?? 0)
  const credited  = Number(wallet?.total_credited_inr ?? 0)
  const debited   = Number(wallet?.total_debited_inr  ?? 0)

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Fund your campaigns via Razorpay. Balance is debited when admin approves a campaign.
        </p>
      </div>

      {/* Balance card */}
      <div className="bg-gray-900 text-white rounded-2xl p-8 mb-6">
        <p className="text-sm text-gray-400 mb-2">Available Balance</p>
        <p className="text-5xl font-bold tabular-nums mb-6">{fmt(balance)}</p>
        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-700 text-sm">
          <div>
            <p className="text-gray-400 mb-1">Total topped up</p>
            <p className="text-xl font-semibold tabular-nums">{fmt(credited)}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Total spent on campaigns</p>
            <p className="text-xl font-semibold tabular-nums">{fmt(debited)}</p>
          </div>
        </div>
      </div>

      {/* Top-up — Razorpay Phase 2 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Top Up Wallet</h2>
          <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded">Razorpay — Phase 2</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Razorpay UPI / card top-up is coming soon. To add funds during testing, contact the admin team.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[5000, 10000, 25000, 50000, 100000, 200000].map((amt) => (
            <button key={amt} disabled
              className="py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
            >
              {fmt(amt)}
            </button>
          ))}
        </div>
        <button
          disabled
          className="w-full py-3 bg-brand-500 text-white text-sm font-semibold rounded-lg opacity-40 cursor-not-allowed"
        >
          Pay via Razorpay
        </button>
      </div>
    </div>
  )
}
