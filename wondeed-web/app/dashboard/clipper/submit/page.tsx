import { createAdminClient } from '@/lib/supabase/admin'
import SubmitClipClient from '@/components/clipper/SubmitClipClient'

export const dynamic = 'force-dynamic'

export default async function SubmitClipPage() {
  const db = createAdminClient()

  // Try with extended columns first; fall back to base columns if migrations haven't run
  let { data, error } = await db
    .from('campaigns')
    .select('id, title, platform, rate_per_million_inr, budget_remaining_inr, per_post_view_cap, end_date, source_content_url')
    .eq('status', 'active')
    .gt('budget_remaining_inr', 0)
    .order('created_at', { ascending: false })

  if (error) {
    const fallback = await db
      .from('campaigns')
      .select('id, title, platform, rate_per_million_inr, budget_remaining_inr, per_post_view_cap, end_date')
      .eq('status', 'active')
      .gt('budget_remaining_inr', 0)
      .order('created_at', { ascending: false })
    data = fallback.data
  }

  const campaigns = (data ?? []) as {
    id: string
    title: string
    platform: string
    rate_per_million_inr: number
    budget_remaining_inr: number
    end_date: string | null
    source_content_url: string | null
  }[]

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submit Clips</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Pick a campaign and paste up to 10 clip URLs — views are fetched automatically
        </p>
      </div>

      <SubmitClipClient campaigns={campaigns} />
    </div>
  )
}
