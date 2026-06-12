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

  const balance  = Number(wallet?.balance_inr        ?? 0)
  const credited = Number(wallet?.total_credited_inr ?? 0)
  const debited  = Number(wallet?.total_debited_inr  ?? 0)

  return (
    <>
      <div className="topbar">
        <div className="col">
          <h1>Wallet</h1>
          <div className="topbar-sub">Fund your campaigns via UPI · Balance debited on campaign approval</div>
        </div>
      </div>

      <div className="content fade-up">
        <div className="wallet-hero mb-20">
          <div className="row between items-start">
            <div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Available Balance
              </div>
              <div className="mt-8" style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {fmt(balance)}
              </div>
              <div className="mt-12 row gap-12 text-md" style={{ color: 'rgba(255,255,255,0.85)' }}>
                <span>Topped up: {fmt(credited)}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>Spent: {fmt(debited)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Top Up Wallet</h2>
              <div className="sub">UPI / card top-ups — coming soon</div>
            </div>
            <div className="card-head-right">
              <span className="badge badge-warn">Phase 2</span>
            </div>
          </div>
          <div style={{ padding: '20px 24px' }} className="col gap-16">
            <div className="helper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="9"/><path d="M12 16v-5"/><circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none"/>
              </svg>
              To add funds during testing, contact the admin team.
            </div>
            <div className="g3">
              {[5_000, 10_000, 25_000, 50_000, 1_00_000, 2_00_000].map(amt => (
                <button key={amt} disabled className="btn btn-secondary" style={{ opacity: 0.4, cursor: 'not-allowed' }}>
                  {fmt(amt)}
                </button>
              ))}
            </div>
            <button disabled className="btn btn-primary" style={{ opacity: 0.4, cursor: 'not-allowed', width: '100%' }}>
              Top up wallet
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
