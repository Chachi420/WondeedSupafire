-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004: Account approval status + social account verification
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Account status on profiles ────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (account_status IN ('pending', 'active', 'suspended'));

-- Existing users are already active — don't lock them out
UPDATE profiles SET account_status = 'active';

-- New clippers start as 'pending'. Clients + admins are auto-approved.
-- The DB trigger that creates profiles on signup sets role from metadata,
-- so we update the trigger to set account_status based on role:
-- admin/client → active immediately; clipper → pending

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_role      user_role;
  v_acc_status TEXT;
BEGIN
  v_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'clipper'
  );

  -- Clients and admins are active immediately; clippers need approval
  v_acc_status := CASE
    WHEN v_role IN ('client', 'admin') THEN 'active'
    ELSE 'pending'
  END;

  INSERT INTO profiles (id, phone, role, account_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.email, ''),
    v_role,
    v_acc_status
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ── 2. Social accounts table for clippers ────────────────────────────────────
CREATE TABLE IF NOT EXISTS clipper_social_accounts (
  clipper_id  UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Instagram (connected via Facebook OAuth)
  instagram_user_id         TEXT,                    -- numeric IG business account ID
  instagram_username        TEXT,                    -- @handle without @
  instagram_access_token    TEXT,                    -- long-lived token (~60 days)
  instagram_token_expires_at TIMESTAMPTZ,
  instagram_connected_at    TIMESTAMPTZ,

  -- YouTube (channel URL submitted by clipper, verified via API)
  youtube_channel_id        TEXT,                    -- UCxxxxxxxxxxxxxxxx
  youtube_channel_handle    TEXT,                    -- @ChannelName
  youtube_channel_title     TEXT,
  youtube_verified_at       TIMESTAMPTZ,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE clipper_social_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "social: clipper sees own"    ON clipper_social_accounts;
DROP POLICY IF EXISTS "social: admin sees all"      ON clipper_social_accounts;
DROP POLICY IF EXISTS "social: clipper inserts own" ON clipper_social_accounts;
DROP POLICY IF EXISTS "social: clipper updates own" ON clipper_social_accounts;
DROP POLICY IF EXISTS "social: admin updates any"   ON clipper_social_accounts;

CREATE POLICY "social: clipper sees own"
  ON clipper_social_accounts FOR SELECT
  USING (clipper_id = auth.uid());

CREATE POLICY "social: admin sees all"
  ON clipper_social_accounts FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "social: clipper inserts own"
  ON clipper_social_accounts FOR INSERT
  WITH CHECK (clipper_id = auth.uid());

CREATE POLICY "social: clipper updates own"
  ON clipper_social_accounts FOR UPDATE
  USING (clipper_id = auth.uid());

CREATE POLICY "social: admin updates any"
  ON clipper_social_accounts FOR UPDATE
  USING (get_my_role() = 'admin');

-- ── 3. Submission verification tracking ──────────────────────────────────────
ALTER TABLE campaign_submissions
  ADD COLUMN IF NOT EXISTS view_count_source TEXT
    CHECK (view_count_source IN ('manual', 'youtube_api', 'instagram_api')),
  ADD COLUMN IF NOT EXISTS live_view_count  BIGINT,   -- latest refreshed count (for display)
  ADD COLUMN IF NOT EXISTS live_like_count  BIGINT,
  ADD COLUMN IF NOT EXISTS live_comment_count BIGINT,
  ADD COLUMN IF NOT EXISTS last_refreshed_at TIMESTAMPTZ;

-- ── 4. Updated_at trigger for social accounts ─────────────────────────────────
DROP TRIGGER IF EXISTS trg_clipper_social_updated_at ON clipper_social_accounts;
CREATE TRIGGER trg_clipper_social_updated_at
  BEFORE UPDATE ON clipper_social_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Grant service role access
GRANT ALL ON clipper_social_accounts TO service_role;
