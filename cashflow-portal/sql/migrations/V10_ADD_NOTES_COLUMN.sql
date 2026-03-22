-- ============================================
-- MIGRATION: Add Notes Column to Category Table
-- ============================================
-- Version: 10 (Bug Fixes V10)
-- Date: March 15, 2026
-- Description: Adds optional notes column to category table
-- ============================================

-- Add notes column to category table
ALTER TABLE category 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN category.notes IS 'Optional notes or description for the category';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'category' 
  AND column_name = 'notes';

-- Show updated table structure (alternative to \d command)
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'category'
ORDER BY ordinal_position;

-- Success message
SELECT '✅ Notes column added successfully!' AS status;
