-- Run this in Supabase SQL Editor
-- Adds the 'area' column to demands to categorize by agency department

ALTER TABLE demands ADD COLUMN IF NOT EXISTS area TEXT 
  DEFAULT 'GENERIC'
  CHECK (area IN ('VIDEOMAKER', 'ACCOUNTS', 'DESIGN', 'TRAFFIC', 'GENERIC'));

-- Update existing demands to GENERIC if null
UPDATE demands SET area = 'GENERIC' WHERE area IS NULL;
