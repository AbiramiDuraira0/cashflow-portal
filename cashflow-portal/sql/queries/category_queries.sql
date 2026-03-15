-- ============================================
-- File: category_queries.sql
-- Purpose: Common queries for category table
-- Author: Copilot AI Assistant
-- Date: 2026-03-13
-- Version: 1.0
-- ============================================

-- Description:
-- Collection of useful queries for debugging, reporting,
-- and data analysis on the category table.

-- ============================================
-- BASIC QUERIES
-- ============================================

-- Get all categories
SELECT * FROM dbo.category;

-- Get all active categories (used by application)
SELECT * FROM dbo.category 
WHERE is_active = TRUE 
ORDER BY category_name;

-- Get all inactive categories (soft deleted)
SELECT * FROM dbo.category 
WHERE is_active = FALSE 
ORDER BY updated_at DESC;

-- Get specific category by ID
SELECT * FROM dbo.category WHERE category_id = 1;

-- Get category by name (case-insensitive)
SELECT * FROM dbo.category WHERE LOWER(category_name) = LOWER('Groceries');


-- ============================================
-- STATISTICS & REPORTS
-- ============================================

-- Count total categories
SELECT COUNT(*) as total_categories FROM dbo.category;

-- Count by status
SELECT 
  is_active, 
  COUNT(*) as count,
  CASE 
    WHEN is_active THEN 'Active'
    ELSE 'Inactive'
  END as status_label
FROM dbo.category 
GROUP BY is_active;

-- Recently added categories (last 7 days)
SELECT * FROM dbo.category 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Recently updated categories (last 7 days)
SELECT * FROM dbo.category 
WHERE updated_at > NOW() - INTERVAL '7 days'
  AND updated_at > created_at  -- Exclude newly created (not updated)
ORDER BY updated_at DESC;

-- Longest category names (for UI testing)
SELECT category_name, LENGTH(category_name) as name_length
FROM dbo.category
ORDER BY name_length DESC
LIMIT 10;


-- ============================================
-- SEARCH QUERIES
-- ============================================

-- Search categories by partial name match
SELECT * FROM dbo.category 
WHERE LOWER(category_name) LIKE LOWER('%Home%')
  AND is_active = TRUE
ORDER BY category_name;

-- Find categories starting with specific prefix
SELECT * FROM dbo.category 
WHERE category_name ILIKE 'Friends%'
  AND is_active = TRUE
ORDER BY category_name;

-- Find all "Home" related categories
SELECT * FROM dbo.category 
WHERE category_name ~* '^Home'  -- Regex: starts with "Home"
ORDER BY category_name;


-- ============================================
-- DATA VALIDATION
-- ============================================

-- Check for potential duplicates (case variations)
SELECT 
  LOWER(category_name) as normalized_name,
  COUNT(*) as count,
  STRING_AGG(category_name, ', ') as variations
FROM dbo.category
GROUP BY LOWER(category_name)
HAVING COUNT(*) > 1;

-- Check for empty or whitespace-only names
SELECT * FROM dbo.category 
WHERE TRIM(category_name) = '' 
   OR category_name IS NULL;

-- Check for very short names (potential data quality issue)
SELECT * FROM dbo.category 
WHERE LENGTH(TRIM(category_name)) < 3;

-- Check for very long names (might cause UI issues)
SELECT * FROM dbo.category 
WHERE LENGTH(category_name) > 30;


-- ============================================
-- AUDIT QUERIES
-- ============================================

-- Categories never updated (created_at = updated_at)
SELECT 
  category_id,
  category_name,
  created_at,
  updated_at,
  (updated_at = created_at) as never_updated
FROM dbo.category
WHERE updated_at = created_at;

-- Most recently modified categories
SELECT 
  category_id,
  category_name,
  created_at,
  updated_at,
  (updated_at - created_at) as age_since_update
FROM dbo.category
ORDER BY updated_at DESC
LIMIT 10;

-- Oldest categories (by creation date)
SELECT * FROM dbo.category 
ORDER BY created_at ASC 
LIMIT 10;


-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Soft delete a category (set inactive)
-- UPDATE dbo.category 
-- SET is_active = FALSE 
-- WHERE category_id = 1;

-- Restore a soft-deleted category
-- UPDATE dbo.category 
-- SET is_active = TRUE 
-- WHERE category_id = 1;

-- Update category name
-- UPDATE dbo.category 
-- SET category_name = 'New Name'
-- WHERE category_id = 1;
-- Note: updated_at is automatically set by trigger

-- Hard delete inactive categories (DANGEROUS!)
-- DELETE FROM dbo.category 
-- WHERE is_active = FALSE;


-- ============================================
-- PERFORMANCE QUERIES
-- ============================================

-- Check index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'dbo' AND tablename = 'category';

-- Table size and statistics
SELECT 
  pg_size_pretty(pg_total_relation_size('dbo.category')) as total_size,
  pg_size_pretty(pg_relation_size('dbo.category')) as table_size,
  pg_size_pretty(pg_total_relation_size('dbo.category') - pg_relation_size('dbo.category')) as indexes_size,
  (SELECT COUNT(*) FROM dbo.category) as row_count;


-- ============================================
-- BULK OPERATIONS
-- ============================================

-- Bulk insert multiple categories at once
-- INSERT INTO dbo.category (category_name) VALUES
-- ('New Category 1'),
-- ('New Category 2'),
-- ('New Category 3')
-- ON CONFLICT DO NOTHING;

-- Bulk soft delete by name pattern
-- UPDATE dbo.category 
-- SET is_active = FALSE 
-- WHERE category_name LIKE 'Friends%';

-- Bulk rename with prefix
-- UPDATE dbo.category 
-- SET category_name = 'Expense - ' || category_name
-- WHERE category_name NOT LIKE 'Expense%';


-- ============================================
-- EXPORT QUERIES
-- ============================================

-- Export to CSV format (for backup)
-- COPY (SELECT * FROM dbo.category WHERE is_active = TRUE) 
-- TO '/tmp/categories_backup.csv' 
-- WITH CSV HEADER;

-- Export as JSON (for API/testing)
-- SELECT json_agg(row_to_json(t)) 
-- FROM (SELECT * FROM dbo.category WHERE is_active = TRUE) t;


-- ============================================
-- NOTES
-- ============================================

-- 1. Always use WHERE is_active = TRUE in application queries
-- 2. Never hard delete categories - use soft delete (is_active = FALSE)
-- 3. Check for case duplicates before inserting new categories
-- 4. Use ILIKE for case-insensitive searches (PostgreSQL specific)
-- 5. Monitor index usage for query optimization

-- ============================================
-- RELATED FILES
-- ============================================

-- Schema: sql/schemas/001_category.sql
-- Seed: sql/seeds/category_seed.sql
-- Service: src/app/services/category.service.ts
