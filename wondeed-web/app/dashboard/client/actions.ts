'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TIER_CONFIG, MIN_CAMPAIGN_BUDGET_INR } from '@/lib/tiers'
import type { SubscriptionTier } from '@/lib/tiers'

async function getClientUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function createCampaign(formData: FormData) {
  const user = await getClientUser()
  const db   = createAdminClient()

  const budgetInr = parseFloat(formData.get('budget_inr') as string)
  if (!budgetInr || budgetInr < MIN_CAMPAIGN_BUDGET_INR)
    throw new Error(`Minimum campaign budget is ₹${MIN_CAMPAIGN_BUDGET_INR.toLocaleString('en-IN')}`)

  const perPostViewCap = parseInt(formData.get('per_post_view_cap') as string, 10)
  if (!perPostViewCap || perPostViewCap <= 0) throw new Error('Invalid per-post view cap')

  // ── Tier limit check ─────────────────────────────────────────
  const { data: profile } = await db
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const tier       = ((profile?.subscription_tier as SubscriptionTier | null) ?? 'pro') as SubscriptionTier
  const tierConfig = TIER_CONFIG[tier]

  if (isFinite(tierConfig.campaign_limit)) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await db
      .from('campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .gte('created_at', startOfMonth.toISOString())
      .neq('status', 'cancelled')

    if ((count ?? 0) >= tierConfig.campaign_limit) {
      throw new Error(
        `Your ${tierConfig.name} plan allows ${tierConfig.campaign_limit} campaigns per month. Upgrade to create more.`
      )
    }
  }
  // ─────────────────────────────────────────────────────────────

  const platformFee  = Math.round(budgetInr * 0.20 * 100) / 100
  const totalCharged = Math.round((budgetInr + platformFee) * 100) / 100

  // ── Read extended fields ──────────────────────────────────────
  const targetPlatforms  = formData.getAll('target_platforms') as string[]
  const durationDays     = parseInt(formData.get('duration_days') as string, 10) || null
  const minViewsForPayout = parseInt(formData.get('min_views_for_payout') as string, 10) || null
  const clipLengthSeconds = parseInt(formData.get('clip_length_seconds') as string, 10) || null
  const clipAspectRatio  = (formData.get('clip_aspect_ratio') as string) || null
  const clipLanguage     = (formData.get('clip_language') as string) || null
  const hookStyle        = (formData.get('hook_style') as string) || null
  const minClipperTier   = ((formData.get('min_clipper_tier') as string) || 'pro') as SubscriptionTier

  // Compute end_date from duration_days if provided
  let endDate: string | null = null
  if (durationDays) {
    const d = new Date()
    d.setDate(d.getDate() + durationDays)
    endDate = d.toISOString().split('T')[0]
  }

  const { data, error } = await db.from('campaigns').insert({
    client_id:            user.id,
    title:                (formData.get('title') as string).trim(),
    description:          (formData.get('description') as string).trim() || null,
    budget_inr:           budgetInr,
    platform_fee_inr:     platformFee,
    total_charged_inr:    totalCharged,
    budget_remaining_inr: budgetInr,
    rate_per_million_inr: 10000,
    per_post_view_cap:    perPostViewCap,
    platform:             formData.get('platform') as 'instagram' | 'youtube' | 'both',
    end_date:             endDate,
    status:               'draft',
    // extended fields
    source_content_url:   (formData.get('source_content_url') as string).trim() || null,
    target_platforms:     targetPlatforms.length > 0 ? targetPlatforms : ['instagram', 'youtube'],
    clip_length_seconds:  clipLengthSeconds,
    clip_aspect_ratio:    clipAspectRatio,
    clip_language:        clipLanguage,
    hook_style:           hookStyle,
    min_views_for_payout: minViewsForPayout,
    mandatory_caption:    (formData.get('mandatory_caption') as string).trim() || null,
    duration_days:        durationDays,
    min_clipper_tier:     minClipperTier,
  }).select('id').single()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/client')
  revalidatePath('/dashboard/client/campaigns')
  redirect(`/dashboard/client/campaigns/${data.id}`)
}

export async function submitForApproval(campaignId: string) {
  const user = await getClientUser()
  const db   = createAdminClient()

  // Fetch the campaign to get the total amount that must be charged
  const { data: campaign } = await db
    .from('campaigns')
    .select('total_charged_inr, status')
    .eq('id', campaignId)
    .eq('client_id', user.id)
    .single()

  if (!campaign || campaign.status !== 'draft') throw new Error('Campaign not found or not in draft status')

  const totalCharged = Number(campaign.total_charged_inr)

  // Check wallet balance
  const { data: wallet } = await db
    .from('wallets')
    .select('balance_inr, total_debited_inr')
    .eq('user_id', user.id)
    .maybeSingle()

  const walletBalance = Number(wallet?.balance_inr ?? 0)
  if (walletBalance < totalCharged) {
    throw new Error(
      `Insufficient wallet balance. You need ₹${totalCharged.toLocaleString('en-IN')} but your wallet has ₹${walletBalance.toLocaleString('en-IN')}.`
    )
  }

  // Update campaign status
  const { error } = await db.from('campaigns')
    .update({ status: 'pending_approval' })
    .eq('id', campaignId)
    .eq('client_id', user.id)
    .eq('status', 'draft')

  if (error) throw new Error(error.message)

  // Deduct from wallet
  const { error: walletError } = await db.from('wallets')
    .update({
      balance_inr:       walletBalance - totalCharged,
      total_debited_inr: Number(wallet?.total_debited_inr ?? 0) + totalCharged,
    })
    .eq('user_id', user.id)

  if (walletError) {
    // Compensate: revert campaign back to draft
    await db.from('campaigns').update({ status: 'draft' }).eq('id', campaignId)
    throw new Error('Failed to deduct wallet balance. Please try again.')
  }

  revalidatePath('/dashboard/client')
  revalidatePath('/dashboard/client/campaigns')
  revalidatePath(`/dashboard/client/campaigns/${campaignId}`)
}

export async function cancelCampaign(campaignId: string) {
  const user = await getClientUser()
  const db   = createAdminClient()

  await db.from('campaigns')
    .update({ status: 'cancelled' })
    .eq('id', campaignId)
    .eq('client_id', user.id)
    .in('status', ['draft', 'pending_approval'])

  revalidatePath('/dashboard/client')
  revalidatePath('/dashboard/client/campaigns')
}

export async function pauseCampaign(campaignId: string) {
  const user = await getClientUser()
  const db   = createAdminClient()

  await db.from('campaigns')
    .update({ status: 'paused' })
    .eq('id', campaignId)
    .eq('client_id', user.id)
    .eq('status', 'active')

  revalidatePath('/dashboard/client/campaigns')
}

export async function resumeCampaign(campaignId: string) {
  const user = await getClientUser()
  const db   = createAdminClient()

  await db.from('campaigns')
    .update({ status: 'active' })
    .eq('id', campaignId)
    .eq('client_id', user.id)
    .eq('status', 'paused')

  revalidatePath('/dashboard/client/campaigns')
}

export async function createCampaignAndSubmit(formData: FormData) {
  const user = await getClientUser()
  const db   = createAdminClient()

  // ── Validate required fields ──────────────────────────────────
  const title = (formData.get('title') as string ?? '').trim()
  if (!title) throw new Error('Campaign name is required')

  const budgetInr = parseFloat(formData.get('budget_inr') as string)
  if (!budgetInr || budgetInr < MIN_CAMPAIGN_BUDGET_INR)
    throw new Error(`Minimum campaign budget is ₹${MIN_CAMPAIGN_BUDGET_INR.toLocaleString('en-IN')}`)

  const perPostViewCap = parseInt(formData.get('per_post_view_cap') as string, 10)
  if (!perPostViewCap || perPostViewCap <= 0) throw new Error('Per-post view cap is required and must be greater than 0')

  const targetPlatforms = formData.getAll('target_platforms') as string[]
  if (targetPlatforms.length === 0) throw new Error('Select at least one target platform')

  // ── Tier limit check ──────────────────────────────────────────
  const { data: profile } = await db
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const tier       = ((profile?.subscription_tier as SubscriptionTier | null) ?? 'pro') as SubscriptionTier
  const tierConfig = TIER_CONFIG[tier]

  if (isFinite(tierConfig.campaign_limit)) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const { count } = await db
      .from('campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .gte('created_at', startOfMonth.toISOString())
      .neq('status', 'cancelled')
    if ((count ?? 0) >= tierConfig.campaign_limit) {
      throw new Error(
        `Your ${tierConfig.name} plan allows ${tierConfig.campaign_limit} campaigns per month. Upgrade to create more.`
      )
    }
  }

  // ── Calculate fees ────────────────────────────────────────────
  const platformFee  = Math.round(budgetInr * 0.20 * 100) / 100
  const totalCharged = Math.round((budgetInr + platformFee) * 100) / 100

  // ── Wallet balance check ──────────────────────────────────────
  const { data: wallet } = await db
    .from('wallets')
    .select('balance_inr, total_debited_inr')
    .eq('user_id', user.id)
    .maybeSingle()

  const walletBalance = Number(wallet?.balance_inr ?? 0)
  if (walletBalance < totalCharged) {
    throw new Error(
      `Insufficient wallet balance. You need ₹${totalCharged.toLocaleString('en-IN')} (budget + 20% platform fee) but your wallet has ₹${walletBalance.toLocaleString('en-IN')}.`
    )
  }

  // ── Parse remaining fields ────────────────────────────────────
  const durationDays      = parseInt(formData.get('duration_days') as string, 10) || null
  const minViewsForPayout = parseInt(formData.get('min_views_for_payout') as string, 10) || 10000
  const clipLengthSeconds = parseInt(formData.get('clip_length_seconds') as string, 10) || null
  const clipAspectRatio   = (formData.get('clip_aspect_ratio') as string) || '9:16'
  const clipLanguage      = (formData.get('clip_language') as string) || null
  const hookStyle         = (formData.get('hook_style') as string) || null
  const minClipperTier    = ((formData.get('min_clipper_tier') as string) || 'pro') as SubscriptionTier
  const mandatoryCaption  = (formData.get('mandatory_caption') as string ?? '').trim() || null
  const sourceContentUrl  = (formData.get('source_content_url') as string ?? '').trim() || null
  const description       = (formData.get('description') as string ?? '').trim() || null

  // Derive platform enum from selected platforms
  const hasIG = targetPlatforms.includes('instagram')
  const hasYT = targetPlatforms.includes('youtube')
  const derivedPlatform: 'instagram' | 'youtube' | 'both' =
    hasIG && !hasYT ? 'instagram' :
    hasYT && !hasIG ? 'youtube' :
    'both'

  let endDate: string | null = null
  if (durationDays) {
    const d = new Date()
    d.setDate(d.getDate() + durationDays)
    endDate = d.toISOString().split('T')[0]
  }

  // ── Insert campaign ───────────────────────────────────────────
  const { data: campaign, error: campaignError } = await db.from('campaigns').insert({
    client_id:            user.id,
    title,
    description,
    budget_inr:           budgetInr,
    platform_fee_inr:     platformFee,
    total_charged_inr:    totalCharged,
    budget_remaining_inr: budgetInr,
    rate_per_million_inr: 10000,
    per_post_view_cap:    perPostViewCap,
    platform:             derivedPlatform,
    status:               'pending_approval',
    source_content_url:   sourceContentUrl,
    target_platforms:     targetPlatforms,
    clip_length_seconds:  clipLengthSeconds,
    clip_aspect_ratio:    clipAspectRatio,
    clip_language:        clipLanguage,
    hook_style:           hookStyle,
    min_views_for_payout: minViewsForPayout,
    mandatory_caption:    mandatoryCaption,
    duration_days:        durationDays,
    min_clipper_tier:     minClipperTier,
    end_date:             endDate,
  }).select('id').single()

  if (campaignError) throw new Error(campaignError.message)

  // ── Deduct from wallet ────────────────────────────────────────
  const { error: walletError } = await db.from('wallets')
    .update({
      balance_inr:       walletBalance - totalCharged,
      total_debited_inr: Number(wallet?.total_debited_inr ?? 0) + totalCharged,
    })
    .eq('user_id', user.id)

  if (walletError) {
    // Rollback campaign if wallet deduction fails
    await db.from('campaigns').delete().eq('id', campaign.id)
    throw new Error('Failed to deduct wallet balance. Please try again.')
  }

  revalidatePath('/dashboard/client')
  revalidatePath('/dashboard/client/campaigns')
  redirect('/dashboard/client/campaigns')
}

export async function updateProfile(formData: FormData) {
  const user = await getClientUser()
  const db   = createAdminClient()

  const fullName = (formData.get('full_name') as string).trim()
  if (!fullName) throw new Error('Name cannot be empty')

  const { error } = await db.from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/client')
  revalidatePath('/dashboard/client/settings')
}
