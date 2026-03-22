-- ============================================
-- Migration: Add MNC Company Column to Income Table
-- Date: March 22, 2026
-- Description: Adds mnc_company column to track which company the income is from
-- ============================================

-- Add mnc_company column (nullable)
ALTER TABLE income
ADD COLUMN IF NOT EXISTS mnc_company VARCHAR(100);

-- Create index for faster filtering by company
CREATE INDEX IF NOT EXISTS idx_income_mnc_company
ON income(mnc_company)
WHERE mnc_company IS NOT NULL;

-- Add comment to column
COMMENT ON COLUMN income.mnc_company IS 'MNC company name (Mindtree, LTIMindtree, Comcast)';

-- Verify column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'income'
AND column_name = 'mnc_company';

-- ============================================
-- Migration Complete
-- ============================================
