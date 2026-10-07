'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function WondeedLogo() {
  return (
    <div style={{ padding: '16px 24px' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--fg)' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: 'linear-gradient(135deg, #F04E23, #FFB800)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 14, color: '#0a0a0a',
        }}>W</div>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Wondeed</span>
      </Link>
    </div>
  )
}

export function PendingApprovalScreen() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <WondeedLogo />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card" style={{ width: '100%', maxWidth: 440, padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg style={{ width: 32, height: 32, color: '#d97706' }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Account Pending Approval</h1>
          <p className="text-xs faint mb-20" style={{ lineHeight: 1.6 }}>
            Your clipper account is under review. Our team will verify your profile within 24–48 hours.
            You will receive a notification once approved.
          </p>
          <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: 16, textAlign: 'left', marginBottom: 20 }} className="col gap-6">
            <p className="text-xs med" style={{ color: '#d97706' }}>While you wait:</p>
            <p className="text-xs faint">• Make sure you have a professional Instagram/YouTube account</p>
            <p className="text-xs faint">• Your account must be public and in good standing</p>
            <p className="text-xs faint">• Have your UPI ID ready for payouts</p>
          </div>
          <p className="text-xs faint" style={{ marginBottom: 24 }}>
            Questions? Contact us at{' '}
            <a href="mailto:support@wondeed.com" style={{ color: 'var(--primary)', fontWeight: 500 }}>
              support@wondeed.com
            </a>
          </p>
          <button onClick={handleSignOut} className="btn btn-ghost btn-block" style={{ fontSize: 13 }}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

export function SuspendedScreen() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <WondeedLogo />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card" style={{ width: '100%', maxWidth: 440, padding: '40px 32px', textAlign: 'center', borderColor: 'rgba(239,68,68,0.3)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg style={{ width: 32, height: 32, color: 'var(--danger)' }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Account Suspended</h1>
          <p className="text-xs faint mb-16" style={{ lineHeight: 1.6 }}>
            Your account has been suspended. Please contact support if you believe this is an error.
          </p>
          <p className="text-xs faint" style={{ marginBottom: 24 }}>
            Contact:{' '}
            <a href="mailto:support@wondeed.com" style={{ color: 'var(--primary)', fontWeight: 500 }}>
              support@wondeed.com
            </a>
          </p>
          <button onClick={handleSignOut} className="btn btn-ghost btn-block" style={{ fontSize: 13 }}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
