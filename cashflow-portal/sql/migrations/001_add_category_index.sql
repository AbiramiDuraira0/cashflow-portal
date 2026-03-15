-- ============================================
-- File: 001_add_category_index.sql
-- Purpose: Add unique case-insensitive index to category_name
-- Author: Copilot AI Assistant
-- Date: 2026-03-13
-- Version: 1.0
-- Prerequisites: dbo.category table must exist
-- ============================================

-- Description:
-- Creates a unique index on LOWER(category_name) to prevent duplicates
-- like 'Fuel' and 'fuel' from being added as separate categories.
-- This migration ensures data integrity.

-- ============================================
-- MIGRATION
-- ============================================

-- Check if index already exists before creating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'dbo' 
      AND indexname = 'ux_category_name_ci'
  ) THEN
    -- Create unique case-insensitive index
    CREATE UNIQUE INDEX ux_category_name_ci
      ON dbo.category (LOWER(category_name));
    
    RAISE NOTICE 'Index ux_category_name_ci created successfully';
  ELSE
    RAISE NOTICE 'Index ux_category_name_ci already exists';
  END IF;
END$$;


-- ============================================
-- VERIFICATION
-- ============================================

-- Check if index was created
-- SELECT indexname, indexdef FROM pg_indexes 
-- WHERE schemaname = 'dbo' AND tablename = 'category';


-- ============================================
-- TEST DUPLICATE PREVENTION
-- ============================================

-- These should fail after index is created:
-- INSERT INTO dbo.category (category_name) VALUES ('Groceries');  -- Exists
-- INSERT INTO dbo.category (category_name) VALUES ('groceries');  -- Duplicate (lowercase)
-- INSERT INTO dbo.category (category_name) VALUES ('GROCERIES');  -- Duplicate (uppercase)


-- ============================================
-- ROLLBACK (Remove index)
-- ============================================

-- DROP INDEX IF EXISTS dbo.ux_category_name_ci;


-- ============================================
-- NOTES
-- ============================================

-- 1. This index improves query performance on category_name lookups
-- 2. Prevents case-sensitive duplicates (e.g., 'Food' vs 'food')
-- 3. Uses functional index on LOWER() for case-insensitive comparison
-- 4. Unique constraint enforced at database level (not just app level)
-- 5. Safe to run multiple times due to IF NOT EXISTS check

-- ============================================
-- RELATED FILES
-- ============================================

-- Schema: sql/schemas/001_category.sql
-- Service: src/app/services/category.service.ts
