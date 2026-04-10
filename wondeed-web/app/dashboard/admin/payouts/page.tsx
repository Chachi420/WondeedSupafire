import { createAdminClient } from '@/lib/supabase/admin'
import PayoutQueue from '@/components/admin/PayoutQueue'

export const dynamic = 'force-dynamic'

export default async function AdminPayoutsPage() {
  const db = createAdminClient()

  const { data: raw } = await db
    .from('payouts')
    .select(`
      id,
      amount_inr,
      upi_id,
      status,
      razorpay_payout_id,
      failure_reason,
      requested_at,
      processed_at,
      clipper_id,
      profiles!payouts_clipper_id_fkey (
        full_name,
        phone
      ),
      clipper_accounts (
        is_verified,
        account_holder_name,
        razorpay_fund_account_id
      )
    `)
    .order('requested_at', { ascending: false })

  const payouts = (raw ?? []) as any[]

  const counts = {
    requested:  payouts.filter(p => p.status === 'requested').length,
    processing: payouts.filter(p => p.status === 'processing').length,
    completed:  payouts.filter(p => p.status === 'completed').length,
    failed:     payouts.filter(p => p.status === 'failed').length,
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payout Requests</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Review clipper payout requests and update Razorpay transfer status
        </p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Requested',  count: counts.requested,  dot: 'bg-amber-400'  },
          { label: 'Processing', count: counts.processing, dot: 'bg-blue-500'   },
          { label: 'Completed',  count: counts.completed,  dot: 'bg-green-500'  },
          { label: 'Failed',     count: counts.failed,     dot: 'bg-red-500'    },
        ].map(({ label, count, dot }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-2 h-2 rounded-full ${dot} mb-3`} />
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{count}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <PayoutQueue payouts={payouts} />
    </div>
  )
}
