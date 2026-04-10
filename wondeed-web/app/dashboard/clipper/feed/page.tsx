import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import CampaignFeedClient from '@/components/clipper/CampaignFeedClient'
import type { FeedCampaign } from '@/components/clipper/CampaignFeedClient'

export const dynamic = 'force-dynamic'

export default async function CampaignFeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const [campaignsResult, submissionsResult, profileResult] = await Promise.all([
    db.from('campaigns')
      .select(
        'id, title, description, platform, target_platforms, ' +
        'budget_inr, budget_remaining_inr, rate_per_million_inr, per_post_view_cap, ' +
        'end_date, min_clipper_tier, clip_aspect_ratio, clip_length_seconds, ' +
        'clip_language, hook_style, min_views_for_payout, source_content_url, created_at'
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    db.from('campaign_submissions')
      .select('campaign_id')
      .eq('clipper_id', user!.id),
    db.from('profiles')
      .select('subscription_tier')
      .eq('id', user!.id)
      .single(),
  ])

  const campaigns        = (campaignsResult.data ?? []) as FeedCampaign[]
  const joinedCampaignIds = new Set(
    (submissionsResult.data ?? []).map(s => s.campaign_id)
  )
  const clipperTier = profileResult.data?.subscription_tier ?? 'pro'

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Campaign Feed</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Browse live campaigns, filter by platform or tier, and join to start earning
        </p>
      </div>

      <CampaignFeedClient
        campaigns={campaigns}
        joinedCampaignIds={joinedCampaignIds}
        clipperTier={clipperTier}
      />
    </div>
  )
}
