-- ============================================
-- File: category_seed.sql
-- Purpose: Initial category data for cashflow portal
-- Author: Copilot AI Assistant
-- Date: 2026-03-13
-- Version: 1.0
-- Prerequisites: dbo.category table must exist
-- ============================================

-- Description:
-- Inserts 12 initial expense categories into the database.
-- Uses ON CONFLICT DO NOTHING to prevent duplicate errors on re-runs.
-- Categories are based on common personal expense tracking needs.

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO dbo.category (category_name) VALUES
('Personal - Abi'),
('Home - Household Items'),
('Home - Provisions'),
('Groceries'),
('Transport'),
('Food'),
('Friends - School'),
('Friends - College'),
('Friends - Office'),
('WiFi'),
('Phone Recharge'),
('Snacks')
ON CONFLICT DO NOTHING;

-- Note: ON CONFLICT requires a unique constraint/index on category_name
-- or LOWER(category_name) which is created in the schema file


-- ============================================
-- VERIFICATION
-- ============================================

-- Check that all categories were inserted
-- SELECT category_name, is_active, created_at FROM dbo.category ORDER BY category_id;

-- Count total categories
-- SELECT COUNT(*) as total_categories FROM dbo.category WHERE is_active = TRUE;


-- ============================================
-- EXPECTED RESULT
-- ============================================

-- After running this script, you should have 12 active categories:
-- 
-- category_id | category_name              | is_active | created_at
-- ------------|----------------------------|-----------|------------
-- 1           | Personal - Abi             | true      | 2026-03-13
-- 2           | Home - Household Items     | true      | 2026-03-13
-- 3           | Home - Provisions          | true      | 2026-03-13
-- 4           | Groceries                  | true      | 2026-03-13
-- 5           | Transport                  | true      | 2026-03-13
-- 6           | Food                       | true      | 2026-03-13
-- 7           | Friends - School           | true      | 2026-03-13
-- 8           | Friends - College          | true      | 2026-03-13
-- 9           | Friends - Office           | true      | 2026-03-13
-- 10          | WiFi                       | true      | 2026-03-13
-- 11          | Phone Recharge             | true      | 2026-03-13
-- 12          | Snacks                     | true      | 2026-03-13


-- ============================================
-- ROLLBACK (Clear seed data)
-- ============================================

-- WARNING: This deletes all seeded categories!
-- DELETE FROM dbo.category WHERE category_name IN (
--   'Personal - Abi',
--   'Home - Household Items',
--   'Home - Provisions',
--   'Groceries',
--   'Transport',
--   'Food',
--   'Friends - School',
--   'Friends - College',
--   'Friends - Office',
--   'WiFi',
--   'Phone Recharge',
--   'Snacks'
-- );


-- ============================================
-- NOTES
-- ============================================

-- 1. This script is idempotent - safe to run multiple times
-- 2. ON CONFLICT DO NOTHING prevents errors if categories already exist
-- 3. Created_at and updated_at are set automatically by DEFAULT NOW()
-- 4. is_active defaults to TRUE for all new entries
-- 5. Can modify category names later via UPDATE statements

-- ============================================
-- RELATED FILES
-- ============================================

-- Schema: sql/schemas/001_category.sql
-- Queries: sql/queries/category_queries.sql
-- Service: src/app/services/category.service.ts
