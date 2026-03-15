-- ================================================================
-- Bug Fixes v6 - Database Migration
-- ================================================================
-- Date: 2026-03-15
-- Purpose: Add icon columns for customizable category/subcategory icons
--          and ensure soft delete support
-- ================================================================

-- Add icon columns to category table
ALTER TABLE category
ADD COLUMN IF NOT EXISTS category_icon VARCHAR(2),
ADD COLUMN IF NOT EXISTS subcategory_icon VARCHAR(2);

-- Ensure is_active column exists for soft delete
ALTER TABLE category
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Set all existing categories to active (if not already set)
UPDATE category 
SET is_active = true 
WHERE is_active IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN category.category_icon IS 'Custom emoji icon for category (VARCHAR(2) to support emoji characters)';
COMMENT ON COLUMN category.subcategory_icon IS 'Custom emoji icon for subcategory (VARCHAR(2) to support emoji characters)';
COMMENT ON COLUMN category.is_active IS 'Soft delete flag - false means deactivated, true means active';

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'category'
AND column_name IN ('category_icon', 'subcategory_icon', 'is_active')
ORDER BY ordinal_position;

-- ================================================================
-- Expected Result:
-- ================================================================
-- category_icon      | VARCHAR | 2    | YES | NULL
-- subcategory_icon   | VARCHAR | 2    | YES | NULL
-- is_active          | BOOLEAN | NULL | NO  | true
-- ================================================================
