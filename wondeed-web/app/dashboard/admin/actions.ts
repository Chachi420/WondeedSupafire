'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchInstagramMetrics } from '@/lib/instagram/scraper'
import type { UserRole } from '@/lib/types/database.types'

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

// ── Campaigns ────────────────────────────────────────────────

export async function approveCampaign(campaignId: string, ratePerMillionInr: number) {
  const user = await getAdminUser()
  const db   = createAdminClient()

  if (!ratePerMillionInr || ratePerMillionInr <= 0) throw new Error('A valid CPM rate is required to approve a campaign')

  // Budget was already deducted from client wallet at submission time.
  // Admin approval activates the campaign and sets the CPM rate.
  const { error } = await db.from('campaigns').update({
    status:               'active',
    approved_by:          user.id,
    approved_at:          new Date().toISOString(),
    rate_per_million_inr: ratePerMillionInr,
  }).eq('id', campaignId).eq('status', 'pending_approval')

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/admin/campaigns')
  revalidatePath('/dashboard/client')
  revalidatePath('/dashboard/client/campaigns')
}

export async function updateCampaignCpm(campaignId: string, ratePerMillionInr: number) {
  await getAdminUser()
  const db = createAdminClient()

  if (!ratePerMillionInr || ratePerMillionInr <= 0) throw new Error('CPM rate must be greater than 0')

  const { error } = await db.from('campaigns')
    .update({ rate_per_million_inr: ratePerMillionInr })
    .eq('id', campaignId)
    .in('status', ['active', 'paused'])

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/campaigns')
  revalidatePath('/dashboard/clipper')
}

export async function rejectCampaign(campaignId: string) {
  const db = createAdminClient()
  const { error } = await db.rpc('reject_campaign_and_refund', { p_campaign_id: campaignId })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/admin/campaigns')
  revalidatePath('/dashboard/client')
  revalidatePath('/dashboard/client/campaigns')
}

// ── Submissions ──────────────────────────────────────────────

export async function approveSubmission(submissionId: string, rawViewCount: number) {
  const user = await getAdminUser()
  const db = createAdminClient()
  const { error } = await db.rpc('approve_submission', {
    p_submission_id:  submissionId,
    p_raw_view_count: rawViewCount,
    p_reviewed_by:    user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/admin/submissions')
}

export async function rejectSubmission(submissionId: string, adminNotes: string) {
  const user = await getAdminUser()
  const db = createAdminClient()
  await db.from('campaign_submissions').update({
    status:      'rejected',
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
    admin_notes: adminNotes || null,
  }).eq('id', submissionId)

  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/admin/submissions')
}

// ── Payouts ──────────────────────────────────────────────────

export async function markPayoutProcessing(payoutId: string) {
  const user = await getAdminUser()
  const db = createAdminClient()
  const { error } = await db.from('payouts').update({
    status:       'processing',
    processed_by: user.id,
    processed_at: new Date().toISOString(),
  }).eq('id', payoutId).eq('status', 'requested')
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/payouts')
}

export async function markPayoutCompleted(payoutId: string, razorpayPayoutId: string) {
  const user = await getAdminUser()
  const db = createAdminClient()
  const { error } = await db.from('payouts').update({
    status:            'completed',
    razorpay_payout_id: razorpayPayoutId.trim(),
    processed_by:      user.id,
    processed_at:      new Date().toISOString(),
  }).eq('id', payoutId).in('status', ['requested', 'processing'])
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/payouts')
}

export async function markPayoutFailed(payoutId: string, failureReason: string) {
  const user = await getAdminUser()
  const db = createAdminClient()
  const { error } = await db.rpc('process_payout_failed', {
    p_payout_id:      payoutId,
    p_failure_reason: failureReason.trim() || '',
    p_processed_by:   user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/payouts')
}

export async function verifyClipperAccount(clipperId: string) {
  const db = createAdminClient()
  const { error } = await db
    .from('clipper_accounts')
    .update({ is_verified: true })
    .eq('clipper_id', clipperId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/payouts')
}

// ── Wallets ──────────────────────────────────────────────────

export async function adminCreditWallet(userId: string, amountInr: number, note: string) {
  await getAdminUser()
  const db = createAdminClient()
  if (amountInr <= 0) throw new Error('Amount must be positive')
  const { error } = await db.rpc('admin_credit_wallet', {
    p_user_id: userId,
    p_amount:  amountInr,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/users')
}

// ── Users ────────────────────────────────────────────────────

export async function updateUserRole(userId: string, role: UserRole) {
  const db = createAdminClient()
  const { error } = await db.from('profiles').update({ role }).eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/users')
}

// ── Clipper account approval ──────────────────────────────────

export async function approveClipperAccount(clipperId: string) {
  await getAdminUser()
  const db = createAdminClient()
  const { error } = await db
    .from('profiles')
    .update({ account_status: 'active' })
    .eq('id', clipperId)
    .eq('role', 'clipper')
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/clippers')
}

export async function suspendClipperAccount(clipperId: string) {
  await getAdminUser()
  const db = createAdminClient()
  const { error } = await db
    .from('profiles')
    .update({ account_status: 'suspended' })
    .eq('id', clipperId)
    .eq('role', 'clipper')
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/clippers')
}

export async function reactivateClipperAccount(clipperId: string) {
  await getAdminUser()
  const db = createAdminClient()
  const { error } = await db
    .from('profiles')
    .update({ account_status: 'active' })
    .eq('id', clipperId)
    .eq('role', 'clipper')
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/clippers')
}

// ── Live view fetching ───────────────────────────────────────

export async function fetchLiveViewCount(submissionId: string): Promise<number | null> {
  await getAdminUser()
  const db = createAdminClient()

  const { data: sub } = await db
    .from('campaign_submissions')
    .select('clip_url, platform')
    .eq('id', submissionId)
    .single()

  if (!sub) return null

  if (sub.platform === 'instagram') {
    const metrics = await fetchInstagramMetrics(sub.clip_url)
    return metrics?.viewCount ?? null
  }

  if (sub.platform === 'youtube') {
    const match = sub.clip_url.match(/(?:shorts\/|watch\?v=|youtu\.be\/)([\w-]{11})/)
    const videoId = match?.[1]
    if (!videoId) return null
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) return null
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`
    )
    if (!res.ok) return null
    const json = await res.json()
    return parseInt(json.items?.[0]?.statistics?.viewCount ?? '0', 10) || null
  }

  return null
}

// ── Dev / testing ────────────────────────────────────────────

export async function seedTestCampaign(): Promise<string> {
  const user = await getAdminUser()
  const db   = createAdminClient()

  const title = `[TEST] Instagram Campaign – ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`

  // Minimal payload — only columns that exist in the original schema
  const { data, error } = await db.from('campaigns').insert({
    client_id:            user.id,
    title,
    platform:             'instagram',
    budget_inr:           20000,
    platform_fee_inr:     0,
    total_charged_inr:    20000,
    budget_remaining_inr: 20000,
    rate_per_million_inr: 0,  // admin sets this at approval; 0 = not yet set
    per_post_view_cap:    1_000_000,
    status:               'active',
  }).select('id').single()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin/campaigns')
  revalidatePath('/dashboard/clipper/submit')
  return data.id
}
