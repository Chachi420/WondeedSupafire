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
    <>
      <div className="topbar">
        <div className="col">
          <h1>Earnings</h1>
          <div className="topbar-sub">Track every rupee — from view-credit to UPI settlement.</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="content fade-up">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Wallet hero */}
          <div className="wallet-hero">
            <div className="row between items-start">
              <div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Available Balance
                </div>
                <div className="mt-8" style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {fmt(balance)}
                </div>
                <div className="mt-12 row gap-12 text-md" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <span>Lifetime: {fmt(totalCredited)}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>Paid out: {fmt(totalDebited)}</span>
                </div>
              </div>
              {account?.is_verified && (
                <div className="col gap-8 items-end">
                  <span className="badge" style={{ background: 'rgba(34,197,94,0.18)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' }}>
                    UPI Verified
                  </span>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{account.upi_id}</div>
                </div>
              )}
            </div>
            <div className="row gap-12 mt-16 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span>Min payout: ₹500</span>
              <span>·</span>
              <span>Settles in 24h via UPI</span>
              <span>·</span>
              <span>Platform fee: 0%</span>
            </div>
          </div>

          {/* Right: stats + UPI */}
          <div className="col gap-16">
            <div className="g2">
              <div className="stat-card">
                <div className="stat-ico ico-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>
                  </svg>
                </div>
                <div className="stat-label">This Month</div>
                <div className="stat-value">{fmt(thisMonth)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-ico ico-violet">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <div className="stat-label">Total Earned</div>
                <div className="stat-value">{fmt(totalCredited)}</div>
              </div>
            </div>

            <EarningsClient walletBalance={balance} account={account ?? null} />
          </div>
        </div>

        {hasPendingPayout && (
          <div className="helper mb-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="9"/><path d="M12 16v-5"/><circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none"/>
            </svg>
            A payout request is in progress. Please wait for it to complete before requesting another.
          </div>
        )}

        {/* Payout history */}
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Payout History</h2>
              <div className="sub">Withdrawals to your UPI account</div>
            </div>
            <div className="card-head-right">
              <span className="text-xs faint">{payouts.length} total</span>
            </div>
          </div>
          {payouts.length === 0 ? (
            <div style={{ padding: '48px 28px', textAlign: 'center', color: 'var(--fg-muted)' }}>
              No payouts yet. Request your first payout above.
            </div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Payout ID</th>
                    <th>UPI</th>
                    <th>Requested</th>
                    <th>Reference</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p: any) => (
                    <tr key={p.id}>
                      <td className="mono med">{p.id.slice(0, 12)}…</td>
                      <td className="mono">{p.upi_id}</td>
                      <td className="muted">{new Date(p.requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="mono text-xs faint">{p.razorpay_payout_id ?? '—'}</td>
                      <td className="num bold" style={{ textAlign: 'right' }}>{fmt(Number(p.amount_inr))}</td>
                      <td>
                        {p.status === 'completed'
                          ? <span className="badge badge-success">Completed</span>
                          : p.status === 'processing'
                          ? <span className="badge badge-info">Processing</span>
                          : p.status === 'failed'
                          ? <span className="badge badge-danger">Failed</span>
                          : <span className="badge badge-warn">Requested</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
