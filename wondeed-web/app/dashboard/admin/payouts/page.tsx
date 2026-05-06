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

  const STAT_ITEMS = [
    { label: 'Requested',  value: counts.requested,  cls: 'ico-amber'  },
    { label: 'Processing', value: counts.processing, cls: 'ico-blue'   },
    { label: 'Completed',  value: counts.completed,  cls: 'ico-green'  },
    { label: 'Failed',     value: counts.failed,     cls: ''            },
  ]

  return (
    <>
      <div className="topbar">
        <div className="col">
          <h1>Payout Requests</h1>
          <div className="topbar-sub">Review clipper payout requests and update Razorpay transfer status</div>
        </div>
      </div>

      <div className="content fade-up">
        <div className="stat-grid mb-20">
          {STAT_ITEMS.map(({ label, value, cls }) => (
            <div key={label} className="stat-card">
              <div className={`stat-ico ${cls}`} style={!cls ? { background: 'var(--danger-bg)', color: 'var(--danger)' } : {}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v2H5a2 2 0 00-2 2V7z"/>
                  <path d="M3 11a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"/>
                  <circle cx="17" cy="14" r="1.4" fill="currentColor"/>
                </svg>
              </div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>All Payouts</h2>
              <div className="sub">{payouts.length} total requests</div>
            </div>
          </div>
          <PayoutQueue payouts={payouts} />
        </div>
      </div>
    </>
  )
}
