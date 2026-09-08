-- Adds a dedicated batches table: sampling metadata (river, collection dates)
-- and audit trail (who uploaded/archived, when) in one place, replacing the
-- previous GROUP BY sampling_stations derivation.
--
-- Run this once in the Supabase SQL editor (or via psql against DATABASE_URL).

CREATE TABLE IF NOT EXISTS upload_batches (
  batch_id          TEXT PRIMARY KEY,
  river             TEXT,
  collection_start  DATE,
  collection_end    DATE,
  record_count      INT NOT NULL DEFAULT 0,
  uploaded_by       TEXT,
  uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_archived       BOOLEAN NOT NULL DEFAULT FALSE,
  archived_by       TEXT,
  archived_at       TIMESTAMPTZ
);

-- Backfill from existing sampling_stations data so batches uploaded before
-- this migration still show up in the batch history list.
INSERT INTO upload_batches (batch_id, record_count, uploaded_at, is_archived)
SELECT
  batch_id,
  COUNT(*),
  MIN(created_at),
  BOOL_AND(is_archived)
FROM sampling_stations
GROUP BY batch_id
ON CONFLICT (batch_id) DO NOTHING;
