-- Migration 002: Quellen und Hinweise je Topic (Issue #14)
ALTER TABLE topics ADD COLUMN IF NOT EXISTS sources JSONB NOT NULL DEFAULT '[]';

COMMENT ON COLUMN topics.sources IS 'Array von Quellangaben: [{label, url, section}]';
