-- Migration: Gliederungs-Feld für Topics
ALTER TABLE topics ADD COLUMN IF NOT EXISTS outline TEXT[] NOT NULL DEFAULT '{}';
