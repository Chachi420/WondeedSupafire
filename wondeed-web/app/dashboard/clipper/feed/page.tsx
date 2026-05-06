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
    (db.from('campaigns') as any)
      .select(
        'id, title, description, platform, target_platforms, ' +
        'budget_inr, budget_remaining_inr, rate_per_million_inr, per_post_view_cap, ' +
        'end_date, min_clipper_tier, clip_aspect_ratio, clip_length_seconds, ' +
        'clip_language, hook_style, min_views_for_payout, source_content_url, niche, created_at'
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

  const campaigns        = ((campaignsResult.data ?? []) as unknown) as FeedCampaign[]
  const joinedCampaignIds = new Set(
    (submissionsResult.data ?? []).map(s => s.campaign_id)
  )
  const clipperTier = profileResult.data?.subscription_tier ?? 'pro'

  return (
    <>
      <div className="topbar">
        <div className="col">
          <h1>Campaign Feed</h1>
          <div className="topbar-sub">{campaigns.length} active campaigns · Browse, filter, and join</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/>
            </svg>
            Saved filters
          </button>
        </div>
      </div>
      <div className="content fade-up">
        <CampaignFeedClient
          campaigns={campaigns}
          joinedCampaignIds={joinedCampaignIds}
          clipperTier={clipperTier}
        />
      </div>
    </>
  )
}
