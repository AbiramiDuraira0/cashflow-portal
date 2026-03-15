-- ============================================
-- File: 002_add_subcategory_column.sql
-- Purpose: Add subcategory column to category table
-- Author: Copilot AI Assistant
-- Date: 2026-03-15
-- Version: 1.0
-- ============================================

-- Description:
-- Adds a new subcategory column to the existing category table
-- to support hierarchical category structure.
-- Subcategory is optional (nullable) to maintain backward compatibility.

-- ============================================
-- 1) ADD SUBCATEGORY COLUMN
-- ============================================

DO $$
BEGIN
  -- Check if column already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'dbo' 
      AND table_name = 'category' 
      AND column_name = 'sub_category'
  ) THEN
    -- Add the subcategory column
    ALTER TABLE dbo.category 
    ADD COLUMN sub_category VARCHAR(50) NULL;
    
    RAISE NOTICE 'Column sub_category added successfully';
  ELSE
    RAISE NOTICE 'Column sub_category already exists, skipping...';
  END IF;
END$$;


-- ============================================
-- 2) ADD INDEX FOR SUBCATEGORY (Performance)
-- ============================================

-- Purpose: Improve query performance when filtering by subcategory
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE schemaname = 'dbo' 
      AND indexname = 'ix_category_subcategory'
  ) THEN
    CREATE INDEX ix_category_subcategory 
      ON dbo.category(sub_category) 
      WHERE sub_category IS NOT NULL;
    
    RAISE NOTICE 'Index ix_category_subcategory created successfully';
  ELSE
    RAISE NOTICE 'Index ix_category_subcategory already exists, skipping...';
  END IF;
END$$;


-- ============================================
-- 3) UPDATE UNIQUE INDEX (Include Subcategory)
-- ============================================

-- Purpose: Ensure uniqueness of category_name + sub_category combination
-- This allows same category name with different subcategories

DO $$
BEGIN
  -- Drop old unique index if exists
  IF EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE schemaname = 'dbo' 
      AND indexname = 'ux_category_name_ci'
  ) THEN
    DROP INDEX dbo.ux_category_name_ci;
    RAISE NOTICE 'Old unique index ux_category_name_ci dropped';
  END IF;
  
  -- Create new composite unique index
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE schemaname = 'dbo' 
      AND indexname = 'ux_category_name_subcategory_ci'
  ) THEN
    CREATE UNIQUE INDEX ux_category_name_subcategory_ci
      ON dbo.category (LOWER(category_name), LOWER(COALESCE(sub_category, '')));
    
    RAISE NOTICE 'New composite unique index ux_category_name_subcategory_ci created';
  END IF;
END$$;


-- ============================================
-- 4) ADD COMMENT TO COLUMN (Documentation)
-- ============================================

COMMENT ON COLUMN dbo.category.sub_category IS 
'Optional subcategory name (max 50 characters). Used for hierarchical category structure. Example: Category="Food", Subcategory="Groceries"';


-- ============================================
-- 5) VERIFICATION QUERIES
-- ============================================

\echo ''
\echo '============================================'
\echo 'Migration 002: Verification'
\echo '============================================'
\echo ''

-- Check column exists
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'dbo' 
  AND table_name = 'category'
  AND column_name = 'sub_category';

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'dbo' 
  AND tablename = 'category'
ORDER BY indexname;

-- Show sample data structure
SELECT 
  category_id,
  category_name,
  sub_category,
  is_active,
  created_at
FROM dbo.category
LIMIT 5;

\echo ''
\echo '✅ Migration 002 completed successfully!'
\echo ''


-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================

/*
-- Run this if you need to rollback the migration:

-- Drop new composite unique index
DROP INDEX IF EXISTS dbo.ux_category_name_subcategory_ci;

-- Recreate old unique index
CREATE UNIQUE INDEX ux_category_name_ci
  ON dbo.category (LOWER(category_name));

-- Drop subcategory index
DROP INDEX IF EXISTS dbo.ix_category_subcategory;

-- Drop subcategory column
ALTER TABLE dbo.category DROP COLUMN IF EXISTS sub_category;

*/
