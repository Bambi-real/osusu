-- Migration 002: Add CANCELLED group status option
-- Run this in the Supabase SQL Editor after the initial schema and migration 001.

ALTER TYPE group_status ADD VALUE IF NOT EXISTS 'CANCELLED';

-- Verify:
-- SELECT enum_range(NULL::group_status);
-- Expected: {FORMING,ACTIVE,COMPLETED,CANCELLED}
