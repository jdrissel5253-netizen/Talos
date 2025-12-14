-- Migration: Add template tracking columns to communication_log table
-- Created: 2025-12-12

-- Add new columns to communication_log for template metadata
ALTER TABLE communication_log ADD COLUMN template_type TEXT;
ALTER TABLE communication_log ADD COLUMN template_tone TEXT;
ALTER TABLE communication_log ADD COLUMN is_nudge BOOLEAN DEFAULT 0;
ALTER TABLE communication_log ADD COLUMN scheduling_link TEXT;

-- Create index for template queries (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS idx_communication_log_template ON communication_log(template_type, template_tone);
