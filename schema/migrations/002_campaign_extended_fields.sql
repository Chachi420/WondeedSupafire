-- ============================================================
-- Migration 002 — Campaign Extended Fields + Paused Status
-- Run in Supabase SQL editor BEFORE deploying the new campaign form.
-- ============================================================

-- ── Add 'paused' to campaign_status enum ────────────────────
ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'paused';

-- ── Extended columns on campaigns ───────────────────────────
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS source_content_url   TEXT,                -- link to reference video to clip
  ADD COLUMN IF NOT EXISTS target_platforms     TEXT[]  NOT NULL DEFAULT '{}',  -- ['instagram','youtube','moj','josh']
  ADD COLUMN IF NOT EXISTS clip_length_seconds  INTEGER,             -- NULL = any length
  ADD COLUMN IF NOT EXISTS clip_aspect_ratio    TEXT,                -- '9:16' | '16:9' | '1:1' | '4:5' | NULL = any
  ADD COLUMN IF NOT EXISTS clip_language        TEXT,                -- 'Hindi' | 'English' | etc. | NULL = any
  ADD COLUMN IF NOT EXISTS hook_style           TEXT,                -- 'Product Demo' | 'Trend Remix' | etc.
  ADD COLUMN IF NOT EXISTS min_views_for_payout BIGINT CHECK (min_views_for_payout IS NULL OR min_views_for_payout >= 0),
  ADD COLUMN IF NOT EXISTS mandatory_caption    TEXT,                -- required caption / hashtags for posts
  ADD COLUMN IF NOT EXISTS duration_days        INTEGER CHECK (duration_days IS NULL OR duration_days > 0),
  ADD COLUMN IF NOT EXISTS min_clipper_tier     subscription_tier NOT NULL DEFAULT 'pro';

-- Index for tier-based clipper filtering
CREATE INDEX IF NOT EXISTS idx_campaigns_min_clipper_tier ON campaigns(min_clipper_tier);
