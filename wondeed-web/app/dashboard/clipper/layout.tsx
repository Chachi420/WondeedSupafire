import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClipperSidebar from '@/components/clipper/Sidebar'

function PendingApprovalScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Account Pending Approval</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Your clipper account is under review. Our team will verify your profile within 24–48 hours.
          You will receive a notification once approved.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2 mb-6">
          <p className="text-xs font-semibold text-amber-800 mb-1">While you wait:</p>
          <p className="text-xs text-amber-700">• Make sure you have a professional Instagram/YouTube account</p>
          <p className="text-xs text-amber-700">• Your account must be public and in good standing</p>
          <p className="text-xs text-amber-700">• Have your UPI ID ready for payouts</p>
        </div>
        <p className="text-xs text-gray-400">
          Questions? Contact us at{' '}
          <a href="mailto:support@wondeed.com" className="text-emerald-600 font-medium hover:underline">
            support@wondeed.com
          </a>
        </p>
      </div>
    </div>
  )
}

function SuspendedScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Account Suspended</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Your account has been suspended. Please contact support if you believe this is an error.
        </p>
        <p className="text-xs text-gray-400">
          Contact:{' '}
          <a href="mailto:support@wondeed.com" className="text-emerald-600 font-medium hover:underline">
            support@wondeed.com
          </a>
        </p>
      </div>
    </div>
  )
}

export default async function ClipperLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, account_status').eq('id', user.id).single()

  if ((profile as { role: string } | null)?.role !== 'clipper') redirect('/dashboard')

  const status = (profile as { account_status?: string } | null)?.account_status ?? 'active'

  if (status === 'pending') return <PendingApprovalScreen />
  if (status === 'suspended') return <SuspendedScreen />

  return (
    <div className="min-h-screen bg-gray-50">
      <ClipperSidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  )
}
