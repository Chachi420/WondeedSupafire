'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchInstagramMetrics } from '@/lib/instagram/scraper'

async function getClipperUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

function extractYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    // youtube.com/watch?v=ID
    const v = u.searchParams.get('v')
    if (v) return v
    // youtu.be/ID or youtube.com/shorts/ID
    const pathMatch = u.pathname.match(/\/(?:shorts|embed|v)\/([\w-]{11})/)
    if (pathMatch) return pathMatch[1]
    // youtu.be short URL
    if (u.hostname === 'youtu.be') return u.pathname.slice(1, 12)
    return null
  } catch {
    return null
  }
}

type ClipResult = { url: string; success: boolean; viewCount?: number | null; error?: string }

export async function submitMultipleClips(
  campaignId: string,
  platform: 'instagram' | 'youtube',
  urls: string[]
): Promise<ClipResult[]> {
  const user = await getClipperUser()
  const db   = createAdminClient()

  if (!urls.length) throw new Error('No URLs provided')
  if (urls.length > 10) throw new Error('Maximum 10 clips per batch')

  // Validate campaign once for all clips
  const { data: campaign } = await db
    .from('campaigns')
    .select('status, platform, budget_remaining_inr')
    .eq('id', campaignId)
    .single()

  if (!campaign || campaign.status !== 'active')
    throw new Error('This campaign is not currently active')
  if (Number(campaign.budget_remaining_inr) <= 0)
    throw new Error('This campaign budget has been exhausted')
  if (campaign.platform !== 'both' && campaign.platform !== platform)
    throw new Error(`This campaign only accepts ${campaign.platform} clips`)

  // Fetch linked YouTube channel once if needed
  let linkedYouTubeChannelId: string | null = null
  if (platform === 'youtube') {
    const { data: social } = await db
      .from('clipper_social_accounts')
      .select('youtube_channel_id')
      .eq('clipper_id', user.id)
      .maybeSingle()
    linkedYouTubeChannelId = social?.youtube_channel_id ?? null
  }

  // Process all clips in parallel
  const results = await Promise.all(urls.map(async (rawUrl): Promise<ClipResult> => {
    const clipUrl = rawUrl.trim()
    try {
      if (!clipUrl.startsWith('http')) throw new Error('Invalid URL')

      let liveViewCount:    number | null = null
      let liveLikeCount:    number | null = null
      let liveCommentCount: number | null = null
      let viewCountSource:  'youtube_api' | 'instagram_api' | 'manual' | null = null

      if (platform === 'instagram') {
        const igMatch = clipUrl.match(/instagram\.com\/(?:reel|p)\/([\w-]+)/)
        if (!igMatch) throw new Error('Invalid Instagram Reel URL')
        const metrics = await fetchInstagramMetrics(clipUrl)
        if (metrics) {
          liveViewCount    = metrics.viewCount
          liveLikeCount    = metrics.likeCount
          liveCommentCount = metrics.commentCount
          viewCountSource  = 'instagram_api'
        }
      }

      if (platform === 'youtube') {
        const videoId = extractYouTubeVideoId(clipUrl)
        if (!videoId) throw new Error('Invalid YouTube URL')
        const API_KEY = process.env.YOUTUBE_API_KEY
        if (API_KEY) {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`
          )
          if (res.ok) {
            const data = await res.json()
            if (!data.items?.length) throw new Error('Video not found — make sure it is public')
            const item = data.items[0]
            if (linkedYouTubeChannelId && linkedYouTubeChannelId !== item.snippet.channelId)
              throw new Error('Video is not from your linked YouTube channel')
            liveViewCount    = parseInt(item.statistics.viewCount    ?? '0', 10)
            liveLikeCount    = parseInt(item.statistics.likeCount    ?? '0', 10)
            liveCommentCount = parseInt(item.statistics.commentCount ?? '0', 10)
            viewCountSource  = 'youtube_api'
          }
        }
      }

      const { error } = await db.from('campaign_submissions').insert({
        campaign_id:        campaignId,
        clipper_id:         user.id,
        clip_url:           clipUrl,
        platform,
        status:             'pending',
        live_view_count:    liveViewCount,
        live_like_count:    liveLikeCount,
        live_comment_count: liveCommentCount,
        view_count_source:  viewCountSource,
        last_refreshed_at:  viewCountSource ? new Date().toISOString() : null,
      })

      if (error) throw new Error(error.message)
      return { url: clipUrl, success: true, viewCount: liveViewCount }
    } catch (err: any) {
      return { url: clipUrl, success: false, error: err.message }
    }
  }))

  revalidatePath('/dashboard/clipper')
  revalidatePath('/dashboard/clipper/my-campaigns')
  revalidatePath(`/dashboard/clipper/campaigns/${campaignId}`)
  return results
}

export async function submitClip(formData: FormData) {
  const user = await getClipperUser()
  const db   = createAdminClient()

  const campaignId = formData.get('campaign_id') as string
  const clipUrl    = (formData.get('clip_url') as string).trim()
  const platform   = formData.get('platform') as 'instagram' | 'youtube'

  if (!clipUrl.startsWith('http')) throw new Error('Please enter a valid URL')

  // Verify campaign is active and has budget
  const { data: campaign } = await db
    .from('campaigns')
    .select('status, platform, budget_remaining_inr')
    .eq('id', campaignId)
    .single()

  if (!campaign || campaign.status !== 'active')
    throw new Error('This campaign is not currently active')
  if (Number(campaign.budget_remaining_inr) <= 0)
    throw new Error('This campaign budget has been exhausted')
  if (campaign.platform !== 'both' && campaign.platform !== platform)
    throw new Error(`This campaign only accepts ${campaign.platform} clips`)

  // Platform: verify clip ownership + fetch live stats
  let liveViewCount:    number | null = null
  let liveLikeCount:    number | null = null
  let liveCommentCount: number | null = null
  let viewCountSource:  'youtube_api' | 'instagram_api' | 'manual' | null = null

  if (platform === 'instagram') {
    const igMatch = clipUrl.match(/instagram\.com\/(?:reel|p)\/([\w-]+)/)
    if (!igMatch) throw new Error('Invalid Instagram URL. Use: instagram.com/reel/... or instagram.com/p/...')

    // Fetch public metrics via scraping API — no account linking required
    const metrics = await fetchInstagramMetrics(clipUrl)
    if (metrics) {
      liveViewCount    = metrics.viewCount
      liveLikeCount    = metrics.likeCount
      liveCommentCount = metrics.commentCount
      viewCountSource  = 'instagram_api'
    }
  }

  if (platform === 'youtube') {
    const videoId = extractYouTubeVideoId(clipUrl)
    if (!videoId) throw new Error('Invalid YouTube URL. Use: youtube.com/shorts/... or youtube.com/watch?v=...')

    const API_KEY = process.env.YOUTUBE_API_KEY
    if (API_KEY) {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`
      )
      if (res.ok) {
        const data = await res.json()
        if (!data.items?.length) throw new Error('Video not found on YouTube. Make sure the video is public.')

        const item = data.items[0]
        const videoChannelId: string = item.snippet.channelId

        // Check if clipper has a linked channel and verify ownership
        const { data: social } = await db
          .from('clipper_social_accounts')
          .select('youtube_channel_id')
          .eq('clipper_id', user.id)
          .maybeSingle()

        if (social?.youtube_channel_id && social.youtube_channel_id !== videoChannelId) {
          throw new Error(
            'This video does not belong to your linked YouTube channel. Submit a video from your verified channel.'
          )
        }

        liveViewCount    = parseInt(item.statistics.viewCount    ?? '0', 10)
        liveLikeCount    = parseInt(item.statistics.likeCount    ?? '0', 10)
        liveCommentCount = parseInt(item.statistics.commentCount ?? '0', 10)
        viewCountSource  = 'youtube_api'
      }
    }
  }

  const fullPayload = {
    campaign_id:        campaignId,
    clipper_id:         user.id,
    clip_url:           clipUrl,
    platform,
    status:             'pending',
    live_view_count:    liveViewCount,
    live_like_count:    liveLikeCount,
    live_comment_count: liveCommentCount,
    view_count_source:  viewCountSource,
    last_refreshed_at:  viewCountSource ? new Date().toISOString() : null,
  }

  let { error } = await db.from('campaign_submissions').insert(fullPayload)

  // If new stat columns don't exist yet (migration 004 not run), fall back to base insert
  if (error?.message?.includes('column')) {
    const baseResult = await db.from('campaign_submissions').insert({
      campaign_id: campaignId,
      clipper_id:  user.id,
      clip_url:    clipUrl,
      platform,
      status:      'pending',
    })
    error = baseResult.error
  }

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/clipper')
  revalidatePath('/dashboard/clipper/my-campaigns')
  revalidatePath(`/dashboard/clipper/campaigns/${campaignId}`)

  return { viewCount: liveViewCount }
}

export async function saveClipperAccount(formData: FormData) {
  const user = await getClipperUser()
  const db   = createAdminClient()

  const { error } = await db.from('clipper_accounts').upsert({
    clipper_id:           user.id,
    upi_id:               (formData.get('upi_id') as string).trim(),
    account_holder_name:  (formData.get('account_holder_name') as string).trim(),
    is_verified:          false,
  }, { onConflict: 'clipper_id' })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/clipper/earnings')
}

export async function requestPayout(formData: FormData) {
  const user = await getClipperUser()
  const db   = createAdminClient()

  const amount = parseFloat(formData.get('amount') as string)
  const upiId  = (formData.get('upi_id') as string).trim()

  if (!amount || amount <= 0) throw new Error('Enter a valid amount')
  if (!upiId) throw new Error('UPI ID is required')

  // Check balance
  const { data: wallet } = await db
    .from('wallets')
    .select('balance_inr, total_debited_inr')
    .eq('user_id', user.id)
    .single()

  if (!wallet || Number(wallet.balance_inr) < amount)
    throw new Error(`Insufficient balance. Available: ₹${wallet?.balance_inr ?? 0}`)

  // Check no pending payout already exists
  const { data: existing } = await db
    .from('payouts')
    .select('id')
    .eq('clipper_id', user.id)
    .in('status', ['requested', 'processing'])
    .maybeSingle()

  if (existing) throw new Error('You already have a payout request in progress')

  // Debit wallet first so process_payout_failed RPC can correctly restore it on failure
  const { error: debitError } = await db.from('wallets').update({
    balance_inr:      Number(wallet.balance_inr)      - amount,
    total_debited_inr: Number(wallet.total_debited_inr) + amount,
  }).eq('user_id', user.id)

  if (debitError) throw new Error(debitError.message)

  const { error: payoutError } = await db.from('payouts').insert({
    clipper_id: user.id,
    amount_inr: amount,
    upi_id:     upiId,
    status:     'requested',
  })

  if (payoutError) {
    // Compensating: restore wallet if payout insert failed
    await db.from('wallets').update({
      balance_inr:      Number(wallet.balance_inr),
      total_debited_inr: Number(wallet.total_debited_inr),
    }).eq('user_id', user.id)
    throw new Error(payoutError.message)
  }

  revalidatePath('/dashboard/clipper/earnings')
}
