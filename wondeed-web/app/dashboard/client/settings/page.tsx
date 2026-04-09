import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateProfile } from '@/app/dashboard/client/actions'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const { data: profile } = await db
    .from('profiles')
    .select('full_name, phone, role, subscription_tier, created_at')
    .eq('id', user!.id)
    .single()

  const p = profile as any

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account information</p>
      </div>

      {/* Profile card */}
      <form action={updateProfile} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide text-xs text-gray-500">
          Profile Information
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Display name</label>
          <input
            name="full_name"
            type="text"
            defaultValue={p?.full_name ?? ''}
            required
            placeholder="Your full name or company name"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
          <input
            type="text"
            value={p?.phone ?? '—'}
            disabled
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-400">Phone is your login identifier and cannot be changed.</p>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Account details (read-only) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Details</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Role</p>
            <p className="font-medium text-gray-900 capitalize">{p?.role ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Subscription tier</p>
            <p className="font-medium text-gray-900 capitalize">{p?.subscription_tier ?? 'pro'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Account ID</p>
            <p className="font-mono text-xs text-gray-600 break-all">{user!.id}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Member since</p>
            <p className="font-medium text-gray-900">
              {p?.created_at
                ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
