-- Migration: add valid_through expiration date to jobs table
-- Date: 2026-05-08

ALTER TABLE jobs ADD COLUMN valid_through DATE;

-- Backfill existing rows: default to 90 days from created_at
UPDATE jobs SET valid_through = (created_at + INTERVAL '90 days')::DATE WHERE valid_through IS NULL;
