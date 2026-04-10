-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003: Atomic RPCs for wallet and earnings operations
-- Run this in Supabase SQL editor (Database → SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── RPC 1: approve_submission ─────────────────────────────────────────────────
-- Atomically: compute earnings, insert earning record, decrement campaign budget,
-- credit clipper wallet, and optionally mark campaign completed.
-- Called by Next.js server action or FastAPI /submissions/{id}/approve

CREATE OR REPLACE FUNCTION approve_submission(
  p_submission_id   UUID,
  p_raw_view_count  BIGINT,
  p_reviewed_by     UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub            campaign_submissions%ROWTYPE;
  v_camp           campaigns%ROWTYPE;
  v_wallet         wallets%ROWTYPE;
  v_capped_views   BIGINT;
  v_raw_earnings   NUMERIC;
  v_earnings_inr   NUMERIC;
  v_new_remaining  NUMERIC;
  v_now            TIMESTAMPTZ := NOW();
BEGIN
  -- Lock and fetch submission
  SELECT * INTO v_sub
  FROM campaign_submissions
  WHERE id = p_submission_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;

  -- Fetch campaign
  SELECT * INTO v_camp
  FROM campaigns
  WHERE id = v_sub.campaign_id
  FOR UPDATE;

  -- Earnings calculation
  v_capped_views  := LEAST(p_raw_view_count, v_camp.per_post_view_cap);
  v_raw_earnings  := FLOOR(v_capped_views * v_camp.rate_per_million_inr / 1000000.0);
  v_earnings_inr  := LEAST(v_raw_earnings, v_camp.budget_remaining_inr);
  v_new_remaining := v_camp.budget_remaining_inr - v_earnings_inr;

  -- 1. Update submission
  UPDATE campaign_submissions SET
    status            = 'approved',
    raw_view_count    = p_raw_view_count,
    capped_view_count = v_capped_views,
    earnings_inr      = v_earnings_inr,
    reviewed_by       = p_reviewed_by,
    reviewed_at       = v_now
  WHERE id = p_submission_id;

  -- 2. Insert earning record
  INSERT INTO earnings (clipper_id, submission_id, campaign_id, amount_inr, status)
  VALUES (v_sub.clipper_id, p_submission_id, v_sub.campaign_id, v_earnings_inr, 'credited');

  -- 3. Decrement campaign budget (auto-complete if exhausted)
  UPDATE campaigns SET
    budget_remaining_inr = v_new_remaining,
    status = CASE WHEN v_new_remaining <= 0 THEN 'completed' ELSE status END
  WHERE id = v_sub.campaign_id;

  -- 4. Credit clipper wallet
  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_sub.clipper_id FOR UPDATE;
  IF FOUND THEN
    UPDATE wallets SET
      balance_inr        = balance_inr + v_earnings_inr,
      total_credited_inr = total_credited_inr + v_earnings_inr
    WHERE user_id = v_sub.clipper_id;
  END IF;

  RETURN jsonb_build_object(
    'submission_id',   p_submission_id,
    'capped_views',    v_capped_views,
    'earnings_inr',    v_earnings_inr,
    'budget_remaining', v_new_remaining
  );
END;
$$;


-- ── RPC 2: reject_campaign_and_refund ────────────────────────────────────────
-- Atomically: cancel a pending_approval campaign and refund the client wallet.

CREATE OR REPLACE FUNCTION reject_campaign_and_refund(
  p_campaign_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_camp   campaigns%ROWTYPE;
  v_wallet wallets%ROWTYPE;
BEGIN
  SELECT * INTO v_camp
  FROM campaigns
  WHERE id = p_campaign_id AND status = 'pending_approval'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campaign not found or not in pending_approval state';
  END IF;

  -- Cancel campaign
  UPDATE campaigns SET status = 'cancelled' WHERE id = p_campaign_id;

  -- Refund client wallet
  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_camp.client_id FOR UPDATE;
  IF FOUND THEN
    UPDATE wallets SET
      balance_inr       = balance_inr + v_camp.total_charged_inr,
      total_debited_inr = GREATEST(0, total_debited_inr - v_camp.total_charged_inr)
    WHERE user_id = v_camp.client_id;
  END IF;

  RETURN jsonb_build_object(
    'campaign_id',   p_campaign_id,
    'refunded_inr',  v_camp.total_charged_inr,
    'client_id',     v_camp.client_id
  );
END;
$$;


-- ── RPC 3: process_payout_failed ─────────────────────────────────────────────
-- Atomically: mark a payout as failed and restore clipper wallet balance.

CREATE OR REPLACE FUNCTION process_payout_failed(
  p_payout_id      UUID,
  p_failure_reason TEXT,
  p_processed_by   UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payout payouts%ROWTYPE;
  v_wallet wallets%ROWTYPE;
BEGIN
  SELECT * INTO v_payout
  FROM payouts
  WHERE id = p_payout_id AND status IN ('requested', 'processing')
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payout not found or already finalised';
  END IF;

  -- Mark failed
  UPDATE payouts SET
    status         = 'failed',
    failure_reason = p_failure_reason,
    processed_by   = p_processed_by,
    processed_at   = NOW()
  WHERE id = p_payout_id;

  -- Restore clipper wallet
  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_payout.clipper_id FOR UPDATE;
  IF FOUND THEN
    UPDATE wallets SET
      balance_inr       = balance_inr + v_payout.amount_inr,
      total_debited_inr = GREATEST(0, total_debited_inr - v_payout.amount_inr)
    WHERE user_id = v_payout.clipper_id;
  END IF;

  RETURN jsonb_build_object(
    'payout_id',    p_payout_id,
    'refunded_inr', v_payout.amount_inr,
    'clipper_id',   v_payout.clipper_id
  );
END;
$$;


-- ── RPC 4: admin_credit_wallet ────────────────────────────────────────────────
-- Atomically credit any user's wallet (manual top-up by admin).

CREATE OR REPLACE FUNCTION admin_credit_wallet(
  p_user_id   UUID,
  p_amount    NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;

  UPDATE wallets SET
    balance_inr        = balance_inr + p_amount,
    total_credited_inr = total_credited_inr + p_amount
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'user_id',         p_user_id,
    'credited_inr',    p_amount,
    'new_balance_inr', v_wallet.balance_inr + p_amount
  );
END;
$$;


-- Grant execute to service role (used by backend/server actions)
GRANT EXECUTE ON FUNCTION approve_submission         TO service_role;
GRANT EXECUTE ON FUNCTION reject_campaign_and_refund TO service_role;
GRANT EXECUTE ON FUNCTION process_payout_failed      TO service_role;
GRANT EXECUTE ON FUNCTION admin_credit_wallet        TO service_role;
