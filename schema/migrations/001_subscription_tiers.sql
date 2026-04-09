-- ============================================================
-- Migration 001 — Subscription Tiers
-- Run this in the Supabase SQL editor on your existing database.
-- ============================================================

-- ── New enums ────────────────────────────────────────────────
CREATE TYPE subscription_tier AS ENUM ('pro', 'premium', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired');

-- ── Add subscription_tier to profiles ───────────────────────
ALTER TABLE profiles
  ADD COLUMN subscription_tier subscription_tier NOT NULL DEFAULT 'pro';

-- ── Tighten campaign budget minimum to ₹20,000 ──────────────
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_budget_inr_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_budget_inr_check
  CHECK (budget_inr >= 20000);

-- ── subscriptions table ──────────────────────────────────────
-- Tracks billing history. Active tier is denormalised onto profiles.subscription_tier
-- for fast reads. Admin updates profiles.subscription_tier on tier change and
-- inserts a record here.
CREATE TABLE subscriptions (
  id           UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id    UUID               NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier         subscription_tier  NOT NULL,
  status       subscription_status NOT NULL DEFAULT 'active',
  amount_inr   NUMERIC(12,2)      NOT NULL DEFAULT 0,
  starts_at    TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  ends_at      TIMESTAMPTZ,          -- NULL = open-ended / manual
  payment_ref  TEXT,                 -- future Razorpay payment ID
  created_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_status    ON subscriptions(status);

-- ── RLS for subscriptions ────────────────────────────────────
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions: client sees own"
  ON subscriptions FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "subscriptions: admin sees all"
  ON subscriptions FOR SELECT
  USING (get_my_role() = 'admin');

-- Only admin/backend (service role) can insert or update subscriptions
-- No public INSERT/UPDATE policy — managed via Supabase service role key.

-- ── Seed: insert Pro subscription records for existing clients ──
INSERT INTO subscriptions (client_id, tier, status, amount_inr)
SELECT id, 'pro', 'active', 0
FROM profiles
WHERE role = 'client'
ON CONFLICT DO NOTHING;
