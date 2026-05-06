-- Migration 006: Variable CPM rate and variable platform fee
-- Run this in the Supabase SQL editor.
--
-- Changes:
--   1. rate_per_million_inr default changed from 10000 → 0
--      (admin must explicitly set it per campaign based on niche; 0 = not yet set)
--   2. Remove the hardcoded 20% platform fee constraint (campaign_fee_is_20pct)
--      Platform fee is now variable — decided per client by Abhinav.

-- 1. Change default CPM to 0 (unset until admin approves)
ALTER TABLE campaigns
  ALTER COLUMN rate_per_million_inr SET DEFAULT 0;

-- 2. Drop the hardcoded 20% fee constraint
ALTER TABLE campaigns
  DROP CONSTRAINT IF EXISTS campaign_fee_is_20pct;

-- Optional: reset any existing campaigns that used the 10000 default but were
-- never explicitly set by an admin (i.e. test/seed campaigns).
-- Review before uncommenting:
-- UPDATE campaigns SET rate_per_million_inr = 0 WHERE rate_per_million_inr = 10000 AND status = 'draft';
