-- Migration 005: Add niche column for campaign categorization + CPM tracking
-- Run this in the Supabase SQL editor

-- Add niche column to campaigns table
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS niche text;

-- Reset platform_fee_inr to 0 for any existing campaigns
-- (optional cleanup — does not affect payouts since total_charged_inr is what matters)
-- UPDATE campaigns SET platform_fee_inr = 0 WHERE platform_fee_inr > 0;
