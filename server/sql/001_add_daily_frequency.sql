-- Migration 001: Add DAILY frequency option
-- Run this in the Supabase SQL Editor after the initial schema.

ALTER TYPE frequency_type ADD VALUE IF NOT EXISTS 'DAILY';

-- Verify:
-- SELECT enum_range(NULL::frequency_type);
-- Expected: {DAILY,WEEKLY,MONTHLY}
