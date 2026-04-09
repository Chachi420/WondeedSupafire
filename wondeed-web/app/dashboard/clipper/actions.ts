'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getClipperUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
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

  const { error } = await db.from('campaign_submissions').insert({
    campaign_id: campaignId,
    clipper_id:  user.id,
    clip_url:    clipUrl,
    platform,
    status:      'pending',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/clipper')
  revalidatePath('/dashboard/clipper/submissions')
  revalidatePath(`/dashboard/clipper/campaigns/${campaignId}`)
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
    .select('balance_inr')
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

  const { error } = await db.from('payouts').insert({
    clipper_id:   user.id,
    amount_inr:   amount,
    upi_id:       upiId,
    status:       'requested',
  })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/clipper/earnings')
}
