-- Migration: Add flexible_on_title field to jobs table
-- Date: 2025-11-23

ALTER TABLE jobs ADD COLUMN flexible_on_title BOOLEAN DEFAULT 1;
