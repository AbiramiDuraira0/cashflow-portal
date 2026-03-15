-- ============================================
-- File: 002_add_icon_columns.sql
-- Purpose: Add icon columns to category table
-- Author: Copilot AI Assistant
-- Date: 2026-03-15
-- Version: 1.0
-- ============================================

-- Description:
-- Adds category_icon, sub_category, and subcategory_icon columns
-- to support the enhanced category management with icons

-- ============================================
-- ADD COLUMNS
-- ============================================

\echo '🔄 Adding icon and subcategory columns to category table...'

-- Add sub_category column (VARCHAR 50, optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'dbo' 
      AND table_name = 'category' 
      AND column_name = 'sub_category'
  ) THEN
    ALTER TABLE dbo.category 
    ADD COLUMN sub_category VARCHAR(50) NULL;
    RAISE NOTICE '✅ Added sub_category column';
  ELSE
    RAISE NOTICE '⚠️  sub_category column already exists';
  END IF;
END$$;

-- Add category_icon column (VARCHAR 2 for emoji storage)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'dbo' 
      AND table_name = 'category' 
      AND column_name = 'category_icon'
  ) THEN
    ALTER TABLE dbo.category 
    ADD COLUMN category_icon VARCHAR(2) NULL;
    RAISE NOTICE '✅ Added category_icon column';
  ELSE
    RAISE NOTICE '⚠️  category_icon column already exists';
  END IF;
END$$;

-- Add subcategory_icon column (VARCHAR 2 for emoji storage)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'dbo' 
      AND table_name = 'category' 
      AND column_name = 'subcategory_icon'
  ) THEN
    ALTER TABLE dbo.category 
    ADD COLUMN subcategory_icon VARCHAR(2) NULL;
    RAISE NOTICE '✅ Added subcategory_icon column';
  ELSE
    RAISE NOTICE '⚠️  subcategory_icon column already exists';
  END IF;
END$$;

-- ============================================
-- VERIFICATION
-- ============================================

\echo ''
\echo '📋 Verifying column additions...'

SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'dbo' 
  AND table_name = 'category'
  AND column_name IN ('category_icon', 'sub_category', 'subcategory_icon')
ORDER BY ordinal_position;

\echo ''
\echo '✅ Migration complete!'
