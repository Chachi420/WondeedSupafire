-- ============================================================
-- WONDEED — Supabase Schema
-- Paste this into the Supabase SQL editor and run it once.
-- All monetary values are stored as NUMERIC(12,2) in Indian Rupees (₹).
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enums ───────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('client', 'clipper', 'admin');

-- campaign_platform: what platform(s) a campaign accepts clips from
CREATE TYPE campaign_platform AS ENUM ('instagram', 'youtube', 'both');

CREATE TYPE campaign_status AS ENUM (
  'draft',            -- client editing, not yet submitted
  'pending_approval', -- submitted, waiting for admin
  'active',           -- approved and running
  'paused',           -- temporarily paused by client
  'completed',        -- budget exhausted OR end_date passed
  'cancelled'         -- cancelled by client or admin
);

-- submission_platform: a specific clip is always on ONE platform
CREATE TYPE submission_platform AS ENUM ('instagram', 'youtube');

CREATE TYPE submission_status AS ENUM (
  'pending',   -- submitted by clipper, awaiting admin review
  'approved',  -- admin entered view count and approved
  'rejected'   -- rejected by admin
);

CREATE TYPE earning_status AS ENUM (
  'pending',    -- earning created, not yet credited to wallet
  'credited',   -- credited to clipper's Wondeed wallet
  'paid_out'    -- included in a completed payout
);

CREATE TYPE payout_status AS ENUM (
  'requested',  -- clipper submitted payout request
  'processing', -- admin initiated Razorpay transfer
  'completed',  -- Razorpay confirmed success
  'failed'      -- Razorpay failed; balance restored
);

-- subscription_tier: client plan tier (stored on profiles + subscriptions)
CREATE TYPE subscription_tier AS ENUM ('pro', 'premium', 'enterprise');

-- subscription_status: lifecycle of a subscription record
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired');

-- ── Tables ──────────────────────────────────────────────────

-- profiles: one row per auth.users entry, stores role + name
CREATE TABLE profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone       TEXT        UNIQUE,   -- NULL for email-based users (admins created via dashboard)
  full_name   TEXT,
  role               user_role         NOT NULL DEFAULT 'clipper',
  subscription_tier  subscription_tier NOT NULL DEFAULT 'pro',  -- only meaningful for role='client'
  created_at         TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- campaigns: posted by clients
--
-- Budget model:
--   budget_inr          = clipper earnings pool (what clippers can earn in total)
--   platform_fee_inr    = 20% of budget_inr → Wondeed's revenue
--   total_charged_inr   = budget_inr + platform_fee_inr → debited from client wallet on activation
--   budget_remaining_inr = starts at budget_inr, decremented on each submission approval
--
-- When budget_remaining_inr reaches 0 (or would go negative), the campaign is set to 'completed'.
--
-- Earnings per submission = FLOOR(capped_view_count × rate_per_million_inr / 1,000,000)
-- rate_per_million_inr defaults to 10,000 (₹10,000 per 1M views)
CREATE TABLE campaigns (
  id                    UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id             UUID              NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,

  title                 TEXT              NOT NULL,
  description           TEXT,
  platform              campaign_platform NOT NULL,

  -- Financials
  budget_inr            NUMERIC(12,2)     NOT NULL CHECK (budget_inr >= 20000),
  platform_fee_inr      NUMERIC(12,2)     NOT NULL CHECK (platform_fee_inr >= 0),
  total_charged_inr     NUMERIC(12,2)     NOT NULL CHECK (total_charged_inr > 0),
  budget_remaining_inr  NUMERIC(12,2)     NOT NULL CHECK (budget_remaining_inr >= 0),
  -- NOTE: unspent budget_remaining_inr on campaign completion (budget exhausted OR
  -- end_date passed) accrues to Wondeed. It is NOT refunded to the client wallet.
  -- The full total_charged_inr is debited from the client wallet at activation.
  rate_per_million_inr  NUMERIC(12,2)     NOT NULL DEFAULT 10000,
  per_post_view_cap     BIGINT            NOT NULL CHECK (per_post_view_cap > 0),

  -- Extended content / clip spec fields
  source_content_url    TEXT,                                           -- reference video URL to clip from
  target_platforms      TEXT[]            NOT NULL DEFAULT '{}',        -- ['instagram','youtube','moj','josh']
  clip_length_seconds   INTEGER,                                        -- NULL = any
  clip_aspect_ratio     TEXT,                                           -- '9:16' | '16:9' | '1:1' | '4:5'
  clip_language         TEXT,                                           -- 'Hindi' | 'English' | etc.
  hook_style            TEXT,                                           -- 'Product Demo' | 'Trend Remix' | etc.
  min_views_for_payout  BIGINT            CHECK (min_views_for_payout IS NULL OR min_views_for_payout >= 0),
  mandatory_caption     TEXT,                                           -- required caption + hashtags
  duration_days         INTEGER           CHECK (duration_days IS NULL OR duration_days > 0),
  min_clipper_tier      subscription_tier NOT NULL DEFAULT 'pro',

  -- Lifecycle
  status                campaign_status   NOT NULL DEFAULT 'draft',
  start_date            DATE,
  end_date              DATE,

  -- Admin approval
  approved_by           UUID              REFERENCES profiles(id),
  approved_at           TIMESTAMPTZ,

  created_at            TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

  -- Integrity constraints
  CONSTRAINT campaign_budget_remaining_le_budget
    CHECK (budget_remaining_inr <= budget_inr),
  CONSTRAINT campaign_fee_is_20pct
    CHECK (ABS(platform_fee_inr - budget_inr * 0.20) < 0.01),
  CONSTRAINT campaign_total_charged_correct
    CHECK (ABS(total_charged_inr - (budget_inr + platform_fee_inr)) < 0.01),
  CONSTRAINT campaign_dates_order
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  CONSTRAINT campaign_approval_fields
    CHECK (
      (approved_by IS NULL AND approved_at IS NULL) OR
      (approved_by IS NOT NULL AND approved_at IS NOT NULL)
    )
);

-- campaign_submissions: one row per clip submitted by a clipper
--
-- Approval flow:
--   1. Clipper submits (status = 'pending', raw_view_count = NULL)
--   2. Admin enters raw_view_count → system computes capped_view_count
--      capped_view_count = LEAST(raw_view_count, campaigns.per_post_view_cap)
--   3. Admin sets status = 'approved'
--   4. Backend (service role) inserts into earnings and decrements campaign.budget_remaining_inr
CREATE TABLE campaign_submissions (
  id               UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id      UUID               NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
  clipper_id       UUID               NOT NULL REFERENCES profiles(id)  ON DELETE RESTRICT,

  clip_url         TEXT               NOT NULL,
  platform         submission_platform NOT NULL,

  status           submission_status  NOT NULL DEFAULT 'pending',

  -- View counts (NULL until admin fills in)
  raw_view_count   BIGINT,
  capped_view_count BIGINT,                    -- computed by backend on admin input
  earnings_inr     NUMERIC(12,2),              -- computed on approval

  -- Review metadata
  reviewed_by      UUID               REFERENCES profiles(id),
  reviewed_at      TIMESTAMPTZ,
  admin_notes      TEXT,

  created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

  CONSTRAINT submission_capped_le_raw
    CHECK (capped_view_count IS NULL OR raw_view_count IS NULL OR capped_view_count <= raw_view_count),
  CONSTRAINT submission_review_fields
    CHECK (
      (reviewed_by IS NULL AND reviewed_at IS NULL) OR
      (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
    )
);

-- earnings: created by backend (service role) when a submission is approved.
-- One row per approved submission (enforced by UNIQUE on submission_id).
CREATE TABLE earnings (
  id             UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  clipper_id     UUID           NOT NULL REFERENCES profiles(id)              ON DELETE RESTRICT,
  submission_id  UUID           NOT NULL REFERENCES campaign_submissions(id)  ON DELETE RESTRICT,
  campaign_id    UUID           NOT NULL REFERENCES campaigns(id)             ON DELETE RESTRICT,
  amount_inr     NUMERIC(12,2)  NOT NULL CHECK (amount_inr > 0),
  status         earning_status NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  UNIQUE (submission_id)   -- exactly one earning record per submission
);

-- wallets: one per user (client or clipper).
-- Modified only by the FastAPI backend via service role key.
--
-- For clients:  balance_inr depleted by campaign activation (total_charged_inr)
-- For clippers: balance_inr grows on earning credit, shrinks on payout
CREATE TABLE wallets (
  id                 UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID          NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  balance_inr        NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (balance_inr >= 0),
  total_credited_inr NUMERIC(12,2) NOT NULL DEFAULT 0, -- sum of all credits (top-ups / earnings)
  total_debited_inr  NUMERIC(12,2) NOT NULL DEFAULT 0, -- sum of all debits (campaign spend / payouts)
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE (user_id)
);

-- payouts: clipper requests a monthly manual payout via UPI
CREATE TABLE payouts (
  id                 UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  clipper_id         UUID          NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount_inr         NUMERIC(12,2) NOT NULL CHECK (amount_inr > 0),
  upi_id             TEXT          NOT NULL,  -- UPI ID at time of request (snapshot)
  status             payout_status NOT NULL DEFAULT 'requested',

  -- Razorpay fields (populated by backend)
  razorpay_payout_id TEXT,
  failure_reason     TEXT,

  -- Admin who processed the payout
  processed_by       UUID          REFERENCES profiles(id),
  requested_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  processed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT payout_processed_fields
    CHECK (
      (processed_by IS NULL AND processed_at IS NULL) OR
      (processed_by IS NOT NULL AND processed_at IS NOT NULL)
    )
);

-- clipper_accounts: stores UPI + Razorpay identifiers for payouts.
-- One account per clipper. Admin verifies before first payout.
CREATE TABLE clipper_accounts (
  id                        UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  clipper_id                UUID        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  upi_id                    TEXT        NOT NULL,
  account_holder_name       TEXT        NOT NULL,
  is_verified               BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Razorpay contact + fund account (populated by backend on verification)
  razorpay_contact_id       TEXT,
  razorpay_fund_account_id  TEXT,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (clipper_id)   -- one payment account per clipper
);

-- subscriptions: billing history; active tier is denormalised onto profiles.subscription_tier
CREATE TABLE subscriptions (
  id           UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id    UUID                NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier         subscription_tier   NOT NULL,
  status       subscription_status NOT NULL DEFAULT 'active',
  amount_inr   NUMERIC(12,2)       NOT NULL DEFAULT 0,
  starts_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  ends_at      TIMESTAMPTZ,        -- NULL = open-ended / manually managed
  payment_ref  TEXT,               -- Razorpay payment ID (future)
  created_at   TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX idx_campaigns_client_id          ON campaigns(client_id);
CREATE INDEX idx_campaigns_status               ON campaigns(status);
CREATE INDEX idx_campaigns_status_end_date      ON campaigns(status, end_date);
CREATE INDEX idx_campaigns_min_clipper_tier     ON campaigns(min_clipper_tier);

CREATE INDEX idx_submissions_campaign_id      ON campaign_submissions(campaign_id);
CREATE INDEX idx_submissions_clipper_id       ON campaign_submissions(clipper_id);
CREATE INDEX idx_submissions_status           ON campaign_submissions(status);
CREATE INDEX idx_submissions_campaign_status  ON campaign_submissions(campaign_id, status); -- admin review queue

CREATE INDEX idx_earnings_clipper_id          ON earnings(clipper_id);
CREATE INDEX idx_earnings_campaign_id         ON earnings(campaign_id);
CREATE INDEX idx_earnings_status              ON earnings(status);

CREATE INDEX idx_payouts_clipper_id           ON payouts(clipper_id);
CREATE INDEX idx_payouts_status               ON payouts(status);

CREATE INDEX idx_subscriptions_client_id      ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_status         ON subscriptions(status);

-- ── updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_submissions_updated_at
  BEFORE UPDATE ON campaign_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_clipper_accounts_updated_at
  BEFORE UPDATE ON clipper_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Auto-create profile + wallet on new Supabase user ────────
-- Fires when a user signs up via phone OTP.
-- Role is read from raw_user_meta_data.role (set by the frontend at signInWithOtp).
-- Admins are provisioned manually; raw_user_meta_data.role should never be 'admin'
-- from the public signup flow — enforce this separately in auth policies or frontend.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _role user_role;
BEGIN
  -- Resolve role: default to 'clipper'; never allow self-assignment of 'admin'
  _role := CASE
    WHEN (NEW.raw_user_meta_data->>'role') IN ('client', 'clipper')
    THEN (NEW.raw_user_meta_data->>'role')::user_role
    ELSE 'clipper'
  END;

  INSERT INTO profiles (id, phone, role)
  VALUES (NEW.id, NEW.phone, _role)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns           ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets             ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE clipper_accounts    ENABLE ROW LEVEL SECURITY;

-- Helper: returns the calling user's role without a subquery join in every policy
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- ┌─────────────────────────────────────────────────────────┐
-- │  profiles                                               │
-- └─────────────────────────────────────────────────────────┘
-- Any user can read their own profile
CREATE POLICY "profiles: self select"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Admins can read all profiles (e.g., to find clippers, clients)
CREATE POLICY "profiles: admin select all"
  ON profiles FOR SELECT
  USING (get_my_role() = 'admin');

-- Users can update their own profile, but cannot change their own role
CREATE POLICY "profiles: self update (no role change)"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- INSERT is handled by the handle_new_user() trigger (SECURITY DEFINER).
-- No public INSERT policy needed.

-- ┌─────────────────────────────────────────────────────────┐
-- │  campaigns                                              │
-- └─────────────────────────────────────────────────────────┘
CREATE POLICY "campaigns: client sees own"
  ON campaigns FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "campaigns: clipper sees active"
  ON campaigns FOR SELECT
  USING (get_my_role() = 'clipper' AND status = 'active');

CREATE POLICY "campaigns: admin sees all"
  ON campaigns FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "campaigns: client creates"
  ON campaigns FOR INSERT
  WITH CHECK (client_id = auth.uid() AND get_my_role() = 'client');

-- Clients can only edit their own campaigns that are still in draft
CREATE POLICY "campaigns: client updates own draft"
  ON campaigns FOR UPDATE
  USING (client_id = auth.uid() AND status = 'draft')
  WITH CHECK (client_id = auth.uid());

-- Admins can update any campaign (approval, status changes)
CREATE POLICY "campaigns: admin updates any"
  ON campaigns FOR UPDATE
  USING (get_my_role() = 'admin');

-- ┌─────────────────────────────────────────────────────────┐
-- │  campaign_submissions                                   │
-- └─────────────────────────────────────────────────────────┘
CREATE POLICY "submissions: clipper sees own"
  ON campaign_submissions FOR SELECT
  USING (clipper_id = auth.uid());

-- Clients can see all submissions on their campaigns
CREATE POLICY "submissions: client sees on own campaigns"
  ON campaign_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id  = campaign_submissions.campaign_id
        AND campaigns.client_id = auth.uid()
    )
  );

CREATE POLICY "submissions: admin sees all"
  ON campaign_submissions FOR SELECT
  USING (get_my_role() = 'admin');

-- Clippers can only submit to active campaigns
CREATE POLICY "submissions: clipper inserts to active campaign"
  ON campaign_submissions FOR INSERT
  WITH CHECK (
    clipper_id = auth.uid()
    AND get_my_role() = 'clipper'
    AND EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_submissions.campaign_id
        AND campaigns.status = 'active'
    )
  );

-- Only admins can review (set view_count, status, etc.)
CREATE POLICY "submissions: admin updates"
  ON campaign_submissions FOR UPDATE
  USING (get_my_role() = 'admin');

-- ┌─────────────────────────────────────────────────────────┐
-- │  earnings                                               │
-- └─────────────────────────────────────────────────────────┘
CREATE POLICY "earnings: clipper sees own"
  ON earnings FOR SELECT
  USING (clipper_id = auth.uid());

CREATE POLICY "earnings: client sees on own campaigns"
  ON earnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id         = earnings.campaign_id
        AND campaigns.client_id  = auth.uid()
    )
  );

CREATE POLICY "earnings: admin sees all"
  ON earnings FOR SELECT
  USING (get_my_role() = 'admin');

-- earnings rows are written by the FastAPI backend (service role key).
-- No INSERT/UPDATE/DELETE policies for the anon/authenticated role.

-- ┌─────────────────────────────────────────────────────────┐
-- │  wallets                                                │
-- └─────────────────────────────────────────────────────────┘
CREATE POLICY "wallets: user sees own"
  ON wallets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "wallets: admin sees all"
  ON wallets FOR SELECT
  USING (get_my_role() = 'admin');

-- wallet mutations are backend-only (service role).
-- No UPDATE policy for anon/authenticated.

-- ┌─────────────────────────────────────────────────────────┐
-- │  payouts                                                │
-- └─────────────────────────────────────────────────────────┘
CREATE POLICY "payouts: clipper sees own"
  ON payouts FOR SELECT
  USING (clipper_id = auth.uid());

CREATE POLICY "payouts: admin sees all"
  ON payouts FOR SELECT
  USING (get_my_role() = 'admin');

-- Clippers can request a payout; backend validates balance before accepting
CREATE POLICY "payouts: clipper inserts"
  ON payouts FOR INSERT
  WITH CHECK (
    clipper_id = auth.uid()
    AND get_my_role() = 'clipper'
  );

-- Admins process payouts (status transitions, Razorpay ID, etc.)
CREATE POLICY "payouts: admin updates"
  ON payouts FOR UPDATE
  USING (get_my_role() = 'admin');

-- ┌─────────────────────────────────────────────────────────┐
-- │  clipper_accounts                                       │
-- └─────────────────────────────────────────────────────────┘
CREATE POLICY "clipper_accounts: clipper sees own"
  ON clipper_accounts FOR SELECT
  USING (clipper_id = auth.uid());

CREATE POLICY "clipper_accounts: admin sees all"
  ON clipper_accounts FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "clipper_accounts: clipper inserts own"
  ON clipper_accounts FOR INSERT
  WITH CHECK (
    clipper_id = auth.uid()
    AND get_my_role() = 'clipper'
  );

-- Clippers can update UPI ID / name; is_verified can only be set by admin
CREATE POLICY "clipper_accounts: clipper updates own (no verify)"
  ON clipper_accounts FOR UPDATE
  USING (clipper_id = auth.uid() AND get_my_role() = 'clipper')
  WITH CHECK (
    clipper_id = auth.uid()
    AND is_verified = (SELECT is_verified FROM clipper_accounts WHERE clipper_id = auth.uid())
  );

CREATE POLICY "clipper_accounts: admin updates any"
  ON clipper_accounts FOR UPDATE
  USING (get_my_role() = 'admin');

-- ┌─────────────────────────────────────────────────────────┐
-- │  subscriptions                                          │
-- └─────────────────────────────────────────────────────────┘
CREATE POLICY "subscriptions: client sees own"
  ON subscriptions FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "subscriptions: admin sees all"
  ON subscriptions FOR SELECT
  USING (get_my_role() = 'admin');

-- INSERT/UPDATE only via service role (admin backend). No public policy.
