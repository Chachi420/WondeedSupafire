'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/lib/types/database.types'

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

// ── Campaigns ────────────────────────────────────────────────

export async function approveCampaign(campaignId: string) {
  const user = await getAdminUser()
  const db   = createAdminClient()

  // Budget was already deducted from client wallet at submission time.
  // Admin approval simply activates the campaign — no wallet mutation needed.
  const { error } = await db.from('campaigns').update({
    status:      'active',
    approved_by: user.id,
    approved_at: new Date().toISOString(),
  }).eq('id', campaignId).eq('status', 'pending_approval')

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/admin/campaigns')
  revalidatePath('/dashboard/client')
  revalidatePath('/dashboard/client/campaigns')
}

export async function rejectCampaign(campaignId: string) {
  const db = createAdminClient()

  // Fetch campaign to get client_id + total_charged so we can refund wallet
  const { data: campaign, error: fetchErr } = await db
    .from('campaigns')
    .select('client_id, total_charged_inr')
    .eq('id', campaignId)
    .eq('status', 'pending_approval')
    .single()

  if (fetchErr || !campaign) throw new Error('Campaign not found or already processed')

  // Refund client wallet
  const { data: wallet } = await db
    .from('wallets')
    .select('balance_inr, total_debited_inr')
    .eq('user_id', campaign.client_id)
    .single()

  if (wallet) {
    await db.from('wallets').update({
      balance_inr:       Number(wallet.balance_inr)       + Number(campaign.total_charged_inr),
      total_debited_inr: Math.max(0, Number(wallet.total_debited_inr) - Number(campaign.total_charged_inr)),
    }).eq('user_id', campaign.client_id)
  }

  // Cancel campaign
  const { error } = await db.from('campaigns')
    .update({ status: 'cancelled' })
    .eq('id', campaignId)

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

  // Fetch submission joined with campaign financials
  const { data: sub, error: subErr } = await db
    .from('campaign_submissions')
    .select(`
      id, clipper_id, campaign_id,
      campaigns ( rate_per_million_inr, per_post_view_cap, budget_remaining_inr )
    `)
    .eq('id', submissionId)
    .single()

  if (subErr || !sub) throw new Error('Submission not found')

  const camp = sub.campaigns as {
    rate_per_million_inr: number
    per_post_view_cap: number
    budget_remaining_inr: number
  }

  // Earnings calculation
  const cappedViews  = Math.min(rawViewCount, Number(camp.per_post_view_cap))
  const rawEarnings  = Math.floor(cappedViews * Number(camp.rate_per_million_inr) / 1_000_000)
  const earningsInr  = Math.min(rawEarnings, Number(camp.budget_remaining_inr))
  const newRemaining = Number(camp.budget_remaining_inr) - earningsInr
  const now          = new Date().toISOString()

  // 1. Update submission
  await db.from('campaign_submissions').update({
    status:            'approved',
    raw_view_count:    rawViewCount,
    capped_view_count: cappedViews,
    earnings_inr:      earningsInr,
    reviewed_by:       user.id,
    reviewed_at:       now,
  }).eq('id', submissionId)

  // 2. Insert earning record
  await db.from('earnings').insert({
    clipper_id:    sub.clipper_id,
    submission_id: submissionId,
    campaign_id:   sub.campaign_id,
    amount_inr:    earningsInr,
    status:        'credited',
  })

  // 3. Decrement campaign budget (auto-complete if exhausted)
  await db.from('campaigns').update({
    budget_remaining_inr: newRemaining,
    ...(newRemaining <= 0 ? { status: 'completed' } : {}),
  }).eq('id', sub.campaign_id)

  // 4. Credit clipper wallet
  const { data: wallet } = await db
    .from('wallets').select('balance_inr, total_credited_inr')
    .eq('user_id', sub.clipper_id).single()

  if (wallet) {
    await db.from('wallets').update({
      balance_inr:        Number(wallet.balance_inr)        + earningsInr,
      total_credited_inr: Number(wallet.total_credited_inr) + earningsInr,
    }).eq('user_id', sub.clipper_id)
  }

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

  // Fetch payout to refund clipper wallet
  const { data: payout, error: fetchErr } = await db
    .from('payouts')
    .select('clipper_id, amount_inr, status')
    .eq('id', payoutId)
    .single()

  if (fetchErr || !payout) throw new Error('Payout not found')
  if (payout.status === 'completed') throw new Error('Cannot fail a completed payout')

  // Refund clipper wallet
  const { data: wallet } = await db
    .from('wallets')
    .select('balance_inr, total_debited_inr')
    .eq('user_id', payout.clipper_id)
    .single()

  if (wallet) {
    await db.from('wallets').update({
      balance_inr:      Number(wallet.balance_inr)      + Number(payout.amount_inr),
      total_debited_inr: Math.max(0, Number(wallet.total_debited_inr) - Number(payout.amount_inr)),
    }).eq('user_id', payout.clipper_id)
  }

  const { error } = await db.from('payouts').update({
    status:        'failed',
    failure_reason: failureReason.trim() || null,
    processed_by:  user.id,
    processed_at:  new Date().toISOString(),
  }).eq('id', payoutId)

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

// ── Users ────────────────────────────────────────────────────

export async function updateUserRole(userId: string, role: UserRole) {
  const db = createAdminClient()
  const { error } = await db.from('profiles').update({ role }).eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/users')
}
