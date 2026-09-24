-- Adds upstream/midstream/downstream classification to stations.
-- Source: station numbering convention confirmed directly by Ma'am Garcia
-- (domain expert / dissertation author) during the GIS expert meeting —
-- lower station number = more upstream, per named river. This is expert
-- ground truth, not a computed/inferred value.
--
-- Run this once in the Supabase SQL editor, after 0001_upload_batches.sql.

ALTER TABLE stations ADD COLUMN IF NOT EXISTS flow_position TEXT
  CHECK (flow_position IN ('upstream', 'midstream', 'downstream') OR flow_position IS NULL);

UPDATE stations SET flow_position = 'upstream'   WHERE station_id IN ('PTG 1', 'MPB 1', 'MPT 1');
UPDATE stations SET flow_position = 'midstream'  WHERE station_id IN ('PTG 2', 'PTG 3', 'MPB 2', 'MPB 3', 'MPT 2', 'MPT 3');
UPDATE stations SET flow_position = 'downstream' WHERE station_id IN ('PTG 4', 'MPB 4', 'MPT 4');

-- River-mouth / sea reference points are the most downstream point possible.
UPDATE stations SET flow_position = 'downstream'
  WHERE station_id IN ('PTG River Mouth', 'MPT-MPB River Mouth', 'MPT Sea');
