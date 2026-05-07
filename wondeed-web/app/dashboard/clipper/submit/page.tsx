import { createAdminClient } from '@/lib/supabase/admin'
import SubmitClipClient from '@/components/clipper/SubmitClipClient'

export const dynamic = 'force-dynamic'

export default async function SubmitClipPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>
}) {
  const { campaign: preselectedId } = await searchParams
  const db = createAdminClient()

  const { data: raw, error } = await (db.from('campaigns') as any)
    .select('id, title, platform, rate_per_million_inr, budget_remaining_inr, per_post_view_cap, end_date, source_content_url, niche')
    .eq('status', 'active')
    .gt('budget_remaining_inr', 0)
    .order('created_at', { ascending: false })

  let rawData = raw
  if (error) {
    const { data: fallback } = await db
      .from('campaigns')
      .select('id, title, platform, rate_per_million_inr, budget_remaining_inr, per_post_view_cap, end_date, source_content_url')
      .eq('status', 'active')
      .gt('budget_remaining_inr', 0)
      .order('created_at', { ascending: false })
    rawData = fallback
  }

  const campaigns = (rawData ?? []) as {
    id: string
    title: string
    platform: string
    rate_per_million_inr: number
    budget_remaining_inr: number
    end_date: string | null
    source_content_url: string | null
    niche: string | null
  }[]

  return (
    <>
      <div className="topbar">
        <div className="col">
          <h1>Submit Clips</h1>
          <div className="topbar-sub">Pick a campaign and paste up to 10 clip URLs — views are fetched automatically</div>
        </div>
      </div>

      <div className="content fade-up">
        <SubmitClipClient campaigns={campaigns} preselectedId={preselectedId} />
      </div>
    </>
  )
}
