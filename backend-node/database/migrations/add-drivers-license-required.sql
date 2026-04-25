-- Migration: Add drivers_license_required field to jobs table
-- Date: 2026-04-25

ALTER TABLE jobs ADD COLUMN drivers_license_required BOOLEAN DEFAULT 0;
